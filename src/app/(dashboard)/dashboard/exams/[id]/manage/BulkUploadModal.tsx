'use client'

import type React from 'react'
import { useState, useRef } from 'react'
import { uploadQuestions } from '@/app/actions/questions'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2, X, Download } from 'lucide-react'

export default function BulkUploadModal({ quizId, quizName, onClose }: { quizId: string; quizName: string; onClose: () => void }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setSuccess('')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError('')
      setSuccess('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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
        if (fileInputRef.current) fileInputRef.current.value = ''
        setTimeout(() => {
          onClose()
          router.refresh()
        }, 1200)
      }
    } catch (err) {
      setError('An unexpected error occurred during upload.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px',
          width: '100%', maxWidth: '560px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Bulk Upload Questions</h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{quizName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <a href="/template.xlsx" download style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600,
              padding: '6px 12px', borderRadius: '8px', background: '#eef2ff'
            }}>
              <Download size={14} /> Template
            </a>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9', border: 'none', borderRadius: '8px',
                width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748b'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !file && fileInputRef.current?.click()}
            style={{
              padding: '2rem 1.5rem',
              border: `2px dashed ${file ? '#86efac' : '#e2e8f0'}`,
              borderRadius: '14px',
              textAlign: 'center',
              backgroundColor: file ? '#f0fdf4' : '#fafafa',
              cursor: file ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1.25rem'
            }}
          >
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <FileSpreadsheet size={32} color="#16a34a" />
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{file.name}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{(file.size / 1024).toFixed(1)} KB</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', marginTop: '4px' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={32} color="#94a3b8" />
                <p style={{ margin: 0, fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>Click to upload or drag and drop</p>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>.xlsx, .xls, or .csv files</span>
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

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className={styles.btnOutline} style={{ padding: '0.6rem 1.25rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading || !file}
              style={{
                padding: '0.6rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                opacity: (!file || loading) ? 0.6 : 1
              }}
            >
              {loading ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
              ) : (
                <><UploadCloud size={16} /> Import</>
              )}
            </button>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { 100% { transform: rotate(360deg); } }` }} />
        </form>
      </div>
    </div>
  )
}
