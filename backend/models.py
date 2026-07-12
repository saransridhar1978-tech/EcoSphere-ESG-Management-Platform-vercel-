# -*- coding: utf-8 -*-
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="Individual User") # Individual User, Company, Admin

    reports = relationship("ESGReport", back_populates="user")
    histories = relationship("AnalysisHistory", back_populates="user")

class ESGReport(Base):
    __tablename__ = "esg_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    carbon_score = Column(Float, default=0.0)
    green_score = Column(Float, default=0.0)
    emission_data = Column(String, nullable=True) # JSON serialized data
    created_date = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    analysis_type = Column(String, nullable=False) # Carbon, Greenwashing, EcoGini, Tree, Campus, Renewable
    result = Column(String, nullable=False) # JSON serialized response
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="histories")
