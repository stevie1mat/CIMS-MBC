'use client'

import React, { useState, useRef } from 'react'
import { submitAssignment } from '@/app/actions/assignments'
import styles from '@/components/dashboard/dashboard.module.css'
import { UploadCloud, File } from 'lucide-react'

export default function UploadSubmission({ assignmentId }: { assignmentId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', padding: '3rem', border: '2px dashed #cbd5e1', borderRadius: '16px', textAlign: 'center', backgroundColor: '#f8fafc', transition: 'all 0.2s ease', position: 'relative' }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.backgroundColor = '#eef2ff' }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#f8fafc' }}
    >
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}
      
      <div style={{ marginBottom: '2rem' }}>
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <File size={56} color="#6366f1" />
            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>{file.name}</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <button 
              type="button" 
              onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = '' }}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}
            >
              Remove File
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <UploadCloud size={56} color="#94a3b8" style={{ transition: 'color 0.2s' }} />
            <span style={{ color: '#475569', fontSize: '1.1rem', fontWeight: 500 }}>Click to select a file</span>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>(PDF, DOCX, ZIP)</span>
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
        style={{ width: '100%', maxWidth: '300px', opacity: (!file || loading) ? 0.5 : 1 }}
      >
        {loading ? 'Uploading...' : 'Submit Assignment'}
      </button>
    </form>
  )
}
