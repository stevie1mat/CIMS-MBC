import React from 'react';
import Link from 'next/link';
import AttendClassButton from './AttendClassButton';
import RealEmailPrompt from './RealEmailPrompt';
import FeesPrompt from './FeesPrompt';
import styles from './dashboard.module.css';

export default function StudentView({ 
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
      
      <div className={styles.bannerContainer}></div>
      
      <div className={styles.profileCardWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.profileInfo}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={avatarUrl || defaultAvatar}
                alt="Profile avatar" 
                className={styles.cardAvatar} 
                style={{ objectFit: 'cover' }}
              />
              <Link href="/dashboard/profile" title="Edit Avatar">
                <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'white', borderRadius: '50%', padding: '4px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </div>
              </Link>
            </div>
            <div className={styles.profileText}>
              <h2>{fullName}</h2>
              <p>MBC CIMS Student</p>
            </div>
          </div>
          <div className={styles.profileActions}>
            <div style={{ width: '100%' }}>
              <AttendClassButton />
            </div>
            <Link href="/dashboard/quizzes" style={{ textDecoration: 'none', display: 'block' }}>
              <button className={styles.btnGreen} style={{ width: '100%' }}>Attempt Exam</button>
            </Link>
          </div>
        </div>
      </div>

      <h3 className={styles.sectionTitle}>MBC CIMS Dashboard</h3>
      
      <div className={styles.imageCardGrid}>
        <div className={styles.imageCard}>
          <img src="https://res.cloudinary.com/ypecwr/image/upload/v1658238610/mbc/exam.webp" alt="CIMS Exam" className={styles.imageCardImg} />
          <h4 className={styles.imageCardTitle}>CIMS Exam</h4>
          <Link href="/dashboard/quizzes" style={{ textDecoration: 'none' }}>
            <button className={styles.btnOutlinePink}>Attempt Exam</button>
          </Link>
        </div>
        
        <div className={styles.imageCard}>
          <img src="https://res.cloudinary.com/ypecwr/image/upload/v1658238610/mbc/results.webp" alt="My Results" className={styles.imageCardImg} />
          <h4 className={styles.imageCardTitle}>My Results</h4>
          <Link href="/dashboard/results" style={{ textDecoration: 'none' }}>
            <button className={styles.btnOutlinePink}>View Now</button>
          </Link>
        </div>
        
        <div className={styles.imageCard}>
          <img src="https://res.cloudinary.com/ypecwr/image/upload/v1658238611/mbc/attan.webp" alt="My Attendance" className={styles.imageCardImg} />
          <h4 className={styles.imageCardTitle}>My Attendance</h4>
          <Link href="/dashboard/my-attendance" style={{ textDecoration: 'none' }}>
            <button className={styles.btnOutlinePink}>View Now</button>
          </Link>
        </div>
      </div>

    </div>
  );
}
