'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { Trash2, AlertTriangle } from 'lucide-react'
import styles from './dashboard.module.css'

export default function DeleteFormButton({ 
  message = "Are you sure you want to remove this item?",
  label = "Remove",
  variant = "outline"
}: { 
  message?: string,
  label?: string,
  variant?: 'outline' | 'text'
}) {
  const { pending } = useFormStatus()
  const [showModal, setShowModal] = useState(false)
  const [wasPending, setWasPending] = useState(false)

  // Close modal automatically when the server action finishes
  useEffect(() => {
    if (pending) {
      setWasPending(true)
    }
    if (!pending && wasPending) {
      setShowModal(false)
      setWasPending(false)
    }
  }, [pending, wasPending])

  const buttonStyle = variant === 'outline' ? {
    padding: '6px 12px', 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontSize: '12px', 
    borderRadius: '100px',
    color: '#ef4444',
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    opacity: pending ? 0.7 : 1,
    cursor: pending ? 'not-allowed' : 'pointer'
  } : {
    color: '#ef4444', 
    background: 'none', 
    border: 'none', 
    cursor: pending ? 'not-allowed' : 'pointer', 
    fontSize: '12px', 
    textDecoration: 'underline', 
    padding: 0,
    opacity: pending ? 0.7 : 1,
  };

  return (
    <>
      <button 
        type="button" 
        disabled={pending}
        onClick={() => setShowModal(true)}
        className={variant === 'outline' ? styles.btnOutline : ''} 
        style={buttonStyle}
      >
        {variant === 'outline' && <Trash2 size={14} />}
        {pending && !showModal ? (variant === 'text' ? '...' : 'Removing...') : label}
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
              {message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className={styles.btnOutline}
                style={{ flex: 1, padding: '12px', fontSize: '14px', borderRadius: '8px' }}
                disabled={pending}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.btnPrimary}
                style={{ flex: 1, padding: '12px', fontSize: '14px', borderRadius: '8px', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                disabled={pending}
              >
                {pending ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
