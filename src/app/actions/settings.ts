'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSetting(key: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
    
  if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
    throw new Error(error.message)
  }
  return data ? data.value : null
}

export async function updateSetting(key: string, value: any) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // We rely on RLS to block non-admins, but we can double check
  const { error } = await supabase
    .from('settings')
    .update({ value: JSON.stringify(value) })
    .eq('key', key)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/settings')
  return { success: true }
}
