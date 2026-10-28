"""
Smart Kitchen Recipe Assistant router.
"""

from __future__ import annotations

import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import SavedRecipe
from backend.models.schemas import RecipeRequest, RecipeResult
from backend.services.ai_service import ai_service, PROMPT_RECIPE

router = APIRouter(prefix="/api/recipe", tags=["recipe"])

DEMO_RECIPE = {
    "recipe_name": "Mediterranean Chickpea & Spinach Skillet",
    "cooking_time": "25 minutes",
    "difficulty": "Easy",
    "servings": 4,
    "nutrition_per_serving": {
        "calories": 310,
        "protein": 14,
        "carbs": 38,
        "fat": 12
    },
    "ingredients_used": [
        "1 can (400 g) chickpeas, drained",
        "200 g fresh spinach",
        "2 cloves garlic, minced",
        "1 medium onion, diced",
        "1 can (400 g) diced tomatoes",
        "2 tbsp olive oil",
        "1 tsp cumin", "1 tsp smoked paprika",
        "Salt & pepper to taste",
        "Juice of ½ lemon",
        "Optional: crumbled feta cheese"
    ],
    "substitutions": {
        "Chickpeas": "White beans or lentils",
        "Spinach": "Kale or Swiss chard",
        "Feta cheese": "Nutritional yeast (for vegan option)",
        "Olive oil": "Avocado oil or coconut oil"
    },
    "instructions": [
        "Heat olive oil in a large skillet over medium heat.",
        "Sauté diced onion until translucent (3–4 min), then add minced garlic and cook 30 seconds.",
        "Stir in cumin and smoked paprika; toast spices for 1 minute.",
        "Add diced tomatoes and chickpeas. Simmer for 10 minutes, stirring occasionally.",
        "Fold in fresh spinach and cook until wilted (2–3 min).",
        "Season with salt, pepper, and lemon juice.",
        "Serve hot, garnished with crumbled feta if desired."
    ],
    "chef_tips": [
        "For extra protein, add a fried egg on top.",
        "Leftovers keep for 3 days refrigerated — flavours improve overnight.",
        "Pair with crusty bread or couscous for a complete meal."
    ]
}


@router.post("/generate", response_model=RecipeResult)
async def generate_recipe(
    req: RecipeRequest,
    db: Session = Depends(get_db)
):
    try:
        diet_str = f"Dietary preferences: {', '.join(req.dietary_preferences)}" if req.dietary_preferences else ""
        cuisine_str = f"Preferred cuisine: {req.cuisine_preference}" if req.cuisine_preference != "Any" else ""
        dietary_note = f"{diet_str}. {cuisine_str}".strip()

        prompt = PROMPT_RECIPE.format(
            ingredients=req.ingredients,
            dietary_note=dietary_note
        )

        ai_raw = await ai_service.analyze_multimodal(prompt, image=None)
        data = ai_service.parse_json_response(ai_raw) if ai_raw else None

        if not data:
            data = DEMO_RECIPE.copy()

        # Save recipe
        record = SavedRecipe(
            recipe_json=json.dumps(data),
            ingredients_input=req.ingredients
        )
        db.add(record)
        db.commit()

        return data
    except Exception:
        return DEMO_RECIPE


@router.get("/saved")
async def get_saved_recipes(db: Session = Depends(get_db)):
    recipes = db.query(SavedRecipe).order_by(SavedRecipe.created_at.desc()).limit(10).all()
    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "recipe": json.loads(r.recipe_json)
        }
        for r in recipes
    ]
