'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from './auth'

async function requireAdmin() {
  const role = await getUserRole()
  return role === 'admin' || role === 'super_admin'
}

export async function getSubjectsPageData() {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return { subjects: [], teachers: [], assignments: [] }

  const supabase = await createClient()

  const [{ data: subjects }, { data: profiles }, { data: assignments }] = await Promise.all([
    supabase.from('categories').select('id, name').order('name'),
    supabase
      .from('profiles')
      .select('id, first_name, last_name, email, account_types(role)')
      .order('first_name'),
    supabase
      .from('subject_teachers' as any)
      .select(`
        id,
        category_id,
        teacher_id,
        categories ( id, name ),
        profiles ( id, first_name, last_name, email )
      `)
      .order('created_at', { ascending: false }),
  ])

  const teachers = (profiles || []).filter((profile: any) => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim().toLowerCase()
    return profile.account_types?.role === 'teacher' && fullName !== 'mbc teacher'
  })

  const placeholderSubjects = new Set(['General knowledge', 'Math'])

  return {
    subjects: (subjects || []).filter((subject: any) => !placeholderSubjects.has(subject.name)),
    teachers,
    assignments: (assignments || []).filter((assignment: any) => !placeholderSubjects.has(assignment.categories?.name)),
  }
}

export async function createSubject(formData: FormData) {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return { error: 'Unauthorized' }

  const name = String(formData.get('name') || '').trim()
  if (!name) return { error: 'Subject name is required.' }

  const supabase = await createClient()
  const { error } = await supabase.from('categories').insert({ name })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/subjects')
  revalidatePath('/dashboard/assignments/new')
  return { success: true }
}

export async function deleteSubject(formData: FormData) {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return { error: 'Unauthorized' }

  const subjectId = Number(formData.get('subject_id'))
  if (!subjectId) return { error: 'Subject id is required.' }

  const supabase = await createClient()

  await supabase
    .from('subject_teachers' as any)
    .delete()
    .eq('category_id', subjectId)

  await supabase
    .from('assignments')
    .update({ category_id: null })
    .eq('category_id', subjectId)

  await supabase
    .from('quiz_selection_rules')
    .update({ category_id: null })
    .eq('category_id', subjectId)

  await supabase
    .from('study_materials')
    .update({ category_id: null })
    .eq('category_id', subjectId)

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', subjectId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/subjects')
  revalidatePath('/dashboard/assignments/new')
  return { success: true }
}

export async function assignSubjectTeacher(formData: FormData) {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return { error: 'Unauthorized' }

  const categoryId = Number(formData.get('category_id'))
  const teacherId = String(formData.get('teacher_id') || '')

  if (!categoryId || !teacherId) return { error: 'Choose a subject and teacher.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('subject_teachers' as any)
    .insert({ category_id: categoryId, teacher_id: teacherId })

  if (error) {
    if (error.code === '23505') return { error: 'This teacher is already assigned to that subject.' }
    return { error: error.message }
  }

  revalidatePath('/dashboard/subjects')
  return { success: true }
}

export async function removeSubjectTeacher(formData: FormData) {
  const isAdmin = await requireAdmin()
  if (!isAdmin) return { error: 'Unauthorized' }

  const assignmentId = Number(formData.get('assignment_id'))
  if (!assignmentId) return { error: 'Assignment id is required.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('subject_teachers' as any)
    .delete()
    .eq('id', assignmentId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/subjects')
  return { success: true }
}
