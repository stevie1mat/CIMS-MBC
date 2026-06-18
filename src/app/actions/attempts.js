'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startQuizAttempt(quiz_id) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Not authenticated' }

  // Check if they already have an open attempt
  const { data: existing } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', quiz_id)
    .eq('profile_id', user.id)
    .eq('status', 'open')
    .single()

  if (existing) {
    return { success: true, attempt: existing }
  }

  // Create new attempt
  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .insert([{
      quiz_id,
      profile_id: user.id,
      status: 'open',
      started_at: new Date().toISOString()
    }])
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, attempt }
}

export async function submitQuizAnswers(attempt_id, answers) {
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
        quiz_questions (
          question_id, correct_score, incorrect_score
        )
      )
    `)
    .eq('id', attempt_id)
    .eq('profile_id', user.id)
    .single()

  if (attemptError || !attempt) return { error: 'Attempt not found' }
  if (attempt.status !== 'open') return { error: 'Attempt already submitted' }

  const quiz = attempt.quizzes

  // 2. Fetch correct options for all questions in this quiz
  const questionIds = quiz.quiz_questions.map(qq => qq.question_id)
  const { data: correctOptions } = await supabase
    .from('question_options')
    .select('id, question_id, score')
    .in('question_id', questionIds)
    .gt('score', 0) // Assuming correct options have score > 0

  const correctOptionMap = {}
  correctOptions.forEach(opt => {
    if (!correctOptionMap[opt.question_id]) correctOptionMap[opt.question_id] = []
    correctOptionMap[opt.question_id].push(opt.id)
  })

  // 3. Process submitted answers and calculate scores
  let totalScoreObtained = 0
  let maxPossibleScore = 0
  const attemptAnswersToInsert = []

  quiz.quiz_questions.forEach((qq) => {
    maxPossibleScore += parseFloat(qq.correct_score)
    const submittedOptionId = answers[qq.question_id]
    let earnedScore = 0

    if (submittedOptionId) {
      const correctForThisQ = correctOptionMap[qq.question_id] || []
      // If the submitted option is in the correct options list
      if (correctForThisQ.includes(parseInt(submittedOptionId))) {
        earnedScore = parseFloat(qq.correct_score)
      } else {
        earnedScore = parseFloat(qq.incorrect_score)
      }
      
      attemptAnswersToInsert.push({
        attempt_id,
        question_id: qq.question_id,
        option_id: parseInt(submittedOptionId),
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
  const started_at = new Date(attempt.started_at).getTime()
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
    .eq('id', attempt_id)

  if (updateError) return { error: updateError.message }

  revalidatePath('/dashboard/results')
  return { success: true }
}
