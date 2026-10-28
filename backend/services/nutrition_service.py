"""
Food composition data service for nutritional calculations and health scoring.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "food_composition.json"


class NutritionService:
    def __init__(self):
        self._database: Dict[str, Dict[str, Any]] = {}
        self._load_data()

    def _load_data(self) -> None:
        if DATA_PATH.exists():
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                self._database = json.load(f)

    def lookup_food(self, query: str) -> Optional[Dict[str, Any]]:
        """Fuzzy match food by name."""
        q = query.lower().strip()
        # Direct key match
        for key, val in self._database.items():
            if key in q or q in key or q in val["name"].lower():
                return val
        # Word overlap match
        q_words = set(q.split())
        best_match = None
        max_overlap = 0
        for key, val in self._database.items():
            name_words = set(val["name"].lower().split())
            overlap = len(q_words & name_words)
            if overlap > max_overlap:
                max_overlap = overlap
                best_match = val
        return best_match

    def calculate_meal_nutrition(self, items: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculate total nutrition for items: [{'food': 'chicken_breast', 'grams': 150}, ...]
        """
        totals = {"calories": 0.0, "protein": 0.0, "carbs": 0.0, "fat": 0.0, "fiber": 0.0}
        for item in items:
            name = item.get("food", "")
            grams = float(item.get("grams", 100))
            ratio = grams / 100.0
            info = self.lookup_food(name)
            if info:
                totals["calories"] += info.get("calories", 0) * ratio
                totals["protein"] += info.get("protein", 0) * ratio
                totals["carbs"] += info.get("carbs", 0) * ratio
                totals["fat"] += info.get("fat", 0) * ratio
                totals["fiber"] += info.get("fiber", 0) * ratio

        return {k: round(v, 1) for k, v in totals.items()}

    def compute_health_score(self, nutrition: Dict[str, Any]) -> int:
        """
        Scientific health score 1-100 based on macro balance, fiber, sodium, and sugar.
        """
        cal = max(float(nutrition.get("calories", 400)), 50.0)
        protein = float(nutrition.get("protein", 20))
        carbs = float(nutrition.get("carbohydrates", 50))
        fats = float(nutrition.get("fats", 15))
        fiber = float(nutrition.get("fiber", 3))
        sodium = float(nutrition.get("sodium", 500))
        sugar = float(nutrition.get("sugar", 10))

        # Base score
        score = 70.0

        # Protein density (+ up to 10)
        protein_cal = protein * 4
        p_ratio = protein_cal / cal
        if 0.20 <= p_ratio <= 0.40:
            score += 10
        elif p_ratio > 0.12:
            score += 5

        # Fiber bonus (+ up to 12)
        if fiber >= 8:
            score += 12
        elif fiber >= 4:
            score += 7

        # Sodium penalty (- up to 15)
        if sodium > 1000:
            score -= 15
        elif sodium > 700:
            score -= 8

        # Sugar penalty (- up to 12)
        if sugar > 25:
            score -= 12
        elif sugar > 15:
            score -= 6

        # Fat balance (+ up to 8)
        fat_cal = fats * 9
        f_ratio = fat_cal / cal
        if 0.20 <= f_ratio <= 0.35:
            score += 8
        elif f_ratio > 0.50:
            score -= 10

        return int(max(10, min(98, round(score))))


nutrition_service = NutritionService()
