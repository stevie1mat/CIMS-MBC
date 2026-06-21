'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import styles from './dashboard.module.css'
import { Search, Bell, Mail, Menu, X } from 'lucide-react'

export default function DashboardLayoutWrapper({ 
  children, 
  role, 
  fullName 
}: { 
  children: React.ReactNode; 
  role: string; 
  fullName: string 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar role={role} />
      </div>

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.mobileMenuBtn} 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
          <div className={styles.headerActions}>
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
  )
}
