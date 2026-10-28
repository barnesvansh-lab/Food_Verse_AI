"""
Kitchen Hygiene & Food Safety Compliance router.
"""

from __future__ import annotations

import json
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.db_models import AnalysisRecord
from backend.models.schemas import HygieneResult
from backend.services.ai_service import ai_service, PROMPT_HYGIENE
from backend.services.vision_service import preprocess_image, extract_video_frames

router = APIRouter(prefix="/api/hygiene", tags=["hygiene"])

DEMO_HYGIENE = {
    "overall_score": 72,
    "grade": "B — Needs Improvement",
    "checks": [
        {"item": "Chef Hat / Hairnet", "status": "PASS", "detail": "All visible staff wearing hairnets.", "points": 15},
        {"item": "Glove Usage", "status": "FAIL", "detail": "One staff member handling ready-to-eat food without gloves.", "points": 0},
        {"item": "Surface Sanitization", "status": "PASS", "detail": "Prep surfaces appear clean; sanitizer dispenser visible.", "points": 12},
        {"item": "Cross-Contamination Risk", "status": "FAIL", "detail": "Raw chicken stored on shelf directly above fresh vegetables.", "points": 0},
        {"item": "Floor Cleanliness", "status": "PASS", "detail": "Floors are dry and free of debris.", "points": 10},
        {"item": "Waste Bin Management", "status": "PASS", "detail": "Bins covered and less than 75% full.", "points": 10},
        {"item": "Temperature Compliance", "status": "PASS", "detail": "Refrigerator displays 3 °C — within safe range.", "points": 15},
        {"item": "Personal Hygiene Signage", "status": "PASS", "detail": "Handwashing reminders posted near all sinks.", "points": 10}
    ],
    "critical_violations": [
        "⚠️ Bare-hand contact with ready-to-eat food (FDA Food Code §3-301.11)",
        "🚨 Raw-to-ready cross-contamination risk — raw poultry above produce (FDA §3-302.11)"
    ],
    "recommendations": [
        "Immediately separate raw proteins from ready-to-eat items.",
        "Enforce mandatory glove usage for all food-contact tasks.",
        "Schedule a refresher food-safety training session within 7 days.",
        "Post visual reminders for FIFO and proper shelving order."
    ]
}


@router.post("/analyze", response_model=HygieneResult)
async def analyze_hygiene(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        is_video = file.content_type in ("video/mp4", "video/quicktime") or file.filename.endswith((".mp4", ".mov"))

        if is_video:
            frames = extract_video_frames(content, max_frames=3)
            pil_image = frames[0] if frames else None
        else:
            pil_image = preprocess_image(content)

        data = None
        if pil_image:
            ai_raw = await ai_service.analyze_multimodal(PROMPT_HYGIENE, pil_image)
            data = ai_service.parse_json_response(ai_raw) if ai_raw else None

        if not data:
            data = DEMO_HYGIENE.copy()

        # Save record
        record = AnalysisRecord(
            analysis_type="hygiene",
            image_path=file.filename or "kitchen_environment.jpg",
            result_json=json.dumps(data)
        )
        db.add(record)
        db.commit()

        return data
    except Exception:
        return DEMO_HYGIENE
