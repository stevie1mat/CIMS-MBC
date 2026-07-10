'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('id, name').order('name')
  return data || []
}

export async function getAssignments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      assignment_submissions(count),
      categories:assignments_category_id_fkey(name),
      profiles:assignments_created_by_fkey(first_name, last_name)
    `)
    .order('due_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getAssignment(id: number | string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', Number(id))
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createAssignment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const due_at = formData.get('due_at') as string
  const category_id = formData.get('category_id') as string
  const attachment = formData.get('attachment') as File | null

  let attachment_bucket = null
  let attachment_path = null

  if (attachment && attachment.size > 0) {
    const fileExt = attachment.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `assignments/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('library-assets')
      .upload(filePath, attachment)

    if (uploadError) return { error: `Upload failed: ${uploadError.message}` }
    
    attachment_bucket = 'library-assets'
    attachment_path = filePath
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert([{
      title,
      description,
      due_at: due_at ? new Date(due_at).toISOString() : null,
      created_by: user.id,
      category_id: category_id ? Number(category_id) : null,
      attachment_bucket,
      attachment_path
    }])
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  return { success: true, assignment: data }
}

export async function updateAssignment(id: number | string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const due_at = formData.get('due_at') as string
  const category_id = formData.get('category_id') as string
  const attachment = formData.get('attachment') as File | null

  let updateData: any = {
    title,
    description,
    due_at: due_at ? new Date(due_at).toISOString() : null,
    category_id: category_id ? Number(category_id) : null,
  }

  if (attachment && attachment.size > 0) {
    const fileExt = attachment.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `assignments/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('library-assets')
      .upload(filePath, attachment)

    if (uploadError) return { error: `Upload failed: ${uploadError.message}` }
    
    updateData.attachment_bucket = 'library-assets'
    updateData.attachment_path = filePath
  }

  const { data, error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', Number(id))
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  revalidatePath(`/dashboard/assignments/${id}`)
  return { success: true, assignment: data }
}

export async function deleteAssignment(id: number | string) {
  const supabase = await createClient()
  const { error } = await supabase.from('assignments').delete().eq('id', Number(id))
  if (error) return { error: error.message }
  revalidatePath('/dashboard/assignments')
  return { success: true }
}

export async function submitAssignment(assignmentId: number | string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  
  const file = formData.get('file') as File
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
      assignment_id: Number(assignmentId),
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

export async function getSubmissions(assignmentId: number | string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assignment_submissions')
    .select(`
      *,
      profiles!assignment_submissions_profile_id_fkey(first_name, last_name, email)
    `)
    .eq('assignment_id', Number(assignmentId))
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getMySubmission(assignmentId: number | string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', Number(assignmentId))
    .eq('profile_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function gradeSubmission(submissionId: number | string, score: string | number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('assignment_submissions')
    .update({
      score: parseFloat(String(score)),
      status: 'evaluated',
      evaluated_by: user.id,
      evaluated_at: new Date().toISOString()
    })
    .eq('id', Number(submissionId))

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/assignments`)
  return { success: true }
}
