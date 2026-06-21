import { getAttemptDetails } from '@/app/actions/results'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import styles from '@/components/dashboard/dashboard.module.css'

export const metadata = {
  title: 'Exam Review | MBC Portal',
}

export default async function AnswerSheetPage({ params }: any) {
  const { id } = await params
  const attempt = await getAttemptDetails(id)

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

  const backHref = isStaff ? `/dashboard/quizzes/${quiz.id}/attempts` : '/dashboard/results'
  const backText = isStaff ? 'Back to Attempts' : 'Back to Results'

  return (
    <div style={{ width: '100%', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href={backHref}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', textDecoration: 'none', fontWeight: 500, marginBottom: '1rem' }}
        >
          <ArrowLeft size={18} /> {backText}
        </Link>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Exam Review: {quiz.name}</h1>
        <p style={{ color: '#64748b', margin: 0 }}>
          Marks: <strong style={{ color: '#0f172a' }}>{attempt.score_obtained} / {questions.length}</strong> 
        </p>
      </div>

      <div className={styles.questionGrid}>
        {questions.map((question, index) => {
          const options = [...(question.question_options || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          const userAnswerId = userAnswersMap[question.id]
          const isUserCorrect = options.some(opt => opt.id === userAnswerId && opt.is_correct)

          return (
            <div key={question.id} style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 600, margin: 0, lineHeight: 1.5, paddingRight: '1rem' }}>
                  <span style={{ color: '#64748b', marginRight: '0.5rem' }}>{index + 1}.</span> {question.question_text}
                </h3>
                {userAnswerId ? (
                  isUserCorrect ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', backgroundColor: '#d1fae5', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
                      <CheckCircle size={16} /> Correct
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
                      <XCircle size={16} /> Incorrect
                    </div>
                  )
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
                    Unanswered
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {options.map((opt, optIdx) => {
                  const isSelected = userAnswerId === opt.id
                  const isCorrect = opt.is_correct

                  let bgColor = '#ffffff'
                  let borderColor = '#e2e8f0'
                  let badgeBgColor = '#f1f5f9'
                  let badgeColor = '#64748b'
                  let textColor = '#334155'

                  if (isCorrect) {
                    bgColor = '#ecfdf5'
                    borderColor = '#10b981'
                    badgeBgColor = '#10b981'
                    badgeColor = '#ffffff'
                    textColor = '#065f46'
                  } else if (isSelected && !isCorrect) {
                    bgColor = '#fef2f2'
                    borderColor = '#ef4444'
                    badgeBgColor = '#ef4444'
                    badgeColor = '#ffffff'
                    textColor = '#991b1b'
                  }

                  return (
                    <div 
                      key={opt.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        border: `2px solid ${borderColor}`, 
                        backgroundColor: bgColor,
                        position: 'relative'
                      }}
                    >
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        backgroundColor: badgeBgColor, 
                        color: badgeColor,
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        fontWeight: 700, 
                        marginRight: '1rem',
                        flexShrink: 0
                      }}>
                        {letters[optIdx] || optIdx + 1}
                      </div>
                      <span style={{ fontSize: '1rem', color: textColor, fontWeight: (isCorrect || isSelected) ? 600 : 500 }}>
                        {opt.option_text}
                      </span>
                      
                      {isCorrect && (
                        <div style={{ position: 'absolute', right: '1rem', color: '#10b981' }}>
                          <CheckCircle size={20} />
                        </div>
                      )}
                      {isSelected && !isCorrect && (
                        <div style={{ position: 'absolute', right: '1rem', color: '#ef4444' }}>
                          <XCircle size={20} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
