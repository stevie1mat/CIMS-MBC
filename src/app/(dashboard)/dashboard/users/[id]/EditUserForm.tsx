'use client'

import { useState } from 'react'
import { updateUser, resetUserPassword } from '@/app/actions/users'
import styles from '@/components/dashboard/dashboard.module.css'
import { Edit2, X, Save, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react'
import AvatarUpload from './AvatarUpload'

export default function EditUserForm({ user, groups, accountTypes, currentAvatarUrl, gravatarUrl }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    const formData = new FormData(e.target)
    
    const result = await updateUser(user.id, formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setIsEditing(false)
      // Optional: you could reload here to show fresh data, or rely on router.refresh() if updateUser does it
      window.location.reload();
    }
    setIsSaving(false)
  }

  const handlePasswordReset = async () => {
    setPasswordError(null)
    setPasswordSuccess(false)

    if (!newPassword) {
      setPasswordError('Please enter a new password.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setIsResetting(true)
    const result = await resetUserPassword(user.id, newPassword)

    if (result.error) {
      setPasswordError(result.error)
    } else {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      // Auto-hide success after 3 seconds
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
    setIsResetting(false)
  }

  const handleClose = () => {
    setIsEditing(false)
    setShowPasswordReset(false)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError(null)
    setPasswordSuccess(false)
    setShowPassword(false)
  }

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)} 
        className={styles.btnPrimary} 
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
      <div className={styles.panel} style={{ width: '100%', maxWidth: '500px', margin: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.panelTitle}>Edit User Details</h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <AvatarUpload userId={user.id} currentAvatarUrl={currentAvatarUrl} fallbackUrl={gravatarUrl} />
          </div>

          {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>First Name</label>
              <input name="first_name" defaultValue={user.first_name} className={styles.input} required />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Last Name</label>
              <input name="last_name" defaultValue={user.last_name} className={styles.input} required />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Contact No</label>
            <input name="contact_no" defaultValue={user.contact_no} className={styles.input} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Account Type</label>
            <select name="account_type_id" defaultValue={user.account_type_id} className={styles.input} required>
              <option value="">Select Account Type</option>
              {accountTypes.map(at => (
                <option key={at.id} value={at.id}>{at.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Fees Status</label>
            <select name="fees_paid" defaultValue={user.fees_paid ? 'true' : 'false'} className={styles.input}>
              <option value="false">Unpaid</option>
              <option value="true">Paid</option>
            </select>
          </div>

          {/* Reset Password Section */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowPasswordReset(!showPasswordReset)
                setPasswordError(null)
                setPasswordSuccess(false)
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6366f1',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: 0,
              }}
            >
              <KeyRound size={16} />
              {showPasswordReset ? 'Hide Password Reset' : 'Reset Password'}
            </button>

            {showPasswordReset && (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {passwordError && (
                  <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '0.5rem', borderRadius: '4px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> Password reset successfully.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.input}
                      placeholder="Min 6 characters"
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        padding: '0.25rem',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#475569' }}>Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Re-enter password"
                  />
                </div>

                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isResetting}
                  className={styles.btnOutline}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    alignSelf: 'flex-start',
                    color: '#6366f1',
                    borderColor: '#6366f1',
                  }}
                >
                  <KeyRound size={16} />
                  {isResetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={handleClose} className={styles.btnOutline}>Cancel</button>
            <button type="submit" disabled={isSaving} className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

