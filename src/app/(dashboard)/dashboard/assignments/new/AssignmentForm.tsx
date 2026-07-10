'use client'

import { useState, useEffect } from 'react'
import { createAssignment, updateAssignment } from '@/app/actions/assignments'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'

export default function AssignmentForm({ categories = [], initialData = null }: { categories?: any[], initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formDataState, setFormDataState] = useState({
    title: '',
    category_id: '',
    description: '',
    due_at: ''
  })

  useEffect(() => {
    if (initialData) {
      // Format datetime-local string (YYYY-MM-DDThh:mm)
      let formattedDate = ''
      if (initialData.due_at) {
        const d = new Date(initialData.due_at)
        formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      }
      
      setFormDataState({
        title: initialData.title || '',
        category_id: initialData.category_id || '',
        description: initialData.description || '',
        due_at: formattedDate
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    setFormDataState(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const result = initialData 
        ? await updateAssignment(initialData.id, formData)
        : await createAssignment(formData)
        
      if (result.error) {
        setError(result.error)
      } else {
        router.push('/dashboard/assignments')
      }
    } catch (err) {
      setError(err.message || 'Failed to save assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {error && <div className={styles.feesAlert} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>{error}</div>}
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Assignment Title</label>
        <input 
          type="text" 
          name="title" 
          className={styles.input} 
          required 
          placeholder="e.g., Essay on Genesis"
          value={formDataState.title}
          onChange={handleChange}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subject (Category)</label>
        <select name="category_id" className={styles.input} required value={formDataState.category_id} onChange={handleChange}>
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
          value={formDataState.description}
          onChange={handleChange}
        ></textarea>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Due Date</label>
        <input 
          type="datetime-local" 
          name="due_at" 
          className={styles.input} 
          required 
          value={formDataState.due_at}
          onChange={handleChange}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Attachment (Optional)</label>
        <input 
          type="file" 
          name="attachment" 
          className={styles.input} 
          accept=".pdf,.doc,.docx,image/*"
        />
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          {initialData?.attachment_path ? 'Upload a new file to replace the existing attachment.' : 'Upload a PDF, Word document, or image'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Assignment' : 'Create Assignment')}
        </button>
      </div>
    </form>
  )
}
