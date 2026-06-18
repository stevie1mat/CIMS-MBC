import styles from './dashboard.module.css';
import Link from 'next/link';

export default function MetricCard({ title, value, icon, trend, trendLabel, colorClass, href }) {
  // Map old color classes to new ones
  const boxColor = colorClass === 'cardBlue' ? styles.blueBox 
                 : colorClass === 'cardPink' ? styles.pinkBox 
                 : styles.purpleBox;

  const CardContent = (
    <div className={styles.statCard} style={{ cursor: href ? 'pointer' : 'default' }}>
      <div className={`${styles.statIconBox} ${boxColor}`}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{title}</span>
        {trend && (
          <span style={{ fontSize: '11px', color: trend > 0 ? '#10b981' : '#ef4444', marginTop: '4px', fontWeight: 600 }}>
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
