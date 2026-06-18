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
const password = process.env.MBC_TEST_USER_PASSWORD || 'Mbcmumbai@279';

const users = [
  {
    email: 'student@mbcmumbai.com',
    firstName: 'MBC',
    lastName: 'Student',
    role: 'student',
  },
  {
    email: 'teacher@mbcmumbai.com',
    firstName: 'MBC',
    lastName: 'Teacher',
    role: 'teacher',
  },
  {
    email: 'admin@mbcmumbai.com',
    firstName: 'MBC',
    lastName: 'Admin',
    role: 'admin',
  },
];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// Provide a no-op WebSocket for Node.js < 22 (this script never uses realtime)
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
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find((candidate) => candidate.email === email);
    if (user) {
      return user;
    }

    if (data.users.length < perPage) {
      return null;
    }

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

  if (error) {
    throw error;
  }

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

  if (error) {
    throw error;
  }
}

for (const user of users) {
  const existingUser = await findUserByEmail(user.email);

  if (existingUser) {
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      {
        password,
        email_confirm: true,
        user_metadata: {
          first_name: user.firstName,
          last_name: user.lastName,
        },
      }
    );

    if (error) {
      throw error;
    }

    await upsertProfile(user, data.user.id);
    console.log(`Updated ${user.email} as ${user.role}`);
    continue;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: user.firstName,
      last_name: user.lastName,
    },
  });

  if (error) {
    throw error;
  }

  await upsertProfile(user, data.user.id);
  console.log(`Created ${user.email} as ${user.role}`);
}
