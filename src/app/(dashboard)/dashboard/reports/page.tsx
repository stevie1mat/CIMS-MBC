import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { getAllResults, deleteAttempt } from '@/app/actions/results'
import styles from '@/components/dashboard/dashboard.module.css'
import { CheckCircle, XCircle, RefreshCcw, TableProperties, TrendingUp, Users, Clock, Award } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import crypto from 'crypto'

export const metadata = {
  title: 'Reports | MBC Portal',
}

export default async function ReportsPage() {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const results = await getAllResults()

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  // Calculate Metrics
  const totalAttempts = results.length;
  const passedAttempts = results.filter(r => r.status === 'pass').length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Global Quiz Reports</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Overview of all student quiz attempts and performance across the platform.</p>
        </div>
      </div>

      {/* Metric Row */}
      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard 
          title="Total Attempts" 
          value={totalAttempts} 
          icon={<TableProperties size={24} color="#3b82f6" />} 
          colorClass="cardBlue"
        />
        <MetricCard 
          title="Global Pass Rate" 
          value={`${passRate}%`} 
          icon={<TrendingUp size={24} color="#ec4899" />} 
          colorClass="cardPink"
        />
        <MetricCard 
          title="Passed Quizzes" 
          value={passedAttempts} 
          icon={<Award size={24} color="#8b5cf6" />} 
          colorClass="cardPurple"
        />
      </div>

      {/* Main Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Recent Attempts</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Student Profile</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Exam Name</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Date Taken</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Marks</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <TableProperties size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No reports available</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Student attempts will appear here once they complete a quiz.</p>
                  </td>
                </tr>
              ) : (
                results.map((r) => {
                  const emailHash = crypto.createHash('md5').update(r.profiles?.email?.toLowerCase() || '').digest('hex');
                  const avatarUrl = r.profiles?.avatar_path 
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${r.profiles.avatar_path}`
                    : `https://www.gravatar.com/avatar/${emailHash}?s=40&d=mp`;

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img 
                            src={avatarUrl} 
                            alt={`${r.profiles?.first_name} Avatar`} 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #e2e8f0', flexShrink: 0 }}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '2px' }}>{r.profiles?.first_name} {r.profiles?.last_name}</span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>{r.profiles?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <strong style={{ color: '#334155' }}>{r.quizzes?.name}</strong>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569', fontSize: '0.9rem' }}>
                        {formatDate(r.ended_at)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{r.score_obtained}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {r.status === 'pass' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#166534', backgroundColor: '#dcfce7', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Pass
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#991b1b', backgroundColor: '#fee2e2', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                            <XCircle size={14} /> Fail
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <form action={async () => {
                            'use server'
                            await deleteAttempt(r.id)
                          }}>
                            <button className={styles.btnOutline} style={{ padding: '0.35rem 0.6rem', color: '#f59e0b', borderColor: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }} title="Reset Attempt (Delete)">
                              <RefreshCcw size={14} /> Reset
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
