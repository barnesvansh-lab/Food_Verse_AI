import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const MacroDonut = ({ nutrition = {} }) => {
  const data = [
    { name: 'Protein', value: Number(nutrition.protein) || 0, color: '#3B82F6' },
    { name: 'Carbs', value: Number(nutrition.carbohydrates) || 0, color: '#F59E0B' },
    { name: 'Fats', value: Number(nutrition.fats) || 0, color: '#EF4444' },
    { name: 'Fiber', value: Number(nutrition.fiber) || 0, color: '#22C55E' },
  ];

  return (
    <div style={{ width: '100%', height: 280 }}>
      <h4 style={{ textAlign: 'center', marginBottom: 10, color: '#FAFAFA' }}>
        Macronutrient Split (grams)
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#1A1D23" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1E2028',
              border: '1px solid #2D3140',
              borderRadius: '8px',
              color: '#FAFAFA',
            }}
            formatter={(value) => [`${value} g`, 'Amount']}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MacroDonut;
