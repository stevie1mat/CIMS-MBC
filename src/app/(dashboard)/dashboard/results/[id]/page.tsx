import { getAttemptDetails } from '@/app/actions/results'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import styles from '@/components/dashboard/dashboard.module.css'

export const metadata = {
  title: 'Exam Review | MBC Portal',
}

type AnswerSheetPageProps = {
  params: Promise<{ id: string }>
}

export default async function AnswerSheetPage({ params }: AnswerSheetPageProps) {
  const { id } = await params
  const attempt = await getAttemptDetails(Number(id))

  if (!attempt) {
    redirect('/dashboard/results')
  }

  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  const quiz = attempt.quizzes
  const questions = [...(quiz.questions || [])].sort((a, b) => (a.id || 0) - (b.id || 0))
  const answers = attempt.attempt_answers || []

  // Create a map of question_id -> user's chosen option_id
  const userAnswersMap: Record<number, number> = {}
  answers.forEach(a => {
    userAnswersMap[a.question_id] = a.option_id
  })

  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  const backHref = isStaff ? `/dashboard/exams/${quiz.id}/attempts` : '/dashboard/results'
  const backText = isStaff ? 'Back to Attempts' : 'Back to Results'

  const totalQuestions = questions.length
  const correctCount = attempt.score_obtained || 0
  const incorrectCount = totalQuestions - correctCount
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  const now = new Date()
  const hasExamEnded = quiz.ends_at ? new Date(quiz.ends_at) < now : true // If no end date, it's open-ended, so allow immediately
  const canViewReview = isStaff || hasExamEnded

  return (
    <div style={{ width: '100%', paddingBottom: '4rem' }}>
      {/* Back link */}
      <Link
        href={backHref}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={18} /> {backText}
      </Link>

      {/* Score Summary Card - Light */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
      }}>
        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, color: '#94a3b8' }}>
          Exam Review
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 1.75rem 0', lineHeight: 1.3, color: '#0f172a' }}>
          {quiz.name}
        </h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'stretch' }}>
          {/* Score Circle */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            border: '1px solid #e2e8f0',
            minWidth: '200px'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: `conic-gradient(#6366f1 ${percentage}%, #e2e8f0 0%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '50%',
                background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.95rem', fontWeight: 800, color: '#0f172a'
              }}>
                {percentage}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{correctCount}/{totalQuestions}</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marks Obtained</div>
            </div>
          </div>

          {/* Correct */}
          <div style={{
            background: '#f0fdf4',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid #bbf7d0',
            flex: '1',
            minWidth: '140px'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={22} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{correctCount}</div>
              <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correct</div>
            </div>
          </div>

          {/* Incorrect */}
          <div style={{
            background: '#fef2f2',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid #fecaca',
            flex: '1',
            minWidth: '140px'
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={22} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>{incorrectCount}</div>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Incorrect</div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Header */}
      {canViewReview ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Question Review
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              {totalQuestions} questions
            </div>
          </div>

          {/* Questions Grid */}
          <div className={styles.questionGrid}>
            {questions.map((question, index) => {
              const options = [...(question.question_options || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              const userAnswerId = userAnswersMap[question.id]
              const isUserCorrect = options.some(opt => opt.id === userAnswerId && opt.is_correct)
              const isUnanswered = !userAnswerId

              let cardBorderTop = '#e2e8f0'
              if (!isUnanswered) {
                cardBorderTop = isUserCorrect ? '#10b981' : '#ef4444'
              }

              return (
                <div key={question.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
                  {/* Colored top accent */}
                  <div style={{ height: '4px', background: cardBorderTop }} />

                  <div style={{ padding: '1.75rem' }}>
                    {/* Question header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '10px',
                          background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.85rem', color: '#475569', flexShrink: 0
                        }}>
                          {index + 1}
                        </div>
                        <h3 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
                          {question.question_text}
                        </h3>
                      </div>
                      {userAnswerId ? (
                        isUserCorrect ? (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            color: '#10b981', backgroundColor: '#ecfdf5',
                            padding: '0.3rem 0.85rem', borderRadius: '9999px',
                            fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                            border: '1px solid #a7f3d0'
                          }}>
                            <CheckCircle size={14} /> Correct
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            color: '#ef4444', backgroundColor: '#fef2f2',
                            padding: '0.3rem 0.85rem', borderRadius: '9999px',
                            fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                            border: '1px solid #fecaca'
                          }}>
                            <XCircle size={14} /> Incorrect
                          </div>
                        )
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          color: '#f59e0b', backgroundColor: '#fffbeb',
                          padding: '0.3rem 0.85rem', borderRadius: '9999px',
                          fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                          border: '1px solid #fde68a'
                        }}>
                          <AlertCircle size={14} /> Skipped
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {options.map((opt, optIdx) => {
                        const isSelected = userAnswerId === opt.id
                        const isCorrect = opt.is_correct

                        let bgColor = '#f8fafc'
                        let borderColor = '#f1f5f9'
                        let badgeBgColor = '#e2e8f0'
                        let badgeColor = '#64748b'
                        let textColor = '#475569'
                        let fontWeight = 500

                        if (isCorrect) {
                          bgColor = '#ecfdf5'
                          borderColor = '#86efac'
                          badgeBgColor = '#10b981'
                          badgeColor = '#ffffff'
                          textColor = '#065f46'
                          fontWeight = 600
                        } else if (isSelected && !isCorrect) {
                          bgColor = '#fef2f2'
                          borderColor = '#fca5a5'
                          badgeBgColor = '#ef4444'
                          badgeColor = '#ffffff'
                          textColor = '#991b1b'
                          fontWeight = 600
                        }

                        return (
                          <div
                            key={opt.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.85rem 1rem',
                              borderRadius: '12px',
                              border: `1.5px solid ${borderColor}`,
                              backgroundColor: bgColor,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                backgroundColor: badgeBgColor,
                                color: badgeColor,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                flexShrink: 0
                              }}>
                                {letters[optIdx] || optIdx + 1}
                              </div>
                              <span style={{ fontSize: '0.95rem', color: textColor, fontWeight }}>
                                {opt.option_text}
                              </span>
                            </div>

                            {isCorrect && (
                              <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div style={{ marginTop: '3rem', padding: '3rem 2rem', backgroundColor: '#f8fafc', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.35rem', margin: 0 }}>Full marksheet will be available soon</h3>
        </div>
      )}
    </div>
  )
}
