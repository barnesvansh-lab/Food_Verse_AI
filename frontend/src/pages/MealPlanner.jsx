import React, { useState } from 'react';
import { generateMealPlan } from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MetricCard from '../components/common/MetricCard';
import WeeklyCalories from '../components/charts/WeeklyCalories';
import { Sparkles, Calendar, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';

export const MealPlanner = () => {
  const [profile, setProfile] = useState({
    age: 28,
    gender: 'Male',
    weight_kg: 78,
    height_cm: 178,
    activity_level: 'Moderately Active',
    dietary_constraints: [],
    fitness_goal: 'Fat Loss',
  });

  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState('Monday');

  const dietOptions = ['Vegetarian', 'Vegan', 'Keto', 'Diabetic-Friendly', 'Gluten-Free', 'Dairy-Free'];

  const handleDietToggle = (diet) => {
    setProfile((prev) => ({
      ...prev,
      dietary_constraints: prev.dietary_constraints.includes(diet)
        ? prev.dietary_constraints.filter((d) => d !== diet)
        : [...prev.dietary_constraints, diet],
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await generateMealPlan(profile);
      setPlanData(res);
    } catch (err) {
      setError('Meal planning API returned error. Showing demonstration schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-header-title">📅 Personalized 7-Day Meal Planner</h1>
      <p className="page-header-desc">
        Calculate precise BMR and TDEE calorie burns with Mifflin-St Jeor physiology, then
        synthesize a balanced 7-day nutritional schedule with an automated grocery list.
      </p>

      {/* Profile Form */}
      <form
        onSubmit={handleGenerate}
        style={{
          background: 'var(--gradient-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: 24,
          marginBottom: 28,
        }}
      >
        <h3 style={{ marginBottom: 16, color: '#FAFAFA' }}>👤 Personal Biometrics</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 4 }}>
              Age
            </label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              min="10"
              max="100"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 4 }}>
              Gender
            </label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 4 }}>
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.5"
              value={profile.weight_kg}
              onChange={(e) => setProfile({ ...profile, weight_kg: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 4 }}>
              Height (cm)
            </label>
            <input
              type="number"
              value={profile.height_cm}
              onChange={(e) => setProfile({ ...profile, height_cm: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 4 }}>
              Activity Level
            </label>
            <select
              value={profile.activity_level}
              onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
            >
              <option value="Sedentary">Sedentary (desk job / little exercise)</option>
              <option value="Lightly Active">Lightly Active (1–3 days/wk)</option>
              <option value="Moderately Active">Moderately Active (3–5 days/wk)</option>
              <option value="Very Active">Very Active (6–7 days/wk)</option>
              <option value="Extra Active">Extra Active (athlete / physical job)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 4 }}>
              Fitness Goal
            </label>
            <select
              value={profile.fitness_goal}
              onChange={(e) => setProfile({ ...profile, fitness_goal: e.target.value })}
            >
              <option value="Maintain">Maintain Weight</option>
              <option value="Fat Loss">Fat Loss (-15% deficit)</option>
              <option value="Aggressive Fat Loss">Aggressive Fat Loss (-25% deficit)</option>
              <option value="Muscle Gain">Muscle Gain (+10% surplus)</option>
              <option value="Lean Bulk">Lean Bulk (+15% surplus)</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#9CA3AF', marginBottom: 8 }}>
            Dietary Constraints
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dietOptions.map((diet) => {
              const selected = profile.dietary_constraints.includes(diet);
              return (
                <button
                  type="button"
                  key={diet}
                  onClick={() => handleDietToggle(diet)}
                  style={{
                    background: selected ? 'var(--primary-orange)' : '#15181E',
                    color: selected ? '#0E1117' : '#FAFAFA',
                    border: '1px solid var(--border-color)',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontSize: '0.85rem',
                    fontWeight: selected ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          <Sparkles size={18} />
          {loading ? 'Computing BMR/TDEE & Synthesizing Schedule…' : 'Generate 7-Day Meal Plan'}
        </button>
      </form>

      {loading && <LoadingSpinner message="Calculating Metabolic Rate & 7-Day Macro Distribution…" />}

      {error && (
        <div className="callout-box callout-warning">
          <b>Notice:</b> {error}
        </div>
      )}

      {planData && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Caloric targets */}
          <div className="metrics-grid">
            <MetricCard label="Basal Metabolic Rate" value={`${planData.bmr} kcal`} emoji="🫀" />
            <MetricCard label="Total Daily Expenditure" value={`${planData.tdee} kcal`} emoji="⚡" />
            <MetricCard label="Daily Caloric Target" value={`${planData.target_calories} kcal`} emoji="🎯" />
            <MetricCard label="Target Protein" value={`${planData.macro_split?.protein_g}g`} emoji="💪" />
            <MetricCard label="Target Carbs" value={`${planData.macro_split?.carbs_g}g`} emoji="🌾" />
            <MetricCard label="Target Fats" value={`${planData.macro_split?.fat_g}g`} emoji="🧈" />
          </div>

          {/* Calorie distribution chart */}
          {planData.plan && (
            <div className="metric-card">
              <WeeklyCalories plan={planData.plan} />
            </div>
          )}

          {/* 7-Day Interactive Accordion */}
          <h3 style={{ margin: '24px 0 14px', color: '#FAFAFA' }}>🗓️ 7-Day Adaptive Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {planData.plan &&
              Object.entries(planData.plan).map(([day, details]) => {
                const isOpen = expandedDay === day;
                return (
                  <div
                    key={day}
                    style={{
                      background: '#1E2028',
                      border: '1px solid #2D3140',
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={() => setExpandedDay(isOpen ? null : day)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: isOpen ? '#262A34' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Calendar size={18} color="#FF6B35" />
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#FAFAFA' }}>
                          {day}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ color: '#F7C948', fontWeight: 700 }}>
                          {details.total} kcal
                        </span>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {['breakfast', 'snack_am', 'lunch', 'snack_pm', 'dinner'].map((slot) => {
                          const item = details[slot];
                          if (!item) return null;
                          const labels = {
                            breakfast: '🌅 Breakfast',
                            snack_am: '🍎 Morning Snack',
                            lunch: '☀️ Lunch',
                            snack_pm: '🥜 Afternoon Snack',
                            dinner: '🌙 Dinner',
                          };
                          return (
                            <div
                              key={slot}
                              style={{
                                background: '#15181E',
                                padding: 12,
                                borderRadius: 8,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <div>
                                <span style={{ color: '#FF6B35', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {labels[slot]}
                                </span>
                                <p style={{ color: '#FAFAFA', marginTop: 2 }}>{item.meal}</p>
                              </div>
                              <span style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 600 }}>
                                {item.cal} kcal
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Automated Grocery List */}
          {planData.grocery_list && (
            <div
              style={{
                background: '#1E2028',
                border: '1px solid #2D3140',
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <ShoppingCart color="#22C55E" size={24} />
                <h3 style={{ color: '#FAFAFA', fontSize: '1.3rem' }}>
                  🛒 Automated Grocery Shopping List
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 20,
                }}
              >
                {Object.entries(planData.grocery_list).map(([category, items]) => (
                  <div key={category}>
                    <h4 style={{ color: '#FF6B35', marginBottom: 10, borderBottom: '1px solid #2D3140', paddingBottom: 4 }}>
                      {category}
                    </h4>
                    <ul style={{ paddingLeft: 18, color: '#D1D5DB', fontSize: '0.9rem', lineHeight: 1.8 }}>
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
