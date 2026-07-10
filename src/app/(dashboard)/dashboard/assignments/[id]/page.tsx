import { getAssignment, getMySubmission } from '@/app/actions/assignments'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, Calendar, FileText, CheckCircle, Edit } from 'lucide-react'
import UploadSubmission from './UploadSubmission'
import { createClient } from '@/lib/supabase/server'

type AssignmentPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: AssignmentPageProps) {
  const { id } = await params
  const assignment = await getAssignment(id)
  return { title: `${assignment.title} | MBC Portal` }
}

export default async function AssignmentDetailsPage({ params }: AssignmentPageProps) {
  const { id } = await params
  const assignment = await getAssignment(id)
  const role = await getUserRole()
  const isStudent = role === 'student'
  
  let mySubmission = null
  let fileUrl = null
  
  if (isStudent) {
    mySubmission = await getMySubmission(id)
    if (mySubmission) {
      const supabase = await createClient()
      const { data } = supabase.storage
        .from(mySubmission.attachment_bucket)
        .getPublicUrl(mySubmission.attachment_path)
      fileUrl = data.publicUrl
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Assignment Details</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isStudent && (
            <Link href={`/dashboard/assignments/${assignment.id}/edit`}>
              <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={18} /> Edit Assignment
              </button>
            </Link>
          )}
          <Link href="/dashboard/assignments">
            <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> Back to Assignments
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <h1 style={{ marginTop: 0, color: '#1e293b' }}>{assignment.title}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', marginBottom: '1.5rem', fontWeight: 500 }}>
            <Calendar size={18} />
            Due: {formatDate(assignment.due_at)}
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
            {assignment.description}
          </div>

          {isStudent && (
            <div>
              <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Your Submission</h3>
              
              {mySubmission ? (
                <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #bbf7d0', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 'bold', marginBottom: '1rem' }}>
                    <CheckCircle size={20} /> Submitted Successfully
                  </div>
                  <p style={{ margin: '0 0 1rem 0', color: '#166534' }}>
                    Submitted on: {new Date(mySubmission.submitted_at).toLocaleString()}
                  </p>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>
                    <FileText size={18} /> View Submitted File
                  </a>
                  
                  {mySubmission.status === 'evaluated' && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #bbf7d0' }}>
                      <p style={{ margin: 0, fontWeight: 'bold', color: '#92400e' }}>Grade Received:</p>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#b45309' }}>{mySubmission.score}</span>
                    </div>
                  )}
                </div>
              ) : (
                <UploadSubmission assignmentId={String(assignment.id)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
