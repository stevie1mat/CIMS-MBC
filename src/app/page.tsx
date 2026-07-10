import styles from './page.module.css';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import React from 'react';
import { BookOpen, GraduationCap, Users, Library, Award, Calendar } from 'lucide-react';

export default async function Login() {
  let verseText = "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves, not looking to your own interests but each of you to the interests of the others.";
  let verseRef = "- Philippians 2:3-4(NIV)";

  try {
    const res = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json&order=random', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      verseText = data.verse.details.text;
      verseRef = `- ${data.verse.details.reference}(${data.verse.details.version})`;
    }
  } catch (error) {
    console.error("Failed to fetch verse:", error);
  }

  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.background}>
          <Image
            src="/campus_bg.jpg"
            alt="MBC Campus Background"
            fill
            priority
            className={styles.bgImage}
          />
          <div className={styles.overlay}></div>
        </div>

        <div className={`${styles.floatingIcon} ${styles.icon1}`}><BookOpen size={48} /></div>
        <div className={`${styles.floatingIcon} ${styles.icon2}`}><GraduationCap size={64} /></div>
        <div className={`${styles.floatingIcon} ${styles.icon3}`}><Users size={40} /></div>
        <div className={`${styles.floatingIcon} ${styles.icon4}`}><Library size={56} /></div>
        <div className={`${styles.floatingIcon} ${styles.icon5}`}><Award size={48} /></div>
        <div className={`${styles.floatingIcon} ${styles.icon6}`}><Calendar size={40} /></div>

        <div className={styles.logoContainer}>
          <span className={styles.logoText}>CIMS MBC PORTAL</span>
        </div>

        <div className={styles.leftContent}>
          <div className={styles.mainTextContainer}>
            <h1 className={styles.heroTitle}>Equipping leaders<br/>for tomorrow.</h1>
            <p className={styles.heroSubtitle}>
              {verseText}
            </p>
            <p className={styles.heroReference}>{verseRef}</p>
          </div>
        </div>

        <div className={styles.footer}>
          <p>© {new Date().getFullYear()} MBC Mumbai. All rights reserved.</p>
        </div>
      </div>

      <div className={styles.rightPane}>
        <div className={styles.loginFormContainer}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <img
              src="https://mbcmumbai.com/wp-content/uploads/2021/08/WhatsApp_Image_2021-08-20_at_17.24.14-removebg-preview.png"
              alt="MBC Logo"
              width={120}
              height={120}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className={styles.welcomeTitle}>Welcome back</h2>
          <p className={styles.welcomeSubtitle}>Enter your credentials to access your account</p>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
