import { getQuiz, addQuestionToQuiz, removeQuestionFromQuiz } from '@/app/actions/quizzes'
import { getQuestions } from '@/app/actions/questions'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

export const metadata = {
  title: 'Manage Quiz | MBC Portal',
}

export default async function EditQuizPage({ params }) {
  const { id } = await params
  const quiz = await getQuiz(id)
  const allQuestions = await getQuestions()

  // Filter out questions already in the quiz
  const existingQuestionIds = new Set(quiz.quiz_questions.map(qq => qq.question_id))
  const availableQuestions = allQuestions.filter(q => !existingQuestionIds.has(q.id))

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Manage Quiz: {quiz.name}</h2>
        <Link href="/dashboard/quizzes">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Quizzes
          </button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Left Column: Questions currently in the quiz */}
        <div style={{ flex: '1 1 400px' }}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Selected Questions ({quiz.quiz_questions.length})</h3>
            </div>
            <div className={styles.panelBody} style={{ padding: 0 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Score</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {quiz.quiz_questions.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>No questions added yet.</td>
                    </tr>
                  ) : (
                    quiz.quiz_questions.map((qq) => (
                      <tr key={qq.question_id} className={styles.tableRow}>
                        <td>
                          <div dangerouslySetInnerHTML={{ __html: qq.questions.body.substring(0, 60) + '...' }} />
                        </td>
                        <td>{qq.correct_score}</td>
                        <td style={{ textAlign: 'center' }}>
                          <form action={async () => {
                            'use server'
                            await removeQuestionFromQuiz(quiz.id, qq.question_id)
                          }}>
                            <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }} title="Remove">
                              <Trash2 size={16} />
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

        {/* Right Column: Available questions in the bank */}
        <div style={{ flex: '1 1 400px' }}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Question Bank</h3>
            </div>
            <div className={styles.panelBody} style={{ padding: 0, maxHeight: '600px', overflowY: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Add</th>
                  </tr>
                </thead>
                <tbody>
                  {availableQuestions.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', padding: '1rem' }}>No available questions.</td>
                    </tr>
                  ) : (
                    availableQuestions.map((q) => (
                      <tr key={q.id} className={styles.tableRow}>
                        <td>
                          <div dangerouslySetInnerHTML={{ __html: q.body.substring(0, 60) + '...' }} />
                          <small style={{ color: '#64748b' }}>{q.categories?.name} - {q.levels?.name}</small>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <form action={async () => {
                            'use server'
                            await addQuestionToQuiz(quiz.id, q.id, 1, 0)
                          }}>
                            <button className={styles.btnPrimary} style={{ padding: '0.25rem 0.5rem' }} title="Add to Quiz">
                              <Plus size={16} />
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
      </div>
    </div>
  )
}
