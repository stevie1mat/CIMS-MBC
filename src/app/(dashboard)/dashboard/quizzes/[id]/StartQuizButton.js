'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startQuizAttempt } from '@/app/actions/attempts'
import styles from '@/components/dashboard/dashboard.module.css'
import { PlayCircle } from 'lucide-react'

export default function StartQuizButton({ quizId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleStart = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await startQuizAttempt(quizId)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push(`/dashboard/quizzes/${quizId}/attempt`)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      <button 
        onClick={handleStart} 
        className={styles.btnPrimary} 
        style={{ padding: '1rem 3rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0 auto' }}
        disabled={loading}
      >
        <PlayCircle size={24} />
        {loading ? 'Starting...' : 'Start Quiz'}
      </button>
    </div>
  )
}
