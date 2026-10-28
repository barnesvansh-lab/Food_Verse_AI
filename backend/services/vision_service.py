"""
OpenCV + PyTorch image pre-processing utilities for Food Verse AI.
"""

from __future__ import annotations

import io
import logging
import tempfile
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np
from PIL import Image, ImageEnhance

logger = logging.getLogger(__name__)


def preprocess_image(image_bytes: bytes) -> Image.Image:
    """Read raw bytes with OpenCV, resize, enhance contrast, return a PIL Image.

    Steps:
        1. Decode bytes → OpenCV BGR array.
        2. Convert BGR → RGB.
        3. Resize so the longest side is at most 1024 px (preserving aspect ratio).
        4. Mild contrast enhancement (1.2×).
        5. Return as PIL ``Image.Image``.
    """
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img_bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Could not decode image bytes with OpenCV")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    h, w = img_rgb.shape[:2]
    max_side = 1024
    if max(h, w) > max_side:
        scale = max_side / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        img_rgb = cv2.resize(img_rgb, (new_w, new_h), interpolation=cv2.INTER_AREA)

    pil_img = Image.fromarray(img_rgb)
    enhancer = ImageEnhance.Contrast(pil_img)
    pil_img = enhancer.enhance(1.2)
    return pil_img


def extract_video_frames(video_bytes: bytes, max_frames: int = 5) -> List[Image.Image]:
    """Extract evenly-spaced key-frames from uploaded video bytes.

    The video bytes are written to a temporary file so that OpenCV's
    ``VideoCapture`` can read them.  Up to *max_frames* frames are
    returned as PIL images.
    """
    frames: List[Image.Image] = []
    tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    try:
        tmp.write(video_bytes)
        tmp.flush()
        tmp.close()

        cap = cv2.VideoCapture(tmp.name)
        if not cap.isOpened():
            raise ValueError("Could not open video bytes with OpenCV")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            raise ValueError("Video has no readable frames")

        indices = np.linspace(0, total_frames - 1, min(max_frames, total_frames), dtype=int)

        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
            ret, frame = cap.read()
            if not ret:
                continue
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_frame = Image.fromarray(frame_rgb)
            # Resize large frames
            w, h = pil_frame.size
            if max(w, h) > 1024:
                scale = 1024 / max(w, h)
                pil_frame = pil_frame.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
            frames.append(pil_frame)
        cap.release()
    except Exception:
        logger.exception("Error extracting video frames")
        raise
    finally:
        Path(tmp.name).unlink(missing_ok=True)

    if not frames:
        raise ValueError("No frames could be extracted from the video")
    return frames


def detect_dominant_colors(image: Image.Image, k: int = 5) -> List[Tuple[int, int, int]]:
    """Return the *k* dominant RGB colours via simple k-means clustering.

    Useful as supporting signal for freshness analysis (e.g., brown/green
    tint detection).
    """
    img_rgb = np.array(image.resize((150, 150)))  # down-sample for speed
    pixels = img_rgb.reshape(-1, 3).astype(np.float32)

    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, centers = cv2.kmeans(
        pixels, k, None, criteria, 10, cv2.KMEANS_PP_CENTERS
    )
    centers = centers.astype(int)
    # Sort by cluster size (descending)
    counts = np.bincount(labels.flatten())
    order = np.argsort(-counts)
    dominant: List[Tuple[int, int, int]] = [
        (int(centers[i][0]), int(centers[i][1]), int(centers[i][2])) for i in order
    ]
    return dominant
