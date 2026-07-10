import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AttemptClient from './AttemptClient'

export const metadata = {
  title: 'Quiz Attempt | MBC Portal',
}

type QuizAttemptPageProps = {
  params: Promise<{ id: string }>
}

export default async function QuizAttemptPage({ params }: QuizAttemptPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Fetch the active attempt
  const { data: attempt } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', Number(id))
    .eq('profile_id', user.id)
    .eq('status', 'open')
    .single()

  if (!attempt) {
    // No open attempt found, redirect to quiz details
    redirect(`/dashboard/quizzes/${id}`)
  }

  // Fetch quiz details with questions and options
  const { data: quiz } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions (
        id,
        question_text,
        question_type,
        question_options (
          id,
          option_text,
          sort_order,
          is_correct
        )
      )
    `)
    .eq('id', Number(id))
    .single()

  if (!quiz) redirect('/dashboard/quizzes')

  return <AttemptClient quiz={quiz} attempt={attempt} />
}
