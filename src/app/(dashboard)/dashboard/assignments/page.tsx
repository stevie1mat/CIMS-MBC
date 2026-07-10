import { getAssignments, deleteAssignment } from '@/app/actions/assignments'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { Plus, Trash2, List, FileUp, Calendar } from 'lucide-react'

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
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>{isStaff ? 'Manage Assignments' : 'My Assignments'}</h2>
        {isStaff && (
          <Link href="/dashboard/assignments/new">
            <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create Assignment
            </button>
          </Link>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Due Date</th>
                {isStaff && <th>Total Submissions</th>}
                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
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
                  <tr key={a.id} className={styles.tableRow}>
                    <td>
                      <Link href={`/dashboard/assignments/${a.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <strong style={{ color: '#0ea5e9' }}>{a.title}</strong>
                      </Link>
                      {a.description && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{a.description}</p>}
                    </td>
                    <td>
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
                    <td style={{ color: '#475569', fontSize: '0.9rem' }}>
                      {a.profiles ? `${a.profiles.first_name} ${a.profiles.last_name}` : 'Unknown'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                        <Calendar size={14} />
                        {formatDate(a.due_at)}
                      </div>
                    </td>
                    {isStaff && <td>{a.assignment_submissions[0]?.count || 0}</td>}
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {!isStaff ? (
                          <Link href={`/dashboard/assignments/${a.id}`}>
                            <button className={styles.btnPrimary} style={{ padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Submit">
                              <FileUp size={16} /> Submit
                            </button>
                          </Link>
                        ) : (
                          <>
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
