import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayoutWrapper from '@/components/dashboard/DashboardLayoutWrapper';

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Fetch the role from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      account_types ( role ),
      first_name,
      last_name
    `)
    .eq('id', user.id)
    .single();

  const role = profile?.account_types?.role || 'student';
  const fullName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'User';

  return (
    <DashboardLayoutWrapper role={role} fullName={fullName}>
      {children}
    </DashboardLayoutWrapper>
  );
}
