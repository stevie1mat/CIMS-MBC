import { createClient } from '@/lib/supabase/server'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { UploadCloud, FileText } from 'lucide-react'

export const metadata = {
  title: 'Question Bank | MBC Portal',
}

export default async function QuestionsPage() {
  const supabase = await createClient()

  // Fetch all quizzes with their question counts
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select(`
      id,
      name,
      questions(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching quizzes:', error)
  }

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Question Bank</h2>
        <Link href="/dashboard/questions/upload">
          <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={18} /> Bulk Upload Questions
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Quiz Name</th>
                <th>Total Questions</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!quizzes || quizzes.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    No quizzes found. Create a Quiz first to upload questions.
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr key={q.id} className={styles.tableRow}>
                    <td>
                      <strong>{q.name}</strong>
                    </td>
                    <td>{q.questions[0]?.count || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Link href={`/dashboard/quizzes/${q.id}/manage`}>
                          <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Manage Questions">
                            <FileText size={16} /> Manage
                          </button>
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
