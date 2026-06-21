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
          
          <div style={{ 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            backgroundColor: '#eff6ff', 
            borderRadius: '0.75rem', 
            border: '1px solid #bfdbfe',
            display: 'flex',
            gap: '1rem'
          }}>
            <Info size={24} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#1e40af', fontSize: '1.1rem' }}>Formatting Guidelines</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e3a8a', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <li><strong>Column A (Type):</strong> 0 = Single Choice, 1 = Multiple Choice, 2 = Match, 3 = Short Answer, 4 = Long Answer</li>
                <li><strong>Column B (Question):</strong> The full text of the question</li>
                <li><strong>Column C (Description):</strong> Optional helper text or hints</li>
                <li><strong>Column D (Correct Answer):</strong> The index of the correct option (1-indexed). For multiple answers, use a comma (e.g., 1,3)</li>
                <li><strong>Column E onwards:</strong> The actual option text (Option 1, Option 2, Option 3, etc.)</li>
              </ul>
            </div>
          </div>

          <UploadForm quizzes={quizzes || []} />
        </div>
      </div>
    </div>
  )
}
