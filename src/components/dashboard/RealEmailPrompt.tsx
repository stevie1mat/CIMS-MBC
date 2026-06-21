'use client'

import { useState } from 'react'
import { updateRealEmail } from '@/app/actions/profile'
import styles from '@/components/dashboard/dashboard.module.css'
import { Mail, ArrowRight } from 'lucide-react'

export default function RealEmailPrompt() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      setLoading(false)
      return
    }

    const result = await updateRealEmail(email)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className={styles.panel} style={{ width: '100%', maxWidth: '450px', margin: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Mail size={32} />
          </div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>Update Your Contact Email</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            To ensure you receive important notifications like exam results and announcements, please provide your primary email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569', fontSize: '0.875rem' }}>Primary Email Address</label>
            <input 
              type="email" 
              name="email" 
              className={styles.input} 
              required 
              placeholder="e.g., student@gmail.com"
              style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.btnPrimary} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? 'Saving...' : 'Save Email'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
