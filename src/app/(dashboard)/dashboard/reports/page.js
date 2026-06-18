import { getAllResults, deleteAttempt } from '@/app/actions/results'
import styles from '@/components/dashboard/dashboard.module.css'
import { CheckCircle, XCircle, RefreshCcw } from 'lucide-react'

export const metadata = {
  title: 'Reports | MBC Portal',
}

export default async function ReportsPage() {
  const results = await getAllResults()

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
        <h2 className={styles.panelTitle}>Global Quiz Reports</h2>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Quiz Name</th>
                <th>Date Taken</th>
                <th>Time Spent</th>
                <th>Percentage</th>
                <th>Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No completed attempts found.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className={styles.tableRow}>
                    <td>
                      <strong>{r.profiles?.first_name} {r.profiles?.last_name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>{r.profiles?.email}</span>
                    </td>
                    <td><strong>{r.quizzes?.name}</strong></td>
                    <td>{formatDate(r.ended_at)}</td>
                    <td>{formatTime(r.total_time_seconds)}</td>
                    <td>
                      <span style={{ fontWeight: 'bold' }}>{parseFloat(r.percentage_obtained).toFixed(2)}%</span>
                    </td>
                    <td>
                      {r.status === 'pass' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', backgroundColor: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500 }}>
                          <CheckCircle size={16} /> Pass
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 500 }}>
                          <XCircle size={16} /> Fail
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <form action={async () => {
                        'use server'
                        await deleteAttempt(r.id)
                      }}>
                        <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem', color: '#f59e0b', borderColor: '#f59e0b' }} title="Reset Attempt (Delete)">
                          <RefreshCcw size={16} />
                        </button>
                      </form>
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
