import { 
  getProfileDetails, 
  getQuizActivity, 
  getCategoryProficiency, 
  getIncorrectQuestions, 
  getPaymentHistory,
  getTeacherExamSummary,
  getUserExamResults
} from '@/app/actions/profile'
import { getGroupsAndAccountTypes } from '@/app/actions/users'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'
import { 
  Mail, Phone, Calendar, Shield, Users,
  Activity, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, Eye, CreditCard, ArrowLeft, BookOpen, FileText
} from 'lucide-react'
import crypto from 'crypto'
import Link from 'next/link'
import EditUserForm from './EditUserForm'
import AvatarUpload from './AvatarUpload'
import { createClient } from '@/lib/supabase/server'

type UserPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: UserPageProps) {
  const { id } = await params
  const profile = await getProfileDetails(id)
  return {
    title: profile ? `${profile.first_name} ${profile.last_name} | MBC Portal` : 'User Not Found',
  }
}

export default async function AdminUserProfilePage({ params }: UserPageProps) {
  const { id } = await params

  const role = await getUserRole()
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isTeacher = role === 'teacher'
  if (!isAdmin && !isTeacher) {
    redirect('/dashboard')
  }

  const profile = await getProfileDetails(id)
  if (!profile) return <div style={{ padding: '2rem' }}>User not found</div>
  if (isTeacher && profile.account_types?.role !== 'student') {
    redirect('/dashboard/users?tab=students')
  }

  const activity = await getQuizActivity(id)
  const categories = await getCategoryProficiency(id)
  const incorrectQuestions = await getIncorrectQuestions(id)
  const paymentHistory = await getPaymentHistory(id)
  const studentExamResults = await getUserExamResults(id)
  const teacherExamSummary = profile.account_types?.role === 'teacher' ? await getTeacherExamSummary(id) : []
  const { groups, accountTypes } = isAdmin ? await getGroupsAndAccountTypes() : { groups: [], accountTypes: [] }

  const emailHash = crypto.createHash('md5').update(profile.email?.toLowerCase() || '').digest('hex')
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=150&d=mp`
  
  let currentAvatarUrl = null;
  if (profile.avatar_path) {
    const supabase = await createClient();
    const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_path);
    currentAvatarUrl = data?.publicUrl;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const teacherSubjects = teacherExamSummary.reduce((subjects: Record<string, any[]>, exam: any) => {
    const subject = exam.subject || 'Unassigned Subject'
    subjects[subject] = subjects[subject] || []
    subjects[subject].push(exam)
    return subjects
  }, {})

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/users">
            <button className={styles.btnOutline} style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={18} />
            </button>
          </Link>
          <h2 className={styles.panelTitle}>User Profile</h2>
        </div>
        
        {isAdmin && (
          <EditUserForm 
            user={profile} 
            groups={groups} 
            accountTypes={accountTypes} 
            currentAvatarUrl={currentAvatarUrl}
            gravatarUrl={gravatarUrl}
          />
        )}
      </div>

      {/* Header Profile Section */}
      <div className={styles.panel} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
        <AvatarUpload 
          userId={profile.id} 
          currentAvatarUrl={currentAvatarUrl} 
          fallbackUrl={gravatarUrl} 
        />
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '2rem' }}>
            {profile.first_name} {profile.last_name}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} /> {profile.email}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Profile Details Card */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle} style={{ fontSize: '1.2rem' }}>Account Details</h3>
          </div>
          <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18}/> Joined Date</span>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>{formatDate(profile.registered_at)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={18}/> Account Type</span>
              <span style={{ fontWeight: 500, color: '#0f172a', textTransform: 'capitalize' }}>{profile.account_type_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={18}/> Contact No</span>
              <span style={{ fontWeight: 500, color: '#0f172a' }}>{profile.contact_no || 'N/A'}</span>
            </div>
          </div>
        </div>



        {/* Category Proficiency and Incorrect Questions removed as per request */}

        {/* Fees Card */}
        {profile.account_types?.role === 'student' && (
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle} style={{ fontSize: '1.2rem' }}>Fees</h3>
            </div>
            <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={18}/> Status</span>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: profile.fees_paid ? '#dcfce7' : '#fee2e2',
                  color: profile.fees_paid ? '#166534' : '#991b1b',
                  textTransform: 'capitalize'
                }}>
                  {profile.fees_paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {profile.account_types?.role === 'student' && (
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle}>Exam Results</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Exams taken by this student with links to the full mark sheet.
              </p>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Submitted</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Time</th>
                  <th style={{ textAlign: 'right' }}>Mark Sheet</th>
                </tr>
              </thead>
              <tbody>
                {studentExamResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      No completed exams found for this student.
                    </td>
                  </tr>
                ) : (
                  studentExamResults.map((attempt: any) => {
                    const quiz = attempt.quizzes || {}
                    return (
                      <tr key={attempt.id} className={styles.tableRow}>
                        <td>
                          <strong>{quiz.name || 'Untitled Exam'}</strong>
                        </td>
                        <td>{quiz.student_subject || 'N/A'}</td>
                        <td>{quiz.student_teacher || 'N/A'}</td>
                        <td>{formatDateTime(attempt.ended_at || attempt.started_at)}</td>
                        <td>
                          <strong>{attempt.score_obtained || 0}</strong>
                          <span style={{ color: '#64748b' }}> ({Number(attempt.percentage_obtained || 0).toFixed(1)}%)</span>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${attempt.status === 'pass' ? styles.statusBadgeSuccess : styles.statusBadgeWarning}`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td>{formatDuration(attempt.total_time_seconds)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Link href={`/dashboard/results/${attempt.id}`} className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
                            <Eye size={14} /> View
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
      )}

      {profile.account_types?.role === 'teacher' && isAdmin && (
        <div className={styles.panel} style={{ marginBottom: '2rem' }}>
          <div className={styles.panelHeader}>
            <div>
              <h3 className={styles.panelTitle}>Teacher Subjects & Exam Results</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                Subjects and exams associated with this teacher, including student result summaries.
              </p>
            </div>
          </div>
          <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {Object.keys(teacherSubjects).length === 0 ? (
              <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center' }}>
                No exams found for this teacher.
              </div>
            ) : (
              Object.entries(teacherSubjects).map(([subject, exams]: [string, any[]]) => (
                <div key={subject} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BookOpen size={20} color="#2563eb" />
                      <strong style={{ color: '#0f172a' }}>{subject}</strong>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{exams.length} exam{exams.length === 1 ? '' : 's'}</span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Exam</th>
                          <th>Teacher Label</th>
                          <th>Attempts</th>
                          <th>Passed</th>
                          <th>Failed</th>
                          <th>Average</th>
                          <th style={{ textAlign: 'right' }}>Results</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((exam: any) => (
                          <tr key={exam.id} className={styles.tableRow}>
                            <td>
                              <strong>{exam.name}</strong>
                              <span style={{ display: 'block', color: '#64748b', fontSize: '0.8rem' }}>
                                {exam.ends_at ? `Ended ${formatDateTime(exam.ends_at)}` : 'No end date'}
                              </span>
                            </td>
                            <td>{exam.student_teacher || 'N/A'}</td>
                            <td>{exam.attemptCount}</td>
                            <td style={{ color: '#166534', fontWeight: 600 }}>{exam.passed}</td>
                            <td style={{ color: '#991b1b', fontWeight: 600 }}>{exam.failed}</td>
                            <td>{Number(exam.averagePercentage || 0).toFixed(1)}%</td>
                            <td style={{ textAlign: 'right' }}>
                              <Link href={`/dashboard/quizzes/${exam.id}/attempts`} className={`${styles.actionButton} ${styles.actionButtonPrimary}`}>
                                <FileText size={14} /> View Results
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  )
}
