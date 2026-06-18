import styles from './dashboard.module.css';
import MetricCard from './MetricCard';
import { Users, BookOpen, FileText, UserCheck, UserX } from 'lucide-react';

export default function AdminView({ user }) {
  // Placeholder data - we will fetch this from Supabase later
  const metrics = {
    totalUsers: 142,
    qbankSize: 850,
    registeredQuizzes: 45,
    activeUsers: 120,
    inactiveUsers: 22
  };

  const recentUsers = [
    { email: 'student1@example.com', name: 'John Doe', group: 'Theology 101', contact: '+91 9876543210' },
    { email: 'student2@example.com', name: 'Jane Smith', group: 'Biblical Studies', contact: '+91 9876543211' },
    { email: 'teacher1@example.com', name: 'Pastor Thomas', group: 'Faculty', contact: '+91 9876543212' },
  ];

  return (
    <div>
      <div className={styles.cardGrid}>
        <MetricCard 
          title="Registered Users" 
          value={metrics.totalUsers} 
          icon={<Users size={32} />}
          colorClass="cardBlue"
          href="/dashboard/users"
        />
        <MetricCard 
          title="Question Bank" 
          value={metrics.qbankSize} 
          icon={<BookOpen size={32} />}
          colorClass="cardGreen"
          href="/dashboard/questions"
        />
        <MetricCard 
          title="Registered Quizzes" 
          value={metrics.registeredQuizzes} 
          icon={<FileText size={32} />}
          colorClass="cardYellow"
          href="/dashboard/quizzes"
        />
      </div>

      <div className={styles.cardGrid}>
        <MetricCard 
          title="Active Users" 
          value={metrics.activeUsers} 
          icon={<UserCheck size={32} />}
          colorClass="cardGreen"
          href="/dashboard/users"
        />
        <MetricCard 
          title="Inactive Users" 
          value={metrics.inactiveUsers} 
          icon={<UserX size={32} />}
          colorClass="cardRed"
          href="/dashboard/users"
        />
      </div>

      <div className={styles.panelGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Recently Registered</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Full Name</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Group Name</th>
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Contact No</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }} className={styles.tableRow}>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>{u.name}</td>
                    <td style={{ padding: '1rem' }}>{u.group}</td>
                    <td style={{ padding: '1rem' }}>{u.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Revenue (Coming Soon)</h3>
          </div>
          <div className={styles.panelBody}>
            <p>Chart integration goes here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
