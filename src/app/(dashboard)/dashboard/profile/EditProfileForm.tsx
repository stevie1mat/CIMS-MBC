'use client'

import { useState } from 'react'
import { updateOwnPassword } from '@/app/actions/profile'
import styles from '@/components/dashboard/dashboard.module.css'
import { Edit2, X, Save, Lock } from 'lucide-react'
import AvatarUpload from '@/app/(dashboard)/dashboard/users/[id]/AvatarUpload'

export default function EditProfileForm({ user, currentAvatarUrl, gravatarUrl }: { user: any, currentAvatarUrl: string | null, gravatarUrl: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string
    
    if (password && password !== confirm) {
      setError('Passwords do not match')
      setIsSaving(false)
      return
    }

    const result = await updateOwnPassword(formData)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Profile updated successfully!')
      setTimeout(() => {
        setIsEditing(false)
        window.location.reload()
      }, 1500)
    }
    setIsSaving(false)
  }

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)} 
        className={styles.btnOutline} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <Edit2 size={16} /> Edit Profile
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className={styles.panel} style={{ width: '100%', maxWidth: '400px', margin: '2rem' }}>
        <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.panelTitle}>Edit Profile</h3>
          <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Profile Picture</span>
            <AvatarUpload userId={user.id} currentAvatarUrl={currentAvatarUrl} fallbackUrl={gravatarUrl} />
          </div>

          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
          {success && <div style={{ color: '#10b981', backgroundColor: '#d1fae5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>{success}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} /> New Password
            </label>
            <input name="password" type="password" placeholder="Leave blank to keep current" className={styles.input} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Confirm New Password</label>
            <input name="confirm_password" type="password" placeholder="Confirm new password" className={styles.input} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsEditing(false)} className={styles.btnOutline}>Cancel</button>
            <button type="submit" disabled={isSaving} className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
