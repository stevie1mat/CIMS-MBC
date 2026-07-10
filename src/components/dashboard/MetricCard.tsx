import React from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel, 
  colorClass, 
  href 
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  colorClass?: string;
  href?: string;
}) {
  const accentColor = colorClass === 'cardPink' ? '#ec4899' 
                    : colorClass === 'cardYellow' ? '#f59e0b'
                    : colorClass === 'cardGreen' ? '#10b981'
                    : colorClass === 'cardBlue' ? '#3b82f6'
                    : '#8b5cf6'; // Default purple

  const boxColor = colorClass === 'cardBlue' ? styles.blueBox 
                 : colorClass === 'cardPink' ? styles.pinkBox 
                 : colorClass === 'cardYellow' ? styles.yellowBox
                 : colorClass === 'cardGreen' ? styles.greenBox
                 : styles.purpleBox;

  const CardContent = (
    <div className={styles.statCard} style={{ cursor: href ? 'pointer' : 'default', '--card-accent': accentColor } as any}>
      <div className={`${styles.statIconBox} ${boxColor}`}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{title}</span>
        {trend !== undefined && (
          <span style={{ fontSize: '12px', color: trend > 0 ? '#10b981' : '#ef4444', marginTop: '8px', fontWeight: 700 }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{CardContent}</Link>;
  }

  return CardContent;
}
