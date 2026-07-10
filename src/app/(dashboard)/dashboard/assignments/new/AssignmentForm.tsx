'use client'

import { useState } from 'react'
import { createAssignment } from '@/app/actions/assignments'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'

export default function AssignmentForm({ categories = [] }: { categories?: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createAssignment(formData)
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/dashboard/assignments')
      }
    } catch (err) {
      setError(err.message || 'Failed to create assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
      {error && <div className={styles.feesAlert} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>{error}</div>}
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Assignment Title</label>
        <input 
          type="text" 
          name="title" 
          className={styles.input} 
          required 
          placeholder="e.g., Essay on Genesis"
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject (Category)</label>
        <select name="category_id" className={styles.input} required>
          <option value="">Select a Subject...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description / Instructions</label>
        <textarea 
          name="description" 
          className={styles.input} 
          rows={5} 
          placeholder="What should the student do?"
          required
        ></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Due Date</label>
        <input 
          type="datetime-local" 
          name="due_at" 
          className={styles.input} 
          required 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Creating...' : 'Create Assignment'}
        </button>
      </div>
    </form>
  )
}
