import AssignmentForm from '../../new/AssignmentForm'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getCategories, getAssignment } from '@/app/actions/assignments'

export const metadata = {
  title: 'Edit Assignment | MBC Portal',
}

type EditAssignmentPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const { id } = await params
  const categories = await getCategories()
  const assignment = await getAssignment(id)
  
  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Edit Assignment</h2>
        <Link href={`/dashboard/assignments/${id}`}>
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Assignment
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ padding: '2rem' }}>
          <AssignmentForm categories={categories} initialData={assignment} />
        </div>
      </div>
    </div>
  )
}
