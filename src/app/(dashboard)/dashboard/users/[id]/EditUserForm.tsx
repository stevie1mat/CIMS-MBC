'use client'

import { useState } from 'react'
import { updateUser } from '@/app/actions/users'
import styles from '@/components/dashboard/dashboard.module.css'
import { Edit2, X, Save } from 'lucide-react'
import AvatarUpload from './AvatarUpload'

export default function EditUserForm({ user, groups, accountTypes, currentAvatarUrl, gravatarUrl }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

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
      <div className={styles.panel} style={{ width: '100%', maxWidth: '500px', margin: '2rem' }}>
        <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.panelTitle}>Edit User Details</h3>
          <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
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
