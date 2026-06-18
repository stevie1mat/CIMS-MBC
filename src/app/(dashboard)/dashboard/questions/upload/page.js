import UploadForm from './UploadForm'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Bulk Upload Questions | MBC Portal',
}

export default async function UploadQuestionsPage() {
  const supabase = await createClient()

  // Fetch all quizzes for the dropdown
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('id, name')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className={styles.panelHeader} style={{ marginBottom: '1rem' }}>
        <h2 className={styles.panelTitle}>Bulk Upload Questions</h2>
        <Link href="/dashboard/questions">
          <button className={styles.btnOutline} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Question Bank
          </button>
        </Link>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelBody}>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
            <h4 style={{ marginTop: 0, color: '#1e40af' }}>Excel Format Requirements</h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e3a8a', fontSize: '0.9rem' }}>
              <li><strong>Column A:</strong> Question Type (0=Single Choice, 1=Multiple Choice, 2=Match the Column, 3=Short Answer, 4=Long Answer)</li>
              <li><strong>Column B:</strong> Question Text</li>
              <li><strong>Column C:</strong> Description (Optional)</li>
              <li><strong>Column D:</strong> Correct Option Index (e.g. 1, 2) or Comma separated for multiple (e.g. 1,3)</li>
              <li><strong>Column E+:</strong> Option 1, Option 2, Option 3...</li>
            </ul>
          </div>

          <UploadForm quizzes={quizzes || []} />
        </div>
      </div>
    </div>
  )
}
