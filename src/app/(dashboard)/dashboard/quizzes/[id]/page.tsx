import { getQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertCircle, ArrowLeft, Clock, FileText, RotateCcw } from 'lucide-react'
import StartQuizButton from './StartQuizButton'
import MetricCard from '@/components/dashboard/MetricCard'
import { createClient } from '@/lib/supabase/server'

type QuizPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: QuizPageProps) {
  const { id } = await params
  const quiz = await getQuiz(id)
  return { title: `${quiz.name} | MBC Portal` }
}

export default async function QuizPortalPage({ params }: QuizPageProps) {
  const { id } = await params
  const role = await getUserRole()
  const isStudent = role === 'student'

  if (!isStudent) {
    redirect('/dashboard/quizzes')
  }

  const quiz = await getQuiz(id)
  const now = new Date()
  const isLive = quiz.starts_at && new Date(quiz.starts_at) <= now && (!quiz.ends_at || new Date(quiz.ends_at) >= now)
  const questionCount = quiz.quiz_questions.length
  const attemptText = quiz.maximum_attempts === 1 ? 'You will have only 1 attempt.' : `You will have ${quiz.maximum_attempts} attempts.`
  const studentSubject = quiz.student_subject || 'Leading with Integrity'
  const studentTeacher = quiz.student_teacher || 'Pr. Benji Mathew'
  const instructionsTitle = quiz.exam_instructions_title || 'Instructions For The Exam'
  const timeText = quiz.exam_time_text || `The Exam duration is ${quiz.duration_minutes} Mins.`
  const questionsText = quiz.exam_questions_text || `You have to attempt all questions. ${attemptText}`
  const resultText = quiz.exam_result_text || 'Your result(score) will be displayed to you as soon as the exam is submitted.'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { count: attemptCount } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', Number(id))
    .eq('profile_id', user?.id)

  const { data: openAttempt } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', Number(id))
    .eq('profile_id', user?.id)
    .eq('status', 'open')
    .maybeSingle()

  const maxAttempts = quiz.maximum_attempts || 1
  const canAttempt = (attemptCount || 0) < maxAttempts

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Exam</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{quiz.name}</p>
        </div>
        <Link href="/dashboard/quizzes">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Quizzes
          </button>
        </Link>
      </div>

      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Duration"
          value={`${quiz.duration_minutes} mins`}
          icon={<Clock size={24} color="#3b82f6" />}
          colorClass="cardBlue"
        />
        <MetricCard
          title="Questions"
          value={questionCount}
          icon={<FileText size={24} color="#ec4899" />}
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
          <h3 className={styles.panelTitle}>{quiz.name}</h3>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.noticeBanner}>
            <AlertCircle size={18} />
            <span>Please Note</span>
          </div>

          <div className={styles.quizDetailLayout}>
            <div className={styles.quizDetailMain}>
              <div className={styles.examBrief}>
                <div className={styles.examMeta}>
                  <p><strong>Subject:</strong> {studentSubject}</p>
                  <p><strong>Teacher:</strong> {studentTeacher}</p>
                </div>

                <div className={styles.examSection}>
                  <h4>{instructionsTitle}</h4>
                  <p><strong>Time:</strong> <strong className={styles.examHighlight}>{timeText}</strong></p>
                  <p><strong>Questions:</strong> <strong className={styles.examHighlight}>{questionsText}</strong></p>
                  <p><strong>Result:</strong> {resultText}</p>
                </div>

              </div>
            </div>

            <div className={styles.quizDetailSide}>
              <div className={styles.quizReadinessCard}>
                <span className={`${styles.statusBadge} ${isLive ? styles.statusBadgeSuccess : styles.statusBadgeWarning}`}>
                  {isLive ? 'Live' : quiz.starts_at ? 'Scheduled' : 'Not scheduled'}
                </span>
                <h4>{isLive ? 'Start when ready' : 'Not available yet'}</h4>
                <p>{isLive ? 'Review the instructions before beginning your attempt.' : 'This quiz will be available when staff make it live.'}</p>
              </div>

              {isLive ? (
                canAttempt ? (
                  <StartQuizButton quizId={quiz.id} openAttemptExists={!!openAttempt} />
                ) : (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '8px', color: '#991b1b', textAlign: 'center', marginTop: '1rem' }}>
                    <strong>Maximum Attempts Reached</strong>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>You have reached the maximum allowed attempts ({maxAttempts}) for this exam.</p>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
