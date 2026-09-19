import QuizForm from './QuizForm'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Create Exam | MBC Portal',
}

export default function NewQuizPage() {
  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Create New Exam</h2>
        <Link href="/dashboard/exams">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Exams
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ paddingTop: '24px' }}>
          <QuizForm />
        </div>
      </div>
    </div>
  )
}
