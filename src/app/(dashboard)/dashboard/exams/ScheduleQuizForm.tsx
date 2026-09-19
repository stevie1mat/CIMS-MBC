'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock } from 'lucide-react'
import { scheduleQuizLive } from '@/app/actions/quizzes'
import styles from '@/components/dashboard/dashboard.module.css'

export default function ScheduleQuizForm({ quizzes, defaultQuizId = "" }: { quizzes: any[], defaultQuizId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const defaultQuiz = quizzes.find(q => q.id.toString() === defaultQuizId) || quizzes[0]
  
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    // format to YYYY-MM-DDThh:mm in local time
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }

  const defaultStartsAt = formatDateForInput(defaultQuiz?.starts_at)
  const defaultEndsAt = formatDateForInput(defaultQuiz?.ends_at)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const result = await scheduleQuizLive(new FormData(event.currentTarget))
      if (result.error) {
        setError(result.error)
      } else {
        setMessage('Exam schedule updated for all students.')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to schedule exam')
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
          <p>Set one exam live for all students.</p>
        </div>
      </div>

      <div className={styles.scheduleGrid}>
        {quizzes.length > 1 ? (
          <label className={`${styles.formField} ${styles.scheduleField}`}>
            <span>Exam</span>
            <select name="quiz_id" className={`${styles.input} ${styles.scheduleInput}`} required defaultValue={defaultQuizId}>
              <option value="" disabled>Select an exam</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="quiz_id" value={quizzes[0]?.id || defaultQuizId} />
        )}
        <label className={`${styles.formField} ${styles.scheduleField}`}>
          <span>Available From</span>
          <input type="datetime-local" name="starts_at" className={`${styles.input} ${styles.scheduleInput}`} required defaultValue={defaultStartsAt} />
        </label>

        <label className={`${styles.formField} ${styles.scheduleField}`}>
          <span>Available Until</span>
          <input type="datetime-local" name="ends_at" className={`${styles.input} ${styles.scheduleInput}`} defaultValue={defaultEndsAt} />
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
