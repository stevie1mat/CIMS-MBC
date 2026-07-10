'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Search } from 'lucide-react';
import styles from '@/components/dashboard/dashboard.module.css';

export default function AttendanceFilter({ initialTab, initialTimeframe, initialDate }: { initialTab: string, initialTimeframe: string, initialDate: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [date, setDate] = useState(initialDate);

  // Sync state if URL changes
  useEffect(() => {
    setTimeframe(searchParams.get('timeframe') || initialTimeframe);
    setDate(searchParams.get('date') || initialDate);
  }, [searchParams, initialTimeframe, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', initialTab);
    params.set('timeframe', timeframe);
    params.set('date', date);
    router.push(`/dashboard/attendance?${params.toString()}`);
  };

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTimeframe = e.target.value;
    setTimeframe(newTimeframe);
    
    // Adjust date format if switching to month
    if (newTimeframe === 'month' && date.length === 10) {
      setDate(date.substring(0, 7)); // YYYY-MM
    } else if (newTimeframe !== 'month' && date.length === 7) {
      setDate(`${date}-01`); // YYYY-MM-DD
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <input type="hidden" name="tab" value={initialTab} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#475569', margin: 0 }}>View:</label>
        <select 
          name="timeframe" 
          value={timeframe} 
          onChange={handleTimeframeChange}
          className={styles.input} 
          style={{ padding: '0.4rem 2rem 0.4rem 1rem', margin: 0, minHeight: 'auto' }}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <label style={{ fontWeight: 500, fontSize: '0.875rem', color: '#475569', margin: 0 }}>
          {timeframe === 'month' ? 'Month:' : timeframe === 'week' ? 'Week of:' : 'Date:'}
        </label>
        <div style={{ position: 'relative' }}>
          <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type={timeframe === 'month' ? 'month' : 'date'}
            name="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input} 
            style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', margin: 0, minHeight: 'auto' }}
          />
        </div>
      </div>
      
      <button type="submit" className={styles.btnPrimary} style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={16} /> Filter
      </button>
    </form>
  );
}
