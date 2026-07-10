'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock } from 'lucide-react'
import { scheduleQuizLive } from '@/app/actions/quizzes'
import styles from '@/components/dashboard/dashboard.module.css'

export default function ScheduleQuizForm({ quizzes }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await scheduleQuizLive(new FormData(event.currentTarget))
      if (result.error) {
        setError(result.error)
      } else {
        setMessage('Quiz schedule updated for all students.')
        router.refresh()
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.scheduleForm}>
      <div className={styles.scheduleFormHeader}>
        <span className={styles.scheduleIcon}>
          <CalendarClock size={18} />
        </span>
        <div>
          <h3>Live Schedule</h3>
          <p>Set one quiz live for all students.</p>
        </div>
      </div>

      <div className={styles.scheduleGrid}>
        <label className={`${styles.formField} ${styles.scheduleField}`}>
          <span>Exam</span>
          <select name="quiz_id" className={`${styles.input} ${styles.scheduleInput}`} required defaultValue="">
            <option value="" disabled>Select a quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
            ))}
          </select>
        </label>

        <label className={`${styles.formField} ${styles.scheduleField}`}>
          <span>Available From</span>
          <input type="datetime-local" name="starts_at" className={`${styles.input} ${styles.scheduleInput}`} required />
        </label>

        <label className={`${styles.formField} ${styles.scheduleField}`}>
          <span>Available Until</span>
          <input type="datetime-local" name="ends_at" className={`${styles.input} ${styles.scheduleInput}`} />
        </label>

        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Saving...' : 'Set Live'}
        </button>
      </div>

      {message && <p className={styles.scheduleSuccess}>{message}</p>}
      {error && <p className={styles.scheduleError}>{error}</p>}
    </form>
  )
}
