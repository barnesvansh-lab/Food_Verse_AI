import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const MicroBar = ({ nutrition = {} }) => {
  const data = [
    { name: 'Vitamin A', value: Number(nutrition.vitamin_a) || 0 },
    { name: 'Vitamin C', value: Number(nutrition.vitamin_c) || 0 },
    { name: 'Iron', value: Number(nutrition.iron) || 0 },
    { name: 'Calcium', value: Number(nutrition.calcium) || 0 },
  ];

  return (
    <div style={{ width: '100%', height: 280 }}>
      <h4 style={{ textAlign: 'center', marginBottom: 10, color: '#FAFAFA' }}>
        Micronutrient Coverage (% DV)
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" />
          <YAxis dataKey="name" type="category" stroke="#FAFAFA" width={80} />
          <Tooltip
            contentStyle={{
              background: '#1E2028',
              border: '1px solid #2D3140',
              borderRadius: '8px',
              color: '#FAFAFA',
            }}
            formatter={(value) => [`${value}% DV`, 'Daily Value']}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#FF6B35" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MicroBar;
