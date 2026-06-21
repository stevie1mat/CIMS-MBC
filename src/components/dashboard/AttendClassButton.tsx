'use client'

import React, { useState } from 'react'
import { markAttendanceAndGetLink } from '@/app/actions/attendance'
import styles from './dashboard.module.css'

export default function AttendClassButton() {
  const [loading, setLoading] = useState(false)

  const handleAttend = async () => {
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
      style={{ width: '100%' }}
      onClick={handleAttend}
      disabled={loading}
    >
      {loading ? 'Connecting...' : 'Attend Class'}
    </button>
  )
}
