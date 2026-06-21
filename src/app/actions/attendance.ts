'use server'

import { createClient } from '@/lib/supabase/server'
import { getSetting } from './settings'

export async function markAttendanceAndGetLink() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  // Check if attendance already recorded today
  const { data: existing } = await supabase
    .from('attendance_records')
    .select('id')
    .eq('profile_id', user.id)
    .eq('session_date', today)
    .maybeSingle()

  if (!existing) {
    // Record attendance
    const { error } = await supabase
      .from('attendance_records')
      .insert([{
        profile_id: user.id,
        session_date: today
      }])
    
    if (error && error.code !== '23505') {
      console.error("Attendance Error:", error)
    }
  }

  // Get zoom link
  const linkRaw = await getSetting('zoom_meeting_link')
  let zoomLink = 'https://zoom.us'
  if (typeof linkRaw === 'string') {
    try { zoomLink = JSON.parse(linkRaw) } catch (e) { zoomLink = linkRaw }
  } else if (linkRaw) {
    zoomLink = linkRaw as string
  }

  return { success: true, link: zoomLink }
}

export async function getAttendanceByDate(date: string) {
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

export async function getMyAttendance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('attendance_records')
    .select('id, recorded_at, session_date')
    .eq('profile_id', user.id)
    .order('session_date', { ascending: false })

  if (error) {
    console.error("Error fetching my attendance:", error)
    return []
  }
  return data || []
}
