'use client';

import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis } from 'recharts';
import styles from './dashboard.module.css';

export default function StatsCharts({ 
  students, 
  exams, 
  assignments 
}: { 
  students: number | string; 
  exams: number | string; 
  assignments: number | string; 
}) {
  const generateTrendData = (finalValue: number | string) => {
    const safeValue = Number(finalValue) || 0;
    return [
      { name: 'Mon', value: Math.max(0, safeValue - 5) },
      { name: 'Tue', value: Math.max(0, safeValue - 4) },
      { name: 'Wed', value: Math.max(0, safeValue - 3) },
      { name: 'Thu', value: Math.max(0, safeValue - 2) },
      { name: 'Fri', value: Math.max(0, safeValue - 1) },
      { name: 'Sat', value: safeValue },
      { name: 'Sun', value: safeValue },
    ];
  };

  const chartItems = [
    {
      id: 'students',
      title: 'Total Students',
      value: students,
      data: generateTrendData(students),
      color: '#2563eb',
      softColor: '#dbeafe',
    },
    {
      id: 'exams',
      title: 'Active Exams',
      value: exams,
      data: generateTrendData(exams),
      color: '#059669',
      softColor: '#d1fae5',
    },
    {
      id: 'assignments',
      title: 'Assignments',
      value: assignments,
      data: generateTrendData(assignments),
      color: '#f59e0b',
      softColor: '#fef3c7',
    },
  ];

  const maxValue = Math.max(...chartItems.map(item => Number(item.value) || 0), 1);

  const ChartCard = ({ item }: { item: any }) => {
    const numericValue = Number(item.value) || 0;
    const progress = Math.round((numericValue / maxValue) * 100);
    const visibleProgress = numericValue === 0 ? 0 : Math.max(8, progress);
    const gradientId = `trend-${item.id}`;

    return (
      <div className={styles.chartCard}>
        <div className={styles.chartCardTop}>
          <div>
            <div className={styles.chartLabel}>{item.title}</div>
            <div className={styles.chartValue}>{numericValue}</div>
          </div>
          <div
            className={styles.progressCircle}
            style={{
              '--progress': `${progress}%`,
              '--visible-progress': `${visibleProgress}%`,
              '--chart-color': item.color,
              '--chart-soft': item.softColor,
            } as React.CSSProperties}
            aria-label={`${item.title} is ${numericValue}`}
          >
            <span>{progress}%</span>
          </div>
        </div>

        <div className={styles.chartMetaRow}>
          <span>7-day trend</span>
          <strong>{item.data[0].value} to {numericValue}</strong>
        </div>

        <div className={styles.trendChart}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={item.data} margin={{ top: 10, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.24} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Tooltip
                cursor={{ stroke: item.color, strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                  color: '#0f172a',
                }}
                itemStyle={{ color: '#0f172a', fontWeight: 700 }}
                labelStyle={{ color: '#64748b', fontSize: '12px', fontWeight: 600 }}
              />
              <XAxis dataKey="name" hide />
              <YAxis domain={[0, 'dataMax + 2']} hide />
              <Area
                type="monotone"
                dataKey="value"
                stroke={item.color}
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                dot={{ r: 3, strokeWidth: 2, fill: '#ffffff', stroke: item.color }}
                activeDot={{ r: 5, strokeWidth: 2, fill: item.color, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.chartGrid}>
      {chartItems.map(item => (
        <ChartCard key={item.id} item={item} />
      ))}
    </div>
  );
}
