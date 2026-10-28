import React from 'react';
import { useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';

const routeTitles = {
  '/': 'Food Recognition & Nutrition Audit',
  '/freshness': 'Food Freshness & Spoilage Diagnostic',
  '/hygiene': 'Kitchen Hygiene & Food Safety Compliance',
  '/recipe': 'Smart Kitchen Recipe Assistant',
  '/meal-plan': 'Personalized 7-Day Meal Planner',
};

export const Header = ({ config }) => {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'Multimodal Food Intelligence';

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FAFAFA' }}>
          {currentTitle}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: '0.85rem' }}>
          <Activity size={16} color="#22C55E" />
          <span>Backend Online</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
