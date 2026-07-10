'use client'

import React, { useState, useRef } from 'react'
import { submitAssignment } from '@/app/actions/assignments'
import styles from '@/components/dashboard/dashboard.module.css'
import { UploadCloud, File } from 'lucide-react'

export default function UploadSubmission({ assignmentId }: { assignmentId: string }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await submitAssignment(assignmentId, formData)
      if (result.error) {
        setError(result.error)
      }
      // If success, the server action revalidates the path and the parent page will show the success state.
    } catch (err) {
      setError('An unexpected error occurred during upload.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '0.5rem', textAlign: 'center' }}>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      
      <div style={{ marginBottom: '1.5rem' }}>
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <File size={48} color="#0ea5e9" />
            <span style={{ fontWeight: 500, color: '#334155' }}>{file.name}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
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
            <span style={{ color: '#64748b' }}>Click to select a file (PDF, DOCX, ZIP)</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".pdf,.doc,.docx,.zip,.rar,.txt"
      />

      <button 
        type="submit" 
        className={styles.btnPrimary} 
        disabled={!file || loading}
        style={{ width: '100%', maxWidth: '300px' }}
      >
        {loading ? 'Uploading...' : 'Submit Assignment'}
      </button>
    </form>
  )
}
