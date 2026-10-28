import React from 'react';

export const HealthScore = ({ score = 75 }) => {
  let color = '#22C55E';
  let label = 'Excellent';

  if (score < 40) {
    color = '#EF4444';
    label = 'Poor';
  } else if (score < 65) {
    color = '#F59E0B';
    label = 'Average';
  } else if (score < 80) {
    color = '#3B82F6';
    label = 'Good';
  }

  const backgroundGradient = `conic-gradient(${color} ${score}%, #1E2028 0)`;

  return (
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <div
        className="health-score-ring"
        style={{
          background: backgroundGradient,
          boxShadow: `0 0 20px ${color}33`,
        }}
      >
        <div
          style={{
            width: '94px',
            height: '94px',
            borderRadius: '50%',
            background: '#1A1D23',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FAFAFA',
          }}
        >
          {score}
        </div>
      </div>
      <div style={{ marginTop: '10px', color: '#9CA3AF', fontSize: '0.9rem' }}>
        Health Score · <b style={{ color }}>{label}</b>
      </div>
    </div>
  );
};

export default HealthScore;
