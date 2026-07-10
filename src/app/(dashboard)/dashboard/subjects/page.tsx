import { redirect } from 'next/navigation'
import { BookOpen, Link2, Trash2 } from 'lucide-react'
import { getUserRole } from '@/app/actions/auth'
import { assignSubjectTeacher, createSubject, deleteSubject, getSubjectsPageData, removeSubjectTeacher } from '@/app/actions/subjects'
import styles from '@/components/dashboard/dashboard.module.css'

export const metadata = {
  title: 'Subjects | MBC Portal',
}

export default async function SubjectsPage() {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const { subjects, teachers, assignments } = await getSubjectsPageData()

  async function createSubjectAction(formData: FormData) {
    'use server'
    await createSubject(formData)
  }

  async function assignSubjectTeacherAction(formData: FormData) {
    'use server'
    await assignSubjectTeacher(formData)
  }

  async function deleteSubjectAction(formData: FormData) {
    'use server'
    await deleteSubject(formData)
  }

  async function removeSubjectTeacherAction(formData: FormData) {
    'use server'
    await removeSubjectTeacher(formData)
  }

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className={styles.panelTitle}>Subjects</h2>
          <p style={{ color: '#64748b', margin: '0.35rem 0 0 0' }}>
            Add subjects and assign them to teachers.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} /> Add Subject
            </h3>
          </div>
          <div className={styles.panelBody}>
            <form action={createSubjectAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
                Subject Name
                <input name="name" className={styles.input} placeholder="e.g. Leading with Integrity" required />
              </label>
              <button type="submit" className={styles.btnPrimary} style={{ alignSelf: 'flex-start' }}>
                Add Subject
              </button>
            </form>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link2 size={18} /> Assign Teacher
            </h3>
          </div>
          <div className={styles.panelBody}>
            <form action={assignSubjectTeacherAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
                Subject
                <select name="category_id" className={styles.input} required defaultValue="">
                  <option value="" disabled>Select subject</option>
                  {subjects.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#334155', fontWeight: 600 }}>
                Teacher
                <select name="teacher_id" className={styles.input} required defaultValue="">
                  <option value="" disabled>Select teacher</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {`${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" className={styles.btnPrimary} style={{ alignSelf: 'flex-start' }}>
                Assign Teacher
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Subjects</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No subjects added yet.
                  </td>
                </tr>
              ) : (
                subjects.map((subject: any) => (
                  <tr key={subject.id} className={styles.tableRow}>
                    <td><strong>{subject.name}</strong></td>
                    <td style={{ textAlign: 'right' }}>
                      <form action={deleteSubjectAction}>
                        <input type="hidden" name="subject_id" value={subject.id} />
                        <button type="submit" className={`${styles.actionButton} ${styles.actionButtonDanger}`}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.panel} style={{ marginTop: '1.5rem' }}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Subjects Assigned to Teachers</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Email</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No teacher assignments yet.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment: any) => {
                  const subject = assignment.categories
                  const teacher = assignment.profiles
                  return (
                    <tr key={assignment.id} className={styles.tableRow}>
                      <td><strong>{subject?.name || 'Unknown Subject'}</strong></td>
                      <td>{`${teacher?.first_name || ''} ${teacher?.last_name || ''}`.trim() || 'Unknown Teacher'}</td>
                      <td>{teacher?.email || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <form action={removeSubjectTeacherAction}>
                          <input type="hidden" name="assignment_id" value={assignment.id} />
                          <button type="submit" className={`${styles.actionButton} ${styles.actionButtonDanger}`}>
                            <Trash2 size={14} /> Remove
                          </button>
                        </form>
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
