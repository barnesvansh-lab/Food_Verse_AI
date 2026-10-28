import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';

export const HygieneRadar = ({ checks = [] }) => {
  const data = checks.map((c) => ({
    subject: c.item,
    points: c.points,
    fullMark: 15,
  }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <h4 style={{ textAlign: 'center', marginBottom: 6, color: '#FAFAFA' }}>
        HACCP Compliance Radar
      </h4>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#2D3140" />
          <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 15]} stroke="#2D3140" />
          <Radar
            name="Compliance Score"
            dataKey="points"
            stroke="#FF6B35"
            fill="#FF6B35"
            fillOpacity={0.4}
          />
          <Tooltip
            contentStyle={{
              background: '#1E2028',
              border: '1px solid #2D3140',
              borderRadius: '8px',
              color: '#FAFAFA',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HygieneRadar;
