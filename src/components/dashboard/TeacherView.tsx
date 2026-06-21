import styles from './dashboard.module.css';
import MetricCard from './MetricCard';
import { Users, BookOpen, FileText } from 'lucide-react';

export default function TeacherView({ user }: { user?: any }) {
  // Placeholder data
  const metrics = {
    myStudents: 45,
    totalStudents: 45, // Adding missing prop referenced in TeacherView
    myQuizzes: 12,
    activeAssignments: 5,
  };

  return (
    <div>
      <div className={styles.cardGrid}>
        <MetricCard 
          title="My Students" 
          value={metrics.totalStudents} 
          icon={<Users size={32} />}
          colorClass="cardBlue"
        />
        <MetricCard 
          title="My Quizzes" 
          value={metrics.myQuizzes} 
          icon={<BookOpen size={32} />}
          colorClass="cardGreen"
        />
        <MetricCard 
          title="Active Assignments" 
          value={metrics.activeAssignments} 
          icon={<FileText size={32} />}
          colorClass="cardPink"
        />
      </div>

      <div className={styles.panelGrid} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Recent Student Submissions</h3>
          </div>
          <div className={styles.panelBody}>
            <p>No recent submissions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
