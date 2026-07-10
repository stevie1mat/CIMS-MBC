'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startQuizAttempt(quiz_id: number | string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, starts_at, ends_at, maximum_attempts')
    .eq('id', Number(quiz_id))
    .single()

  if (quizError || !quiz) return { error: 'Quiz not found' }

  const now = new Date()
  if (!quiz.starts_at || new Date(quiz.starts_at) > now) {
    return { error: 'This quiz is not live yet.' }
  }

  if (quiz.ends_at && new Date(quiz.ends_at) < now) {
    return { error: 'This quiz is no longer live.' }
  }

  // Check if they already have an open attempt
  const { data: existing } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', Number(quiz_id))
    .eq('profile_id', user.id)
    .eq('status', 'open')
    .maybeSingle()

  if (existing) {
    return { success: true, attempt: existing }
  }

  // Check if they have reached the maximum number of attempts
  const { count } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', Number(quiz_id))
    .eq('profile_id', user.id)

  const maxAttempts = quiz.maximum_attempts || 1
  if (count !== null && count >= maxAttempts) {
    return { error: `You have reached the maximum of ${maxAttempts} attempts for this quiz.` }
  }

  // Create new attempt
  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .insert([{
      quiz_id: Number(quiz_id),
      profile_id: user.id,
      status: 'open',
      started_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, attempt }
}

export async function submitQuizAnswers(attempt_id: number | string, answers: Record<string, string | number>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Get the attempt and quiz details to calculate score
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quizzes (
        id, pass_percentage,
        questions (
          id,
          question_options (
            id,
            is_correct
          )
        )
      )
    `)
    .eq('id', Number(attempt_id))
    .eq('profile_id', user.id)
    .single()

  if (attemptError || !attempt) return { error: 'Attempt not found' }
  if (attempt.status !== 'open') return { error: 'Attempt already submitted' }

  const quiz = attempt.quizzes as any
  const questions = quiz?.questions || []

  const correctOptionMap: Record<number, number[]> = {}
  questions.forEach((question: any) => {
    correctOptionMap[question.id] = (question.question_options || [])
      .filter((opt: any) => opt.is_correct)
      .map((opt: any) => opt.id)
  })

  // 3. Process submitted answers and calculate scores
  let totalScoreObtained = 0
  let maxPossibleScore = 0
  const attemptAnswersToInsert: any[] = []

  questions.forEach((question: any) => {
    maxPossibleScore += 1
    const submittedOptionId = answers[question.id]
    let earnedScore = 0

    if (submittedOptionId) {
      const correctForThisQ = correctOptionMap[question.id] || []
      // If the submitted option is in the correct options list
      if (correctForThisQ.includes(parseInt(String(submittedOptionId)))) {
        earnedScore = 1
      }
      
      attemptAnswersToInsert.push({
        attempt_id: Number(attempt_id),
        question_id: question.id,
        option_id: parseInt(String(submittedOptionId)),
        score: earnedScore
      })
    }
    
    totalScoreObtained += earnedScore
  })

  // Calculate percentage
  const percentage = maxPossibleScore > 0 ? (totalScoreObtained / maxPossibleScore) * 100 : 0
  const status = percentage >= parseFloat(quiz.pass_percentage) ? 'pass' : 'fail'

  // 4. Save answers
  if (attemptAnswersToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('attempt_answers')
      .insert(attemptAnswersToInsert)
      
    if (insertError) return { error: insertError.message }
  }

  // 5. Finalize attempt
  const ended_at = new Date().toISOString()
  const started_at = new Date(attempt.started_at!).getTime()
  const total_time_seconds = Math.floor((new Date(ended_at).getTime() - started_at) / 1000)

  const { error: updateError } = await supabase
    .from('quiz_attempts')
    .update({
      status,
      ended_at,
      total_time_seconds,
      score_obtained: totalScoreObtained,
      percentage_obtained: percentage
    })
    .eq('id', Number(attempt_id))

  if (updateError) return { error: updateError.message }

  // Send Notification
  try {
    const { sendAttemptNotificationEmail } = await import('./export')
    const studentName = `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || 'Student'
    await sendAttemptNotificationEmail(quiz.name, studentName, user.email || '', totalScoreObtained, percentage)
  } catch (e) {
    console.error("Failed to send notification email", e)
  }

  revalidatePath('/dashboard/results')
  return { success: true }
}
