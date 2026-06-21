'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { startQuizAttempt } from '@/app/actions/attempts'
import styles from '@/components/dashboard/dashboard.module.css'
import { PlayCircle } from 'lucide-react'

export default function StartQuizButton({ quizId, openAttemptExists }: { quizId: string | number, openAttemptExists?: boolean }) {
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
    <div>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      <button 
        onClick={handleStart} 
        className={styles.btnPrimary}
        style={{ width: '100%', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        disabled={loading}
      >
        <PlayCircle size={18} />
        {loading ? (openAttemptExists ? 'Resuming...' : 'Starting...') : (openAttemptExists ? 'Resume Quiz' : 'Start Quiz')}
      </button>
    </div>
  )
}
