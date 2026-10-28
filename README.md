# 🍽️ Food Verse AI — Multimodal Food Intelligence Agent

**Skill Wallet Capstone Project 3**

A complete, production-grade decoupled full-stack platform for food recognition, nutritional auditing, spoilage diagnostics, commercial kitchen hygiene compliance, smart recipe synthesis, and adaptive 7-day meal planning.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Role |
|-----------|------------|------|
| **User Interface** | **React 18 + Vite + Recharts + Lucide** | High-performance interactive dark UI, responsive dashboards, drag-and-drop media ingestion, macro donut / micro bar / radar charts |
| **API & Inference Backend** | **FastAPI + Uvicorn + Pydantic v2** | High-throughput asynchronous REST APIs with structured JSON schemas and robust error recovery |
| **Deep Learning & Computer Vision** | **PyTorch + OpenCV** | Keyframe extraction from surveillance videos, aspect-ratio preserving enhancement, and color clustering |
| **Multimodal LLM Reasoning** | **Google Gemini / Groq / LLaMA (PyTorch)** | Multimodal reasoning, ingredient segmentation, FDA/HACCP compliance auditing, recipe generation |
| **Food-Composition Knowledge Base** | **50+ Item Food Composition Dataset** | Gram-accurate macro/micronutrient calculation and scientific Health Score algorithm |
| **Relational Database** | **SQLite + SQLAlchemy ORM** | Persistent storage for user biometric profiles, inspection violation logs, meal schedules, and saved recipes |

---

## 📂 Project Structure

```
TRY1/
├── backend/
│   ├── main.py                  # FastAPI entry point, CORS, startup hooks
│   ├── config.py                # Pydantic BaseSettings (.env support)
│   ├── database.py              # SQLAlchemy engine & session factory
│   ├── requirements.txt         # Python dependencies
│   ├── models/
│   │   ├── db_models.py         # SQLAlchemy tables (AnalysisRecord, UserProfile, etc.)
│   │   └── schemas.py           # Pydantic request/response validation schemas
│   ├── routers/
│   │   ├── nutrition.py         # Tab 1: Food recognition & nutrition audit
│   │   ├── freshness.py         # Tab 2: Freshness & spoilage diagnostics
│   │   ├── hygiene.py           # Tab 3: HACCP kitchen hygiene compliance
│   │   ├── recipe.py            # Tab 4: Pantry recipe assistant
│   │   └── meal_planner.py      # Tab 5: BMR/TDEE & 7-day meal scheduler
│   ├── services/
│   │   ├── ai_service.py        # Unified AI gateway (Gemini, Groq, PyTorch/LLaMA)
│   │   ├── vision_service.py    # OpenCV image preprocessing & video frame analysis
│   │   ├── nutrition_service.py # Food composition lookup & health score math
│   │   └── meal_service.py      # Mifflin-St Jeor BMR/TDEE & macro calculations
│   └── data/
│       └── food_composition.json# Nutritional profile of 50+ common foods
│
├── frontend/
│   ├── package.json             # React, Vite, Recharts, Lucide, Axios
│   ├── vite.config.js           # Vite config with /api reverse-proxy
│   ├── index.html               # Web root with Inter typography
│   └── src/
│       ├── main.jsx             # React DOM entry point
│       ├── App.jsx              # Routing & application state
│       ├── App.css              # Vibrant dark theme styling
│       ├── api/
│       │   └── client.js        # Axios API gateway client
│       ├── components/
│       │   ├── Layout/          # Sidebar, Header, Responsive Shell
│       │   ├── common/          # MetricCard, Badge, HealthScore, FileUploader, Spinner
│       │   └── charts/          # MacroDonut, MicroBar, HygieneRadar, WeeklyCalories
│       └── pages/
│           ├── NutritionAudit.jsx
│           ├── FreshnessCheck.jsx
│           ├── KitchenHygiene.jsx
│           ├── RecipeAssistant.jsx
│           └── MealPlanner.jsx
```

---

## 🚀 Quick Start Guide

### 1. Launch the FastAPI Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

*Interactive API Docs:* [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Launch the React Frontend

In a second terminal window:

```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server on port 5173
npm run dev
```

*Web Application:* [http://localhost:5173](http://localhost:5173)

---

## 🔑 AI Provider & Standalone Demo Mode

- **Zero-Setup Demo Mode:** The application works instantly out-of-the-box with rich, realistic fallback data for every tab. No API keys or GPU required to evaluate.
- **Live Multimodal Mode:** Enter your **Google Gemini** or **Groq** API key directly in the sidebar inside the React UI, or set `GEMINI_API_KEY` / `GROQ_API_KEY` in your `.env` file to immediately activate real-time multimodal AI analysis.
- **Local PyTorch / LLaMA Mode:** Configure `LLAMA_MODEL_PATH` for local transformer model weights.
