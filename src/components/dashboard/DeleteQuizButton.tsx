'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'

export default function DeleteQuizButton({ 
  quizId, 
  deleteAction 
}: { 
  quizId: number | string; 
  deleteAction: (id: number | string) => Promise<any>;
}) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this exam? This action cannot be undone and will delete all associated questions and attempts.')) {
      setIsDeleting(true)
      try {
        const result = await deleteAction(quizId)
        if (result && result.success) {
          router.push('/dashboard/exams')
          router.refresh()
        }
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      className={`${styles.actionButton} ${styles.actionButtonDanger}`}
      style={{ opacity: isDeleting ? 0.5 : 1 }}
      title="Delete Exam"
      disabled={isDeleting}
    >
      <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete Exam'}
    </button>
  )
}
