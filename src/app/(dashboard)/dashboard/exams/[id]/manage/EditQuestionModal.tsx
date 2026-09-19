'use client'

import { useState, useEffect } from 'react'
import { updateQuestion } from '@/app/actions/questions'
import styles from '@/components/dashboard/dashboard.module.css'
import { X, Plus, Trash2, Save } from 'lucide-react'

interface Option {
  id?: number
  text: string
  isCorrect: boolean
}

interface EditQuestionModalProps {
  quizId: string | number
  question: any
  onClose: () => void
}

export default function EditQuestionModal({ quizId, question, onClose }: EditQuestionModalProps) {
  const [questionText, setQuestionText] = useState('')
  const [description, setDescription] = useState('')
  const [questionType, setQuestionType] = useState('Multiple Choice Single Answer')
  const [options, setOptions] = useState<Option[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text || '')
      setDescription(question.description || '')
      setQuestionType(question.question_type || 'Multiple Choice Single Answer')
      
      const mappedOptions = (question.question_options || []).map((opt: any) => ({
        id: opt.id,
        text: opt.option_text || '',
        isCorrect: opt.is_correct || false
      }))
      
      // Ensure there are at least some options
      if (mappedOptions.length === 0) {
        mappedOptions.push({ text: '', isCorrect: true })
        mappedOptions.push({ text: '', isCorrect: false })
      }
      
      setOptions(mappedOptions)
    }
  }, [question])

  const handleOptionChange = (index: number, field: keyof Option, value: any) => {
    const newOptions = [...options]
    if (field === 'isCorrect' && questionType === 'Multiple Choice Single Answer') {
      // Uncheck others
      newOptions.forEach(opt => opt.isCorrect = false)
    }
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const addOption = () => {
    setOptions([...options, { text: '', isCorrect: false }])
  }

  const removeOption = (index: number) => {
    const newOptions = [...options]
    newOptions.splice(index, 1)
    setOptions(newOptions)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!questionText.trim()) {
      setError('Question text is required')
      return
    }

    if (questionType.includes('Multiple Choice')) {
      const emptyOptions = options.filter(o => !o.text.trim())
      if (emptyOptions.length > 0) {
        setError('All options must have text')
        return
      }
      const hasCorrect = options.some(o => o.isCorrect)
      if (!hasCorrect) {
        setError('At least one option must be marked as correct')
        return
      }
    }

    setIsSaving(true)
    try {
      const res = await updateQuestion(
        quizId,
        question.id,
        questionText,
        questionType,
        description,
        options
      )
      
      if (res.error) {
        setError(res.error)
      } else {
        onClose()
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save question')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Edit Question</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {error && (
            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form id="edit-question-form" onSubmit={handleSave}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                Question Text
              </label>
              <textarea 
                className={styles.input}
                style={{ width: '100%', minHeight: '100px', padding: '0.75rem' }}
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Enter question text..."
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                Description (Optional)
              </label>
              <input 
                type="text"
                className={styles.input}
                style={{ width: '100%', padding: '0.75rem' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Additional instructions or context..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#334155' }}>
                Question Type
              </label>
              <select 
                className={styles.input}
                style={{ width: '100%', padding: '0.75rem' }}
                value={questionType}
                onChange={e => setQuestionType(e.target.value)}
              >
                <option value="Multiple Choice Single Answer">Multiple Choice Single Answer</option>
                <option value="Multiple Choice Multiple Answer">Multiple Choice Multiple Answer</option>
                <option value="True/False">True/False</option>
              </select>
            </div>

            {/* Options Section */}
            {questionType.includes('Multiple Choice') || questionType === 'True/False' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 500, color: '#334155', margin: 0 }}>Answer Options</label>
                  <button 
                    type="button" 
                    onClick={addOption}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.25rem', 
                      background: 'none', border: 'none', color: '#3b82f6', 
                      fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' 
                    }}
                  >
                    <Plus size={16} /> Add Option
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {options.map((opt, index) => (
                    <div key={index} style={{ 
                      display: 'flex', gap: '1rem', alignItems: 'center', 
                      padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px',
                      border: opt.isCorrect ? '1px solid #86efac' : '1px solid transparent'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <input 
                          type={questionType === 'Multiple Choice Single Answer' || questionType === 'True/False' ? 'radio' : 'checkbox'}
                          name="isCorrect"
                          checked={opt.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </div>
                      <input 
                        type="text"
                        className={styles.input}
                        style={{ flex: 1, padding: '0.5rem' }}
                        value={opt.text}
                        onChange={e => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => removeOption(index)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                        title="Remove Option"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          backgroundColor: '#f8fafc',
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px'
        }}>
          <button 
            type="button"
            onClick={onClose}
            className={styles.btnOutline}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="edit-question-form"
            className={styles.btnPrimary}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
