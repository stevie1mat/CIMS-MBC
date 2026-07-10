'use client'

import { useState } from 'react'
import { gradeSubmission } from '@/app/actions/assignments'
import styles from '@/components/dashboard/dashboard.module.css'
import { Check } from 'lucide-react'

export default function GradeSubmissionForm({ submissionId, currentScore }: { submissionId: number | string, currentScore?: number | string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const score = String(formData.get('score') || '')

    try {
      const result = await gradeSubmission(submissionId, score)
      if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to save grade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input 
        type="number" 
        name="score" 
        className={styles.input} 
        style={{ width: '80px', padding: '0.25rem 0.5rem', margin: 0 }}
        defaultValue={currentScore || ''}
        placeholder="Score"
        min="0"
        max="100"
        required
      />
      <button 
        type="submit" 
        className={styles.btnPrimary} 
        style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center' }}
        disabled={loading}
        title="Save Grade"
      >
        <Check size={16} />
      </button>
      {error && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>Error</span>}
    </form>
  )
}
