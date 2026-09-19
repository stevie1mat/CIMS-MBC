'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function UpcomingExamBanner({ quiz }: { quiz: any }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, isLive: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const startTime = new Date(quiz.starts_at).getTime()
      const difference = startTime - now

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isLive: true })
        // Optional: you could force a refresh here to switch to the Live banner
      } else {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setTimeLeft({ hours, minutes, seconds, isLive: false })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [quiz.starts_at])

  if (timeLeft.isLive) {
    return (
      <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'center', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#0f172a', fontWeight: 600, fontSize: '1.25rem', margin: '0 0 1rem 0' }}>The exam is starting now! Please refresh the page.</p>
        <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          Refresh Page
        </button>
      </div>
    )
  }

  const startDate = new Date(quiz.starts_at)
  const isToday = new Date().toDateString() === startDate.toDateString()

  return (
    <div style={{ 
      padding: '3rem', 
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
      borderRadius: '24px', 
      color: 'white', 
      marginBottom: '2rem', 
      boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', backdropFilter: 'blur(10px)' }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Upcoming Exam</span>
        </div>
        
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{quiz.name}</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>
          Scheduled for {isToday ? 'Today at ' : `${startDate.toLocaleDateString()} at `} 
          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', minWidth: '80px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{String(timeLeft.hours).padStart(2, '0')}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '0.5rem', opacity: 0.8, fontWeight: 600 }}>Hours</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', minWidth: '80px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '0.5rem', opacity: 0.8, fontWeight: 600 }}>Minutes</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', minWidth: '80px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginTop: '0.5rem', opacity: 0.8, fontWeight: 600 }}>Seconds</div>
          </div>
        </div>
      </div>
    </div>
  )
}
