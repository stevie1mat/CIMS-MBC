import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminView from '@/components/dashboard/AdminView';
import TeacherView from '@/components/dashboard/TeacherView';
import StudentView from '@/components/dashboard/StudentView';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch the role and fees_paid from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      account_types ( role ),
      fees_paid,
      real_email,
      avatar_path,
      avatar_bucket
    `)
    .eq('id', user.id)
    .single();

  const role = profile?.account_types?.role || 'student';
  
  let avatarUrl = null;
  if (profile?.avatar_path) {
    const { data } = supabase.storage.from(profile.avatar_bucket || 'avatars').getPublicUrl(profile.avatar_path);
    avatarUrl = data.publicUrl;
  }

  if (role === 'admin' || role === 'super_admin') {
    return <AdminView user={user} />;
  }
  
  if (role === 'teacher') {
    return <TeacherView user={user} />;
  }

  return <StudentView user={user} feesPaid={profile?.fees_paid} realEmail={profile?.real_email} avatarUrl={avatarUrl} />;
}
