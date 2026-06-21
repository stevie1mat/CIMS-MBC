const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  try {
    const buffer = fs.readFileSync('/Users/stevenmathew/Downloads/MBC/questions-format/RIGHTLY DIVIDING THE WORD  UNIT 2.xls');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    let processedCount = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 2) continue;
      
      let typeIndex = row[0];
      let questionText = row[1];
      let description = row[2] || '';
      let correctAnswersRaw = row[3] || '';
      
      if (!questionText) continue;
      if (i === 1 && String(typeIndex).toLowerCase().includes('type')) continue;

      const questionType = 'Multiple Choice Single Answer';
      
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .insert([{
          quiz_id: 1, // Assume quiz 1 exists. Or let's just use quiz_id: null if it allows it.
          question_text: questionText,
          description: description,
          question_type: questionType,
          created_by: null // we don't know a valid uuid, but it's optional?
        }])
        .select()
        .single();
        
      if (qError) {
        console.error('QError at row', i, ':', qError);
        break;
      }
      processedCount++;
    }
    console.log("Success! Processed:", processedCount);
  } catch (err) {
    console.error(err);
  }
}

testUpload();
