import { getQuizzes, deleteQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Edit, List, PlayCircle, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import DeleteQuizButton from '@/components/dashboard/DeleteQuizButton'
import ScheduleQuizForm from './ScheduleQuizForm'

export const metadata = {
  title: 'Quizzes | MBC Portal',
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzes()
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  const now = new Date()
  const isQuizLive = (quiz) => {
    if (!quiz.starts_at) return false
    const startsAt = new Date(quiz.starts_at)
    const endsAt = quiz.ends_at ? new Date(quiz.ends_at) : null
    return startsAt <= now && (!endsAt || endsAt >= now)
  }

  const liveQuizzes = quizzes.filter(isQuizLive)

  // For students, immediately redirect to the live exam or show a simple empty state
  if (!isStaff) {
    if (liveQuizzes.length > 0) {
      redirect(`/dashboard/quizzes/${liveQuizzes[0].id}`)
    }

    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <FileText size={64} color="#94a3b8" style={{ opacity: 0.5 }} />
        </div>
        <h2 style={{ color: '#0f172a', marginBottom: '1rem', fontSize: '1.8rem' }}>No Live Exam Available</h2>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
          There are currently no active exams available for you to take. Please check back when your teacher schedules one.
        </p>
        <Link href="/dashboard">
          <button className={styles.btnPrimary} style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
            Return to Dashboard
          </button>
        </Link>
      </div>
    )
  }

  const getQuizAvailability = (quiz) => {
    if (!quiz.starts_at) {
      return { label: 'Not scheduled', className: styles.statusBadgeWarning, meta: null }
    }

    const startsAt = new Date(quiz.starts_at)
    const endsAt = quiz.ends_at ? new Date(quiz.ends_at) : null

    if (endsAt && endsAt < now) {
      return { label: 'Ended', className: styles.statusBadgeMuted, meta: endsAt.toLocaleString() }
    }

    if (startsAt > now) {
      return { label: 'Scheduled', className: styles.statusBadgeMuted, meta: startsAt.toLocaleString() }
    }

    return { label: 'Live', className: styles.statusBadgeSuccess, meta: startsAt.toLocaleString() }
  }

  const visibleQuizzes = quizzes
  const activeQuizzes = liveQuizzes.length;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>{isStaff ? 'Manage Quizzes' : 'Available Quizzes'}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            {isStaff ? 'Create and manage all test and assignment quizzes.' : 'Take a quiz to test your knowledge.'}
          </p>
        </div>
        
        {isStaff && (
          <Link href="/dashboard/quizzes/new">
            <button className={styles.btnPrimary} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Plus size={18} /> Create Quiz
            </button>
          </Link>
        )}
      </div>

      {/* Metric Row */}
      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard 
          title="Total Quizzes" 
          value={quizzes.length} 
          icon={<FileText size={24} color="#3b82f6" />} 
          colorClass="cardBlue"
        />
        <MetricCard 
          title="Active Quizzes" 
          value={activeQuizzes} 
          icon={<PlayCircle size={24} color="#ec4899" />} 
          colorClass="cardPink"
        />
        <MetricCard 
          title="Requires Attention" 
          value={quizzes.length - activeQuizzes} 
          icon={<List size={24} color="#8b5cf6" />} 
          colorClass="cardPurple"
        />
      </div>

      {isStaff && (
        <div className={styles.schedulePanel}>
          <ScheduleQuizForm quizzes={quizzes} />
        </div>
      )}

      {/* Main Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Quiz List</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Quiz Name</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Duration</th>
                {isStaff && <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Availability</th>}
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Questions</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, width: '360px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 5 : 4} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No quizzes available</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{isStaff ? 'Click "Create Quiz" to add one.' : 'Check back when a quiz is live.'}</p>
                  </td>
                </tr>
              ) : (
                visibleQuizzes.map((q) => {
                  const questionCount = q.questions[0]?.count || 0;
                  const availability = getQuizAvailability(q)
                  
                  return (
                    <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div className={styles.quizNameCell}>
                          <div className={styles.quizNameIcon}>
                            <FileText size={17} color="#3b82f6" />
                          </div>
                          <div>
                            <Link href={isStaff ? `/dashboard/quizzes/${q.id}/edit` : `/dashboard/quizzes/${q.id}`} style={{ textDecoration: 'none' }}>
                              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>{q.name}</strong>
                            </Link>
                            {q.description && <p className={styles.quizDescription}>{q.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 500 }}>
                          <Clock size={16} />
                          {q.duration_minutes} mins
                        </div>
                      </td>
                      {isStaff && (
                        <td style={{ padding: '1rem' }}>
                          <div className={styles.availabilityCell}>
                            <span className={`${styles.statusBadge} ${availability.className}`}>
                              {availability.label}
                            </span>
                            {availability.meta && (
                              <span className={styles.availabilityMeta}>
                                {availability.meta}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      <td style={{ padding: '1rem' }}>
                        <span className={`${styles.statusBadge} ${questionCount > 0 ? styles.statusBadgeSuccess : styles.statusBadgeWarning}`}>
                          {questionCount > 0 ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {questionCount} Question{questionCount !== 1 && 's'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div className={styles.tableActions}>
                          {!isStaff ? (
                            <Link href={`/dashboard/quizzes/${q.id}`} className={`${styles.actionButton} ${styles.actionButtonPrimary}`} title="Attempt">
                              <PlayCircle size={14} /> Attempt
                            </Link>
                          ) : (
                            <>
                              <Link href={`/dashboard/quizzes/${q.id}/edit`} className={`${styles.actionButton} ${styles.actionButtonPrimary}`} title="Edit Quiz">
                                <Edit size={14} /> Edit
                              </Link>
                              <Link href={`/dashboard/quizzes/${q.id}/manage`} className={styles.actionButton} title="Manage Questions">
                                <List size={14} /> Questions
                              </Link>
                              <DeleteQuizButton quizId={q.id} deleteAction={deleteQuiz} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
