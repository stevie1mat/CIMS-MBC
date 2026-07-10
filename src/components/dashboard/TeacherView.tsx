import styles from './dashboard.module.css';
import MetricCard from './MetricCard';
import { Users, BookOpen, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import StartClassButton from './StartClassButton';

export default async function TeacherView({ user }: { user?: any }) {
  const supabase = await createClient();

  const [
    { data: allProfiles },
    { count: myExams },
    { count: activeAssignments }
  ] = await Promise.all([
    supabase.from('profiles').select('account_types(role)'),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
  ]);

  let studentCount = 0;
  allProfiles?.forEach(p => {
    if ((p.account_types as any)?.role === 'student') studentCount++;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <StartClassButton />
      </div>
      
      <div className={styles.adminMetricGrid}>
        <MetricCard 
          title="Total Students" 
          value={studentCount} 
          icon={<Users size={32} />}
          colorClass="cardBlue"
          href="/dashboard/users?tab=students"
        />
        <MetricCard 
          title="Total Exams" 
          value={myExams || 0} 
          icon={<BookOpen size={32} />}
          colorClass="cardGreen"
          href="/dashboard/quizzes"
        />
        <MetricCard 
          title="Active Assignments" 
          value={activeAssignments || 0} 
          icon={<FileText size={32} />}
          colorClass="cardPink"
          href="/dashboard/assignments"
        />
      </div>

      <div className={styles.panelGrid} style={{ gridTemplateColumns: '1fr' }}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Recent Student Submissions</h3>
          </div>
          <div className={styles.panelBody}>
            <p style={{ color: '#64748b' }}>No recent submissions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
