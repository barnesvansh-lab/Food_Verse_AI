"""
Personalized Meal Planner router.
"""

from __future__ import annotations

import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import UserProfile, SavedMealPlan
from backend.models.schemas import MealPlanRequest, MealPlanResult
from backend.services.ai_service import ai_service, PROMPT_MEAL_PLAN
from backend.services.meal_service import (
    compute_bmr,
    compute_tdee,
    compute_target_calories,
    compute_macro_split
)

router = APIRouter(prefix="/api/meal-plan", tags=["meal-plan"])

DEMO_MEAL_PLAN = {
    "user_profile_summary": "28-year-old Male · 78 kg · Moderately Active · Goal: Fat Loss",
    "bmr": 1782,
    "tdee": 2762,
    "target_calories": 2210,
    "macro_split": {"protein_g": 165, "carbs_g": 248, "fat_g": 61},
    "plan": {
        "Monday": {
            "breakfast": {"meal": "Greek Yogurt Parfait with Berries & Granola", "cal": 380},
            "snack_am": {"meal": "Apple slices with 2 tbsp almond butter", "cal": 220},
            "lunch": {"meal": "Grilled Chicken Quinoa Bowl with Roasted Veggies", "cal": 550},
            "snack_pm": {"meal": "Protein shake with banana", "cal": 280},
            "dinner": {"meal": "Baked Salmon with Steamed Broccoli & Sweet Potato", "cal": 520},
            "total": 1950
        },
        "Tuesday": {
            "breakfast": {"meal": "Spinach & Mushroom Omelette (3 eggs) with Toast", "cal": 410},
            "snack_am": {"meal": "Handful of mixed nuts (30 g)", "cal": 185},
            "lunch": {"meal": "Turkey & Avocado Wrap with Side Salad", "cal": 520},
            "snack_pm": {"meal": "Cottage cheese with pineapple", "cal": 180},
            "dinner": {"meal": "Lean Beef Stir-Fry with Brown Rice & Bok Choy", "cal": 580},
            "total": 1875
        },
        "Wednesday": {
            "breakfast": {"meal": "Overnight Oats with Chia Seeds, Banana & Honey", "cal": 370},
            "snack_am": {"meal": "Boiled eggs (2) with cherry tomatoes", "cal": 180},
            "lunch": {"meal": "Lentil Soup with Whole-Grain Bread", "cal": 480},
            "snack_pm": {"meal": "Greek yogurt with walnuts", "cal": 200},
            "dinner": {"meal": "Herb-Crusted Chicken Thighs with Roasted Zucchini", "cal": 510},
            "total": 1740
        },
        "Thursday": {
            "breakfast": {"meal": "Smoothie Bowl — Mango, Spinach, Protein Powder, Granola", "cal": 400},
            "snack_am": {"meal": "Rice cakes with peanut butter", "cal": 210},
            "lunch": {"meal": "Shrimp Tacos with Cabbage Slaw & Lime Crema", "cal": 490},
            "snack_pm": {"meal": "Edamame (1 cup)", "cal": 190},
            "dinner": {"meal": "Baked Cod with Asparagus & Quinoa", "cal": 470},
            "total": 1760
        },
        "Friday": {
            "breakfast": {"meal": "Whole-Wheat Pancakes with Berries & Maple Syrup", "cal": 420},
            "snack_am": {"meal": "Carrot sticks with hummus", "cal": 160},
            "lunch": {"meal": "Mediterranean Chickpea Salad with Feta", "cal": 460},
            "snack_pm": {"meal": "Protein bar", "cal": 230},
            "dinner": {"meal": "Grilled Pork Tenderloin with Mashed Cauliflower", "cal": 500},
            "total": 1770
        },
        "Saturday": {
            "breakfast": {"meal": "Avocado Toast on Sourdough with Poached Eggs", "cal": 440},
            "snack_am": {"meal": "Trail mix (40 g)", "cal": 200},
            "lunch": {"meal": "Chicken Caesar Salad (light dressing)", "cal": 420},
            "snack_pm": {"meal": "Sliced bell peppers with guacamole", "cal": 170},
            "dinner": {"meal": "Vegetable & Tofu Pad Thai with Peanuts", "cal": 530},
            "total": 1760
        },
        "Sunday": {
            "breakfast": {"meal": "Veggie Frittata with Side of Fresh Fruit", "cal": 380},
            "snack_am": {"meal": "Banana with almond butter", "cal": 230},
            "lunch": {"meal": "BBQ Chicken Pizza on Cauliflower Crust", "cal": 480},
            "snack_pm": {"meal": "Cottage cheese with sliced peaches", "cal": 175},
            "dinner": {"meal": "Herb-Grilled Lamb Chops with Tabbouleh", "cal": 540},
            "total": 1805
        }
    },
    "grocery_list": {
        "Proteins": [
            "Chicken breast (1 kg)", "Salmon fillets (400 g)", "Lean ground beef (300 g)",
            "Turkey deli slices (200 g)", "Shrimp (300 g)", "Cod fillets (300 g)",
            "Pork tenderloin (400 g)", "Tofu, firm (400 g)", "Eggs (2 dozen)", "Greek yogurt (1 kg)"
        ],
        "Grains & Starches": [
            "Quinoa (500 g)", "Brown rice (500 g)", "Whole-wheat bread (1 loaf)",
            "Oats (500 g)", "Sourdough bread (1 loaf)", "Rice cakes (1 pack)"
        ],
        "Fruits & Vegetables": [
            "Spinach (300 g)", "Broccoli (2 heads)", "Sweet potatoes (3)",
            "Zucchini (3)", "Asparagus (1 bunch)", "Bell peppers (4)", "Avocados (4)", "Bananas (6)"
        ],
        "Pantry & Condiments": [
            "Olive oil", "Almond butter", "Peanut butter", "Hummus",
            "Chia seeds", "Walnuts", "Canned chickpeas (2)", "Protein powder"
        ]
    }
}


@router.post("/generate", response_model=MealPlanResult)
async def generate_meal_plan(
    req: MealPlanRequest,
    db: Session = Depends(get_db)
):
    try:
        bmr = compute_bmr(req.gender, req.weight_kg, req.height_cm, req.age)
        tdee = compute_tdee(bmr, req.activity_level)
        target = compute_target_calories(tdee, req.fitness_goal)
        macro_split = compute_macro_split(target, req.fitness_goal)

        diet_str = ", ".join(req.dietary_constraints) if req.dietary_constraints else "None"
        prompt = PROMPT_MEAL_PLAN.format(
            age=req.age,
            gender=req.gender,
            weight=req.weight_kg,
            height=req.height_cm,
            activity=req.activity_level,
            diet=diet_str,
            goal=req.fitness_goal,
            bmr=int(bmr),
            tdee=int(tdee),
            target=int(target)
        )

        ai_raw = await ai_service.analyze_multimodal(prompt, image=None)
        data = ai_service.parse_json_response(ai_raw) if ai_raw else None

        if not data:
            data = DEMO_MEAL_PLAN.copy()
            data["user_profile_summary"] = f"{req.age}-year-old {req.gender} · {req.weight_kg} kg · {req.activity_level} · Goal: {req.fitness_goal}"

        data["bmr"] = int(bmr)
        data["tdee"] = int(tdee)
        data["target_calories"] = int(target)
        data["macro_split"] = macro_split

        # Save profile & plan to DB
        profile = UserProfile(
            age=req.age,
            gender=req.gender,
            weight_kg=req.weight_kg,
            height_cm=req.height_cm,
            activity_level=req.activity_level,
            dietary_constraints=json.dumps(req.dietary_constraints),
            fitness_goal=req.fitness_goal
        )
        db.add(profile)
        db.commit()

        plan_rec = SavedMealPlan(
            user_profile_id=profile.id,
            plan_json=json.dumps(data.get("plan", {})),
            grocery_list_json=json.dumps(data.get("grocery_list", {})),
            target_calories=int(target)
        )
        db.add(plan_rec)
        db.commit()

        return data
    except Exception:
        fallback = DEMO_MEAL_PLAN.copy()
        fallback["bmr"] = int(compute_bmr(req.gender, req.weight_kg, req.height_cm, req.age))
        fallback["tdee"] = int(compute_tdee(fallback["bmr"], req.activity_level))
        fallback["target_calories"] = int(compute_target_calories(fallback["tdee"], req.fitness_goal))
        fallback["macro_split"] = compute_macro_split(fallback["target_calories"], req.fitness_goal)
        return fallback
