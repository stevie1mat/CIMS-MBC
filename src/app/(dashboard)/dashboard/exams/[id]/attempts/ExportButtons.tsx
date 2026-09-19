'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Download, Mail } from 'lucide-react'
import { sendAttemptsCsvEmail } from '@/app/actions/export'

export default function ExportButtons({ quiz, attempts }) {
  const [isEmailing, setIsEmailing] = useState(false)

  const formatData = () => {
    return attempts.map(attempt => ({
      'Student Name': `${attempt.profiles?.first_name || ''} ${attempt.profiles?.last_name || ''}`.trim(),
      'Email': attempt.profiles?.email || '',
      'Score': attempt.score_obtained || 0,
      'Percentage': attempt.percentage_obtained ? `${Number(attempt.percentage_obtained).toFixed(1)}%` : '0%',
      'Status': attempt.status || '',
      'Date Started': new Date(attempt.started_at).toLocaleString()
    }))
  }

  const handleDownload = () => {
    const data = formatData()
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Attempts")
    XLSX.writeFile(wb, `${quiz.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attempts.csv`, { bookType: 'csv' })
  }

  const handleEmail = async () => {
    setIsEmailing(true)
    try {
      const res = await sendAttemptsCsvEmail(quiz.id, quiz.name, attempts)
      if (res.error) {
        alert(`Error: ${res.error}`)
      } else {
        alert(res.message || 'Email sent successfully!')
      }
    } catch (e) {
      alert('An unexpected error occurred.')
    } finally {
      setIsEmailing(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <button 
        onClick={handleDownload}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        title="Download CSV"
      >
        <Download size={16} />
        Download CSV
      </button>

      <button 
        onClick={handleEmail}
        disabled={isEmailing}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#f0f9ff',
          color: '#0369a1',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: isEmailing ? 'not-allowed' : 'pointer',
          opacity: isEmailing ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
        title="Email CSV to Default Address"
      >
        <Mail size={16} />
        {isEmailing ? 'Sending...' : 'Email CSV'}
      </button>
    </div>
  )
}
