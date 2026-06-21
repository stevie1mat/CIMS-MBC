'use client'

import { useState, useRef } from 'react'
import { uploadQuestions } from '@/app/actions/questions'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

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
      setError('')
      setSuccess('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError('')
      setSuccess('')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
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
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred during upload.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
      
      {/* Alert Messages */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991b1b' }}>
          <AlertTriangle size={20} />
          <div>
            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Upload Failed</h5>
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#166534' }}>
          <CheckCircle size={20} />
          <div>
            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Success</h5>
            <span style={{ fontSize: '0.9rem' }}>{success}</span>
          </div>
        </div>
      )}
      
      {/* Target Quiz Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>Step 1: Select Target Quiz</label>
        <select 
          className={styles.input} 
          value={quizId}
          onChange={(e) => setQuizId(e.target.value)}
          required
          style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer' }}
        >
          <option value="" disabled>-- Select the quiz to add questions to --</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.name}</option>
          ))}
        </select>
      </div>

      {/* File Upload Zone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>Step 2: Upload File</label>
        <div 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ 
            padding: '3rem 2rem', 
            border: '2px dashed #cbd5e1', 
            borderRadius: '0.75rem', 
            textAlign: 'center',
            backgroundColor: file ? '#f8fafc' : '#ffffff',
            transition: 'all 0.2s ease',
            cursor: file ? 'default' : 'pointer'
          }}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'inline-flex' }}>
                <FileSpreadsheet size={40} color="#16a34a" />
              </div>
              <div>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a', display: 'block' }}>{file.name}</strong>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{(file.size / 1024).toFixed(2)} KB</span>
              </div>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setFile(null); if(fileInputRef.current) fileInputRef.current.value = '' }}
                style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.4rem 1rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500, transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#fef2f2' }}
                onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent' }}
              >
                Remove File
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'inline-flex' }}>
                <UploadCloud size={40} color="#64748b" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#334155', fontSize: '1.2rem' }}>Click to upload or drag and drop</h4>
                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Only Excel files (.xlsx, .xls) and CSVs are supported</span>
              </div>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".xlsx, .xls, .csv"
          />
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <button 
          type="submit" 
          className={styles.btnPrimary} 
          disabled={loading || !file || !quizId}
          style={{ 
            padding: '0.75rem 2rem', 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            opacity: (!file || !quizId || loading) ? 0.6 : 1
          }}
        >
          {loading ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 2s linear infinite' }} /> Processing...
            </>
          ) : (
            <>
              <UploadCloud size={20} /> Begin Import
            </>
          )}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </form>
  )
}
