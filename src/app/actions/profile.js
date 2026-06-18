'use server'

import { createClient } from '@/lib/supabase/server'

export async function getProfileDetails(targetUserId = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const userId = targetUserId || user.id

  // Fetch profile with account type
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      account_types(name, role)
    `)
    .eq('id', userId)
    .single()

  // Fetch group name (first group)
  const { data: profileGroup } = await supabase
    .from('profile_groups')
    .select('groups(id, name)')
    .eq('profile_id', userId)
    .limit(1)
    .single()

  return {
    ...profile,
    group_id: profileGroup?.groups?.id || null,
    group_name: profileGroup?.groups?.name || 'No Group',
    account_type_name: profile?.account_types?.name || 'User',
  }
}

export async function getQuizActivity(targetUserId = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const userId = targetUserId || user.id

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id, status, ended_at')
    .eq('profile_id', userId)
    .neq('status', 'open') // Only consider finished/submitted attempts

  if (!attempts || attempts.length === 0) {
    return { attempted: 0, pass: 0, fail: 0, lastAttempt: null }
  }

  const passCount = attempts.filter(a => a.status === 'pass').length
  const failCount = attempts.filter(a => a.status === 'fail').length
  
  // Find most recent ended_at
  const completedAttempts = attempts.filter(a => a.ended_at)
  const lastAttempt = completedAttempts.length > 0 
    ? new Date(Math.max(...completedAttempts.map(a => new Date(a.ended_at).getTime())))
    : null

  return {
    attempted: attempts.length,
    pass: passCount,
    fail: failCount,
    lastAttempt: lastAttempt
  }
}

export async function getCategoryProficiency(targetUserId = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const userId = targetUserId || user.id

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      percentage_obtained,
      ended_at,
      quizzes(
        categories(
          id,
          name
        )
      )
    `)
    .eq('profile_id', userId)
    .not('ended_at', 'is', null)

  if (!attempts || attempts.length === 0) return []

  // Group by category
  const categoryStats = {}
  attempts.forEach(attempt => {
    const category = attempt.quizzes?.categories
    if (!category) return

    if (!categoryStats[category.id]) {
      categoryStats[category.id] = {
        name: category.name,
        totalPercentage: 0,
        count: 0,
        recentPercentage: 0,
        recentDate: 0
      }
    }
    
    categoryStats[category.id].totalPercentage += attempt.percentage_obtained
    categoryStats[category.id].count += 1

    const attemptTime = new Date(attempt.ended_at).getTime()
    if (attemptTime > categoryStats[category.id].recentDate) {
      categoryStats[category.id].recentDate = attemptTime
      categoryStats[category.id].recentPercentage = attempt.percentage_obtained
    }
  })

  return Object.values(categoryStats).map(stat => ({
    categoryName: stat.name,
    overallPercentage: stat.count > 0 ? (stat.totalPercentage / stat.count) : 0,
    recentPercentage: stat.recentPercentage
  })).sort((a, b) => b.overallPercentage - a.overallPercentage)
}

export async function getIncorrectQuestions(targetUserId = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const userId = targetUserId || user.id

  // To get incorrect questions we first need the user's attempt ids
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('profile_id', userId)

  if (!attempts || attempts.length === 0) return []

  const attemptIds = attempts.map(a => a.id)

  const { data: answers } = await supabase
    .from('attempt_answers')
    .select(`
      question_id,
      questions (
        id,
        body
      )
    `)
    .in('attempt_id', attemptIds)
    .eq('score', 0)
    .limit(50) // Limit to 50 for performance

  if (!answers) return []
  
  // Deduplicate by question id
  const uniqueQuestions = []
  const seenIds = new Set()
  
  for (const answer of answers) {
    if (answer.questions && !seenIds.has(answer.questions.id)) {
      seenIds.add(answer.questions.id)
      uniqueQuestions.push({
        id: answer.questions.id,
        body: answer.questions.body
      })
    }
  }

  return uniqueQuestions
}

export async function getPaymentHistory(targetUserId = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const userId = targetUserId || user.id

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('profile_id', userId)
    .order('paid_at', { ascending: false })

  return payments || []
}
