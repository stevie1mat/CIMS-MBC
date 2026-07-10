import UploadForm from './UploadForm'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, Download, Info } from 'lucide-react'
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
    <div style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Bulk Upload</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Import multiple questions at once using an Excel or CSV file.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/template.xlsx" target="_blank" download>
            <button className={styles.btnOutline} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Download size={18} /> Download Template
            </button>
          </Link>
          <Link href="/dashboard/questions">
            <button className={styles.btnPrimary} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <ArrowLeft size={18} /> Back to Bank
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Upload Configuration</h3>
        </div>
        <div className={styles.panelBody}>
          


          <UploadForm quizzes={quizzes || []} />
        </div>
      </div>
    </div>
  )
}
