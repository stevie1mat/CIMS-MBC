import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      id, title,
      profiles:assignments_created_by_fkey(first_name, last_name)
    `)
  console.log("With alias:", JSON.stringify(data, null, 2))
  
  const { data: data2 } = await supabase
    .from('assignments')
    .select(`
      id, title,
      profiles(first_name, last_name)
    `)
  console.log("Without alias:", JSON.stringify(data2, null, 2))
}
run()
