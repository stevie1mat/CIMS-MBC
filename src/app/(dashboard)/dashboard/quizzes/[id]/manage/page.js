import { getQuiz } from '@/app/actions/quizzes'
import { getQuestionsByQuiz, deleteQuestion } from '@/app/actions/questions'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, Trash2, UploadCloud } from 'lucide-react'

export const metadata = {
  title: 'Manage Quiz Questions | MBC Portal',
}

export default async function ManageQuizQuestionsPage({ params }) {
  const { id } = await params
  const quiz = await getQuiz(id)
  const questions = await getQuestionsByQuiz(id)

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Questions for: {quiz.name}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/dashboard/questions/upload`}>
            <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={18} /> Bulk Upload More
            </button>
          </Link>
          <Link href="/dashboard/quizzes">
            <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> Back to Quizzes
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Question</th>
                <th>Type</th>
                <th>Options</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    No questions have been uploaded to this quiz yet. 
                    <br /><br />
                    <Link href={`/dashboard/questions/upload`} style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
                      Click here to bulk upload questions from Excel.
                    </Link>
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className={styles.tableRow}>
                    <td>
                      <div dangerouslySetInnerHTML={{ __html: q.question_text }} />
                      {q.description && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>{q.description}</p>}
                    </td>
                    <td>{q.question_type}</td>
                    <td>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                        {q.question_options?.map(opt => (
                          <li key={opt.id} style={{ color: opt.is_correct ? '#16a34a' : '#64748b', fontWeight: opt.is_correct ? 600 : 400 }}>
                            {opt.option_text} {opt.is_correct && '✓'}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <form action={async () => {
                          'use server'
                          await deleteQuestion(q.id, quiz.id)
                        }}>
                          <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }} title="Delete from Quiz">
                            <Trash2 size={16} />
                          </button>
                        </form>
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
