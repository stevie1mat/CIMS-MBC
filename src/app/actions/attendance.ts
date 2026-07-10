'use server'

import { createClient } from '@/lib/supabase/server'
import { getSetting } from './settings'

export async function markAttendanceAndGetLink() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const getISTDateString = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(new Date());
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    return `${y}-${m}-${d}`;
  };

  const today = getISTDateString();

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
    zoomLink = String(linkRaw)
  }

  return { success: true, link: zoomLink }
}

export async function getAttendanceData(date: string, timeframe: 'day' | 'week' | 'month' = 'day') {
  const supabase = await createClient()

  let startDate = date;
  let endDate = date;

  const parts = date.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const dayStr = parts.length > 2 ? parseInt(parts[2], 10) : 1;
  
  // Create a local date at noon to avoid timezone shifts
  const d = new Date(year, month, dayStr, 12, 0, 0);

  const formatDate = (dateObj: Date) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (timeframe === 'week') {
    const dayOfWeek = d.getDay();
    const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setDate(diff));
    const endOfWeek = new Date(d.setDate(startOfWeek.getDate() + 6));
    startDate = formatDate(startOfWeek);
    endDate = formatDate(endOfWeek);
  } else if (timeframe === 'month') {
    const startOfMonth = new Date(year, month, 1, 12, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 12, 0, 0);
    startDate = formatDate(startOfMonth);
    endDate = formatDate(endOfMonth);
  } else {
    if (date.length === 7) {
      startDate = `${date}-01`;
      endDate = `${date}-01`;
    }
  }

  // For admins/teachers
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      id, recorded_at, session_date,
      profiles ( email, first_name, last_name, avatar_path, account_types(role) )
    `)
    .gte('session_date', startDate)
    .lte('session_date', endDate)
    .order('session_date', { ascending: false })
    .order('recorded_at', { ascending: false })

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
