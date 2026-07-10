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
  
  let assignmentFileUrl = null
  if (assignment.attachment_bucket && assignment.attachment_path) {
    const supabase = await createClient()
    const { data } = supabase.storage
      .from(assignment.attachment_bucket)
      .getPublicUrl(assignment.attachment_path)
    assignmentFileUrl = data.publicUrl
  }
  
  if (isStudent) {
    mySubmission = await getMySubmission(id)
    if (mySubmission && mySubmission.attachment_bucket && mySubmission.attachment_path) {
      const supabase = await createClient()
      if (mySubmission.attachment_bucket === 'student-submissions') {
        const { data } = await supabase.storage
          .from(mySubmission.attachment_bucket)
          .createSignedUrl(mySubmission.attachment_path, 60 * 60) // 1 hour expiry
        fileUrl = data?.signedUrl || null
      } else {
        const { data } = supabase.storage
          .from(mySubmission.attachment_bucket)
          .getPublicUrl(mySubmission.attachment_path)
        fileUrl = data.publicUrl
      }
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
      <div className={styles.panelHeader} style={{ marginBottom: '1.5rem' }}>
        <h2 className={styles.panelTitle}>Assignment Details</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!isStudent && (
            <Link href={`/dashboard/assignments/${assignment.id}/edit`}>
              <button className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={18} /> Edit
              </button>
            </Link>
          )}
          <Link href="/dashboard/assignments">
            <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> Back
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: '3rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ marginTop: 0, color: '#0f172a', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '1rem' }}>
              {assignment.title}
            </h1>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 500 }}>
              <Calendar size={16} style={{ color: '#6366f1' }} />
              Due: {formatDate(assignment.due_at)}
            </div>
          </div>

          <div style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: assignmentFileUrl ? '2rem' : '3rem', whiteSpace: 'pre-wrap', color: '#334155', lineHeight: '1.7' }}>
            {assignment.description}
          </div>

          {assignmentFileUrl && (
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem' }}>Attachment</h3>
              <a 
                href={assignmentFileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.attachmentLink}
              >
                <div style={{ padding: '0.5rem', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
                  <FileText size={20} color="#6366f1" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>Attachment</span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Click to view or download</span>
                </div>
              </a>
            </div>
          )}

          {isStudent && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2.5rem' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>Your Submission</h3>
              
              {mySubmission ? (
                <div style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#059669', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>
                    <CheckCircle size={24} /> Submitted Successfully
                  </div>
                  <p style={{ margin: '0 0 1.5rem 0', color: '#64748b' }}>
                    Submitted on: {formatDate(mySubmission.submitted_at)}
                  </p>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600, backgroundColor: '#eef2ff', padding: '0.75rem 1.25rem', borderRadius: '8px', transition: 'all 0.2s' }}>
                    <FileText size={18} /> View Submitted File
                  </a>
                  
                  {mySubmission.status === 'evaluated' && (
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#475569' }}>Grade Received</p>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{mySubmission.score}</span>
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
