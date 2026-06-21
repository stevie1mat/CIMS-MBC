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

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

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

  const handleClearAnswer = (questionId) => {
    setAnswers(prev => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError('')

    try {
      const result = await submitQuizAnswers(attempt.id, answers)
      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else {
        router.push(`/dashboard/results/${attempt.id}`)
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

  const questions = quiz.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  if (!currentQuestion) return null

  // Sort options
  const options = [...(currentQuestion.question_options || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))

  const progressPercentage = (Object.keys(answers).length / questions.length) * 100
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '6rem', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header with Timer & Progress */}
      <div style={{ 
        position: 'sticky', 
        top: '1rem', 
        zIndex: 50, 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(8px)',
        padding: '1.25rem 1.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        marginBottom: '2.5rem',
        border: timeLeft < 60 ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>{quiz.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft < 60 ? '#ef4444' : '#0f172a', fontWeight: 800, fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '-0.05em' }}>
            <Clock size={24} color={timeLeft < 60 ? '#ef4444' : '#64748b'} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${progressPercentage}%`, 
            backgroundColor: progressPercentage === 100 ? '#10b981' : '#3b82f6',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '9999px'
          }} />
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', fontWeight: 500 }}>
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '1rem' }}>
        {/* Question Area */}
        <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            lineHeight: 1.5, 
            color: '#0f172a', 
            fontWeight: 700, 
            margin: 0,
          }} dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }} />
        </div>

        {/* Options Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem' }}>
          {options.map((opt, idx) => {
            const isSelected = answers[currentQuestion.id] === opt.id;
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            
            return (
              <label 
                key={opt.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.25rem', 
                  padding: '1.25rem 1.5rem', 
                  backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                  border: isSelected ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected ? '0 4px 14px 0 rgba(59, 130, 246, 0.15)' : '0 2px 5px rgba(0,0,0,0.02)',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#3b82f6' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  {letters[idx] || idx + 1}
                </div>
                <input 
                  type="radio" 
                  name={`question_${currentQuestion.id}`}
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(currentQuestion.id, opt.id)}
                  style={{ display: 'none' }} // Hide native radio, we use the label card instead
                />
                <span style={{ fontSize: '1.1rem', color: isSelected ? '#0f172a' : '#334155', fontWeight: isSelected ? 600 : 500 }}>
                  {opt.option_text}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem 0',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              type="button" 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={isFirstQuestion}
              style={{ 
                padding: '0.75rem 1.5rem', 
                backgroundColor: isFirstQuestion ? '#f1f5f9' : '#ffffff', 
                color: isFirstQuestion ? '#94a3b8' : '#334155', 
                border: isFirstQuestion ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                borderRadius: '12px', 
                fontWeight: 600, 
                cursor: isFirstQuestion ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: isFirstQuestion ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              Previous
            </button>
            <button 
              type="button" 
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={isLastQuestion}
              style={{ 
                padding: '0.75rem 2rem', 
                backgroundColor: isLastQuestion ? '#f1f5f9' : '#3b82f6', 
                color: isLastQuestion ? '#94a3b8' : '#ffffff', 
                border: isLastQuestion ? '1px solid #e2e8f0' : 'none',
                borderRadius: '12px', 
                fontWeight: 700, 
                cursor: isLastQuestion ? 'not-allowed' : 'pointer',
                boxShadow: isLastQuestion ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Next
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isLastQuestion && (
              <button 
                type="button" 
                onClick={() => handleSubmit(new Event('submit'))}
                disabled={isSubmitting}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#ffffff', 
                  color: '#ef4444', 
                  border: '1px solid #fca5a5',
                  borderRadius: '12px', 
                  fontWeight: 600, 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? 'Ending...' : 'End Exam?'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
