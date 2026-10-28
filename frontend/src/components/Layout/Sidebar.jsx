import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Utensils,
  Apple,
  ShieldCheck,
  ChefHat,
  CalendarCheck,
  Settings,
  Sparkles,
} from 'lucide-react';
import { updateConfig } from '../../api/client';

export const Sidebar = ({ config, onConfigUpdate }) => {
  const [provider, setProvider] = useState(config.ai_provider || 'gemini');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await updateConfig({ provider, api_key: apiKey });
      setMsg(res.message);
      onConfigUpdate(res);
    } catch (err) {
      setMsg('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { to: '/', label: 'Nutrition Audit', icon: Utensils },
    { to: '/freshness', label: 'Freshness Diagnostic', icon: Apple },
    { to: '/hygiene', label: 'Kitchen Hygiene', icon: ShieldCheck },
    { to: '/recipe', label: 'Recipe Assistant', icon: ChefHat },
    { to: '/meal-plan', label: 'Meal Planner', icon: CalendarCheck },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-title">
          <span>🍽️</span>
          <span>Food Verse AI</span>
        </div>
        <p style={{ color: '#9CA3AF', fontSize: '0.8rem', marginTop: 4 }}>
          Multimodal Food Intelligence
        </p>
      </div>

      <ul className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                end={item.to === '/'}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div style={{ marginTop: 'auto', borderTop: '1px solid #2D3140', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Settings size={16} color="#FF6B35" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FAFAFA' }}>
            AI Engine Config
          </span>
        </div>

        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
          >
            <option value="gemini">Google Gemini</option>
            <option value="groq">Groq (LLaVA)</option>
            <option value="llama">PyTorch / LLaMA</option>
          </select>

          <input
            type="password"
            placeholder={`Enter ${provider.toUpperCase()} Key`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '6px 10px' }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            disabled={loading}
          >
            <Sparkles size={14} />
            {loading ? 'Connecting…' : 'Update Backend'}
          </button>
        </form>

        {msg && (
          <p style={{ fontSize: '0.75rem', color: '#34D399', marginTop: 8 }}>
            {msg}
          </p>
        )}

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <span
            className={`badge ${config.demo_mode ? 'badge-moderate' : 'badge-fresh'}`}
            style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
          >
            {config.demo_mode ? '🎮 DEMO FALLBACK' : `⚡ LIVE (${config.ai_provider?.toUpperCase()})`}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
