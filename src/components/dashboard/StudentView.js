import styles from './dashboard.module.css';
import Script from 'next/script';
import Link from 'next/link';

import AttendClassButton from './AttendClassButton';

export default function StudentView({ user, feesPaid }) {
  const fullName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` 
    : user?.email || 'Student User';

  return (
    <div>
      <Script src="//code-eu1.jivosite.com/widget/GdFvA8K2lj" strategy="lazyOnload" />
      
      <div className={styles.bannerContainer}></div>
      
      <div className={styles.profileCardWrapper}>
        <div className={styles.profileCard}>
          <div className={styles.profileInfo}>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff`}
              alt="Profile avatar" 
              className={styles.profileAvatar} 
            />
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

      {feesPaid && (
        <div className={styles.feesAlert}>
          Fees For The Semester Is Paid.
        </div>
      )}

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
          <Link href="/dashboard/profile" style={{ textDecoration: 'none' }}>
            <button className={styles.btnOutlinePink}>View Now</button>
          </Link>
        </div>
      </div>

    </div>
  );
}
