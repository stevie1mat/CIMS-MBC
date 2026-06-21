'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserRole } from './auth'

export async function getUsers() {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') return []

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

  return users?.map(u => {
    const userGroup = profileGroupsData.find(pg => pg.profile_id === u.id)
    return {
      ...u,
      account_type_name: (u.account_types as any)?.name || 'User',
      role: (u.account_types as any)?.role || 'student',
      group_name: (userGroup?.groups as any)?.name || 'No Group'
    }
  }) || []
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
