import { 
  getProfileDetails, 
  getQuizActivity, 
  getCategoryProficiency, 
  getIncorrectQuestions, 
  getPaymentHistory 
} from '@/app/actions/profile'
import styles from '@/components/dashboard/dashboard.module.css'
import { 
  User, Mail, Phone, Calendar, Shield, Users,
  Activity, CheckCircle, XCircle, Clock,
  TrendingUp, TrendingDown, Eye, CreditCard
} from 'lucide-react'
import crypto from 'crypto'

import { getUserRole } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import AvatarUpload from '@/app/(dashboard)/dashboard/users/[id]/AvatarUpload'
import EditProfileForm from './EditProfileForm'

export const metadata = {
  title: 'My Profile | MBC Portal',
}

export default async function ProfilePage() {
  const role = await getUserRole()
  const profile = await getProfileDetails()
  const activity = await getQuizActivity()
  const categories = await getCategoryProficiency()
  const incorrectQuestions = await getIncorrectQuestions()
  const paymentHistory = await getPaymentHistory()

  if (!profile) return <div>Profile not found</div>

  const emailHash = crypto.createHash('md5').update(profile.email?.toLowerCase() || '').digest('hex')
  const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=150&d=mp`

  const supabase = await createClient()
  let currentAvatarUrl = null
  if (profile.avatar_path) {
    const { data } = supabase.storage.from(profile.avatar_bucket || 'avatars').getPublicUrl(profile.avatar_path)
    currentAvatarUrl = data.publicUrl
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1.5rem' }}>
        <h2 className={styles.panelTitle}>My Profile</h2>
      </div>

      {/* Header Profile Section */}
      <div className={styles.panel} style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
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
        <EditProfileForm user={profile} currentAvatarUrl={currentAvatarUrl} gravatarUrl={gravatarUrl} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>



        {/* Fees Card */}
        {role === 'student' && (
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
