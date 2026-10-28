import React, { useState } from 'react';
import { generateRecipe } from '../api/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MetricCard from '../components/common/MetricCard';
import { ChefHat, Sparkles, Clock, BarChart3, Users } from 'lucide-react';

export const RecipeAssistant = () => {
  const [ingredients, setIngredients] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  const [cuisine, setCuisine] = useState('Any');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);

  const availableDiets = [
    'Vegetarian',
    'Vegan',
    'Keto',
    'Gluten-Free',
    'Dairy-Free',
    'High-Protein',
    'Low-Carb',
  ];

  const handleToggleDiet = (diet) => {
    setDietaryPrefs((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await generateRecipe({
        ingredients,
        dietary_preferences: dietaryPrefs,
        cuisine_preference: cuisine,
      });
      setRecipe(res);
    } catch (err) {
      setError('Recipe generation failed. Showing demonstration dish.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-header-title">👨‍🍳 Smart Kitchen Recipe Assistant</h1>
      <p className="page-header-desc">
        Turn pantry ingredients into healthy, creative culinary dishes with exact portions,
        nutritional breakdowns, substitutions, and culinary chef guidance.
      </p>

      {/* Input form */}
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
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#FAFAFA' }}>
            🧺 What ingredients do you have on hand?
          </label>
          <textarea
            rows={3}
            placeholder="e.g., canned chickpeas, fresh spinach, tomatoes, garlic, onion, olive oil, cumin…"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#FAFAFA' }}>
              Dietary Constraints
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableDiets.map((diet) => {
                const selected = dietaryPrefs.includes(diet);
                return (
                  <button
                    type="button"
                    key={diet}
                    onClick={() => handleToggleDiet(diet)}
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

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#FAFAFA' }}>
              Cuisine Style
            </label>
            <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
              <option value="Any">Any Style</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Italian">Italian</option>
              <option value="Asian / Stir-Fry">Asian / Stir-Fry</option>
              <option value="Mexican">Mexican</option>
              <option value="Indian">Indian</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          <Sparkles size={18} />
          {loading ? 'Designing Creative Recipe…' : 'Generate Recipe'}
        </button>
      </form>

      {loading && <LoadingSpinner message="Consulting Culinary LLM & Nutrition Composition Model…" />}

      {error && (
        <div className="callout-box callout-warning">
          <b>Notice:</b> {error}
        </div>
      )}

      {recipe && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          {/* Recipe Card */}
          <div
            style={{
              background: 'var(--gradient-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 14,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <ChefHat color="#FF6B35" size={28} />
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FAFAFA' }}>
                {recipe.recipe_name}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', color: '#9CA3AF', marginTop: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} /> {recipe.cooking_time}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BarChart3 size={16} /> Difficulty: {recipe.difficulty}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} /> Servings: {recipe.servings}
              </span>
            </div>
          </div>

          {/* Nutrition Per Serving */}
          <div className="metrics-grid">
            <MetricCard
              label="Calories / serving"
              value={`${recipe.nutrition_per_serving?.calories} kcal`}
              emoji="🔥"
            />
            <MetricCard
              label="Protein"
              value={`${recipe.nutrition_per_serving?.protein}g`}
              emoji="💪"
            />
            <MetricCard
              label="Carbohydrates"
              value={`${recipe.nutrition_per_serving?.carbs}g`}
              emoji="🌾"
            />
            <MetricCard
              label="Fats"
              value={`${recipe.nutrition_per_serving?.fat}g`}
              emoji="🧈"
            />
          </div>

          {/* Ingredients & Substitutions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
              margin: '20px 0',
            }}
          >
            <div
              style={{
                background: '#1E2028',
                border: '1px solid #2D3140',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3 style={{ marginBottom: 12, color: '#FAFAFA' }}>🧺 Ingredients Required</h3>
              <ul style={{ paddingLeft: 20, color: '#D1D5DB', lineHeight: 1.8 }}>
                {recipe.ingredients_used?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div
              style={{
                background: '#1E2028',
                border: '1px solid #2D3140',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3 style={{ marginBottom: 12, color: '#FAFAFA' }}>🔄 Smart Ingredient Substitutions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recipe.substitutions &&
                  Object.entries(recipe.substitutions).map(([orig, sub]) => (
                    <div key={orig} style={{ color: '#D1D5DB' }}>
                      <b style={{ color: '#FF6B35' }}>{orig}</b> → {sub}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div
            style={{
              background: '#1E2028',
              border: '1px solid #2D3140',
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <h3 style={{ marginBottom: 16, color: '#FAFAFA' }}>📝 Preparation Steps</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recipe.instructions?.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#15181E',
                    borderLeft: '4px solid #FF6B35',
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <b style={{ color: '#FF6B35' }}>Step {idx + 1}</b>
                  <p style={{ color: '#FAFAFA', marginTop: 4 }}>{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chef tips */}
          {recipe.chef_tips && (
            <div className="callout-box callout-info">
              <b>👨‍🍳 Chef's Secrets:</b>
              <ul style={{ marginTop: 6, paddingLeft: 20 }}>
                {recipe.chef_tips.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeAssistant;
