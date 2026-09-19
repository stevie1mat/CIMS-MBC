import { getUsers } from '@/app/actions/users'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from '@/components/dashboard/dashboard.module.css'
import { Eye, UserPlus } from 'lucide-react'
import UserSearchInput from './UserSearchInput'
import DeleteUserButton from './DeleteUserButton'

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
  const searchQuery = (resolvedParams?.query || '').toLowerCase();

  const allUsers = await getUsers()
  
  // Calculate counts for each category
  const studentCount = allUsers.filter(u => u.role === 'student').length
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length
  const adminCount = allUsers.filter(u => u.role === 'admin').length
  const allCount = allUsers.length

  const sortBy = resolvedParams?.sort || 'name';
  const sortOrder = resolvedParams?.order || 'asc';

  // Filter users based on active tab and search query
  let users = allUsers.filter(u => {
    // Tab filter
    let tabMatch = true
    if (activeTab === 'students') tabMatch = u.role === 'student'
    else if (activeTab === 'teachers') tabMatch = u.role === 'teacher'
    else if (activeTab === 'admins') tabMatch = u.role === 'admin'

    // Search filter
    let searchMatch = true
    if (searchQuery) {
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase()
      const email = (u.email || '').toLowerCase()
      searchMatch = fullName.includes(searchQuery) || email.includes(searchQuery)
    }

    return tabMatch && searchMatch
  })

  // Sort users
  users = users.sort((a, b) => {
    let aVal = '', bVal = '';
    if (sortBy === 'role') {
      aVal = a.role || '';
      bVal = b.role || '';
    } else if (sortBy === 'email') {
      aVal = a.email || '';
      bVal = b.email || '';
    } else {
      // Default to name
      aVal = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
      bVal = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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

  const getHeaderLink = (column: string, label: string) => {
    const isSorted = sortBy === column;
    const nextOrder = isSorted && sortOrder === 'asc' ? 'desc' : 'asc';
    return (
      <Link 
        href={`/dashboard/users?tab=${activeTab}&sort=${column}&order=${nextOrder}${searchQuery ? `&query=${searchQuery}` : ''}`}
        style={{ 
          color: '#64748b', 
          textDecoration: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px' 
        }}
      >
        {label}
        {isSorted && (
          <span style={{ fontSize: '10px' }}>
            {sortOrder === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div>
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ padding: '20px 28px 0 28px', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <h2 className={styles.panelTitle}>{isTeacher ? 'My Students' : 'User Management'}</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              {isAdmin && (
                <Link href="/dashboard/users/new">
                  <button className={styles.btnPrimary} style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <UserPlus size={15} /> New User
                  </button>
                </Link>
              )}
              <UserSearchInput />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9', width: '100%' }}>
            {isAdmin && <Link href="/dashboard/users?tab=all" style={getTabStyle('all')}>All Users ({allCount})</Link>}
            <Link href="/dashboard/users?tab=students" style={getTabStyle('students')}>Students ({studentCount})</Link>
            {isAdmin && <Link href="/dashboard/users?tab=teachers" style={getTabStyle('teachers')}>Teachers ({teacherCount})</Link>}
            {isAdmin && <Link href="/dashboard/users?tab=admins" style={getTabStyle('admins')}>Admins ({adminCount})</Link>}
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 28px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {getHeaderLink('name', 'User')}
                </th>
                <th style={{ padding: '16px 28px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {getHeaderLink('email', 'Email')}
                </th>
                <th style={{ padding: '16px 28px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {getHeaderLink('role', 'Role')}
                </th>
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <Link href={`/dashboard/users/${u.id}`}>
                            <button className={styles.btnOutline} style={{ 
                              padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', 
                              fontSize: '12px', borderRadius: '100px'
                            }}>
                              <Eye size={14} /> View
                            </button>
                          </Link>
                          {isAdmin && (
                            <DeleteUserButton userId={u.id} userName={`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User'} />
                          )}
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
