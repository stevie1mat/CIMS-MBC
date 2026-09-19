'use client'

import { useFormStatus } from 'react-dom'
import { Trash2 } from 'lucide-react'
import styles from './dashboard.module.css'

export default function DeleteFormButton({ 
  message = "Are you sure you want to remove this item?",
  label = "Remove"
}: { 
  message?: string,
  label?: string
}) {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault()
        }
      }}
      className={styles.btnOutline} 
      style={{ 
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
      }}
    >
      <Trash2 size={14} /> 
      {pending ? 'Removing...' : label}
    </button>
  )
}
