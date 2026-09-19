'use client'

import { useState } from 'react'
import { createQuiz } from '@/app/actions/quizzes'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'

export default function QuizForm({ subjects = [], assignments = [] }: { subjects?: any[], assignments?: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  const availableTeachers = assignments
    .filter(a => a.category_id.toString() === selectedSubject && a.profiles)
    .map(a => a.profiles)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    // Map the ID back to the subject name for backwards compatibility with the quizzes table
    const subject = subjects.find(s => s.id.toString() === formData.get('student_subject'))
    if (subject) {
      formData.set('student_subject', subject.name)
    }

    try {
      const result = await createQuiz(formData)
      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/dashboard/exams/${result.quiz.id}/edit`)
      }
    } catch (err) {
      setError(err.message || 'Failed to create exam')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && <div className={styles.feesAlert} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>{error}</div>}
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Exam Name</label>
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
          rows={3} 
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

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject</label>
          <select 
            name="student_subject" 
            className={styles.input} 
            required
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select subject</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Teacher</label>
          <select 
            name="student_teacher" 
            className={styles.input} 
            required
            disabled={!selectedSubject || availableTeachers.length === 0}
          >
            <option value="">
              {!selectedSubject 
                ? 'Select a subject first' 
                : availableTeachers.length === 0 
                  ? 'No teachers assigned' 
                  : 'Select teacher'}
            </option>
            {availableTeachers.map(t => (
              <option key={t.id} value={`${t.first_name || ''} ${t.last_name || ''}`.trim()}>
                {t.first_name} {t.last_name} ({t.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          type="submit" 
          className={styles.btnPrimary}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create & Add Questions'}
        </button>
      </div>
    </form>
  )
}
