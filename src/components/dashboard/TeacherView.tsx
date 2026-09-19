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
    { count: activeAssignments },
    { data: recentSubmissions }
  ] = await Promise.all([
    supabase.from('profiles').select('account_types(role)'),
    supabase.from('quizzes').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true }),
    supabase.from('assignment_submissions')
      .select('id, submitted_at, status, score, assignments!inner(title, created_by), student:profiles!assignment_submissions_profile_id_fkey(first_name, last_name)')
      .eq('assignments.created_by', user?.id)
      .order('submitted_at', { ascending: false })
      .limit(5)
  ]);

  if (recentSubmissions === null) {
    console.error("Error fetching recent submissions, possibly due to FK ambiguity.");
  }

  let studentCount = 0;
  allProfiles?.forEach(p => {
    if ((p.account_types as any)?.role === 'student') studentCount++;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: '#0f172a' }}>Dashboard</h1>
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
          href="/dashboard/exams"
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
          <div className={styles.panelBody} style={{ padding: 0 }}>
            {recentSubmissions && recentSubmissions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Student</th>
                      <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Assignment</th>
                      <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSubmissions.map((sub: any) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>
                          {sub.student ? `${sub.student.first_name} ${sub.student.last_name}` : 'Unknown'}
                        </td>
                        <td style={{ padding: '1rem', color: '#475569' }}>{sub.assignments?.title}</td>
                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                          {new Date(sub.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.5rem', 
                            backgroundColor: sub.status === 'evaluated' ? '#dcfce7' : '#fef9c3', 
                            color: sub.status === 'evaluated' ? '#166534' : '#854d0e',
                            borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 
                          }}>
                            {sub.status === 'evaluated' ? `Graded: ${sub.score}` : 'Needs Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem' }}>
                <p style={{ color: '#64748b', margin: 0 }}>No recent submissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
