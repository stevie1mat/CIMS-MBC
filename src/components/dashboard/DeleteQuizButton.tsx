'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import styles from '@/components/dashboard/dashboard.module.css'

export default function DeleteQuizButton({ 
  quizId, 
  deleteAction 
}: { 
  quizId: number | string; 
  deleteAction: (id: number | string) => Promise<any>;
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone and will delete all associated questions and attempts.')) {
      setIsDeleting(true)
      try {
        await deleteAction(quizId)
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
      title="Delete Quiz"
      disabled={isDeleting}
    >
      <Trash2 size={14} /> {isDeleting ? 'Deleting' : 'Delete'}
    </button>
  )
}
