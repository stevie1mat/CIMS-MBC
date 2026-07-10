import { getQuiz } from '@/app/actions/quizzes'
import { getQuestionsByQuiz, deleteQuestion } from '@/app/actions/questions'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileText, HelpCircle, ListChecks, Trash2, UploadCloud } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'

export const metadata = {
  title: 'Manage Quiz Questions | MBC Portal',
}

type ManageQuizQuestionsPageProps = {
  params: Promise<{ id: string }>
}

export default async function ManageQuizQuestionsPage({ params }: ManageQuizQuestionsPageProps) {
  const { id } = await params
  const quiz = await getQuiz(id)
  const questions = await getQuestionsByQuiz(id)
  const optionCount = questions.reduce((total, q) => total + (q.question_options?.length || 0), 0)
  const answeredCount = questions.filter(q => q.question_options?.some(opt => opt.is_correct)).length

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Manage Questions</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{quiz.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Total Questions"
          value={questions.length}
          icon={<HelpCircle size={24} color="#3b82f6" />}
          colorClass="cardBlue"
        />
        <MetricCard
          title="Answer Options"
          value={optionCount}
          icon={<ListChecks size={24} color="#ec4899" />}
          colorClass="cardPink"
        />
        <MetricCard
          title="Answered"
          value={answeredCount}
          icon={<CheckCircle size={24} color="#8b5cf6" />}
          colorClass="cardPurple"
        />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Question List</h3>
        </div>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Question</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Options</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, width: '130px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>No questions uploaded</p>
                    <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.9rem' }}>Bulk upload questions from Excel to prepare this quiz.</p>
                    <Link href="/dashboard/questions/upload" className={`${styles.actionButton} ${styles.actionButtonPrimary}`} style={{ display: 'inline-flex' }}>
                      <UploadCloud size={14} /> Bulk Upload Questions
                    </Link>
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className={styles.tableRow}>
                    <td style={{ padding: '1rem' }}>
                      <div className={styles.quizNameCell}>
                        <div className={styles.quizNameIcon}>
                          <HelpCircle size={17} color="#3b82f6" />
                        </div>
                        <div>
                          <div className={styles.questionText} dangerouslySetInnerHTML={{ __html: q.question_text }} />
                          {q.description && <p className={styles.quizDescription}>{q.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`${styles.statusBadge} ${styles.statusBadgeMuted}`}>{q.question_type}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <ul className={styles.optionList}>
                        {q.question_options?.map(opt => (
                          <li key={opt.id} className={opt.is_correct ? styles.optionCorrect : undefined}>
                            {opt.option_text} {opt.is_correct && <CheckCircle size={13} />}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div className={styles.tableActions}>
                        <form action={async () => {
                          'use server'
                          await deleteQuestion(q.id, quiz.id)
                        }}>
                          <button className={`${styles.actionButton} ${styles.actionButtonDanger}`} title="Delete from Quiz">
                            <Trash2 size={14} /> Delete
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
