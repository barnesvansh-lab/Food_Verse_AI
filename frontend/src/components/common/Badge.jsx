import React from 'react';

export const Badge = ({ text, variant = 'safe', style = {} }) => {
  const variantClass = `badge-${variant.toLowerCase()}`;
  return (
    <span className={`badge ${variantClass}`} style={style}>
      {text}
    </span>
  );
};

export default Badge;
