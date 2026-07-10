import { getAttendanceByDate } from '@/app/actions/attendance'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'
import { Calendar, Search, Users, Clock, CheckCircle } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import crypto from 'crypto'

export const metadata = {
  title: 'Attendance | MBC Portal',
}

export default async function AttendancePage({ searchParams }) {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'teacher' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Get date from query params or default to today
  const searchParamsObj = await searchParams
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = searchParamsObj?.date || today

  const attendanceRecords = await getAttendanceByDate(selectedDate)

  // Format date and time
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Attendance Report</h1>
          <p style={{ color: '#64748b', margin: 0 }}>View and manage daily student check-ins.</p>
        </div>
        
        {/* Date Selector */}
        <div className={styles.panel} style={{ padding: '0.75rem 1.5rem', margin: 0 }}>
          <form style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#475569', margin: 0 }}>Date:</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="date" 
                  name="date" 
                  className={styles.input} 
                  defaultValue={selectedDate}
                  style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', margin: 0, minHeight: 'auto' }}
                />
              </div>
            </div>
            <button type="submit" className={styles.btnPrimary} style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={16} /> View
            </button>
          </form>
        </div>
      </div>

      {/* Metric Row */}
      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard 
          title="Total Present" 
          value={attendanceRecords.length} 
          icon={<Users size={24} color="#3b82f6" />} 
          colorClass="cardBlue"
        />
        <MetricCard 
          title="Selected Date" 
          value={new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
          icon={<Calendar size={24} color="#ec4899" />} 
          colorClass="cardPink"
        />
        <MetricCard 
          title="Status" 
          value={attendanceRecords.length > 0 ? 'Active' : 'No Records'} 
          icon={<CheckCircle size={24} color="#8b5cf6" />} 
          colorClass="cardPurple"
        />
      </div>

      {/* Main Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Student Check-ins</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Student Profile</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Time Joined</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No attendance recorded</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>There are no student check-ins for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => {
                  const emailHash = crypto.createHash('md5').update(record.profiles?.email?.toLowerCase() || '').digest('hex');
                  const avatarUrl = record.profiles?.avatar_path 
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${record.profiles.avatar_path}`
                    : `https://www.gravatar.com/avatar/${emailHash}?s=40&d=mp`;

                  return (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img 
                            src={avatarUrl} 
                            alt={`${record.profiles?.first_name} Avatar`} 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #e2e8f0' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{record.profiles?.first_name} {record.profiles?.last_name}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>
                        {record.profiles?.email}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 500 }}>
                          <Clock size={16} />
                          {formatDateTime(record.recorded_at)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          display: 'inline-block'
                        }}>
                          Present
                        </span>
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
