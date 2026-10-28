"""
Pydantic v2 schemas for all API request / response models.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Nutrition
# ---------------------------------------------------------------------------

class NutritionResult(BaseModel):
    dish_name: str
    cuisine: str
    ingredients: list[str]
    portion_size: str
    nutrition: dict  # {calories, protein, carbohydrates, fats, fiber, saturated_fat, sodium, sugar, vitamin_a, vitamin_c, iron, calcium}
    allergens: list[str]
    health_score: int = Field(ge=1, le=100)
    health_notes: str
    dietary_tags: list[str]


# ---------------------------------------------------------------------------
# Freshness
# ---------------------------------------------------------------------------

class FreshnessResult(BaseModel):
    item_name: str
    category: str  # Fruit | Vegetable | Meat | Dairy | Seafood
    freshness_stage: str  # Fresh | Moderately Fresh | Spoiled
    confidence: int = Field(ge=0, le=100)
    visual_indicators: dict  # {surface_texture, color_analysis, discoloration, mold_presence, firmness_estimate}
    safety_recommendation: str
    safety_class: str  # safe | caution | danger
    storage_tips: list[str]
    shelf_life_remaining: str


# ---------------------------------------------------------------------------
# Hygiene
# ---------------------------------------------------------------------------

class HygieneCheck(BaseModel):
    item: str
    status: str  # PASS | FAIL
    detail: str
    points: int = Field(ge=0, le=15)


class HygieneResult(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    grade: str
    checks: list[HygieneCheck]
    critical_violations: list[str]
    recommendations: list[str]


# ---------------------------------------------------------------------------
# Recipe
# ---------------------------------------------------------------------------

class RecipeRequest(BaseModel):
    ingredients: str
    dietary_preferences: list[str] = []
    cuisine_preference: str = "Any"


class NutritionPerServing(BaseModel):
    calories: int
    protein: int
    carbs: int
    fat: int


class RecipeResult(BaseModel):
    recipe_name: str
    cooking_time: str
    difficulty: str
    servings: int
    nutrition_per_serving: NutritionPerServing
    ingredients_used: list[str]
    substitutions: dict[str, str]
    instructions: list[str]
    chef_tips: list[str]


# ---------------------------------------------------------------------------
# Meal Plan
# ---------------------------------------------------------------------------

class MealPlanRequest(BaseModel):
    age: int
    gender: str
    weight_kg: float
    height_cm: float
    activity_level: str
    dietary_constraints: list[str] = []
    fitness_goal: str


class MealEntry(BaseModel):
    meal: str
    cal: int


class DayPlan(BaseModel):
    breakfast: MealEntry
    snack_am: MealEntry
    lunch: MealEntry
    snack_pm: MealEntry
    dinner: MealEntry
    total: int


class MealPlanResult(BaseModel):
    user_profile_summary: str
    bmr: int
    tdee: int
    target_calories: int
    macro_split: dict  # {protein_g, carbs_g, fat_g}
    plan: dict[str, DayPlan]
    grocery_list: dict[str, list[str]]


# ---------------------------------------------------------------------------
# Config / Health
# ---------------------------------------------------------------------------

class APIConfigRequest(BaseModel):
    provider: str  # gemini | groq | llama
    api_key: str = ""


class APIConfigResponse(BaseModel):
    valid: bool
    provider: str
    demo_mode: bool
    message: str


class HealthResponse(BaseModel):
    status: str
    app_name: str
    demo_mode: bool
    ai_provider: str
