'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfileDetails(targetUserId: string | null = null) {
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
    group_id: (profileGroup?.groups as any)?.id || null,
    group_name: (profileGroup?.groups as any)?.name || 'No Group',
    account_type_name: (profile?.account_types as any)?.name || 'User',
  }
}

export async function getQuizActivity(targetUserId: string | null = null) {
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

  const passCount = attempts.filter((a: any) => a.status === 'pass').length
  const failCount = attempts.filter((a: any) => a.status === 'fail').length
  
  // Find most recent ended_at
  const completedAttempts = attempts.filter((a: any) => a.ended_at)
  const lastAttempt = completedAttempts.length > 0 
    ? new Date(Math.max(...completedAttempts.map((a: any) => new Date(a.ended_at).getTime())))
    : null

  return {
    attempted: attempts.length,
    pass: passCount,
    fail: failCount,
    lastAttempt: lastAttempt
  }
}

export async function getUserExamResults(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      quiz_id,
      status,
      score_obtained,
      percentage_obtained,
      total_time_seconds,
      started_at,
      ended_at,
      quizzes (
        id,
        name,
        duration_minutes,
        student_subject,
        student_teacher
      )
    `)
    .eq('profile_id', targetUserId)
    .neq('status', 'open')
    .order('ended_at', { ascending: false })

  if (error) {
    console.error('Error fetching user exam results:', error)
    return []
  }

  return data || []
}

export async function getTeacherExamSummary(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: teacherProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', targetUserId)
    .single()

  const teacherName = `${teacherProfile?.first_name || ''} ${teacherProfile?.last_name || ''}`.trim()

  const { data: insertedQuizzes, error: insertedError } = await supabase
    .from('quizzes')
    .select(`
      id,
      name,
      starts_at,
      ends_at,
      student_subject,
      student_teacher,
      inserted_by,
      quiz_attempts (
        id,
        status,
        score_obtained,
        percentage_obtained,
        ended_at,
        profiles ( first_name, last_name, email )
      )
    `)
    .eq('inserted_by', targetUserId)
    .order('created_at', { ascending: false })

  if (insertedError) {
    console.error('Error fetching teacher inserted exams:', insertedError)
  }

  let namedQuizzes: any[] = []
  if (teacherName) {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        id,
        name,
        starts_at,
        ends_at,
        student_subject,
        student_teacher,
        inserted_by,
        quiz_attempts (
          id,
          status,
          score_obtained,
          percentage_obtained,
          ended_at,
          profiles ( first_name, last_name, email )
        )
      `)
      .ilike('student_teacher', `%${teacherName}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching teacher named exams:', error)
    }
    namedQuizzes = data || []
  }

  const quizMap = new Map<number, any>()
  ;[...(insertedExams || []), ...namedQuizzes].forEach((quiz: any) => {
    quizMap.set(quiz.id, quiz)
  })

  return Array.from(quizMap.values()).map((quiz: any) => {
    const attempts = (quiz.quiz_attempts || []).filter((attempt: any) => attempt.status !== 'open')
    const passed = attempts.filter((attempt: any) => attempt.status === 'pass').length
    const averagePercentage = attempts.length > 0
      ? attempts.reduce((total: number, attempt: any) => total + Number(attempt.percentage_obtained || 0), 0) / attempts.length
      : 0

    return {
      ...quiz,
      quiz_attempts: attempts,
      attemptCount: attempts.length,
      passed,
      failed: attempts.length - passed,
      averagePercentage,
      subject: quiz.student_subject || 'Unassigned Subject',
    }
  }).sort((a, b) => a.subject.localeCompare(b.subject) || a.name.localeCompare(b.name))
}

export async function getCategoryProficiency(targetUserId: string | null = null) {
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
  const categoryStats: Record<string, any> = {}
  attempts.forEach((attempt: any) => {
    const category = (attempt.quizzes as any)?.categories
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
    
    categoryStats[category.id].totalPercentage += attempt.percentage_obtained || 0
    categoryStats[category.id].count += 1

    const attemptTime = new Date(attempt.ended_at).getTime()
    if (attemptTime > categoryStats[category.id].recentDate) {
      categoryStats[category.id].recentDate = attemptTime
      categoryStats[category.id].recentPercentage = attempt.percentage_obtained || 0
    }
  })

  return Object.values(categoryStats).map(stat => ({
    categoryName: stat.name,
    overallPercentage: stat.count > 0 ? (stat.totalPercentage / stat.count) : 0,
    recentPercentage: stat.recentPercentage
  })).sort((a, b) => b.overallPercentage - a.overallPercentage)
}

export async function getIncorrectQuestions(targetUserId: string | null = null) {
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
        question_text
      )
    `)
    .in('attempt_id', attemptIds)
    .eq('score', 0)
    .limit(50) // Limit to 50 for performance

  if (!answers) return []
  
  // Deduplicate by question id
  const uniqueQuestions: any[] = []
  const seenIds = new Set()
  
  for (const answer of answers) {
    const q = answer.questions as any
    if (q && !seenIds.has(q.id)) {
      seenIds.add(q.id)
      uniqueQuestions.push({
        id: q.id,
        body: q.question_text || q.body || ''
      })
    }
  }

  return uniqueQuestions
}

export async function getPaymentHistory(targetUserId: string | null = null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const userId = targetUserId || user.id

  const { data: payments } = await supabase
    .from('payments' as any) // Assuming payments table might not be generated if it was missing from types, but using as any to be safe
    .select('*')
    .eq('profile_id', userId)
    .order('paid_at', { ascending: false })

  return payments || []
}

export async function updateUserAvatar(userId: string, avatarPath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Admin or self
  if (user.id !== userId) {
    const { data: currentUser } = await supabase.from('profiles').select('account_types(role)').eq('id', user.id).single()
    const role = (currentUser?.account_types as any)?.role
    if (role !== 'admin' && role !== 'super_admin') {
      return { success: false, error: 'Unauthorized' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_path: avatarPath, avatar_bucket: 'avatars' })
    .eq('id', userId)

  if (error) {
    console.error("Error updating avatar path:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateOwnPassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const password = formData.get('password') as string
  if (password) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      return { error: error.message }
    }
  }

  return { success: true }
}

export async function updateRealEmail(email: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ real_email: email })
    .eq('id', user.id)

  if (error) {
    console.error("Error updating real email:", error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
