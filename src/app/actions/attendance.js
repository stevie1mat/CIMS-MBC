'use server'

import { createClient } from '@/lib/supabase/server'
import { getSetting } from './settings'

export async function markAttendanceAndGetLink() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Record attendance
  const { error } = await supabase
    .from('attendance_records')
    .insert([{
      profile_id: user.id,
      session_date: today
    }])
  
  // Ignore PGRST116/duplicate key errors since they might click multiple times a day
  // but we still want to give them the link
  if (error && error.code !== '23505') {
    console.error("Attendance Error:", error)
  }

  // Get zoom link
  const linkRaw = await getSetting('zoom_meeting_link')
  let zoomLink = 'https://zoom.us'
  if (typeof linkRaw === 'string') {
    try { zoomLink = JSON.parse(linkRaw) } catch (e) { zoomLink = linkRaw }
  } else if (linkRaw) {
    zoomLink = linkRaw
  }

  return { success: true, link: zoomLink }
}

export async function getAttendanceByDate(date) {
  const supabase = await createClient()

  // For admins/teachers
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      id, recorded_at,
      profiles ( email, first_name, last_name )
    `)
    .eq('session_date', date)
    .order('recorded_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}
