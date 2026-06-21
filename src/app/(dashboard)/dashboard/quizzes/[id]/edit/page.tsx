import { getQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText, List, RotateCcw } from 'lucide-react'
import EditQuizForm from './EditQuizForm'
import MetricCard from '@/components/dashboard/MetricCard'

export const metadata = {
  title: 'Edit Quiz | MBC Portal',
}

export default async function EditQuizPage({ params }) {
  const { id } = await params
  const quiz = await getQuiz(id)
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  if (!isStaff) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <h2 className={styles.panelTitle}>Access denied</h2>
          <p style={{ color: '#64748b', marginTop: '0.75rem' }}>Only staff can edit quizzes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editPage}>
      <div className={styles.editPageHeader}>
        <div>
          <h1>Edit Quiz</h1>
          <p>{quiz.name}</p>
        </div>
      </div>

      <div className={styles.cardGrid} style={{ marginBottom: '1.5rem' }}>
        <MetricCard
          title="Questions"
          value={quiz.quiz_questions.length}
          icon={<FileText size={24} color="#3b82f6" />}
          colorClass="cardBlue"
        />
        <MetricCard
          title="Duration"
          value={`${quiz.duration_minutes} mins`}
          icon={<Clock size={24} color="#ec4899" />}
          colorClass="cardPink"
        />
        <MetricCard
          title="Max Attempts"
          value={quiz.maximum_attempts}
          icon={<RotateCcw size={24} color="#8b5cf6" />}
          colorClass="cardPurple"
        />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Quiz Settings</h3>
          <div className={styles.panelActions}>
            <Link href={`/dashboard/quizzes/${quiz.id}/attempts`} className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
              <List size={14} /> Attempts
            </Link>
            <Link href={`/dashboard/quizzes/${quiz.id}/manage`} className={styles.actionButton}>
              <FileText size={14} /> Questions
            </Link>
            <Link href="/dashboard/quizzes" className={styles.actionButton}>
              <ArrowLeft size={14} /> Quizzes
            </Link>
          </div>
        </div>
        <div className={styles.panelBody}>
          <EditQuizForm quiz={quiz} />
        </div>
      </div>
    </div>
  )
}
