import { 
  getProfileDetails, 
  getQuizActivity, 
  getCategoryProficiency, 
  getIncorrectQuestions, 
  getPaymentHistory 
} from '@/app/actions/profile'
import { getGroupsAndAccountTypes } from '@/app/actions/users'
import { getUserRole } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import styles from '@/components/dashboard/dashboard.module.css'
import { 
  Mail, Phone, Calendar, Shield, Users,
  Activity, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, Eye, CreditCard, ArrowLeft
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
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const profile = await getProfileDetails(id)
  if (!profile) return <div style={{ padding: '2rem' }}>User not found</div>

  const activity = await getQuizActivity(id)
  const categories = await getCategoryProficiency(id)
  const incorrectQuestions = await getIncorrectQuestions(id)
  const paymentHistory = await getPaymentHistory(id)
  const { groups, accountTypes } = await getGroupsAndAccountTypes()

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

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
        
        <EditUserForm 
          user={profile} 
          groups={groups} 
          accountTypes={accountTypes} 
          currentAvatarUrl={currentAvatarUrl}
          gravatarUrl={gravatarUrl}
        />
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

    </div>
  )
}
