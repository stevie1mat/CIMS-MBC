import { getAssignments, deleteAssignment } from '@/app/actions/assignments'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { Plus, Trash2, List, FileUp, Calendar, Eye } from 'lucide-react'

export const metadata = {
  title: 'Assignments | MBC Portal',
}

export default async function AssignmentsPage() {
  const assignments = await getAssignments()
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>{isStaff ? 'Manage Assignments' : 'My Assignments'}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>{isStaff ? 'Create and manage course assignments.' : 'View and submit your course assignments.'}</p>
        </div>
        {isStaff && (
          <Link href="/dashboard/assignments/new">
            <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create Assignment
            </button>
          </Link>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Assignments List</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Subject</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Teacher</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Due Date</th>
                {isStaff && <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Total Submissions</th>}
                <th style={{ width: '150px', textAlign: 'center', padding: '1rem', color: '#475569', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1rem' }}>
                      <Link href={`/dashboard/assignments/${a.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <strong style={{ color: '#0ea5e9' }}>{a.title}</strong>
                      </Link>
                      {a.description && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{a.description}</p>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: '#f1f5f9', 
                        color: '#475569', 
                        borderRadius: '4px', 
                        fontSize: '0.875rem' 
                      }}>
                        {a.categories?.name || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569', fontWeight: 500 }}>
                      {a.profiles ? `${a.profiles.first_name} ${a.profiles.last_name}` : 'Unknown'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <Calendar size={14} />
                        {formatDate(a.due_at)}
                      </div>
                    </td>
                    {isStaff && <td style={{ padding: '1rem', fontWeight: 500, color: '#0f172a' }}>{a.assignment_submissions[0]?.count || 0}</td>}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {!isStaff ? (
                          <Link href={`/dashboard/assignments/${a.id}`}>
                            <button className={styles.btnPrimary} style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="View">
                              <Eye size={16} /> View
                            </button>
                          </Link>
                        ) : (
                          <>
                            <Link href={`/dashboard/assignments/${a.id}`}>
                              <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem' }} title="View Details">
                                <Eye size={16} />
                              </button>
                            </Link>
                            <Link href={`/dashboard/assignments/${a.id}/submissions`}>
                              <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem' }} title="View Submissions">
                                <List size={16} />
                              </button>
                            </Link>
                            <form action={async () => {
                              'use server'
                              await deleteAssignment(a.id)
                            }}>
                              <button className={styles.btnOutline} style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }} title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </form>
                          </>
                        )}
                      </div>
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
