import { getAttendanceByDate } from '@/app/actions/attendance'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'
import { Calendar, Search } from 'lucide-react'

export const metadata = {
  title: 'Attendance | MBC Portal',
}

export default async function AttendancePage({ searchParams }) {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'teacher' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Get date from query params or default to today
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = searchParams.date || today

  const attendanceRecords = await getAttendanceByDate(selectedDate)

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Daily Attendance Report</h2>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <form style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Select Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="date" 
                  name="date" 
                  className={styles.input} 
                  defaultValue={selectedDate}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <button type="submit" className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={18} /> View
            </button>
          </form>
        </div>

        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Time Joined</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    No attendance recorded for {selectedDate}.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.id} className={styles.tableRow}>
                    <td><strong>{record.profiles?.first_name} {record.profiles?.last_name}</strong></td>
                    <td>{record.profiles?.email}</td>
                    <td>{formatTime(record.recorded_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
