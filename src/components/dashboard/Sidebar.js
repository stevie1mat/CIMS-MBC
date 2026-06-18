'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, Receipt, Settings, LogOut, TableProperties, FileText } from 'lucide-react';
import styles from './dashboard.module.css';
import { logoutAction } from '@/app/actions/auth';

const ROLE_MENUS = {
  admin: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/dashboard/users', icon: Users },
    { name: 'Question Bank', path: '/dashboard/questions', icon: BookOpen },
    { name: 'Quizzes', path: '/dashboard/quizzes', icon: FileText },
    { name: 'Reports', path: '/dashboard/reports', icon: TableProperties },
    { name: 'Attendance', path: '/dashboard/attendance', icon: Users },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ],
  teacher: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/dashboard/profile', icon: Users },
    { name: 'My Students', path: '/dashboard/students', icon: Users },
    { name: 'Question Bank', path: '/dashboard/questions', icon: BookOpen },
    { name: 'Quizzes', path: '/dashboard/quizzes', icon: FileText },
    { name: 'Reports', path: '/dashboard/reports', icon: TableProperties },
    { name: 'Attendance', path: '/dashboard/attendance', icon: Users },
    { name: 'Assignments', path: '/dashboard/assignments', icon: BookOpen },
  ],
  student: [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/dashboard/profile', icon: Users },
    { name: 'My Results', path: '/dashboard/results', icon: Receipt },
    { name: 'Assignments', path: '/dashboard/assignments', icon: BookOpen },
    { name: 'Study Material', path: '/dashboard/materials', icon: BookOpen },
  ]
};

export default function Sidebar({ role = 'student' }) {
  const pathname = usePathname();
  const menuItems = ROLE_MENUS[role] || ROLE_MENUS.student;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>M</div>
        <h2 className={styles.sidebarTitle}>MBC Portal</h2>
      </div>

      <nav className={styles.sidebarNav}>
        <div className={styles.navSectionTitle}>Overview</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          
          // Special handling to not match exactly for dashboard
          const isReallyActive = item.path === '/dashboard' ? pathname === '/dashboard' : isActive;

          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`${styles.navItem} ${isReallyActive ? styles.navItemActive : ''}`}
            >
              <Icon size={18} className={styles.navIcon} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarBottom}>
        <form action={logoutAction}>
          <button type="submit" className={`${styles.navItem} ${styles.logoutBtn}`}>
            <LogOut size={18} className={styles.navIcon} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
