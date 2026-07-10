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
      quizzes ( name, duration_minutes )
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
      quizzes ( name, duration_minutes ),
      profiles ( email, first_name, last_name )
    `)
    .neq('status', 'open')
    .order('ended_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getQuizAttempts(quiz_id: string | number) {
  const supabase = await createClient()

  // For admins/teachers to view attempts for a specific quiz
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      profiles ( email, first_name, last_name, avatar_path )
    `)
    .eq('quiz_id', Number(quiz_id))
    .order('started_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function deleteAttempt(id: number, quiz_id?: string | number) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('quiz_attempts')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/reports')
  if (quiz_id) {
    revalidatePath(`/dashboard/quizzes/${quiz_id}/attempts`)
  }
  return { success: true }
}

export async function getAttemptDetails(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes (
        id, name, duration_minutes,
        questions (
          id, question_text, question_type,
          question_options (
            id, option_text, is_correct, sort_order
          )
        )
      ),
      attempt_answers (
        question_id, option_id, score
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error("Error in getAttemptDetails:", error)
    return null
  }
  return data
}
