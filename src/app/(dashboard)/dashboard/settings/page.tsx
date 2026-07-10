import { getSetting, updateSetting } from '@/app/actions/settings'
import styles from '@/components/dashboard/dashboard.module.css'
import { Link as LinkIcon, Save } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getUserRole } from '@/app/actions/auth'

export const metadata = {
  title: 'Settings | MBC Portal',
}

export default async function SettingsPage() {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const zoomLinkRaw = await getSetting('zoom_meeting_link')
  // Parse the JSONb value if it's a string, else use directly
  let zoomLink = ''
  if (typeof zoomLinkRaw === 'string') {
    try { zoomLink = JSON.parse(zoomLinkRaw) } catch (e) { zoomLink = zoomLinkRaw }
  } else {
    zoomLink = typeof zoomLinkRaw === 'string' ? zoomLinkRaw : ''
  }

  async function saveZoomLink(formData: FormData) {
    'use server'
    const link = String(formData.get('zoom_link') || '')
    await updateSetting('zoom_meeting_link', link)
  }

  const exportEmailRaw = await getSetting('csv_export_email')
  const exportEmail = typeof exportEmailRaw === 'string' ? exportEmailRaw : 'mathewsteven1996@gmail.com'

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Platform Settings</h2>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon size={20} /> Live Class (Zoom) Configuration
          </h3>
        </div>
        <div className={styles.panelBody}>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Set the default Zoom meeting link. When students click "Attend Class" on their dashboard, their attendance will be recorded and they will be redirected to this link.
          </p>

          <form action={saveZoomLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Zoom Meeting Link</label>
              <input 
                type="url" 
                name="zoom_link" 
                className={styles.input} 
                defaultValue={zoomLink || ''}
                placeholder="https://zoom.us/j/..."
                required 
              />
            </div>
            <div>
              <button type="submit" className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Save Link
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.panel} style={{ marginTop: '2rem' }}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkIcon size={20} /> Export Settings
          </h3>
        </div>
        <div className={styles.panelBody}>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Set the default email address where CSV exports (like Quiz Attempts) will be sent.
          </p>

          <form action={async (formData) => {
            'use server'
            await updateSetting('csv_export_email', String(formData.get('email') || ''))
          }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Default CSV Export Email</label>
              <input 
                type="email" 
                name="email" 
                className={styles.input} 
                defaultValue={exportEmail}
                placeholder="admin@example.com"
                required 
              />
            </div>
            <div>
              <button type="submit" className={styles.btnPrimary} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Save Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
