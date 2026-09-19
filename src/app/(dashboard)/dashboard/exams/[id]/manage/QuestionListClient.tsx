'use client'

import { useState } from 'react'
import { deleteQuestion, bulkDeleteQuestions } from '@/app/actions/questions'
import styles from '@/components/dashboard/dashboard.module.css'
import { CheckCircle, FileText, HelpCircle, Trash2, Edit2 } from 'lucide-react'
import BulkUploadButton from './BulkUploadButton'
import EditQuestionModal from './EditQuestionModal'

type Question = any // or import your specific type

interface QuestionListClientProps {
  questions: Question[]
  quizId: number | string
  quizName: string
}

export default function QuestionListClient({ questions, quizId, quizName }: QuestionListClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(questions.map(q => q.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelect = (id: number | string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected questions?`)) return

    setIsDeleting(true)
    try {
      const res = await bulkDeleteQuestions(Array.from(selectedIds), quizId)
      if (res.error) {
        alert(res.error)
      } else {
        setSelectedIds(new Set())
      }
    } catch (e: any) {
      alert(e.message || 'Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSingle = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    setIsDeleting(true)
    try {
      await deleteQuestion(id, quizId)
      const newSelected = new Set(selectedIds)
      newSelected.delete(id)
      setSelectedIds(newSelected)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className={styles.panelTitle}>Question List</h3>
        {selectedIds.size > 0 && (
          <button 
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className={`${styles.actionButton} ${styles.actionButtonDanger}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fecaca', padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            <Trash2 size={14} /> Delete Selected ({selectedIds.size})
          </button>
        )}
      </div>
      <div className={styles.panelBody} style={{ padding: 0 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={questions.length > 0 && selectedIds.size === questions.length}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Question</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Options</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, width: '130px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto', display: 'block' }} />
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>No questions uploaded</p>
                  <p style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.9rem' }}>Bulk upload questions from Excel to prepare this exam.</p>
                  <BulkUploadButton quizId={quizId.toString()} quizName={quizName} variant="emptyState" />
                </td>
              </tr>
            ) : (
              questions.map((q, index) => (
                <tr key={q.id} className={styles.tableRow}>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="checkbox"
                      checked={selectedIds.has(q.id)}
                      onChange={(e) => handleSelect(q.id, e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div className={styles.quizNameCell}>
                      <div className={styles.quizNameIcon}>
                        <HelpCircle size={17} color="#3b82f6" />
                      </div>
                      <div>
                        <div className={styles.questionText} dangerouslySetInnerHTML={{ __html: q.question_text }} />
                        {q.description && <p className={styles.quizDescription}>{q.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`${styles.statusBadge} ${styles.statusBadgeMuted}`}>{q.question_type}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <ul className={styles.optionList}>
                      {q.question_options?.map((opt: any) => (
                        <li key={opt.id} className={opt.is_correct ? styles.optionCorrect : undefined}>
                          {opt.option_text} {opt.is_correct && <CheckCircle size={13} />}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div className={styles.tableActions} style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setEditingQuestion(q)}
                        className={styles.actionButton}
                        title="Edit Question"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSingle(q.id)}
                        disabled={isDeleting}
                        className={`${styles.actionButton} ${styles.actionButtonDanger}`} 
                        title="Delete from Exam"
                        style={{ opacity: isDeleting ? 0.5 : 1 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {editingQuestion && (
        <EditQuestionModal 
          quizId={quizId} 
          question={editingQuestion} 
          onClose={() => setEditingQuestion(null)} 
        />
      )}
    </div>
  )
}
