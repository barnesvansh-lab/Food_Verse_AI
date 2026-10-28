import React, { useState } from 'react';
import { analyzeFreshness } from '../api/client';
import FileUploader from '../components/common/FileUploader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';

export const FreshnessCheck = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await analyzeFreshness(formData);
      setData(res);
    } catch (err) {
      setError('Freshness diagnostic failed. Showing fallback demonstration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-header-title">🧪 Food Freshness & Spoilage Diagnostic</h1>
      <p className="page-header-desc">
        Inspect perishable raw items (fruits, vegetables, meats, dairy) for surface wrinkling,
        discoloration, texture defects, and early microbial signs.
      </p>

      <div style={{ maxWidth: 650, margin: '0 auto 28px' }}>
        <FileUploader
          onFileSelect={handleFileUpload}
          label="Upload perishable produce, meat or dairy photo"
        />
      </div>

      {loading && <LoadingSpinner message="Scanning surface features & spoilage indicators…" />}

      {error && (
        <div className="callout-box callout-warning">
          <b>Notice:</b> {error}
        </div>
      )}

      {data && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Header */}
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
              marginBottom: 24,
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FAFAFA' }}>
                {data.item_name}
              </h2>
              <p style={{ color: '#9CA3AF', marginTop: 4 }}>
                <b>Category:</b> {data.category} &nbsp;|&nbsp; <b>Confidence:</b> {data.confidence}%
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Badge
                text={data.freshness_stage}
                variant={
                  data.freshness_stage === 'Fresh'
                    ? 'fresh'
                    : data.freshness_stage === 'Moderately Fresh'
                    ? 'moderate'
                    : 'spoiled'
                }
                style={{ fontSize: '1rem', padding: '8px 20px' }}
              />
            </div>
          </div>

          {/* Visual indicators */}
          <h3 style={{ marginBottom: 14, color: '#FAFAFA' }}>🔎 Surface Diagnostic Metrics</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 14,
              marginBottom: 24,
            }}
          >
            {data.visual_indicators &&
              Object.entries(data.visual_indicators).map(([key, val]) => (
                <div
                  key={key}
                  style={{
                    background: '#1E2028',
                    border: '1px solid #2D3140',
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <b style={{ textTransform: 'capitalize', color: '#FF6B35' }}>
                    {key.replace('_', ' ')}
                  </b>
                  <p style={{ color: '#D1D5DB', marginTop: 6, fontSize: '0.92rem' }}>
                    {val}
                  </p>
                </div>
              ))}
          </div>

          {/* Safety Recommendation */}
          <div
            className={`callout-box callout-${
              data.safety_class === 'safe'
                ? 'success'
                : data.safety_class === 'danger'
                ? 'danger'
                : 'warning'
            }`}
          >
            <h4 style={{ fontSize: '1.1rem', marginBottom: 4 }}>
              🛡️ Recommendation: {data.safety_recommendation}
            </h4>
            <p style={{ color: '#D1D5DB' }}>
              Estimated remaining shelf life: <b>{data.shelf_life_remaining}</b>
            </p>
          </div>

          {/* Storage Tips */}
          {data.storage_tips && (
            <div
              style={{
                background: '#1E2028',
                border: '1px solid #2D3140',
                borderRadius: 12,
                padding: 20,
                marginTop: 20,
              }}
            >
              <h3 style={{ marginBottom: 12, color: '#FAFAFA' }}>🧊 Preservation & Storage Tips</h3>
              <ul style={{ paddingLeft: 20, color: '#D1D5DB', lineHeight: 1.7 }}>
                {data.storage_tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FreshnessCheck;
