'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuizAnswers } from '@/app/actions/attempts'
import styles from '@/components/dashboard/dashboard.module.css'
import { Clock, AlertTriangle } from 'lucide-react'

export default function AttemptClient({ quiz, attempt }) {
  const router = useRouter()
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Calculate remaining time
  useEffect(() => {
    const startedAt = new Date(attempt.started_at).getTime()
    const durationMs = quiz.duration_minutes * 60 * 1000
    const endAt = startedAt + durationMs

    const updateTimer = () => {
      const now = new Date().getTime()
      const remaining = Math.max(0, Math.floor((endAt - now) / 1000))
      setTimeLeft(remaining)

      if (remaining === 0 && !isSubmitting) {
        handleSubmit(new Event('submit')) // Auto-submit when time is up
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [attempt.started_at, quiz.duration_minutes, isSubmitting])

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')

    try {
      const result = await submitQuizAnswers(attempt.id, answers)
      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else {
        router.push('/dashboard/results')
      }
    } catch (err) {
      setError('An unexpected error occurred while submitting.')
      setIsSubmitting(false)
    }
  }

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Sort questions
  const questions = [...quiz.quiz_questions].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Sticky Header with Timer */}
      <div style={{ 
        position: 'sticky', 
        top: '1rem', 
        zIndex: 10, 
        backgroundColor: '#fff', 
        padding: '1rem 1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        border: timeLeft < 60 ? '2px solid #ef4444' : '1px solid #e2e8f0'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>{quiz.name}</h2>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Answered: {Object.keys(answers).length} / {questions.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 60 ? '#ef4444' : '#0ea5e9', fontWeight: 'bold', fontSize: '1.5rem' }}>
          <Clock size={28} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {error && (
        <div className={styles.feesAlert} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {questions.map((qq, index) => {
            const q = qq.questions
            // Sort options
            const options = [...q.question_options].sort((a, b) => a.sort_order - b.sort_order)

            return (
              <div key={q.id} className={styles.panel} style={{ borderLeft: answers[q.id] ? '4px solid #10b981' : '4px solid #e2e8f0' }}>
                <div className={styles.panelBody}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 'bold', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0 }}>
                      {index + 1}
                    </span>
                    <div style={{ fontSize: '1.1rem', color: '#1e293b', paddingTop: '4px' }} dangerouslySetInnerHTML={{ __html: q.body }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '3rem' }}>
                    {options.map((opt) => (
                      <label 
                        key={opt.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          padding: '0.75rem', 
                          backgroundColor: answers[q.id] === opt.id ? '#f0fdf4' : '#f8fafc', 
                          border: answers[q.id] === opt.id ? '1px solid #86efac' : '1px solid #e2e8f0',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <input 
                          type="radio" 
                          name={`question_${q.id}`} 
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleOptionSelect(q.id, opt.id)}
                          style={{ width: '1.25rem', height: '1.25rem', accentColor: '#0ea5e9' }}
                        />
                        <span style={{ fontSize: '1rem', color: '#334155' }}>{opt.option_text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            type="submit" 
            className={styles.btnPrimary} 
            style={{ padding: '1rem 4rem', fontSize: '1.25rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Final Answers'}
          </button>
        </div>
      </form>
    </div>
  )
}
