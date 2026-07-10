import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { getUserRole } from '@/app/actions/auth'
import { createUser, getGroupsAndAccountTypes } from '@/app/actions/users'
import styles from '@/components/dashboard/dashboard.module.css'

export const metadata = {
  title: 'Create User | MBC Portal',
}

export default async function NewUserPage() {
  const role = await getUserRole()
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/dashboard')
  }

  const { accountTypes } = await getGroupsAndAccountTypes()

  async function createUserAction(formData: FormData) {
    'use server'
    await createUser(formData)
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard/users" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <div style={{ padding: '8px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s' }}>
            <ArrowLeft size={20} />
          </div>
        </Link>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', color: '#0f172a' }}>Create New User</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Add a new administrator, teacher, or student to the portal.</p>
        </div>
      </div>

      <div className={styles.panel} style={{ padding: '2rem' }}>
        <form action={createUserAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
              First Name
              <input name="first_name" className={styles.input} placeholder="e.g. John" required />
            </label>
            <label style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
              Last Name
              <input name="last_name" className={styles.input} placeholder="e.g. Doe" required />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
              Email Address
              <input type="email" name="email" className={styles.input} placeholder="john.doe@example.com" required />
            </label>
            <label style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
              Temporary Password
              <input type="password" name="password" className={styles.input} placeholder="Min. 6 characters" minLength={6} required />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
              Contact Number (Optional)
              <input name="contact_no" className={styles.input} placeholder="+1 234 567 8900" />
            </label>
            <label style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
              Account Type
              <select name="account_type_id" className={styles.input} required defaultValue="">
                <option value="" disabled>Select account type</option>
                {accountTypes.map((accountType: any) => (
                  <option key={accountType.id} value={accountType.id}>{accountType.name.charAt(0).toUpperCase() + accountType.name.slice(1)}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className={styles.btnPrimary} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <UserPlus size={18} /> Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
