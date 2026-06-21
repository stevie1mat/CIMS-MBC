'use client'

import styles from '@/components/dashboard/dashboard.module.css'
import { AlertCircle, CreditCard } from 'lucide-react'

export default function FeesPrompt() {
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <AlertCircle size={32} />
          </div>
          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem' }}>Fees Pending</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Your fees for the current semester have not been paid. Please clear your dues to regain full access to the dashboard, exams, and materials.
          </p>
        </div>
      </div>
    </div>
  )
}
