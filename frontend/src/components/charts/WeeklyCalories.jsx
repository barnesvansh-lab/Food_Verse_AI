import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

export const WeeklyCalories = ({ plan = {} }) => {
  const data = Object.entries(plan).map(([day, details]) => ({
    day,
    calories: details.total || 0,
  }));

  const maxCal = Math.max(...data.map((d) => d.calories), 2000);

  return (
    <div style={{ width: '100%', height: 300, margin: '20px 0' }}>
      <h4 style={{ textAlign: 'center', marginBottom: 12, color: '#FAFAFA' }}>
        7-Day Caloric Distribution (kcal)
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3140" vertical={false} />
          <XAxis dataKey="day" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" domain={[0, maxCal + 300]} />
          <Tooltip
            contentStyle={{
              background: '#1E2028',
              border: '1px solid #2D3140',
              borderRadius: '8px',
              color: '#FAFAFA',
            }}
            formatter={(value) => [`${value} kcal`, 'Daily Target']}
          />
          <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.calories === maxCal ? '#FF6B35' : '#3B82F6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyCalories;
