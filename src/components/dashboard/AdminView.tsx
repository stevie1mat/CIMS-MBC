import React from 'react';
import styles from './dashboard.module.css';
import MetricCard from './MetricCard';
import StatsCharts from './StatsCharts';
import { Users, BookOpen, FileText, UserCheck, UserX } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function AdminView({ user }: { user: any }) {
  const supabase = await createClient();

  const [{ count: totalUsers }, { count: qbankSize }, { count: registeredQuizzes }, { count: totalAssignments }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true })
  ]);

  const metrics = {
    totalUsers: totalUsers || 0,
    qbankSize: qbankSize || 0,
    registeredQuizzes: registeredQuizzes || 0,
    activeUsers: totalUsers || 0, // Simplified for now
    inactiveUsers: 0,
    totalAssignments: totalAssignments || 0
  };

  const { data: rawRecentUsers } = await supabase.from('profiles')
    .select('id, email, first_name, last_name, contact_no, account_types(role)')
    .order('registered_at', { ascending: false })
    .limit(5);

  let profileGroupsData: any[] = [];
  if (rawRecentUsers && rawRecentUsers.length > 0) {
    const userIds = rawRecentUsers.map((u: any) => u.id);
    const { data: pgroups } = await supabase
      .from('profile_groups')
      .select('profile_id, groups(name)')
      .in('profile_id', userIds);
    profileGroupsData = pgroups || [];
  }

  const recentUsers = rawRecentUsers?.map((u: any) => {
    const userGroup = profileGroupsData.find(pg => pg.profile_id === u.id);
    return {
      email: u.email,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown',
      group: (userGroup?.groups as any)?.name || 'No Group',
      contact: u.contact_no || 'N/A'
    };
  }) || [];

  // Approximate Student count (assuming mostly students if not admin)
  // To get precise we would do another query, but for now let's just show total users minus admins
  const estimatedStudents = Math.max(0, metrics.totalUsers - 1);

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
                  <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Contact No</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No users found.</td></tr>
                ) : (
                  recentUsers.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }} className={styles.tableRow}>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{u.email}</td>
                      <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>{u.name}</td>
                      <td style={{ padding: '1rem' }}>{u.contact}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader} style={{ borderBottom: 'none' }}>
            <h3 className={styles.panelTitle}>Platform Stats (7-Day Trend)</h3>
          </div>
          <div className={styles.panelBody}>
            <StatsCharts 
              students={estimatedStudents} 
              exams={metrics.registeredQuizzes} 
              assignments={metrics.totalAssignments} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
