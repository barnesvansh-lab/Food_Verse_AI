import React from 'react';

export const LoadingSpinner = ({ message = 'Analyzing with Multimodal AI…' }) => {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      <div className="spinner-pulse" style={{ fontSize: '3.2rem', marginBottom: 16 }}>
        🧠🍽️
      </div>
      <h3 style={{ fontSize: '1.2rem', color: '#FAFAFA', marginBottom: 6 }}>
        {message}
      </h3>
      <p style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
        Processing image tokens, running deep vision diagnostics & computing food nutrition…
      </p>
    </div>
  );
};

export default LoadingSpinner;
