"""
Unified AI service supporting Gemini, Groq, and local LLaMA/Transformers.
"""

from __future__ import annotations

import base64
import io
import json
import logging
import re
from typing import Any, Dict, Optional
from PIL import Image

from backend.config import settings

logger = logging.getLogger(__name__)

# Prompt templates
PROMPT_NUTRITION = """You are an expert food nutritionist and computer-vision analyst.
Analyze the provided meal image and return ONLY a valid JSON object (no markdown, no extra text) with exactly these keys:
{
  "dish_name": "<string>",
  "cuisine": "<string>",
  "ingredients": ["<string>", ...],
  "portion_size": "<string with weight estimate>",
  "nutrition": {
    "calories": <int kcal>,
    "protein": <float g>,
    "carbohydrates": <float g>,
    "fats": <float g>,
    "fiber": <float g>,
    "saturated_fat": <float g>,
    "sodium": <int mg>,
    "sugar": <float g>,
    "vitamin_a": <int % DV>,
    "vitamin_c": <int % DV>,
    "iron": <int % DV>,
    "calcium": <int % DV>
  },
  "allergens": ["<string>", ...],
  "health_score": <int 1-100>,
  "health_notes": "<string>",
  "dietary_tags": ["<string>", ...]
}"""

PROMPT_FRESHNESS = """You are an expert food-safety inspector with computer-vision capabilities.
Analyze this image of a perishable food item and return ONLY valid JSON:
{
  "item_name": "<string>",
  "category": "<Fruit | Vegetable | Meat | Dairy | Seafood | Other>",
  "freshness_stage": "<Fresh | Moderately Fresh | Spoiled>",
  "confidence": <int 0-100>,
  "visual_indicators": {
    "surface_texture": "<description>",
    "color_analysis": "<description>",
    "discoloration": "<description>",
    "mold_presence": "<description>",
    "firmness_estimate": "<description>"
  },
  "safety_recommendation": "<Safe to consume | Consume within 24h | Discard immediately>",
  "safety_class": "<safe | caution | danger>",
  "storage_tips": ["<string>", ...],
  "shelf_life_remaining": "<string>"
}"""

PROMPT_HYGIENE = """You are a certified food-safety auditor (ServSafe / HACCP Level 4).
Inspect this kitchen image and return ONLY valid JSON:
{
  "overall_score": <int 0-100>,
  "grade": "<A — Excellent | B — Needs Improvement | C — Unsatisfactory | F — Critical Failure>",
  "checks": [
    {"item": "<check name>", "status": "<PASS|FAIL>", "detail": "<observation>", "points": <int 0-15>}
  ],
  "critical_violations": ["<string>", ...],
  "recommendations": ["<string>", ...]
}
Check at minimum: Chef hat/hairnet, Glove usage, Surface sanitization, Cross-contamination, Floor cleanliness, Waste bins, Temperature compliance, Signage."""

PROMPT_RECIPE = """You are a creative, world-class chef and nutritionist.
Given these available pantry ingredients: {ingredients}
{dietary_note}
Generate ONE creative, nutritious recipe and return ONLY valid JSON:
{{
  "recipe_name": "<string>",
  "cooking_time": "<string>",
  "difficulty": "<Easy | Medium | Hard>",
  "servings": <int>,
  "nutrition_per_serving": {{"calories": <int>, "protein": <int>, "carbs": <int>, "fat": <int>}},
  "ingredients_used": ["<quantity ingredient>", ...],
  "substitutions": {{"<ingredient>": "<substitute>", ...}},
  "instructions": ["<step>", ...],
  "chef_tips": ["<tip>", ...]
}}"""

PROMPT_MEAL_PLAN = """You are an elite sports nutritionist.
Client profile:
- Age: {age}, Gender: {gender}, Weight: {weight} kg, Height: {height} cm
- Activity level: {activity}
- Dietary constraints: {diet}
- Fitness goal: {goal}
- Calculated BMR: {bmr} kcal, TDEE: {tdee} kcal, Target: {target} kcal

Generate a full 7-day meal plan and return ONLY valid JSON:
{{
  "user_profile_summary": "<string>",
  "bmr": {bmr},
  "tdee": {tdee},
  "target_calories": {target},
  "macro_split": {{"protein_g": <int>, "carbs_g": <int>, "fat_g": <int>}},
  "plan": {{
    "Monday": {{
      "breakfast": {{"meal": "<string>", "cal": <int>}},
      "snack_am": {{"meal": "<string>", "cal": <int>}},
      "lunch": {{"meal": "<string>", "cal": <int>}},
      "snack_pm": {{"meal": "<string>", "cal": <int>}},
      "dinner": {{"meal": "<string>", "cal": <int>}},
      "total": <int>
    }},
    "Tuesday": {{
      "breakfast": {{"meal": "<string>", "cal": <int>}},
      "snack_am": {{"meal": "<string>", "cal": <int>}},
      "lunch": {{"meal": "<string>", "cal": <int>}},
      "snack_pm": {{"meal": "<string>", "cal": <int>}},
      "dinner": {{"meal": "<string>", "cal": <int>}},
      "total": <int>
    }},
    "Wednesday": {{
      "breakfast": {{"meal": "<string>", "cal": <int>}},
      "snack_am": {{"meal": "<string>", "cal": <int>}},
      "lunch": {{"meal": "<string>", "cal": <int>}},
      "snack_pm": {{"meal": "<string>", "cal": <int>}},
      "dinner": {{"meal": "<string>", "cal": <int>}},
      "total": <int>
    }},
    "Thursday": {{
      "breakfast": {{"meal": "<string>", "cal": <int>}},
      "snack_am": {{"meal": "<string>", "cal": <int>}},
      "lunch": {{"meal": "<string>", "cal": <int>}},
      "snack_pm": {{"meal": "<string>", "cal": <int>}},
      "dinner": {{"meal": "<string>", "cal": <int>}},
      "total": <int>
    }},
    "Friday": {{
      "breakfast": {{"meal": "<string>", "cal": <int>}},
      "snack_am": {{"meal": "<string>", "cal": <int>}},
      "lunch": {{"meal": "<string>", "cal": <int>}},
      "snack_pm": {{"meal": "<string>", "cal": <int>}},
      "dinner": {{"meal": "<string>", "cal": <int>}},
      "total": <int>
    }},
    "Saturday": {{
      "breakfast": {{"meal": "<string>", "cal": <int>}},
      "snack_am": {{"meal": "<string>", "cal": <int>}},
      "lunch": {{"meal": "<string>", "cal": <int>}},
      "snack_pm": {{"meal": "<string>", "cal": <int>}},
      "dinner": {{"meal": "<string>", "cal": <int>}},
      "total": <int>
    }},
    "Sunday": {{
      "breakfast": {{"meal": "<string>", "cal": <int>}},
      "snack_am": {{"meal": "<string>", "cal": <int>}},
      "lunch": {{"meal": "<string>", "cal": <int>}},
      "snack_pm": {{"meal": "<string>", "cal": <int>}},
      "dinner": {{"meal": "<string>", "cal": <int>}},
      "total": <int>
    }}
  }},
  "grocery_list": {{
    "Proteins": ["<item>", ...],
    "Grains & Starches": ["<item>", ...],
    "Fruits & Vegetables": ["<item>", ...],
    "Pantry & Condiments": ["<item>", ...]
  }}
}}"""


class AIService:
    def __init__(self):
        self._gemini_client = None
        self._groq_client = None
        self._llama_pipeline = None

    def _image_to_base64(self, image: Image.Image) -> str:
        buf = io.BytesIO()
        if image.mode == "RGBA":
            image = image.convert("RGB")
        image.save(buf, format="JPEG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    async def analyze_multimodal(self, prompt: str, image: Optional[Image.Image] = None) -> Optional[str]:
        """Routes prompt & image to configured AI backend."""
        if settings.effective_demo_mode:
            logger.info("Operating in demo mode; returning None to trigger fallback")
            return None

        provider = settings.AI_PROVIDER.lower()

        try:
            if provider == "gemini":
                return await self._call_gemini(prompt, image)
            elif provider == "groq":
                return await self._call_groq(prompt, image)
            elif provider == "llama":
                return await self._call_llama(prompt, image)
            else:
                logger.warning(f"Unknown provider: {provider}")
                return None
        except Exception as e:
            logger.error(f"AI Service error for provider {provider}: {e}")
            return None

    async def _call_gemini(self, prompt: str, image: Optional[Image.Image]) -> str:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        if image is not None:
            res = model.generate_content([prompt, image])
        else:
            res = model.generate_content(prompt)
        return res.text

    async def _call_groq(self, prompt: str, image: Optional[Image.Image]) -> str:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        messages = [{"role": "user", "content": []}]
        if image is not None:
            b64 = self._image_to_base64(image)
            messages[0]["content"].append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
            })
        messages[0]["content"].append({"type": "text", "text": prompt})
        resp = client.chat.completions.create(
            model="llava-v1.5-7b-4096-preview",
            messages=messages,
            max_tokens=4096,
            temperature=0.4,
        )
        return resp.choices[0].message.content

    async def _call_llama(self, prompt: str, image: Optional[Image.Image]) -> str:
        """Call local PyTorch / Transformers model if configured."""
        import torch
        from transformers import pipeline
        if self._llama_pipeline is None:
            path = settings.LLAMA_MODEL_PATH or "llava-hf/llava-1.5-7b-hf"
            device = 0 if torch.cuda.is_available() else (-1 if not torch.backends.mps.is_available() else "mps")
            self._llama_pipeline = pipeline("image-to-text", model=path, device=device)

        if image is not None:
            result = self._llama_pipeline(image, prompt=prompt, generate_kwargs={"max_new_tokens": 1024})
            return result[0]["generated_text"]
        else:
            # Fallback text generation
            return ""

    def parse_json_response(self, text: Optional[str]) -> Optional[Dict[str, Any]]:
        if not text:
            return None
        cleaned = re.sub(r"```(?:json)?", "", text).strip().rstrip("`")
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            match = re.search(r"\{[\s\S]*\}", cleaned)
            if match:
                try:
                    return json.loads(match.group())
                except json.JSONDecodeError:
                    return None
        return None


ai_service = AIService()
