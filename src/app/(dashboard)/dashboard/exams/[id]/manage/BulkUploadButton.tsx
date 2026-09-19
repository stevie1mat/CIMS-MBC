'use client'

import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import styles from '@/components/dashboard/dashboard.module.css'
import BulkUploadModal from './BulkUploadModal'

type BulkUploadButtonProps = {
  quizId: string
  quizName: string
  variant?: 'primary' | 'outline' | 'emptyState'
}

export default function BulkUploadButton({ quizId, quizName, variant = 'primary' }: BulkUploadButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {variant === 'primary' && (
        <button 
          onClick={() => setShowModal(true)} 
          className={styles.btnPrimary} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UploadCloud size={18} /> Bulk Upload More
        </button>
      )}

      {variant === 'emptyState' && (
        <button 
          onClick={() => setShowModal(true)} 
          className={`${styles.actionButton} ${styles.actionButtonPrimary}`} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: 'none', padding: '0.5rem 1rem' }}
        >
          <UploadCloud size={14} /> Bulk Upload Questions
        </button>
      )}
      
      {showModal && (
        <BulkUploadModal 
          quizId={quizId} 
          quizName={quizName} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  )
}
