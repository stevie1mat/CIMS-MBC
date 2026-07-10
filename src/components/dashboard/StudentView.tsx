import React from 'react';
import Link from 'next/link';
import AttendClassButton from './AttendClassButton';
import RealEmailPrompt from './RealEmailPrompt';
import FeesPrompt from './FeesPrompt';
import styles from './dashboard.module.css';
import { createClient } from '@/lib/supabase/server';
import { FileText, BookOpen, Clock, ArrowRight, Calendar, Activity } from 'lucide-react';

export default async function StudentView({ 
  user, 
  feesPaid,
  realEmail,
  avatarUrl
}: { 
  user: any; 
  feesPaid?: boolean;
  realEmail?: string | null;
  avatarUrl?: string | null;
}) {
  const fullName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}` 
    : user?.email || 'Student User';

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=6366f1&color=fff`

  const supabase = await createClient();
  
  const [
    { data: recentAssignments },
    { data: activeExams }
  ] = await Promise.all([
    supabase.from('assignments')
      .select('id, title, due_at, categories:assignments_category_id_fkey(name)')
      .order('due_at', { ascending: true })
      .limit(3),
    supabase.from('quizzes')
      .select('id, name, time_limit')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3)
  ]);

  return (
    <div>
      {!realEmail ? (
        <RealEmailPrompt />
      ) : !feesPaid ? (
        <FeesPrompt />
      ) : null}
      
      <div style={{ 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        backgroundColor: '#ffffff',
        padding: '2.5rem 3rem',
        borderRadius: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        marginBottom: '3rem',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 1 }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={avatarUrl || defaultAvatar}
              alt="Profile avatar" 
              style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f8fafc', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
            />
            <Link href="/dashboard/profile" title="Edit Avatar">
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#ffffff', borderRadius: '50%', padding: '6px', cursor: 'pointer', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </div>
            </Link>
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.25rem 0', fontWeight: 800 }}>Welcome back, {user?.user_metadata?.first_name || 'Student'}!</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>Ready to continue learning?</p>
          </div>
        </div>
        <div style={{ minWidth: '220px', zIndex: 1 }}>
          <AttendClassButton />
        </div>
      </div>
      
      <h3 className={styles.sectionTitle}>Overview</h3>
      
      <div className={styles.panelGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Assignments Panel */}
        <div className={styles.panel} style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
              <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                <BookOpen size={20} color="#4f46e5" />
              </div> 
              Recent Assignments
            </h3>
            <Link href="/dashboard/assignments" style={{ fontSize: '0.875rem', color: '#4f46e5', textDecoration: 'none', fontWeight: 600, background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s' }}>
              View All
            </Link>
          </div>
          <div className={styles.panelBody} style={{ padding: '1rem' }}>
            {recentAssignments && recentAssignments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentAssignments.map((assignment: any) => (
                  <div key={assignment.id} className={styles.interactiveCard} style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.4rem', fontSize: '1.05rem' }}>{assignment.title}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {assignment.categories?.name && <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{assignment.categories.name}</span>}
                        {assignment.due_at && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} color="#94a3b8" /> {new Date(assignment.due_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/dashboard/assignments`} style={{ textDecoration: 'none' }}>
                      <button className={styles.btnOutline} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '8px' }}>
                        View <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ background: '#f8fafc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <BookOpen size={32} color="#cbd5e1" />
                </div>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>No pending assignments!</p>
              </div>
            )}
          </div>
        </div>

        {/* Exams Panel */}
        <div className={styles.panel} style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h3 className={styles.panelTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
              <div style={{ background: '#fce7f3', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                <FileText size={20} color="#ec4899" />
              </div>
              Active Exams
            </h3>
            <Link href="/dashboard/quizzes" style={{ fontSize: '0.875rem', color: '#ec4899', textDecoration: 'none', fontWeight: 600, background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s' }}>
              View All
            </Link>
          </div>
          <div className={styles.panelBody} style={{ padding: '1rem' }}>
            {activeExams && activeExams.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeExams.map((exam: any) => (
                  <div key={exam.id} className={styles.interactiveCard} style={{ padding: '1.25rem', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.4rem', fontSize: '1.05rem' }}>{exam.name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                          <Clock size={14} color="#94a3b8" /> {exam.time_limit} mins
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/quizzes`} style={{ textDecoration: 'none' }}>
                      <button className={styles.btnOutlinePink} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderRadius: '8px' }}>
                        Attempt <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ background: '#f8fafc', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <Activity size={32} color="#cbd5e1" />
                </div>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>No active exams right now.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
