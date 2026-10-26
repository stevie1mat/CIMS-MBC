import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/app/actions/auth'

// Exams currently store the subject name rather than a category foreign key.
export async function getTeacherExamIds(): Promise<number[] | null> {
  if (await getUserRole() !== 'teacher') return null
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data: assignments, error } = await supabase
    .from('subject_teachers' as any)
    .select('categories ( name )')
    .eq('teacher_id', user.id)
  if (error) throw new Error(error.message)
  const subjects = new Set((assignments || []).map((assignment: any) =>
    assignment.categories?.name?.trim().toLowerCase()).filter(Boolean))
  if (!subjects.size) return []
  const { data: quizzes, error: quizError } = await supabase.from('quizzes').select('id, student_subject')
  if (quizError) throw new Error(quizError.message)
  return (quizzes || []).filter(quiz => subjects.has(quiz.student_subject?.trim().toLowerCase())).map(quiz => quiz.id)
}

export async function requireTeacherExamAccess(quizId: number | string) {
  const ids = await getTeacherExamIds()
  if (ids !== null && !ids.includes(Number(quizId))) throw new Error('Access denied: this exam is not in your assigned subjects.')
}
