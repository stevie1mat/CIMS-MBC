import { getAttendanceData } from '@/app/actions/attendance'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/dashboard/dashboard.module.css'
import { Calendar, Search, Users, Clock, CheckCircle } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import AttendanceFilter from './AttendanceFilter'
import crypto from 'crypto'

export const metadata = {
  title: 'Attendance Report | MBC Portal',
}

export default async function AttendancePage({ searchParams }: any) {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'teacher' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const searchParamsObj = await searchParams;
  const today = new Date().toISOString().split('T')[0];
  const timeframe = (searchParamsObj?.timeframe as 'day' | 'week' | 'month') || 'day';
  const activeTab = searchParamsObj?.tab || 'all';

  let selectedDate = searchParamsObj?.date || today;
  if (timeframe === 'month' && selectedDate.length === 10) {
    selectedDate = selectedDate.substring(0, 7);
  } else if (timeframe !== 'month' && selectedDate.length === 7) {
    selectedDate = `${selectedDate}-01`;
  }

  const rawRecords = await getAttendanceData(selectedDate, timeframe);

  // Filter by role tab
  const attendanceRecords = rawRecords.filter(record => {
    const r = (record.profiles?.account_types as any)?.role || 'unknown';
    if (activeTab === 'students') return r === 'student';
    if (activeTab === 'teachers') return r === 'teacher';
    if (activeTab === 'admins') return r === 'admin' || r === 'super_admin';
    return true;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getTabStyle = (tabId: string) => ({
    padding: '16px 20px',
    borderBottom: activeTab === tabId ? '2px solid #2563eb' : '2px solid transparent',
    color: activeTab === tabId ? '#2563eb' : '#64748b',
    fontWeight: activeTab === tabId ? 600 : 500,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Attendance Report</h1>
          <p style={{ color: '#64748b', margin: 0 }}>View and manage user check-ins.</p>
        </div>
        
        {/* Date Selector */}
        <div className={styles.panel} style={{ padding: '0.75rem 1.5rem', margin: 0 }}>
          <AttendanceFilter initialTab={activeTab} initialTimeframe={timeframe} initialDate={selectedDate} />
        </div>
      </div>

      {/* Metric Row */}
      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard 
          title={`Total Present (${timeframe})`} 
          value={attendanceRecords.length} 
          icon={<Users size={24} color="#3b82f6" />} 
          colorClass="cardBlue"
        />
        <MetricCard 
          title="Selected Date" 
          value={(() => {
            const parts = selectedDate.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parts.length > 2 ? parseInt(parts[2], 10) : 1;
            const localDate = new Date(year, month, day, 12, 0, 0);
            
            if (timeframe === 'month') {
              return localDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            } else {
              return localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }
          })()} 
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
        <div className={styles.panelHeader} style={{ padding: '20px 28px 0 28px', flexDirection: 'column', alignItems: 'flex-start', gap: '0px' }}>
          <h3 className={styles.panelTitle} style={{ marginBottom: '16px' }}>Attendance</h3>
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9', width: '100%' }}>
            <Link href={`/dashboard/attendance?date=${selectedDate}&timeframe=${timeframe}&tab=all`} style={getTabStyle('all')}>All Users</Link>
            <Link href={`/dashboard/attendance?date=${selectedDate}&timeframe=${timeframe}&tab=students`} style={getTabStyle('students')}>Students</Link>
            <Link href={`/dashboard/attendance?date=${selectedDate}&timeframe=${timeframe}&tab=teachers`} style={getTabStyle('teachers')}>Teachers</Link>
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 28px', color: '#475569', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Profile</th>
                <th style={{ padding: '1rem 28px', color: '#475569', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Email Address</th>
                <th style={{ padding: '1rem 28px', color: '#475569', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '1rem 28px', color: '#475569', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Time Joined</th>
                <th style={{ padding: '1rem 28px', color: '#475569', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No attendance recorded</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>There are no check-ins for the selected timeframe and category.</p>
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => {
                  const emailHash = crypto.createHash('md5').update(record.profiles?.email?.toLowerCase() || '').digest('hex');
                  const avatarUrl = record.profiles?.avatar_path 
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${record.profiles.avatar_path}`
                    : `https://www.gravatar.com/avatar/${emailHash}?s=40&d=mp`;
                  
                  const r = (record.profiles?.account_types as any)?.role || 'unknown';

                  return (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img 
                            src={avatarUrl} 
                            alt={`${record.profiles?.first_name} Avatar`} 
                            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e2e8f0' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{record.profiles?.first_name} {record.profiles?.last_name}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 28px', color: '#475569', fontSize: '14px' }}>
                        {record.profiles?.email}
                      </td>
                      <td style={{ padding: '1rem 28px', textTransform: 'capitalize' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: r === 'admin' ? '#fef3c7' : r === 'teacher' ? '#f3e8ff' : '#eff6ff',
                          color: r === 'admin' ? '#b45309' : r === 'teacher' ? '#7e22ce' : '#1d4ed8'
                        }}>
                          {r}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 500, fontSize: '14px' }}>
                          <Clock size={16} />
                          {formatDateTime(record.recorded_at)}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 28px' }}>
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
