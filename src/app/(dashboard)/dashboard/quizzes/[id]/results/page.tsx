import { getQuiz } from '@/app/actions/quizzes'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, CheckCircle, Percent } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import styles from '@/components/dashboard/dashboard.module.css'

export const metadata = {
  title: 'Exam Marksheet | MBC Portal',
}

type ExamMarksheetPageProps = {
  params: Promise<{ id: string }>
}

export default async function ExamMarksheetPage({ params }: ExamMarksheetPageProps) {
  const { id } = await params
  
  // Verify access
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'
  if (!isStaff) {
    redirect('/dashboard/quizzes')
  }

  const supabase = await createClient()
  const quiz = await getQuiz(id)

  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email
      )
    `)
    .eq('quiz_id', id)
    .order('created_at', { ascending: false })

  // Calculate metrics
  const totalAttempts = attempts?.length || 0
  const completedAttempts = attempts?.filter(a => a.status === 'completed').length || 0
  const averageScore = totalAttempts > 0 
    ? Math.round(attempts!.reduce((sum, a) => sum + (a.percentage_obtained || 0), 0) / totalAttempts)
    : 0

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Marksheet</h1>
          <p style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>{quiz.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/quizzes">
            <button className={styles.btnPrimary} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <ArrowLeft size={18} /> Back to Exams
            </button>
          </Link>
        </div>
      </div>



      {/* Marksheet Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Student Results</h3>
        </div>
        <div className={styles.panelBody} style={{ padding: 0, overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'left' }}>Student</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'left' }}>Date</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>Time Taken</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>Score</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>Percentage</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attempts?.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No attempts yet.</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Students haven't taken this exam.</p>
                  </td>
                </tr>
              ) : (
                attempts?.map(attempt => {
                  const student = attempt.profiles as any
                  const fullName = student 
                    ? `${student.first_name} ${student.last_name || ''}`.trim() 
                    : 'Unknown Student'
                  const email = student?.email || 'N/A'
                  const date = new Date(attempt.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                  
                  const isPass = (attempt.percentage_obtained || 0) >= 50
                  
                  return (
                    <tr key={attempt.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <Link href={`/dashboard/results/${attempt.id}`} style={{ textDecoration: 'none' }} title="View Detailed Marksheet">
                          <strong style={{ color: '#3b82f6', display: 'block', marginBottom: '2px' }}>{fullName}</strong>
                        </Link>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{email}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.95rem' }}>
                        {date}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', color: '#475569' }}>
                        {attempt.total_time_seconds ? `${Math.floor(attempt.total_time_seconds / 60)}m ${attempt.total_time_seconds % 60}s` : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                        {attempt.score_obtained || 0}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: isPass ? '#16a34a' : '#ef4444' 
                        }}>
                          {attempt.percentage_obtained || 0}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                         <span className={`${styles.statusBadge} ${attempt.status === 'completed' ? styles.statusBadgeSuccess : styles.statusBadgeWarning}`}>
                           {attempt.status || 'in_progress'}
                         </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
