import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Load .env file manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  console.warn('Could not read .env file, relying on environment variables.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_PASSWORD = 'Welcome@MBC2026';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class NoOpWebSocket {
    constructor() {}
    close() {}
  };
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email === email);
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function getAccountTypeId(role) {
  const { data, error } = await supabase
    .from('account_types')
    .select('id')
    .eq('role', role)
    .order('id', { ascending: true })
    .limit(1)
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertProfile(user, authUserId) {
  const accountTypeId = await getAccountTypeId(user.role);
  const { error } = await supabase.from('profiles').upsert({
    id: authUserId,
    account_type_id: accountTypeId,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    status: 'active',
  });
  if (error) throw error;
}

async function runMigration() {
  console.log('Reading SQL file...');
  const content = readFileSync(resolve(__dirname, '..', 'sql/u306526696_website.sql'), 'utf8');
  
  // Find all INSERT INTO `savsoft_users` blocks
  const insertIndex = content.indexOf('INSERT INTO `savsoft_users`');
  if (insertIndex === -1) {
    console.log('Could not find any savsoft_users records.');
    return;
  }
  
  const endIndex = content.indexOf(';', insertIndex);
  const insertBlock = content.substring(insertIndex, endIndex);
  
  const valuesStart = insertBlock.indexOf('VALUES\n') + 7;
  const valuesStr = insertBlock.substring(valuesStart);
  
  console.log('Parsing records from SQL...');
  const records = [];
  let inString = false;
  let currentRecord = [];
  let currentValue = "";
  
  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    if (char === "'" && valuesStr[i-1] !== '\\') {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '(' && currentValue.trim() === '') continue;
      if (char === ',') {
        currentRecord.push(currentValue.trim());
        currentValue = "";
        continue;
      }
      if (char === ')') {
        currentRecord.push(currentValue.trim());
        records.push(currentRecord);
        currentRecord = [];
        currentValue = "";
        while(i + 1 < valuesStr.length && (valuesStr[i+1] === ',' || valuesStr[i+1] === '\n' || valuesStr[i+1] === '\r')) {
          i++;
        }
        continue;
      }
    }
    currentValue += char;
  }
  
  console.log(`Found ${records.length} user records to process.`);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const r of records) {
    const email = r[2] ? r[2].replace(/^'|'$/g, '').trim() : '';
    if (!email || email.indexOf('@') === -1) {
      console.log(`Skipping invalid email: ${email}`);
      skipped++;
      continue;
    }

    const firstName = r[3] ? r[3].replace(/^'|'$/g, '').trim() : 'User';
    const lastName = r[4] ? r[4].replace(/^'|'$/g, '').trim() : '';
    const contactNo = r[5] ? r[5].replace(/^'|'$/g, '') : '';
    const checkStudent = r[27] ? r[27].replace(/^'|'$/g, '') : '';
    
    let role = 'student';
    if (checkStudent === '0' || contactNo.startsWith('MBC#T')) role = 'teacher';
    if (checkStudent === '3') role = 'admin';

    const userObj = { email, firstName, lastName, role };
    console.log(`Processing ${email} as ${role}...`);

    try {
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        const { data, error } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            email_confirm: true,
            user_metadata: { first_name: firstName, last_name: lastName },
          }
        );
        if (error) throw error;
        await upsertProfile(userObj, data.user.id);
        console.log(`  Updated ${email}`);
        updated++;
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: email,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: { first_name: firstName, last_name: lastName },
        });
        if (error) throw error;
        await upsertProfile(userObj, data.user.id);
        console.log(`  Created ${email}`);
        created++;
      }
    } catch (err) {
      console.error(`  Failed to process ${email}:`, err.message);
      skipped++;
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`Total processed: ${records.length}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed/Skipped: ${skipped}`);
}

runMigration().catch(console.error);
