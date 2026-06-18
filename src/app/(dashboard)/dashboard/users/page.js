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
      <div className={styles.panelHeader} style={{ marginBottom: '1.5rem' }}>
        <h2 className={styles.panelTitle}>User Management</h2>
      </div>

      <div className={styles.panel}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Group</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>
                      {u.first_name} {u.last_name}
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        backgroundColor: u.role === 'admin' ? '#fef3c7' : u.role === 'teacher' ? '#e0e7ff' : '#f1f5f9',
                        color: u.role === 'admin' ? '#92400e' : u.role === 'teacher' ? '#3730a3' : '#475569'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{u.group_name}</td>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/dashboard/users/${u.id}`}>
                        <button className={styles.btnOutline} style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Eye size={16} /> View
                        </button>
                      </Link>
                    </td>
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
