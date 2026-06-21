'use client'

import { useState } from 'react'
import { deleteAttempt } from '@/app/actions/results'
import { Trash2 } from 'lucide-react'

export default function DeleteAttemptButton({ attemptId, quizId }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this attempt? The student will be able to retake the exam.')) {
      setIsDeleting(true)
      const res = await deleteAttempt(attemptId, quizId)
      if (res?.error) {
        alert(res.error)
        setIsDeleting(false)
      }
      // Since it calls revalidatePath, the page should automatically refresh on success
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.35rem 0.75rem',
        backgroundColor: '#fee2e2',
        color: '#ef4444',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        opacity: isDeleting ? 0.7 : 1,
        transition: 'all 0.2s',
      }}
      onMouseOver={(e) => {
        if (!isDeleting) {
          e.currentTarget.style.backgroundColor = '#fca5a5'
        }
      }}
      onMouseOut={(e) => {
        if (!isDeleting) {
          e.currentTarget.style.backgroundColor = '#fee2e2'
        }
      }}
      title="Delete Attempt"
    >
      <Trash2 size={16} />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  )
}
