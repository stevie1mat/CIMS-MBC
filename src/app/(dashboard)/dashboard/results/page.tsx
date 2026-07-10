import { getStudentResults } from '@/app/actions/results'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'My Results | MBC Portal',
}

export default async function StudentResultsPage() {
  const role = await getUserRole()
  if (role !== 'student') {
    redirect('/dashboard/reports')
  }

  const results = await getStudentResults()

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>My Exam Results</h2>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Date Taken</th>
                <th>Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    You have not completed any exams yet.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className={styles.tableRow}>
                    <td>
                      <Link href={`/dashboard/results/${r.id}`} style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold' }}>
                        {r.quizzes?.name}
                      </Link>
                    </td>
                    <td>{formatDate(r.ended_at)}</td>
                    <td>{r.score_obtained}</td>
                    <td>
                      <div className={styles.tableActions} style={{ justifyContent: 'flex-start' }}>
                        <Link href={`/dashboard/results/${r.id}`} className={`${styles.actionButton} ${styles.actionButtonPrimary}`} title="View Answers">
                           View Answers
                        </Link>
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
