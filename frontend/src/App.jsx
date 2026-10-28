import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import NutritionAudit from './pages/NutritionAudit';
import FreshnessCheck from './pages/FreshnessCheck';
import KitchenHygiene from './pages/KitchenHygiene';
import RecipeAssistant from './pages/RecipeAssistant';
import MealPlanner from './pages/MealPlanner';
import { getHealth } from './api/client';
import './App.css';

export const App = () => {
  const [config, setConfig] = useState({
    demo_mode: true,
    ai_provider: 'gemini',
    status: 'healthy',
  });

  useEffect(() => {
    getHealth()
      .then((data) => setConfig((prev) => ({ ...prev, ...data })))
      .catch((err) => console.log('Backend offline or starting up:', err.message));
  }, []);

  const handleConfigUpdate = (newCfg) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  return (
    <Routes>
      <Route path="/" element={<Layout config={config} onConfigUpdate={handleConfigUpdate} />}>
        <Route index element={<NutritionAudit />} />
        <Route path="freshness" element={<FreshnessCheck />} />
        <Route path="hygiene" element={<KitchenHygiene />} />
        <Route path="recipe" element={<RecipeAssistant />} />
        <Route path="meal-plan" element={<MealPlanner />} />
      </Route>
    </Routes>
  );
};

export default App;
