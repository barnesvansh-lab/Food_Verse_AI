import React, { useState } from 'react';
import { analyzeHygiene } from '../api/client';
import FileUploader from '../components/common/FileUploader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MetricCard from '../components/common/MetricCard';
import HygieneRadar from '../components/charts/HygieneRadar';
import { CheckCircle2, XCircle } from 'lucide-react';

export const KitchenHygiene = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await analyzeHygiene(formData);
      setData(res);
    } catch (err) {
      setError('Hygiene inspection failed. Showing fallback demonstration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-header-title">🏥 Kitchen Hygiene & Food Safety Compliance</h1>
      <p className="page-header-desc">
        Upload photos or surveillance video frames from commercial kitchens. Detect staff PPE
        (hairnets, gloves), cross-contamination hazards, and calculate HACCP compliance scores.
      </p>

      <div style={{ maxWidth: 650, margin: '0 auto 28px' }}>
        <FileUploader
          onFileSelect={handleFileUpload}
          accept={{
            'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
            'video/*': ['.mp4', '.mov'],
          }}
          label="Upload kitchen photo or video frame (MP4/MOV/JPG)"
        />
      </div>

      {loading && <LoadingSpinner message="Auditing sanitation, PPE compliance & contamination risks…" />}

      {error && (
        <div className="callout-box callout-warning">
          <b>Notice:</b> {error}
        </div>
      )}

      {data && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Compliance score & Grade */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <MetricCard
              label="Compliance Score"
              value={`${data.overall_score}%`}
              emoji="📊"
            />
            <MetricCard
              label="Sanitation Grade"
              value={data.grade}
              emoji="🏆"
            />
          </div>

          {/* Radar Chart */}
          <div className="metric-card" style={{ marginBottom: 24 }}>
            <HygieneRadar checks={data.checks} />
          </div>

          {/* Itemized Checks */}
          <h3 style={{ marginBottom: 14, color: '#FAFAFA' }}>📋 Inspection Checklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {data.checks?.map((check, idx) => {
              const isPass = check.status === 'PASS';
              return (
                <div
                  key={idx}
                  style={{
                    background: '#1E2028',
                    border: '1px solid #2D3140',
                    borderLeft: `4px solid ${isPass ? '#22C55E' : '#EF4444'}`,
                    borderRadius: 10,
                    padding: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isPass ? (
                      <CheckCircle2 color="#22C55E" size={22} />
                    ) : (
                      <XCircle color="#EF4444" size={22} />
                    )}
                    <div>
                      <b style={{ color: '#FAFAFA' }}>{check.item}</b>
                      <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginTop: 2 }}>
                        {check.detail}
                      </p>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: isPass ? '#22C55E' : '#EF4444' }}>
                    {check.points}/15 pts
                  </div>
                </div>
              );
            })}
          </div>

          {/* Critical violations */}
          {data.critical_violations && data.critical_violations.length > 0 && (
            <div className="callout-box callout-danger" style={{ marginBottom: 20 }}>
              <b>🚨 Critical HACCP Violations:</b>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {data.critical_violations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations && (
            <div
              style={{
                background: '#1E2028',
                border: '1px solid #2D3140',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3 style={{ marginBottom: 12, color: '#FAFAFA' }}>💡 Corrective Action Plan</h3>
              <ol style={{ paddingLeft: 20, color: '#D1D5DB', lineHeight: 1.8 }}>
                {data.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KitchenHygiene;
