import React from 'react';
import Link from 'next/link';
import AttendClassButton from './AttendClassButton';
import RealEmailPrompt from './RealEmailPrompt';
import FeesPrompt from './FeesPrompt';
import styles from './dashboard.module.css';
import { createClient } from '@/lib/supabase/server';
import UpcomingExamBanner from './UpcomingExamBanner';

export default async function StudentView({ 
  user, 
  feesPaid,
  realEmail,
  avatarUrl
}: { 
  user: any; 
  feesPaid?: boolean;
  realEmail?: string | null;
  avatarUrl?: string | null;
}) {
  const fullName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` 
    : user?.email || 'Student User';

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff`

  const supabase = await createClient();
  const now = new Date().toISOString();
  
  const { data: liveQuiz } = await supabase
    .from('quizzes')
    .select('id, name, description')
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let upcomingQuiz = null;
  if (!liveQuiz) {
    const { data } = await supabase
      .from('quizzes')
      .select('id, name, starts_at')
      .gt('starts_at', now)
      .order('starts_at', { ascending: true })
      .limit(1)
      .maybeSingle();
      
    upcomingQuiz = data;
  }

  return (
    <div>
      {!realEmail ? (
        <RealEmailPrompt />
      ) : !feesPaid ? (
        <FeesPrompt />
      ) : null}
      
      {/* Hero Banner Image */}
      <div className={styles.bannerContainer} />

      {/* Profile Card overlapping the banner */}
      <div className={styles.profileCardWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.profileInfo}>
            <div style={{ position: 'relative' }}>
              <img 
                src={avatarUrl || defaultAvatar}
                alt="Profile avatar" 
                className={styles.cardAvatar}
              />
              <Link href="/dashboard/profile" title="Edit Avatar">
                <div style={{ 
                  position: 'absolute', bottom: 0, right: 0, 
                  background: '#ffffff', borderRadius: '50%', padding: '5px', 
                  cursor: 'pointer', border: '1px solid #e2e8f0', 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </div>
              </Link>
            </div>
            <div className={styles.profileText}>
              <h2>{fullName}</h2>
              <p>MBC CIMS Student</p>
            </div>
          </div>
          <div className={styles.profileActions}>
            <AttendClassButton />
            <Link href="/dashboard/exams" style={{ textDecoration: 'none' }}>
              <button className={styles.btnGreen} style={{ width: '100%' }}>Attempt Exam</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Section Title */}
      <h3 className={styles.sectionTitle}>MBC CIMS Dashboard</h3>

      {liveQuiz ? (
        <div style={{ 
          padding: '3rem', 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
          borderRadius: '24px', 
          color: 'white', 
          marginBottom: '2rem', 
          boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4), 0 10px 10px -5px rgba(16, 185, 129, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background circles */}
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px', backdropFilter: 'blur(10px)' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#ecfdf5', borderRadius: '50%', boxShadow: '0 0 10px #ecfdf5' }}></span>
              <span style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Live Exam Available</span>
            </div>
            
            <h2 style={{ fontSize: '3rem', margin: '0 0 1rem 0', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{liveQuiz.name}</h2>
            
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2.5rem', maxWidth: '700px', lineHeight: 1.5 }}>
              {liveQuiz.description || 'This exam is currently live and available for you to attempt. Please ensure you have a stable connection and sufficient time before beginning.'}
            </p>
            
            <Link href={`/dashboard/exams/${liveQuiz.id}`} style={{ textDecoration: 'none' }}>
              <button style={{ 
                padding: '1.25rem 3rem', 
                background: 'white', 
                color: '#059669', 
                border: 'none', 
                borderRadius: '12px', 
                fontSize: '1.2rem', 
                fontWeight: 800, 
                cursor: 'pointer', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}>
                ATTEMPT EXAM NOW
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </Link>
          </div>
        </div>
      ) : upcomingQuiz ? (
        <UpcomingExamBanner quiz={upcomingQuiz} />
      ) : (
        <div className={styles.imageCardGrid}>
          {/* CIMS Exam Card */}
          <div className={styles.imageCard}>
            <img 
              src="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=200&fit=crop" 
              alt="CIMS Exam" 
              className={styles.imageCardImg}
            />
            <span className={styles.imageCardTitle}>CIMS Exam</span>
            <Link href="/dashboard/exams" style={{ textDecoration: 'none' }}>
              <button className={styles.btnOutlinePink}>Attempt Exam</button>
            </Link>
          </div>

          {/* My Results Card */}
          <div className={styles.imageCard}>
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop" 
              alt="My Results" 
              className={styles.imageCardImg}
            />
            <span className={styles.imageCardTitle}>My Results</span>
            <Link href="/dashboard/results" style={{ textDecoration: 'none' }}>
              <button className={styles.btnOutlinePink}>View Now</button>
            </Link>
          </div>

          {/* My Attendance Card */}
          <div className={styles.imageCard}>
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop" 
              alt="My Attendance" 
              className={styles.imageCardImg}
            />
            <span className={styles.imageCardTitle}>My Attendance</span>
            <Link href="/dashboard/attendance" style={{ textDecoration: 'none' }}>
              <button className={styles.btnOutlinePink}>View Now</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
