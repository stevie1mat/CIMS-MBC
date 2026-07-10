import { getAssignment, getSubmissions } from '@/app/actions/assignments'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import GradeSubmissionForm from './GradeSubmissionForm'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Assignment Submissions | MBC Portal',
}

type AssignmentSubmissionsPageProps = {
  params: Promise<{ id: string }>
}

export default async function AssignmentSubmissionsPage({ params }: AssignmentSubmissionsPageProps) {
  const { id } = await params
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'teacher' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const assignment = await getAssignment(id)
  const submissions = await getSubmissions(id) as any[]
  const supabase = await createClient()

  // Generate public URLs for files
  const submissionsWithUrls = submissions.map(sub => {
    const { data } = supabase.storage
      .from(sub.attachment_bucket)
      .getPublicUrl(sub.attachment_path)
    return { ...sub, fileUrl: data.publicUrl }
  })

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Submissions: {assignment.title}</h2>
        <Link href="/dashboard/assignments">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Assignments
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: 0 }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Submitted At</th>
                <th>Attachment</th>
                <th>Status</th>
                <th style={{ width: '200px' }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {submissionsWithUrls.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissionsWithUrls.map((sub) => (
                  <tr key={sub.id} className={styles.tableRow}>
                    <td>
                      <strong>{sub.profiles?.first_name} {sub.profiles?.last_name}</strong>
                      <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{sub.profiles?.email}</span>
                    </td>
                    <td>{formatDate(sub.submitted_at)}</td>
                    <td>
                      <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
                        <FileText size={16} /> View File
                      </a>
                    </td>
                    <td>
                      {sub.status === 'evaluated' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', backgroundColor: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                          <CheckCircle size={14} /> Evaluated
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <GradeSubmissionForm submissionId={sub.id} currentScore={sub.score} />
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
