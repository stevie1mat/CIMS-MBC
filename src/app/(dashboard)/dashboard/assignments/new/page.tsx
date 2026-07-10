import AssignmentForm from './AssignmentForm'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getCategories } from '@/app/actions/assignments'

export const metadata = {
  title: 'Create Assignment | MBC Portal',
}

export default async function NewAssignmentPage() {
  const categories = await getCategories()
  
  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Create New Assignment</h2>
        <Link href="/dashboard/assignments">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Assignments
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: '2rem' }}>
          <AssignmentForm categories={categories} />
        </div>
      </div>
    </div>
  )
}
