'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getQuizzes() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('quizzes').select(`
    *,
    questions ( count ),
    quiz_groups ( groups ( name ) )
  `).order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function createQuiz(formData) {
  const supabase = await createClient()
  
  const name = formData.get('name')
  const description = formData.get('description')
  const duration_minutes = parseInt(formData.get('duration_minutes') || 10, 10)
  const pass_percentage = parseFloat(formData.get('pass_percentage') || 50)
  const maximum_attempts = parseInt(formData.get('maximum_attempts') || 1, 10)
  
  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert([{
      name,
      description,
      duration_minutes,
      pass_percentage,
      maximum_attempts,
    }])
    .select()
    .single()
    
  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/quizzes')
  return { success: true, quiz }
}

export async function deleteQuiz(id) {
  const supabase = await createClient()
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/quizzes')
  return { success: true }
}

export async function getQuiz(id) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('quizzes').select(`
    *,
    questions (
      id,
      question_text,
      description,
      question_type,
      question_options (
        id,
        option_text,
        is_correct
      )
    )
  `).eq('id', id).single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function addQuestionToQuiz(quiz_id, question_id, correct_score = 1, incorrect_score = 0) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('quiz_questions')
    .insert([{
      quiz_id,
      question_id,
      correct_score,
      incorrect_score
    }])
    
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/quizzes/${quiz_id}`)
  return { success: true }
}

export async function removeQuestionFromQuiz(quiz_id, question_id) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .match({ quiz_id, question_id })
    
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/quizzes/${quiz_id}`)
  return { success: true }
}
