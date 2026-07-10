import { getQuizAttempts } from '@/app/actions/results'
import { getQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/dashboard/dashboard.module.css'
import { ArrowLeft, Clock, Eye, Users } from 'lucide-react'
import DeleteAttemptButton from './DeleteAttemptButton'
import ExportButtons from './ExportButtons'

export const metadata = {
  title: 'Quiz Attempts | MBC Portal',
}

type QuizAttemptsPageProps = {
  params: Promise<{ id: string }>
}

export default async function QuizAttemptsPage({ params }: QuizAttemptsPageProps) {
  const { id } = await params
  
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  if (!isStaff) {
    redirect('/dashboard')
  }

  const [quiz, attempts] = await Promise.all([
    getQuiz(id),
    getQuizAttempts(id)
  ])

  if (!quiz) redirect('/dashboard/quizzes')

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Attempts</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{quiz.name}</p>
        </div>
        <Link href={`/dashboard/quizzes/${id}/edit`}>
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Quiz
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3 className={styles.panelTitle}>Student Attempts</h3>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>
              Total: {attempts.length}
            </div>
          </div>
          <ExportButtons quiz={quiz} attempts={attempts} />
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Student</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Score</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No attempts yet</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Students have not attempted this quiz.</p>
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr key={attempt.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{attempt.profiles?.first_name} {attempt.profiles?.last_name}</span>
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{attempt.profiles?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 600 }}>
                      {attempt.status === 'open' ? '-' : `${attempt.score_obtained} (${Number(attempt.percentage_obtained).toFixed(1)}%)`}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 500 }}>
                        <Clock size={16} />
                        {new Date(attempt.started_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {attempt.status !== 'open' && (
                          <Link href={`/dashboard/results/${attempt.id}`}>
                            <button
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.75rem',
                                backgroundColor: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                              title="View Answers"
                            >
                              <Eye size={16} /> View
                            </button>
                          </Link>
                        )}
                        <DeleteAttemptButton attemptId={attempt.id} quizId={id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
