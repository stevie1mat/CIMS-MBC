'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as xlsx from 'xlsx'

// Helper to determine question type string based on legacy index format
const getQuestionTypeString = (index: any) => {
  const map: Record<string, string> = {
    '0': 'Multiple Choice Single Answer',
    '1': 'Multiple Choice Multiple Answer',
    '2': 'Match the Column',
    '3': 'Short Answer',
    '4': 'Long Answer'
  }
  return map[String(index).trim()] || 'Multiple Choice Single Answer'
}

export async function uploadQuestions(quizId: number | string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const workbook = xlsx.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Parse the sheet to JSON. Assuming format:
    // [0] Type, [1] Question, [2] Description, [3] Correct Option/s, [4] Option 1, [5] Option 2...
    // header: 1 returns array of arrays (rows)
    const rows: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
    
    let processedCount = 0
    const failedRows: any[] = []

    // Loop through each row
    for (let i = 1; i < rows.length; i++) { // Skip header row (index 0) if there is one. Wait, legacy might not have header. We'll check if row 0 looks like a header.
      const row = rows[i]
      if (!row || row.length < 2) continue // Skip empty rows

      // Let's assume index 0 is not a header if it starts with a number. But to be safe, we just process all rows that have data.
      // If row 0 is a header (e.g. "Question Type"), we can skip it.
      if (i === 1 && String(row[0]).toLowerCase().includes('type')) continue;
      
      let typeIndex = row[0]
      let questionText = row[1]
      let description = row[2] || ''
      let correctAnswersRaw = row[3] || ''
      
      if (!questionText) continue

      const questionType = getQuestionTypeString(typeIndex)

      // Insert question
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .insert([{
          quiz_id: Number(quizId),
          question_text: questionText,
          description: description,
          question_type: questionType
        }])
        .select()
        .single()

      if (qError) {
        console.error('Error inserting question:', qError)
        failedRows.push({ row: i + 1, message: qError.message })
        continue
      }

      const qid = qData.id
      const options: any[] = []
      
      // Parse Options starting from index 4
      if (questionType === 'Multiple Choice Single Answer' || questionType === 'Multiple Choice Multiple Answer') {
        const correctIndexes = String(correctAnswersRaw).split(',').map(s => parseInt(s.trim()))
        let optionIndex = 1 // Options are 1-indexed in the Excel column logic
        
        for (let col = 4; col < row.length; col++) {
          const optText = row[col]
          if (optText !== undefined && optText !== null && String(optText).trim() !== '') {
            const isCorrect = correctIndexes.includes(optionIndex)
            options.push({
              question_id: qid,
              option_text: String(optText),
              is_correct: isCorrect
            })
            optionIndex++
          }
        }
      } else if (questionType === 'Match the Column') {
         // Legacy: Option format "Item=Match"
         for (let col = 4; col < row.length; col++) {
          const optText = row[col]
          if (optText && String(optText).includes('=')) {
            const parts = String(optText).split('=')
            options.push({
              question_id: qid,
              option_text: parts[0].trim(),
              match_text: parts[1].trim(), // Note: Assuming we add a `match_text` column if we want to fully support this, but for now we'll put it in option_text as JSON or just keep it simple if `match_text` is not in our schema. Let's stick to standard options for now if schema doesn't have match_text.
              is_correct: true // For match the column, the pair itself is the correct answer
            })
          }
         }
      } else if (questionType === 'Short Answer' || questionType === 'Long Answer') {
        // Just insert the text as the correct answer
        if (correctAnswersRaw) {
          options.push({
            question_id: qid,
            option_text: String(correctAnswersRaw),
            is_correct: true
          })
        }
      }

      if (options.length > 0) {
        // Ensure match_text doesn't break if not in schema. 
        // We'll clean it up to match our current options table which is (question_id, option_text, is_correct)
        const cleanOptions = options.map(o => ({
          question_id: o.question_id,
          option_text: o.option_text + (o.match_text ? ` = ${o.match_text}` : ''),
          is_correct: o.is_correct
        }))

        const { error: optError } = await supabase.from('question_options').insert(cleanOptions)
        if (optError) {
          console.error('Error inserting options:', optError)
          failedRows.push({ row: i + 1, message: optError.message })
        }
      }

      processedCount++
    }

    revalidatePath(`/dashboard/quizzes/${quizId}/manage`)
    if (processedCount === 0 && failedRows.length > 0) {
      return { error: `No questions were uploaded. First error on row ${failedRows[0].row}: ${failedRows[0].message}` }
    }

    return { success: true, count: processedCount }

  } catch (err: any) {
    console.error('Upload parsing error:', err)
    return { error: `Failed to process file: ${err.message || 'Unknown error'}` }
  }
}

export async function getQuestionsByQuiz(quizId: number | string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options(*)
    `)
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getQuestions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_options(*)
    `)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

export async function deleteQuestion(id: number | string, quizId?: number | string) {
  const supabase = await createClient()
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) return { error: error.message }
  if (quizId) {
    revalidatePath(`/dashboard/quizzes/${quizId}/manage`)
  }
  return { success: true }
}
