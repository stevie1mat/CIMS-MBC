import { createClient } from '@/lib/supabase/server'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { UploadCloud, FileText, Database, HelpCircle, ArrowRight } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'

export const metadata = {
  title: 'Question Bank | MBC Portal',
}

export default async function QuestionsPage() {
  const supabase = await createClient()

  // Fetch all quizzes with their question counts
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select(`
      id,
      name,
      questions(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching quizzes:', error)
  }

  const totalQuizzes = quizzes?.length || 0;
  const totalQuestions = quizzes?.reduce((acc, q) => acc + (q.questions[0]?.count || 0), 0) || 0;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Question Bank</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Manage the central repository of questions across all quizzes.</p>
        </div>
        
        <Link href="/dashboard/questions/upload">
          <button className={styles.btnPrimary} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <UploadCloud size={18} /> Bulk Upload Questions
          </button>
        </Link>
      </div>

      {/* Metric Row */}
      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard 
          title="Total Quizzes" 
          value={totalQuizzes} 
          icon={<FileText size={24} color="#3b82f6" />} 
          colorClass="cardBlue"
        />
        <MetricCard 
          title="Total Questions" 
          value={totalQuestions} 
          icon={<HelpCircle size={24} color="#ec4899" />} 
          colorClass="cardPink"
        />
        <MetricCard 
          title="Storage Status" 
          value="Healthy" 
          icon={<Database size={24} color="#8b5cf6" />} 
          colorClass="cardPurple"
        />
      </div>

      {/* Main Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Questions by Quiz</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Quiz Name</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Total Questions</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!quizzes || quizzes.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <Database size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No quizzes found</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Create a Quiz first before you can upload questions to it.</p>
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => {
                  const questionCount = q.questions[0]?.count || 0;
                  
                  return (
                    <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '8px', 
                            backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}>
                            <FileText size={16} color="#3b82f6" />
                          </div>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{q.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          backgroundColor: questionCount > 0 ? '#f0fdf4' : '#f1f5f9',
                          color: questionCount > 0 ? '#16a34a' : '#64748b',
                          display: 'inline-block'
                        }}>
                          {questionCount} Question{questionCount !== 1 && 's'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <Link href={`/dashboard/quizzes/${q.id}/manage`}>
                            <button className={styles.btnOutline} style={{ padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }}>
                              Manage <ArrowRight size={14} />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
