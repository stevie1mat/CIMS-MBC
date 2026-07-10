'use server'

import { createClient } from '@/lib/supabase/server'
import { getSetting } from './settings'
import { Resend } from 'resend'
import * as XLSX from 'xlsx'

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendAttemptsCsvEmail(quizId: string | number, quizName: string, attemptsData: any[]) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase.from('profiles').select('account_types(role)').eq('id', user.id).single()
    const role = profile?.account_types?.role
    if (role !== 'admin' && role !== 'teacher' && role !== 'super_admin') {
      return { error: 'Unauthorized' }
    }

    const csvData = attemptsData.map(attempt => ({
      'Student Name': `${attempt.profiles?.first_name || ''} ${attempt.profiles?.last_name || ''}`.trim(),
      'Email': attempt.profiles?.email || '',
      'Score': attempt.score_obtained || 0,
      'Percentage': attempt.percentage_obtained ? `${Number(attempt.percentage_obtained).toFixed(1)}%` : '0%',
      'Status': attempt.status || '',
      'Date Started': new Date(attempt.started_at).toLocaleString()
    }))

    const ws = XLSX.utils.json_to_sheet(csvData)
    const csvString = XLSX.utils.sheet_to_csv(ws)
    const csvBuffer = Buffer.from(csvString, 'utf-8')

    const targetEmailRaw = await getSetting('csv_export_email')
    const targetEmail = typeof targetEmailRaw === 'string' ? targetEmailRaw : 'mathewsteven1996@gmail.com'

    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: 'MBC Portal <onboarding@resend.dev>',
      to: targetEmail,
      subject: `Quiz Attempts Export: ${quizName}`,
      html: `<p>Please find attached the CSV export of all student attempts for the quiz: <strong>${quizName}</strong>.</p>`,
      attachments: [
        {
          filename: `attempts_${quizId}.csv`,
          content: csvBuffer,
        }
      ]
    })

    if (error) {
      console.error("Resend API Error:", error)
      return { error: error.message }
    }

    return { success: true, message: `Email sent to ${targetEmail}` }
  } catch (err: any) {
    console.error("Error sending email:", err)
    return { error: err.message || 'Failed to send email' }
  }
}

export async function sendAttemptNotificationEmail(quizName: string, studentName: string, studentEmail: string, score: number, percentage: number) {
  try {
    const targetEmailRaw = await getSetting('csv_export_email')
    const targetEmail = typeof targetEmailRaw === 'string' ? targetEmailRaw : 'mathewsteven1996@gmail.com'

    const resend = getResendClient()
    const { error } = await resend.emails.send({
      from: 'MBC Portal <onboarding@resend.dev>',
      to: targetEmail,
      subject: `New Quiz Submission: ${studentName}`,
      html: `
        <h2>New Quiz Submission</h2>
        <p>A student has just completed an exam.</p>
        <ul>
          <li><strong>Student:</strong> ${studentName} (${studentEmail})</li>
          <li><strong>Quiz:</strong> ${quizName}</li>
          <li><strong>Score:</strong> ${score}</li>
          <li><strong>Percentage:</strong> ${percentage.toFixed(1)}%</li>
        </ul>
        <p>Log in to the MBC Portal to view full details.</p>
      `
    })

    if (error) {
      console.error("Resend API Error (Notification):", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error("Error sending notification:", err)
    return { error: err.message }
  }
}
