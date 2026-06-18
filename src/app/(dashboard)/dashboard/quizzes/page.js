import { getQuizzes, deleteQuiz } from '@/app/actions/quizzes'
import { getUserRole } from '@/app/actions/auth'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { Plus, Edit, Trash2, List, PlayCircle, FileText, CheckCircle, Clock } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'

export const metadata = {
  title: 'Quizzes | MBC Portal',
}

export default async function QuizzesPage() {
  const quizzes = await getQuizzes()
  const role = await getUserRole()
  const isStaff = role === 'admin' || role === 'teacher' || role === 'super_admin'

  const activeQuizzes = quizzes.filter(q => (q.questions[0]?.count || 0) > 0).length;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>{isStaff ? 'Manage Quizzes' : 'Available Quizzes'}</h1>
          <p style={{ color: '#64748b', margin: 0 }}>
            {isStaff ? 'Create and manage all test and assignment quizzes.' : 'Take a quiz to test your knowledge.'}
          </p>
        </div>
        
        {isStaff && (
          <Link href="/dashboard/quizzes/new">
            <button className={styles.btnPrimary} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Plus size={18} /> Create Quiz
            </button>
          </Link>
        )}
      </div>

      {/* Metric Row */}
      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard 
          title="Total Quizzes" 
          value={quizzes.length} 
          icon={<FileText size={24} color="#3b82f6" />} 
          colorClass="cardBlue"
        />
        <MetricCard 
          title="Active Quizzes" 
          value={activeQuizzes} 
          icon={<PlayCircle size={24} color="#ec4899" />} 
          colorClass="cardPink"
        />
        <MetricCard 
          title="Requires Attention" 
          value={quizzes.length - activeQuizzes} 
          icon={<List size={24} color="#8b5cf6" />} 
          colorClass="cardPurple"
        />
      </div>

      {/* Main Table */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>Quiz List</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Quiz Name</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Pass Mark</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Questions</th>
                <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>No quizzes available</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{isStaff ? 'Click "Create Quiz" to add one.' : 'Check back later for new quizzes.'}</p>
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
                            backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            <FileText size={16} color="#3b82f6" />
                          </div>
                          <div>
                            <Link href={`/dashboard/quizzes/${q.id}`} style={{ textDecoration: 'none' }}>
                              <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>{q.name}</strong>
                            </Link>
                            {q.description && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{q.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 500 }}>
                          <Clock size={16} />
                          {q.duration_minutes} mins
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: 500 }}>
                          <CheckCircle size={16} color="#10b981" />
                          {q.pass_percentage}%
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          backgroundColor: questionCount > 0 ? '#f0fdf4' : '#fef2f2',
                          color: questionCount > 0 ? '#16a34a' : '#dc2626',
                          display: 'inline-block'
                        }}>
                          {questionCount}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {!isStaff ? (
                            <Link href={`/dashboard/quizzes/${q.id}`}>
                              <button className={styles.btnPrimary} style={{ padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem' }} title="Attempt">
                                <PlayCircle size={14} /> Attempt
                              </button>
                            </Link>
                          ) : (
                            <>
                              <Link href={`/dashboard/quizzes/${q.id}/manage`}>
                                <button className={styles.btnOutline} style={{ padding: '0.35rem 0.5rem' }} title="Manage Questions">
                                  <List size={16} />
                                </button>
                              </Link>
                              <form action={async () => {
                                'use server'
                                await deleteQuiz(q.id)
                              }}>
                                <button className={styles.btnOutline} style={{ padding: '0.35rem 0.5rem', color: '#ef4444', borderColor: '#ef4444' }} title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </form>
                            </>
                          )}
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
