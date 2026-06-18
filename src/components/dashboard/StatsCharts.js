'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

export default function StatsCharts({ students, exams, assignments }) {
  // Generate some visually pleasing mock trend data that ends at the actual value
  const generateTrendData = (finalValue) => {
    return [
      { name: 'Mon', value: Math.max(0, finalValue - 5) },
      { name: 'Tue', value: Math.max(0, finalValue - 4) },
      { name: 'Wed', value: Math.max(0, finalValue - 3) },
      { name: 'Thu', value: Math.max(0, finalValue - 2) },
      { name: 'Fri', value: Math.max(0, finalValue - 1) },
      { name: 'Sat', value: finalValue },
      { name: 'Sun', value: finalValue },
    ];
  };

  const studentData = generateTrendData(students);
  const examData = generateTrendData(exams);
  const assignmentData = generateTrendData(assignments);

  const ChartCard = ({ title, value, data, color }) => (
    <div style={{ 
      padding: '24px', 
      backgroundColor: 'white', 
      borderRadius: '16px', 
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    }}>
      <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ color: '#0f172a', fontSize: '32px', fontWeight: 800, marginBottom: '16px' }}>
        {value}
      </div>
      <div style={{ height: '80px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#0f172a', fontWeight: 600 }}
              labelStyle={{ color: '#64748b', fontSize: '12px' }}
            />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#color-${title})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '16px' }}>
      <ChartCard title="Total Students" value={students} data={studentData} color="#3b82f6" />
      <ChartCard title="Active Exams" value={exams} data={examData} color="#10b981" />
      <ChartCard title="Assignments" value={assignments} data={assignmentData} color="#f59e0b" />
    </div>
  );
}
