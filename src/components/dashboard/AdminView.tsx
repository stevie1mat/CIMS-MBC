import React from 'react';
import styles from './dashboard.module.css';
import MetricCard from './MetricCard';
import StatsCharts from './StatsCharts';
import { Users, BookOpen, FileText, GraduationCap, UserCheck, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminView({ user }: { user: any }) {
  const supabase = await createClient();

  const [{ count: totalUsers }, { count: qbankSize }, { count: registeredQuizzes }, { count: totalAssignments }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
  ]);

  const { data: allProfiles } = await supabase.from('profiles').select('status, account_types(role)');
  
  let activeUsers = 0;
  let inactiveUsers = 0;
  let studentCount = 0;
  let teacherCount = 0;
  let adminCount = 0;

  allProfiles?.forEach(p => {
    if (p.status === 'active') activeUsers++;
    else inactiveUsers++;

    if ((p.account_types as any)?.role === 'student') studentCount++;
    if ((p.account_types as any)?.role === 'teacher') teacherCount++;
    if ((p.account_types as any)?.role === 'admin' || (p.account_types as any)?.role === 'super_admin') adminCount++;
  });

  const metrics = {
    totalUsers: totalUsers || 0,
    qbankSize: qbankSize || 0,
    registeredQuizzes: registeredQuizzes || 0,
    activeUsers,
    inactiveUsers,
    totalAssignments: totalAssignments || 0
  };



  return (
    <div>
      <div className={styles.adminMetricGrid}>
        <MetricCard
          title="Total Students"
          value={studentCount}
          icon={<GraduationCap size={32} />}
          colorClass="cardBlue"
          href="/dashboard/users?tab=students"
        />
        <MetricCard
          title="Total Teachers"
          value={teacherCount}
          icon={<UserCheck size={32} />}
          colorClass="cardGreen"
          href="/dashboard/users?tab=teachers"
        />
        <MetricCard
          title="Administrators"
          value={adminCount}
          icon={<Shield size={32} />}
          colorClass="cardYellow"
          href="/dashboard/users?tab=admins"
        />
        <MetricCard
          title="Question Bank"
          value={metrics.qbankSize}
          icon={<BookOpen size={32} />}
          colorClass="cardGreen"
          href="/dashboard/questions"
        />
        <MetricCard
          title="Exams Conducted"
          value={metrics.registeredQuizzes}
          icon={<FileText size={32} />}
          colorClass="cardYellow"
          href="/dashboard/quizzes"
        />
      </div>

      <div className={styles.panelGrid}>
        <div className={styles.panel} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.panelHeader} style={{ borderBottom: 'none' }}>
            <h3 className={styles.panelTitle}>Platform Stats (7-Day Trend)</h3>
          </div>
          <div className={styles.panelBody}>
            <StatsCharts 
              students={studentCount} 
              exams={metrics.registeredQuizzes} 
              assignments={metrics.totalAssignments} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
