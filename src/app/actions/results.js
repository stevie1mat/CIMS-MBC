'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getStudentResults() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes ( name, duration_minutes, pass_percentage )
    `)
    .eq('profile_id', user.id)
    .neq('status', 'open') // Only show completed or cancelled attempts
    .order('ended_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getAllResults() {
  const supabase = await createClient()

  // For admins/teachers
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes ( name, duration_minutes, pass_percentage ),
      profiles ( email, first_name, last_name )
    `)
    .neq('status', 'open')
    .order('ended_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function deleteAttempt(id) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('quiz_attempts')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/reports')
  return { success: true }
}
