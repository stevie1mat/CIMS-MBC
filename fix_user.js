require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixUser() {
  const email = 'student@mbcmumbai.com';
  console.log(`Looking for user: ${email}`);
  
  // Get users
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  const user = usersData.users.find(u => u.email === email);
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  console.log(`Found user: ${user.id}, confirmed_at: ${user.email_confirmed_at}`);
  
  // Update password and confirm email
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: process.env.MBC_TEST_USER_PASSWORD,
    email_confirm: true,
  });
  
  if (error) {
    console.error('Error updating user:', error);
  } else {
    console.log('Successfully updated user password and confirmed email!');
  }
}

fixUser();
