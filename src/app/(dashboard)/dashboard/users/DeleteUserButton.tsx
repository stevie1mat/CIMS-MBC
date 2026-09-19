'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteUser } from '@/app/actions/users'

export default function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${userName}? This action cannot be undone and will remove all their data.`)) {
      return
    }

    startTransition(async () => {
      setError(null)
      const res = await deleteUser(userId)
      if (res?.error) {
        setError(res.error)
        window.alert(`Failed to delete user: ${res.error}`)
      }
    })
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      style={{ 
        padding: '6px 12px', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px', 
        fontSize: '12px', 
        borderRadius: '100px',
        backgroundColor: '#fee2e2',
        color: '#ef4444',
        border: '1px solid #fca5a5',
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.7 : 1,
        transition: 'all 0.2s ease',
        fontWeight: 600
      }}
      onMouseOver={(e) => {
        if (!isPending) e.currentTarget.style.backgroundColor = '#fecaca'
      }}
      onMouseOut={(e) => {
        if (!isPending) e.currentTarget.style.backgroundColor = '#fee2e2'
      }}
    >
      <Trash2 size={14} />
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  )
}
