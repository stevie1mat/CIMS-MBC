import { getQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText, CheckCircle } from 'lucide-react'
import StartQuizButton from './StartQuizButton'

export async function generateMetadata({ params }) {
  const { id } = await params
  const quiz = await getQuiz(id)
  return { title: `${quiz.name} | MBC Portal` }
}

export default async function QuizPortalPage({ params }) {
  const { id } = await params
  const quiz = await getQuiz(id)
  const role = await getUserRole()
  const isStudent = role === 'student'

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Quiz Details</h2>
        <Link href="/dashboard/quizzes">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Quizzes
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <h1 style={{ marginTop: 0, color: '#1e293b' }}>{quiz.name}</h1>
          {quiz.description && <p style={{ fontSize: '1.1rem', color: '#475569' }}>{quiz.description}</p>}

          <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', flex: 1 }}>
              <Clock size={24} color="#0ea5e9" />
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Duration</p>
                <strong style={{ fontSize: '1.125rem' }}>{quiz.duration_minutes} Minutes</strong>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', flex: 1 }}>
              <FileText size={24} color="#8b5cf6" />
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Questions</p>
                <strong style={{ fontSize: '1.125rem' }}>{quiz.quiz_questions.length}</strong>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', flex: 1 }}>
              <CheckCircle size={24} color="#10b981" />
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Passing Score</p>
                <strong style={{ fontSize: '1.125rem' }}>{quiz.pass_percentage}%</strong>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#fffbeb', borderRadius: '0.5rem', border: '1px solid #fde68a', marginBottom: '2rem' }}>
            <h3 style={{ marginTop: 0, color: '#92400e' }}>Instructions</h3>
            <ul style={{ color: '#b45309', margin: 0, paddingLeft: '1.5rem' }}>
              <li>Ensure you have a stable internet connection before starting.</li>
              <li>Once you start, the timer cannot be paused.</li>
              <li>Do not refresh the page or navigate away during the attempt.</li>
              <li>Your answers will be automatically submitted when the time expires.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {isStudent ? (
              <StartQuizButton quizId={quiz.id} />
            ) : (
              <Link href={`/dashboard/quizzes/${quiz.id}/edit`}>
                <button className={styles.btnPrimary} style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                  Manage Questions
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
