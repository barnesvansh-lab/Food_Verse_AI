"""
BMR / TDEE calculations and macro-split logic for meal planning.
"""

from __future__ import annotations


def compute_bmr(gender: str, weight_kg: float, height_cm: float, age: int) -> float:
    """Mifflin-St Jeor equation.

    - Male:   10 × weight(kg) + 6.25 × height(cm) − 5 × age − 5
    - Female: 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
    """
    base = 10.0 * weight_kg + 6.25 * height_cm - 5.0 * age
    if gender.strip().lower() in ("male", "m"):
        return round(base + 5, 1)
    return round(base - 161, 1)


_ACTIVITY_MULTIPLIER: dict[str, float] = {
    "sedentary": 1.2,
    "lightly active": 1.375,
    "moderately active": 1.55,
    "very active": 1.725,
    "extra active": 1.9,
}


def compute_tdee(bmr: float, activity_level: str) -> float:
    """TDEE = BMR × activity multiplier."""
    key = activity_level.strip().lower()
    multiplier = _ACTIVITY_MULTIPLIER.get(key, 1.55)
    return round(bmr * multiplier, 1)


_GOAL_OFFSET: dict[str, float] = {
    "maintain": 0.0,
    "fat loss": -0.15,
    "aggressive fat loss": -0.25,
    "muscle gain": 0.10,
    "lean bulk": 0.15,
}


def compute_target_calories(tdee: float, goal: str) -> float:
    """Adjust TDEE based on fitness goal (percentage offset)."""
    key = goal.strip().lower()
    offset = _GOAL_OFFSET.get(key, 0.0)
    return round(tdee * (1.0 + offset))


def compute_macro_split(target_calories: float, goal: str) -> dict[str, int]:
    """Return ``{protein_g, carbs_g, fat_g}`` for the given calorie target and goal.

    Rough splits:
        - fat loss / aggressive fat loss: 40 P / 30 C / 30 F
        - muscle gain / lean bulk:        30 P / 45 C / 25 F
        - maintain:                       30 P / 40 C / 30 F
    """
    key = goal.strip().lower()
    if key in ("fat loss", "aggressive fat loss"):
        p_pct, c_pct, f_pct = 0.40, 0.30, 0.30
    elif key in ("muscle gain", "lean bulk"):
        p_pct, c_pct, f_pct = 0.30, 0.45, 0.25
    else:
        p_pct, c_pct, f_pct = 0.30, 0.40, 0.30

    protein_g = round(target_calories * p_pct / 4)
    carbs_g = round(target_calories * c_pct / 4)
    fat_g = round(target_calories * f_pct / 9)
    return {"protein_g": protein_g, "carbs_g": carbs_g, "fat_g": fat_g}
