import { getQuiz } from '@/app/actions/quizzes'
import { getQuestionsByQuiz, deleteQuestion } from '@/app/actions/questions'
import styles from '@/components/dashboard/dashboard.module.css'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileText, HelpCircle, ListChecks, Trash2, UploadCloud } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import BulkUploadButton from './BulkUploadButton'
import QuestionListClient from './QuestionListClient'

export const metadata = {
  title: 'Manage Exam Questions | MBC Portal',
}

type ManageQuizQuestionsPageProps = {
  params: Promise<{ id: string }>
}

export default async function ManageQuizQuestionsPage({ params }: ManageQuizQuestionsPageProps) {
  const { id } = await params
  const quiz = await getQuiz(id)
  const questions = await getQuestionsByQuiz(id)

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', color: '#0f172a' }}>{quiz.name}</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Manage Questions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>

          <Link href={`/dashboard/exams/${quiz.id}/edit`} style={{ textDecoration: 'none' }}>
            <button className={styles.btnPrimary} style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <ArrowLeft size={18} /> Back to Exam
            </button>
          </Link>
        </div>
      </div>

      <div className={styles.cardGrid} style={{ marginBottom: '2rem' }}>
        <MetricCard
          title="Total Questions"
          value={questions.length}
          icon={<HelpCircle size={24} color="#3b82f6" />}
          colorClass="cardBlue"
        />
        <MetricCard
          title="MCQ Single"
          value={questions.filter(q => q.question_type === 'Multiple Choice Single Answer').length}
          icon={<ListChecks size={24} color="#ec4899" />}
          colorClass="cardPink"
        />
        <MetricCard
          title="MCQ Multiple"
          value={questions.filter(q => q.question_type === 'Multiple Choice Multiple Answer').length}
          icon={<ListChecks size={24} color="#f59e0b" />}
          colorClass="cardOrange"
        />
        <MetricCard
          title="True / False"
          value={questions.filter(q => q.question_type === 'True/False').length}
          icon={<CheckCircle size={24} color="#8b5cf6" />}
          colorClass="cardPurple"
        />
      </div>

      <QuestionListClient questions={questions} quizId={quiz.id} quizName={quiz.name} />
    </div>
  )
}
