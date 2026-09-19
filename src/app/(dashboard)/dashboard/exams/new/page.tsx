import QuizForm from './QuizForm'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Create Exam | MBC Portal',
}

export default async function NewQuizPage() {
  const supabase = await createClient()
  
  const [{ data: subjects }, { data: assignments }] = await Promise.all([
    supabase.from('categories').select('id, name').order('name'),
    supabase
      .from('subject_teachers' as any)
      .select(`
        category_id,
        profiles ( id, first_name, last_name, email )
      `)
  ])

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Create New Exam</h2>
        <Link href="/dashboard/exams">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Exams
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody} style={{ paddingTop: '24px' }}>
          <QuizForm 
            subjects={subjects || []} 
            assignments={assignments || []} 
          />
        </div>
      </div>
    </div>
  )
}
