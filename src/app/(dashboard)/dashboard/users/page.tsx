import { getUsers } from '@/app/actions/users'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/dashboard/dashboard.module.css'
import { Eye } from 'lucide-react'

export const metadata = {
  title: 'User Management | MBC Portal',
}

export default async function UsersListPage({ searchParams }: any) {
  const role = await getUserRole()
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isTeacher = role === 'teacher'
  if (!isAdmin && !isTeacher) {
    redirect('/dashboard')
  }

  // Handle Next.js 15+ searchParams Promise safely
  const resolvedParams = await searchParams;
  const activeTab = isTeacher ? 'students' : (resolvedParams?.tab || 'all');

  const allUsers = await getUsers()
  
  // Filter users based on active tab
  const users = allUsers.filter(u => {
    if (activeTab === 'students') return u.role === 'student'
    if (activeTab === 'teachers') return u.role === 'teacher'
    if (activeTab === 'admins') return u.role === 'admin'
    return true
  })

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
    <div>
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ padding: '20px 28px 0 28px', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <h2 className={styles.panelTitle}>{isTeacher ? 'My Students' : 'User Management'}</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Search users..." 
                className={styles.input} 
                style={{ width: '250px', padding: '8px 16px', fontSize: '13px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9', width: '100%' }}>
            {isAdmin && <Link href="/dashboard/users?tab=all" style={getTabStyle('all')}>All Users</Link>}
            <Link href="/dashboard/users?tab=students" style={getTabStyle('students')}>Students</Link>
            {isAdmin && <Link href="/dashboard/users?tab=teachers" style={getTabStyle('teachers')}>Teachers</Link>}
            {isAdmin && <Link href="/dashboard/users?tab=admins" style={getTabStyle('admins')}>Admins</Link>}
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
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No users found for this category.</td></tr>
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
