import { getUsers } from '@/app/actions/users'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/dashboard/dashboard.module.css'
import { Eye } from 'lucide-react'

export const metadata = {
  title: 'User Management | MBC Portal',
}

export default async function UsersListPage() {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const users = await getUsers()

  return (
    <div>
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ borderBottom: '1px solid #f1f5f9', padding: '20px 28px' }}>
          <h2 className={styles.panelTitle}>User Management</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Placeholder for future search/filter */}
            <input 
              type="text" 
              placeholder="Search users..." 
              className={styles.input} 
              style={{ width: '250px', padding: '8px 16px', fontSize: '13px' }}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 28px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User</th>
                <th style={{ padding: '16px 28px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '16px 28px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                <th style={{ padding: '16px 28px', color: '#64748b', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No users found.</td></tr>
              ) : (
                users.map((u) => {
                  const initials = `${(u.first_name?.[0] || '').toUpperCase()}${(u.last_name?.[0] || '').toUpperCase()}` || 'U'
                  const avatarColor = u.role === 'admin' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 
                                     u.role === 'teacher' ? 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' :
                                     'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  
                  return (
                    <tr key={u.id} className={styles.tableRow} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, 
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 700, fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                              {u.first_name} {u.last_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {u.id.substring(0,8)}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 28px', color: '#475569', fontSize: '14px' }}>{u.email}</td>
                      <td style={{ padding: '16px 28px', textTransform: 'capitalize' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: u.role === 'admin' ? '#fef3c7' : u.role === 'teacher' ? '#f3e8ff' : '#eff6ff',
                          color: u.role === 'admin' ? '#b45309' : u.role === 'teacher' ? '#7e22ce' : '#1d4ed8'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 28px', textAlign: 'right' }}>
                        <Link href={`/dashboard/users/${u.id}`}>
                          <button className={styles.btnOutline} style={{ 
                            padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', 
                            fontSize: '12px', borderRadius: '100px'
                          }}>
                            <Eye size={14} /> View
                          </button>
                        </Link>
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
