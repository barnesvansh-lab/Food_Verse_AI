"""
SQLAlchemy ORM models for Food Verse AI.
"""

from __future__ import annotations

import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.database import Base


class AnalysisRecord(Base):
    __tablename__ = "analysis_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    analysis_type = Column(String(32), nullable=False, index=True)  # nutrition | freshness | hygiene
    image_path = Column(String(512), nullable=True)
    result_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    age = Column(Integer, nullable=False)
    gender = Column(String(16), nullable=False)
    weight_kg = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    activity_level = Column(String(32), nullable=False)
    dietary_constraints = Column(Text, default="[]")  # JSON string list
    fitness_goal = Column(String(32), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    meal_plans = relationship("SavedMealPlan", back_populates="user_profile")


class SavedMealPlan(Base):
    __tablename__ = "saved_meal_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_profile_id = Column(Integer, ForeignKey("user_profiles.id"), nullable=True)
    plan_json = Column(Text, nullable=False)
    grocery_list_json = Column(Text, nullable=True)
    target_calories = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user_profile = relationship("UserProfile", back_populates="meal_plans")


class SavedRecipe(Base):
    __tablename__ = "saved_recipes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    recipe_json = Column(Text, nullable=False)
    ingredients_input = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
