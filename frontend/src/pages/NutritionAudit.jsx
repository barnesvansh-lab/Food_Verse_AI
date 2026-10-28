import React, { useState } from 'react';
import { analyzeNutrition } from '../api/client';
import FileUploader from '../components/common/FileUploader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MetricCard from '../components/common/MetricCard';
import Badge from '../components/common/Badge';
import HealthScore from '../components/common/HealthScore';
import MacroDonut from '../components/charts/MacroDonut';
import MicroBar from '../components/charts/MicroBar';

export const NutritionAudit = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await analyzeNutrition(formData);
      setData(res);
    } catch (err) {
      setError('Failed to analyze meal. Showing fallback demonstration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-header-title">🔍 Food Recognition & Nutrition Audit</h1>
      <p className="page-header-desc">
        Upload a photo of any dish or meal. Our multimodal vision pipeline segments ingredients,
        estimates portions, computes detailed macro/micronutrients, and scores healthiness.
      </p>

      <div style={{ maxWidth: 650, margin: '0 auto 28px' }}>
        <FileUploader onFileSelect={handleFileUpload} />
      </div>

      {loading && <LoadingSpinner message="Auditing meal with Computer Vision & Nutrition Engine…" />}

      {error && (
        <div className="callout-box callout-warning">
          <b>Notice:</b> {error}
        </div>
      )}

      {data && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Header summary */}
          <div
            style={{
              background: 'var(--gradient-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FAFAFA' }}>
                {data.dish_name}
              </h2>
              <p style={{ color: '#9CA3AF', marginTop: 4 }}>
                <b>Cuisine:</b> {data.cuisine} &nbsp;|&nbsp; <b>Portion:</b> {data.portion_size}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.dietary_tags?.map((t, i) => (
                <Badge key={i} text={t} variant="safe" />
              ))}
            </div>
          </div>

          {/* Metric cards */}
          <div className="metrics-grid">
            <MetricCard label="Calories" value={`${data.nutrition?.calories} kcal`} emoji="🔥" />
            <MetricCard label="Protein" value={`${data.nutrition?.protein}g`} emoji="💪" />
            <MetricCard label="Carbs" value={`${data.nutrition?.carbohydrates}g`} emoji="🌾" />
            <MetricCard label="Fats" value={`${data.nutrition?.fats}g`} emoji="🧈" />
            <MetricCard label="Fiber" value={`${data.nutrition?.fiber}g`} emoji="🥦" />
            <MetricCard label="Sodium" value={`${data.nutrition?.sodium} mg`} emoji="🧂" />
          </div>

          {/* Charts & Score */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
              margin: '24px 0',
            }}
          >
            <div className="metric-card">
              <MacroDonut nutrition={data.nutrition} />
            </div>
            <div className="metric-card">
              <MicroBar nutrition={data.nutrition} />
            </div>
            <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <HealthScore score={data.health_score} />
            </div>
          </div>

          {/* Ingredients list */}
          <div
            style={{
              background: '#1E2028',
              border: '1px solid #2D3140',
              borderRadius: 12,
              padding: 20,
              margin: '20px 0',
            }}
          >
            <h3 style={{ marginBottom: 12, color: '#FAFAFA' }}>🧾 Identified Ingredients</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
              {data.ingredients?.map((ing, i) => (
                <div key={i} style={{ color: '#D1D5DB', fontSize: '0.95rem' }}>
                  • {ing}
                </div>
              ))}
            </div>
          </div>

          {/* Allergens warning */}
          {data.allergens && data.allergens.length > 0 && (
            <div className="callout-box callout-warning">
              <b>⚠️ Allergen Warnings:</b>
              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                {data.allergens.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Health Notes */}
          {data.health_notes && (
            <div className="callout-box callout-info">
              <b>📝 AI Nutritionist Assessment:</b>
              <p style={{ marginTop: 6, color: '#D1D5DB' }}>{data.health_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionAudit;
