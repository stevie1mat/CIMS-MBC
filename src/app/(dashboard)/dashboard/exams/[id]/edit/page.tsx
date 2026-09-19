import { getQuiz, deleteQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText, List, RotateCcw, TableProperties } from 'lucide-react'
import EditQuizForm from './EditQuizForm'
import MetricCard from '@/components/dashboard/MetricCard'
import ScheduleQuizForm from '../../ScheduleQuizForm'
import DeleteQuizButton from '@/components/dashboard/DeleteQuizButton'

export const metadata = {
  title: 'Edit Exam | MBC Portal',
}

type EditQuizPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
  const { id } = await params
  const quiz = await getQuiz(id)
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  if (!isStaff) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <h2 className={styles.panelTitle}>Access denied</h2>
          <p style={{ color: '#64748b', marginTop: '0.75rem' }}>Only staff can edit exams.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editPage}>
      <div className={styles.editPageHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', color: '#0f172a' }}>{quiz.name}</h1>
            {(() => {
              if (quiz.starts_at && quiz.ends_at) {
                const now = new Date();
                const start = new Date(quiz.starts_at);
                const end = new Date(quiz.ends_at);
                
                if (now < start) {
                  return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>SCHEDULED</span>;
                } else if (now >= start && now <= end) {
                  return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span style={{ width: '6px', height: '6px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'inline-block' }}></span> LIVE</span>;
                } else if (now > end) {
                  return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>FINISHED</span>;
                }
              }
              return null;
            })()}
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Edit Exam</p>
        </div>
        <Link href="/dashboard/exams" style={{ textDecoration: 'none' }}>
          <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontWeight: 600 }}>
            <ArrowLeft size={18} /> Back to Exams
          </button>
        </Link>
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

      <div className={styles.schedulePanel} style={{ marginBottom: '2rem' }}>
        <ScheduleQuizForm quizzes={[quiz]} defaultQuizId={quiz.id.toString()} />
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Exam Settings</h3>
          <div className={styles.panelActions}>

            <Link href={`/dashboard/exams/${quiz.id}/manage`} className={styles.actionButton} style={{ textDecoration: 'none' }}>
              <FileText size={14} /> Questions
            </Link>
            <Link href={`/dashboard/exams/${quiz.id}/results`} className={`${styles.actionButton} ${styles.actionButtonSuccess}`} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', textDecoration: 'none' }}>
              <TableProperties size={14} /> Marksheet
            </Link>
          </div>
        </div>
        <div className={styles.panelBody}>
          <EditQuizForm quiz={quiz} isAdmin={role === 'admin' || role === 'super_admin'} />
        </div>
      </div>
    </div>
  )
}
