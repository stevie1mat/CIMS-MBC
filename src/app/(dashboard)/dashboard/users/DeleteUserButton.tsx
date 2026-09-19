'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { deleteUser } from '@/app/actions/users'
import styles from '@/components/dashboard/dashboard.module.css'

export default function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleDelete = () => {
    startTransition(async () => {
      setError(null)
      const res = await deleteUser(userId)
      if (res?.error) {
        setError(res.error)
        window.alert(`Failed to delete user: ${res.error}`)
      } else {
        setShowModal(false)
      }
    })
  }

  return (
    <>
      <button 
        type="button"
        onClick={() => setShowModal(true)}
        disabled={isPending}
        className={styles.btnOutline}
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

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#ef4444' }}>
              <div style={{ padding: '16px', backgroundColor: '#fee2e2', borderRadius: '50%' }}>
                <AlertTriangle size={36} />
              </div>
            </div>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '20px', fontWeight: 700 }}>Confirm Deletion</h3>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px', lineHeight: '1.5' }}>
              Are you sure you want to permanently delete user <strong>{userName}</strong>? This action cannot be undone and will remove all their data.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className={styles.btnOutline}
                style={{ flex: 1, padding: '12px', fontSize: '14px', borderRadius: '8px' }}
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={styles.btnPrimary}
                onClick={handleDelete}
                style={{ flex: 1, padding: '12px', fontSize: '14px', borderRadius: '8px', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
