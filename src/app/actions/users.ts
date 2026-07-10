'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getUserRole } from './auth'
import { Database } from '@/lib/supabase/types'

export async function getUsers() {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin' && role !== 'teacher') return []

  const supabase = await createClient()
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      first_name,
      last_name,
      contact_no,
      registered_at,
      account_types(name, role)
    `)
    .order('registered_at', { ascending: false })

  if (error) {
    console.error("Error fetching users. Message:", error.message, "Details:", error.details, "Hint:", error.hint, "Code:", error.code)
    return []
  }

  // Fetch groups separately to avoid foreign key ambiguity
  const userIds = users.map(u => u.id)
  let profileGroupsData: any[] = []
  if (userIds.length > 0) {
    const { data: pgroups } = await supabase
      .from('profile_groups')
      .select('profile_id, groups(name)')
      .in('profile_id', userIds)
    profileGroupsData = pgroups || []
  }

  const hiddenTestAccounts = new Set(['mbc student', 'mbc teacher'])

  const formattedUsers = users?.map(u => {
    const userGroup = profileGroupsData.find(pg => pg.profile_id === u.id)
    return {
      ...u,
      account_type_name: (u.account_types as any)?.name || 'User',
      role: (u.account_types as any)?.role || 'student',
      group_name: (userGroup?.groups as any)?.name || 'No Group'
    }
  }).filter(u => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase()
    return !hiddenTestAccounts.has(fullName)
  }) || []

  if (role === 'teacher') {
    return formattedUsers.filter(u => u.role === 'student')
  }

  return formattedUsers
}

export async function getGroupsAndAccountTypes() {
  const supabase = await createClient()
  
  const { data: groups } = await supabase.from('groups').select('id, name')
  const { data: accountTypes } = await supabase.from('account_types').select('id, name')
  
  return {
    groups: groups || [],
    accountTypes: accountTypes || []
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') return { error: 'Unauthorized' }

  const supabase = await createClient()

  const first_name = formData.get('first_name') as string
  const last_name = formData.get('last_name') as string
  const contact_no = formData.get('contact_no') as string
  const account_type_id = formData.get('account_type_id') ? parseInt(formData.get('account_type_id') as string, 10) : null
  const group_id = formData.get('group_id') ? parseInt(formData.get('group_id') as string, 10) : null
  
  const updateData: any = { 
    first_name, 
    last_name, 
    contact_no: contact_no || null, 
    account_type_id: account_type_id || null 
  }

  if (formData.has('fees_paid')) {
    updateData.fees_paid = formData.get('fees_paid') === 'true'
  }

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)

  if (profileError) return { error: profileError.message }

  // Update group
  await supabase.from('profile_groups').delete().eq('profile_id', userId)
  
  if (group_id) {
    await supabase.from('profile_groups').insert({ profile_id: userId, group_id })
  }

  revalidatePath(`/dashboard/users/${userId}`)
  revalidatePath('/dashboard/users')
  
  return { success: true }
}

export async function createUser(formData: FormData) {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') return { error: 'Unauthorized' }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) return { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }

  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const firstName = String(formData.get('first_name') || '').trim()
  const lastName = String(formData.get('last_name') || '').trim()
  const contactNo = String(formData.get('contact_no') || '').trim()
  const accountTypeId = formData.get('account_type_id') ? Number(formData.get('account_type_id')) : null
  const groupId = formData.get('group_id') ? Number(formData.get('group_id')) : null

  if (!email || !password || !firstName || !lastName || !accountTypeId) {
    return { error: 'Email, password, first name, last name, and account type are required.' }
  }

  const adminSupabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
    },
  })

  if (authError) return { error: authError.message }
  const newUserId = authData.user?.id
  if (!newUserId) return { error: 'User was created without an id.' }

  const { error: profileError } = await adminSupabase
    .from('profiles')
    .upsert({
      id: newUserId,
      email,
      first_name: firstName,
      last_name: lastName,
      contact_no: contactNo || null,
      account_type_id: accountTypeId,
    })

  if (profileError) return { error: profileError.message }

  if (groupId) {
    const { error: groupError } = await adminSupabase
      .from('profile_groups')
      .insert({ profile_id: newUserId, group_id: groupId })

    if (groupError) return { error: groupError.message }
  }

  revalidatePath('/dashboard/users')
  redirect(`/dashboard/users/${newUserId}`)
}
