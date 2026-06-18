'use client'

import { useState, useRef } from 'react'
import { uploadQuestions } from '@/app/actions/questions'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'
import { UploadCloud, File, CheckCircle } from 'lucide-react'

export default function UploadForm({ quizzes }) {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [quizId, setQuizId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!quizId) {
      setError('Please select a target quiz.')
      return
    }
    if (!file) {
      setError('Please select an Excel file to upload.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadQuestions(quizId, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(`Successfully uploaded ${result.count} questions!`)
        setFile(null)
        if(fileInputRef.current) fileInputRef.current.value = ''
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/dashboard/quizzes/${quizId}/manage`)
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred during upload.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
      {error && <div className={styles.feesAlert} style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>{error}</div>}
      {success && (
        <div className={styles.feesAlert} style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}
      
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Target Quiz</label>
        <select 
          className={styles.input} 
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          required
        >
          <option value="">-- Select a Quiz --</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.name}</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: '0.5rem', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '0.5rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <File size={48} color="#10b981" />
              <span style={{ fontWeight: 500, color: '#334155' }}>{file.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{(file.size / 1024).toFixed(2)} KB</span>
              <button 
                type="button" 
                onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = '' }}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem', marginTop: '0.5rem' }}
              >
                Remove File
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={48} color="#94a3b8" />
              <span style={{ color: '#64748b' }}>Click to select Excel file (.xlsx, .xls, .csv)</span>
            </div>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept=".xlsx, .xls, .csv"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button type="submit" className={styles.btnPrimary} disabled={loading || !file || !quizId}>
          {loading ? 'Uploading...' : 'Upload Questions'}
        </button>
      </div>
    </form>
  )
}
