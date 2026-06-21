const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testUpload() {
  try {
    const workbook = xlsx.readFile('/Users/stevenmathew/Downloads/MBC/questions-format/RIGHTLY DIVIDING THE WORD  UNIT 2.xls');
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
      
      // Let's test insert
      const { data: qData, error: qError } = await supabase
        .from('questions')
        .insert([{
          quiz_id: 1, // assume quiz_id 1 exists
          question_text: questionText,
          description: description,
          question_type: questionType,
          created_by: 'b4b1a415-37ff-4328-b0a3-f938d827282b' // try some dummy uuid
        }])
        .select()
        .single();
        
      if (qError) {
        console.error('QError:', qError.message);
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
