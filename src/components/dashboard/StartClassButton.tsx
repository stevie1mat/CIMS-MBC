'use client'

import React, { useState } from 'react'
import { markAttendanceAndGetLink } from '@/app/actions/attendance'
import { Video } from 'lucide-react'
import styles from './dashboard.module.css'

export default function StartClassButton() {
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const result = await markAttendanceAndGetLink()
      if (result.success && result.link) {
        window.open(result.link, '_blank')
      } else {
        alert(result.error || 'Failed to get class link.')
      }
    } catch (e) {
      alert('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      className={styles.btnBlue} 
      style={{ padding: '0.75rem 1.5rem', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}
      onClick={handleStart}
      disabled={loading}
    >
      <Video size={20} />
      {loading ? 'STARTING...' : 'START CLASS'}
    </button>
  )
}
