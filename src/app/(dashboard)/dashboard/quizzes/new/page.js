import QuizForm from './QuizForm'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Create Quiz | MBC Portal',
}

export default function NewQuizPage() {
  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Create New Quiz</h2>
        <Link href="/dashboard/quizzes">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Quizzes
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <QuizForm />
        </div>
      </div>
    </div>
  )
}
