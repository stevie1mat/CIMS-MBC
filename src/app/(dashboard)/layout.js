import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import styles from '@/components/dashboard/dashboard.module.css';
import { Search, Bell, Mail } from 'lucide-react';

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
    <div className={styles.dashboardContainer}>
      <Sidebar role={role} />
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search your course...." className={styles.searchInput} />
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn}><Mail size={18} /></button>
            <button className={styles.iconBtn}><Bell size={18} /></button>
            <div className={styles.userProfile}>
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff`} alt={fullName} className={styles.profileAvatar} />
              <span>{fullName}</span>
            </div>
          </div>
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
