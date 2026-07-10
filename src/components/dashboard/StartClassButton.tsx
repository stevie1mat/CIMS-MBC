'use client'

import React, { useState } from 'react'
import { markAttendanceAndGetLink } from '@/app/actions/attendance'
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
      style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
      onClick={handleStart}
      disabled={loading}
    >
      {loading ? 'Starting...' : 'Start Class'}
    </button>
  )
}
