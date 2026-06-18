'use client'

import { useState } from 'react'
import { createQuiz } from '@/app/actions/quizzes'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'

export default function QuizForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.target)

    try {
      const result = await createQuiz(formData)
      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/dashboard/quizzes/${result.quiz.id}/edit`)
      }
    } catch (err) {
      setError(err.message || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && <div className={styles.feesAlert} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>{error}</div>}
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quiz Name</label>
        <input 
          type="text" 
          name="name" 
          className={styles.input} 
          required 
          placeholder="e.g., Midterm Exam 2026"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description (Optional)</label>
        <textarea 
          name="description" 
          className={styles.input} 
          rows="3" 
          placeholder="Instructions or details for the students"
        ></textarea>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Duration (Minutes)</label>
          <input 
            type="number" 
            name="duration_minutes" 
            className={styles.input} 
            defaultValue={10}
            min={1}
            required 
          />
        </div>
        
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Pass Percentage (%)</label>
          <input 
            type="number" 
            name="pass_percentage" 
            className={styles.input} 
            defaultValue={50}
            min={0}
            max={100}
            required 
          />
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Maximum Attempts</label>
          <input 
            type="number" 
            name="maximum_attempts" 
            className={styles.input} 
            defaultValue={1}
            min={1}
            required 
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Creating...' : 'Create & Add Questions'}
        </button>
      </div>
    </form>
  )
}
