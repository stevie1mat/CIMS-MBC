'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(`account_types ( role )`)
    .eq('id', user.id)
    .single()

  return profile?.account_types?.role || 'student'
}

export async function loginAction(prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  const supabase = await createClient()
  console.log("Supabase object:", typeof supabase, Object.keys(supabase || {}))

  // Authenticate the user
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Route to the unified dashboard
  redirect('/dashboard')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
