import React from 'react';
import Link from 'next/link';
import AttendClassButton from './AttendClassButton';
import RealEmailPrompt from './RealEmailPrompt';
import FeesPrompt from './FeesPrompt';
import styles from './dashboard.module.css';
import { createClient } from '@/lib/supabase/server';

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

      {/* Feature Cards Grid */}
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
            src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=200&fit=crop" 
            alt="My Attendance" 
            className={styles.imageCardImg}
          />
          <span className={styles.imageCardTitle}>My Attendance</span>
          <Link href="/dashboard/my-attendance" style={{ textDecoration: 'none' }}>
            <button className={styles.btnOutlinePink}>View Now</button>
          </Link>
        </div>
      </div>

    </div>
  );
}
