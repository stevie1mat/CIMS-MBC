'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateQuiz } from '@/app/actions/quizzes'
import styles from '@/components/dashboard/dashboard.module.css'
import { Clock, FileText, Info } from 'lucide-react'

export default function EditQuizForm({ quiz }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const defaultAttemptsText = quiz.maximum_attempts === 1
    ? 'You will have only 1 attempt.'
    : `You will have ${quiz.maximum_attempts} attempts.`

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await updateQuiz(quiz.id, new FormData(event.currentTarget))
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/dashboard/quizzes')
        router.refresh()
      }
    } catch (err) {
      setError(err.message || 'Failed to update quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.quizEditForm}>
      {error && (
        <div className={styles.feesAlert} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}

      <section className={styles.formSection}>
        <div className={styles.formSectionHeader}>
          <FileText size={20} />
          <div>
            <h4>Basic Details</h4>
            <p>The quiz name shown across the portal.</p>
          </div>
        </div>

        <label className={styles.formField}>
          <span>Quiz Name</span>
          <input name="name" className={styles.input} defaultValue={quiz.name || ''} required />
        </label>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formSectionHeader}>
          <Clock size={20} />
          <div>
            <h4>Attempt Settings</h4>
            <p>Set the time limit and allowed attempts for this quiz.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.formField}>
            <span>Duration (Minutes)</span>
            <input type="number" name="duration_minutes" className={styles.input} defaultValue={quiz.duration_minutes || 10} min="1" required />
          </label>

          <label className={styles.formField}>
            <span>Maximum Attempts</span>
            <input type="number" name="maximum_attempts" className={styles.input} defaultValue={quiz.maximum_attempts || 1} min="1" required />
          </label>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formSectionHeader}>
          <Info size={20} />
          <div>
            <h4>Student Page Content</h4>
            <p>This is the exact content students see before starting the quiz.</p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.formField}>
            <span>Subject</span>
            <input
              name="student_subject"
              className={styles.input}
              defaultValue={quiz.student_subject || 'Leading with Integrity'}
            />
          </label>

          <label className={styles.formField}>
            <span>Teacher</span>
            <input
              name="student_teacher"
              className={styles.input}
              defaultValue={quiz.student_teacher || 'Pr. Benji Mathew'}
            />
          </label>
        </div>

        <label className={styles.formField}>
          <span>Instructions Heading</span>
          <input
            name="exam_instructions_title"
            className={styles.input}
            defaultValue={quiz.exam_instructions_title || 'Instructions For The Exam'}
          />
        </label>

        <div className={styles.formGrid}>
          <label className={styles.formField}>
            <span>Time Text</span>
            <textarea
              name="exam_time_text"
              className={styles.input}
              rows="2"
              defaultValue={quiz.exam_time_text || `The Exam duration is ${quiz.duration_minutes || 10} Mins.`}
            />
          </label>

          <label className={styles.formField}>
            <span>Questions Text</span>
            <textarea
              name="exam_questions_text"
              className={styles.input}
              rows="2"
              defaultValue={quiz.exam_questions_text || `You have to attempt all questions. ${defaultAttemptsText}`}
            />
          </label>
        </div>

        <label className={styles.formField}>
          <span>Result Text</span>
          <textarea
            name="exam_result_text"
            className={styles.input}
            rows="2"
            defaultValue={quiz.exam_result_text || 'Your result(score) will be displayed to you as soon as the exam is submitted.'}
          />
        </label>
      </section>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnOutline} onClick={() => router.push('/dashboard/quizzes')}>
          Cancel
        </button>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </form>
  )
}
