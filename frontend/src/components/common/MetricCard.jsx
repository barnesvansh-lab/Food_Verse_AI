import React from 'react';

export const MetricCard = ({ label, value, emoji = '📊', className = '' }) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-emoji">{emoji}</div>
      <div className="metric-val">{value}</div>
      <div className="metric-lbl">{label}</div>
    </div>
  );
};

export default MetricCard;
