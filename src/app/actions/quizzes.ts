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

export async function createQuiz(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string || '10', 10)
  const pass_percentage = parseFloat(formData.get('pass_percentage') as string || '50')
  const maximum_attempts = parseInt(formData.get('maximum_attempts') as string || '1', 10)
  
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

export async function updateQuiz(id: number | string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const duration_minutes = parseInt(formData.get('duration_minutes') as string || '10', 10)
  const maximum_attempts = parseInt(formData.get('maximum_attempts') as string || '1', 10)

  const starts_at = formData.get('starts_at') as string || null
  const ends_at = formData.get('ends_at') as string || null
  const updates: any = {
    name,
    duration_minutes,
    maximum_attempts,
    updated_at: new Date().toISOString(),
  }

  if (formData.has('starts_at')) updates.starts_at = starts_at
  if (formData.has('ends_at')) updates.ends_at = ends_at
  if (formData.has('description')) updates.description = formData.get('description') as string
  if (formData.has('student_subject')) updates.student_subject = formData.get('student_subject') as string || null
  if (formData.has('student_teacher')) updates.student_teacher = formData.get('student_teacher') as string || null
  if (formData.has('exam_instructions_title')) updates.exam_instructions_title = formData.get('exam_instructions_title') as string || null
  if (formData.has('exam_time_text')) updates.exam_time_text = formData.get('exam_time_text') as string || null
  if (formData.has('exam_questions_text')) updates.exam_questions_text = formData.get('exam_questions_text') as string || null
  if (formData.has('exam_result_text')) updates.exam_result_text = formData.get('exam_result_text') as string || null
  if (formData.has('quiz_template')) updates.quiz_template = formData.get('quiz_template') as string || 'default'
  if (formData.has('view_answer')) updates.view_answer = formData.get('view_answer') === 'on'
  if (formData.has('camera_required')) updates.camera_required = formData.get('camera_required') === 'on'
  if (formData.has('generate_certificate')) updates.generate_certificate = formData.get('generate_certificate') === 'on'
  if (formData.has('requires_login')) updates.requires_login = formData.get('requires_login') === 'on'
  if (formData.has('show_chart_rank')) updates.show_chart_rank = formData.get('show_chart_rank') === 'on'
  if (formData.has('ip_address_rule')) updates.ip_address_rule = formData.get('ip_address_rule') as string || null
  if (formData.has('certificate_text')) updates.certificate_text = formData.get('certificate_text') as string || null
  if (formData.has('pass_percentage')) updates.pass_percentage = parseFloat(formData.get('pass_percentage') as string || '50')
  if (formData.has('quiz_price')) updates.quiz_price = parseFloat(formData.get('quiz_price') as string || '0')

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/quizzes')
  revalidatePath(`/dashboard/quizzes/${id}`)
  revalidatePath(`/dashboard/quizzes/${id}/edit`)
  return { success: true, quiz }
}

export async function scheduleQuizLive(formData: FormData) {
  const supabase = await createClient()

  const quizId = formData.get('quiz_id') as string
  const startsAt = formData.get('starts_at') as string
  const endsAt = formData.get('ends_at') as string || null

  if (!quizId) return { error: 'Please select a quiz.' }
  if (!startsAt) return { error: 'Please choose a live date and time.' }

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .update({
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quizId)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/quizzes')
  revalidatePath(`/dashboard/quizzes/${quizId}`)
  revalidatePath(`/dashboard/quizzes/${quizId}/edit`)
  return { success: true, quiz }
}

export async function deleteQuiz(id: number | string) {
  const supabase = await createClient()
  const { error } = await supabase.from('quizzes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/quizzes')
  return { success: true }
}

export async function getQuiz(id: number | string) {
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
  ;(data as any).quiz_questions = (data as any).questions || []
  return data
}

export async function addQuestionToQuiz(quiz_id: number | string, question_id: number | string, correct_score = 1, incorrect_score = 0) {
  const supabase = await createClient()
  // Ensure we insert into quiz_questions using untyped insert if it's missing from Database types,
  // but it seems quiz_questions does not exist in types or it's a join table.
  // We'll use any typing.
  const { error } = await supabase
    .from('quiz_questions' as any)
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

export async function removeQuestionFromQuiz(quiz_id: number | string, question_id: number | string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('quiz_questions' as any)
    .delete()
    .match({ quiz_id, question_id })
    
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/quizzes/${quiz_id}`)
  return { success: true }
}
