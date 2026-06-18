'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAssignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      assignment_submissions(count)
    `)
    .order('due_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getAssignment(id) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createAssignment(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const title = formData.get('title')
  const description = formData.get('description')
  const due_at = formData.get('due_at')

  const { data, error } = await supabase
    .from('assignments')
    .insert([{
      title,
      description,
      due_at: due_at ? new Date(due_at).toISOString() : null,
      created_by: user.id
    }])
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  return { success: true, assignment: data }
}

export async function deleteAssignment(id) {
  const supabase = await createClient()
  const { error } = await supabase.from('assignments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  return { success: true }
}

export async function submitAssignment(assignmentId, formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const file = formData.get('file')
  if (!file || file.size === 0) return { error: 'Please select a file to upload' }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${assignmentId}-${Date.now()}.${fileExt}`
  const filePath = `${assignmentId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('student-submissions')
    .upload(filePath, file)

  if (uploadError) return { error: uploadError.message }

  // Create submission record
  const { error: dbError } = await supabase
    .from('assignment_submissions')
    .upsert([{
      assignment_id: assignmentId,
      profile_id: user.id,
      attachment_bucket: 'student-submissions',
      attachment_path: filePath,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    }], { onConflict: 'assignment_id, profile_id' }) // Assuming one submission per assignment per user

  if (dbError) return { error: dbError.message }

  revalidatePath(`/dashboard/assignments/${assignmentId}`)
  return { success: true }
}

export async function getSubmissions(assignmentId) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      profiles(first_name, last_name, email)
    `)
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getMySubmission(assignmentId) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('profile_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function gradeSubmission(submissionId, score) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('assignment_submissions')
    .update({
      score: parseFloat(score),
      status: 'evaluated',
      evaluated_by: user.id,
      evaluated_at: new Date().toISOString()
    })
    .eq('id', submissionId)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/assignments`)
  return { success: true }
}
