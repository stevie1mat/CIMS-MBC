import { getQuizzes, deleteQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { Plus, Edit, Trash2, List, PlayCircle } from 'lucide-react'

export const metadata = {
  title: 'Quizzes | MBC Portal',
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzes()
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>{isStaff ? 'Manage Quizzes' : 'Available Quizzes'}</h2>
        {isStaff && (
          <Link href="/dashboard/quizzes/new">
            <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create Quiz
            </button>
          </Link>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Duration (mins)</th>
                <th>Pass %</th>
                <th>Questions</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No quizzes found.
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr key={q.id} className={styles.tableRow}>
                    <td>
                      <Link href={`/dashboard/quizzes/${q.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <strong style={{ color: '#0ea5e9' }}>{q.name}</strong>
                      </Link>
                      {q.description && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{q.description}</p>}
                    </td>
                    <td>{q.duration_minutes}</td>
                    <td>{q.pass_percentage}%</td>
                    <td>{q.questions[0]?.count || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {!isStaff ? (
                          <Link href={`/dashboard/quizzes/${q.id}`}>
                            <button className={styles.btnPrimary} style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Attempt">
                              <PlayCircle size={16} /> Attempt
                            </button>
                          </Link>
                        ) : (
                          <>
                            <Link href={`/dashboard/quizzes/${q.id}/manage`}>
                              <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem' }} title="Manage Questions">
                                <List size={16} />
                              </button>
                            </Link>
                            <form action={async () => {
                              'use server'
                              await deleteQuiz(q.id)
                            }}>
                              <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }} title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </form>
                          </>
                        )}
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
