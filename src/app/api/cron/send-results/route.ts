import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as XLSX from 'xlsx'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const resend = new Resend(process.env.RESEND_API_KEY)
  const now = new Date().toISOString()

  try {
    const { data: endedQuizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('id, name')
      .lt('ends_at', now)
      .eq('final_results_sent', false)

    if (quizError) throw quizError
    if (!endedExams || endedQuizzes.length === 0) {
      return NextResponse.json({ message: 'No ended quizzes require export.' })
    }

    const { data: settingData } = await supabase.from('settings').select('value').eq('key', 'csv_export_email').single()
    const targetEmail = (settingData?.value as string) || 'mathewsteven1996@gmail.com'
    const processedQuizzes = []

    for (const quiz of endedQuizzes) {
      const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          id, score_obtained, percentage_obtained, status, started_at,
          profiles:profile_id (first_name, last_name, email)
        `)
        .eq('quiz_id', quiz.id)

      if (attemptsError) {
        console.error(`Error fetching attempts for quiz ${quiz.id}:`, attemptsError)
        continue
      }

      if (attempts && attempts.length > 0) {
        const csvData = attempts.map((attempt: any) => ({
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

        const { error: resendError } = await resend.emails.send({
          from: 'MBC Portal <onboarding@resend.dev>',
          to: targetEmail,
          subject: `Final Results Export: ${quiz.name}`,
          html: `<p>The exam for <strong>${quiz.name}</strong> has officially ended.</p><p>Please find attached the final CSV export of all student attempts.</p>`,
          attachments: [
            {
              filename: `final_attempts_${quiz.id}.csv`,
              content: csvBuffer,
            }
          ]
        })

        if (!resendError) {
          await supabase.from('quizzes').update({ final_results_sent: true }).eq('id', quiz.id)
          processedQuizzes.push(quiz.id)
        } else {
          console.error(`Failed to send email for quiz ${quiz.id}:`, resendError)
        }
      } else {
        // Mark as sent even if no attempts, to avoid endlessly polling
        await supabase.from('quizzes').update({ final_results_sent: true }).eq('id', quiz.id)
        processedQuizzes.push(quiz.id)
      }
    }

    return NextResponse.json({ message: `Processed ${processedQuizzes.length} quizzes.`, quizzes: processedQuizzes })
  } catch (err: any) {
    console.error("Cron Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
