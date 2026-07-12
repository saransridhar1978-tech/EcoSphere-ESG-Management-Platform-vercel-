# -*- coding: utf-8 -*-
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import datetime
from pydantic import BaseModel
from typing import List, Optional

from .database import engine, get_db, Base
from .models import User as DBUser, ESGReport as DBESGReport, AnalysisHistory as DBAnalysisHistory
from .ai_models import (
    CarbonAnalyzerAI, 
    GreenwashingDetectorAI, 
    EcoGiniScorerAI, 
    TreePlantationAI, 
    CampusPollutionAI, 
    RenewableEnergyAI
)

# Initialize database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoSphere ESG Management Platform API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str # Individual User, Company, Admin

class UserLogin(BaseModel):
    email: str
    password: str

class CarbonInput(BaseModel):
    electricity_kwh: float
    vehicle_km: float
    waste_kg: float
    water_m3: float
    industrial_val: float
    user_id: int

class GreenwashingInput(BaseModel):
    text: str
    user_id: int

class ESGScoreInput(BaseModel):
    energy_usage: float
    waste_recycle_rate: float
    renewable_pct: float
    carbon_emission: float
    social_score: float
    gov_score: float
    user_id: int

class TreeInput(BaseModel):
    tree_count: float
    tree_type: str
    years: float
    user_id: int

class CoachInput(BaseModel):
    message: str

class CampusInput(BaseModel):
    students: int
    vehicles: int
    waste_generation_kg: float
    energy_kwh: float
    user_id: int

class RenewableInput(BaseModel):
    panel_capacity_kw: float
    direct_sun_hours: float
    turbine_capacity_kw: Optional[float] = 0.0
    wind_speed_ms: Optional[float] = 0.0
    user_id: int

# REST APIs

@app.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_exist = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_exist:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Quick hashed password mock for prototype
    new_user = DBUser(
        name=user.name,
        email=user.email,
        password_hash=user.password, # Plain text for simple mock/prototype validation, or can use passlib
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "name": new_user.name, "email": new_user.email, "role": new_user.role}

@app.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == credentials.email).first()
    if not db_user or db_user.password_hash != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"id": db_user.id, "name": db_user.name, "email": db_user.email, "role": db_user.role}

@app.post("/carbon-analysis")
def analyze_carbon(data: CarbonInput, db: Session = Depends(get_db)):
    result = CarbonAnalyzerAI.calculate(
        data.electricity_kwh,
        data.vehicle_km,
        data.waste_kg,
        data.water_m3,
        data.industrial_val
    )
    
    # Save to history
    new_history = DBAnalysisHistory(
        user_id=data.user_id,
        analysis_type="Carbon",
        result=json.dumps(result)
    )
    db.add(new_history)
    db.commit()
    
    return result

@app.get("/carbon-history")
def carbon_history(user_id: int, db: Session = Depends(get_db)):
    histories = db.query(DBAnalysisHistory).filter(
        DBAnalysisHistory.user_id == user_id,
        DBAnalysisHistory.analysis_type == "Carbon"
    ).order_by(DBAnalysisHistory.timestamp.desc()).all()
    
    results = []
    for h in histories:
        results.append({
            "id": h.id,
            "timestamp": h.timestamp,
            "data": json.loads(h.result)
        })
    return results

@app.post("/detect-greenwashing")
def detect_greenwashing(data: GreenwashingInput, db: Session = Depends(get_db)):
    result = GreenwashingDetectorAI.analyze(data.text)
    
    new_history = DBAnalysisHistory(
        user_id=data.user_id,
        analysis_type="Greenwashing",
        result=json.dumps(result)
    )
    db.add(new_history)
    db.commit()
    
    return result

@app.post("/calculate-score")
def calculate_score(data: ESGScoreInput, db: Session = Depends(get_db)):
    result = EcoGiniScorerAI.calculate(
        data.energy_usage,
        data.waste_recycle_rate,
        data.renewable_pct,
        data.carbon_emission,
        data.social_score,
        data.gov_score
    )
    
    # Save to ESG Reports
    new_report = DBESGReport(
        user_id=data.user_id,
        carbon_score=data.carbon_emission,
        green_score=result["overall_esg_score"],
        emission_data=json.dumps(result)
    )
    db.add(new_report)
    
    new_history = DBAnalysisHistory(
        user_id=data.user_id,
        analysis_type="EcoGini",
        result=json.dumps(result)
    )
    db.add(new_history)
    db.commit()
    
    return result

@app.post("/tree-impact")
def tree_impact(data: TreeInput, db: Session = Depends(get_db)):
    result = TreePlantationAI.simulate(data.tree_count, data.tree_type, data.years)
    
    new_history = DBAnalysisHistory(
        user_id=data.user_id,
        analysis_type="Tree",
        result=json.dumps(result)
    )
    db.add(new_history)
    db.commit()
    
    return result

@app.post("/campus-predict")
def campus_predict(data: CampusInput, db: Session = Depends(get_db)):
    result = CampusPollutionAI.predict(
        data.students,
        data.vehicles,
        data.waste_generation_kg,
        data.energy_kwh
    )
    
    new_history = DBAnalysisHistory(
        user_id=data.user_id,
        analysis_type="Campus",
        result=json.dumps(result)
    )
    db.add(new_history)
    db.commit()
    
    return result

@app.post("/renewable-predict")
def renewable_predict(data: RenewableInput, db: Session = Depends(get_db)):
    solar = RenewableEnergyAI.predict_solar(
        data.panel_capacity_kw,
        data.direct_sun_hours
    )
    wind = RenewableEnergyAI.predict_wind(
        data.turbine_capacity_kw,
        data.wind_speed_ms
    )
    
    result = {
        "solar": solar,
        "wind": wind,
        "combined_annual_generation_kwh": solar["annual_generation_kwh"] + wind["annual_generation_kwh"],
        "combined_annual_carbon_offset_kg": solar["annual_carbon_offset_kg"] + wind["annual_carbon_offset_kg"]
    }
    
    new_history = DBAnalysisHistory(
        user_id=data.user_id,
        analysis_type="Renewable",
        result=json.dumps(result)
    )
    db.add(new_history)
    db.commit()
    
    return result

@app.post("/green-coach")
def green_coach(data: CoachInput):
    msg_lower = data.message.lower()
    
    if "carbon" in msg_lower or "reduce emissions" in msg_lower:
        reply = "Reducing carbon emissions requires a multi-pronged approach:\n1. Transition to 100% renewable electricity contracts.\n2. Optimize cargo shipment and transit paths.\n3. Implement energy-efficiency retrofits (like LED lighting & IoT sensors).\n4. Institute composting to divert landfills."
    elif "greenwash" in msg_lower:
        reply = "Greenwashing happens when companies mislead consumers about their environmental friendliness. To avoid this, back all claims with audited certifications (such as ISO 14064 or SCS global), publish transparent raw data, and specify concrete goals instead of vague buzzwords like 'eco-friendly'."
    elif "tree" in msg_lower or "plant" in msg_lower:
        reply = "Trees play a vital role. For instance, a single mature Oak or Mangrove can absorb between 20kg to 25kg of CO2 per year. Choosing native varieties is crucial for maintaining biodiversity."
    elif "renewable" in msg_lower or "solar" in msg_lower:
        reply = "Solar energy generation depends on Panel Capacity (kW) and Peak Sun Hours. Typically, a standard 10kW commercial setup with 4.5 sun hours produces around 35kWh daily. Adding battery storage helps smooth output during off-peak windows."
    else:
        reply = "EcoSphere Copilot recommendation: Audit scope 1 & 2 carbon profiles first. Our ESG simulator or Carbon Analyzer can assist in identifying high-impact areas."
        
    return {"reply": reply}

# Admin endpoints
@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role} for u in users]

@app.get("/admin/reports")
def get_all_reports(db: Session = Depends(get_db)):
    reports = db.query(DBESGReport).order_by(DBESGReport.created_date.desc()).all()
    results = []
    for r in reports:
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "carbon_score": r.carbon_score,
            "green_score": r.green_score,
            "created_date": r.created_date,
            "details": json.loads(r.emission_data)
        })
    return results

@app.post("/admin/verify-company")
def verify_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(DBUser).filter(DBUser.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company user not found")
    
    # Mock verify
    return {"status": "success", "message": f"Company {company.name} successfully verified."}

from fastapi.responses import StreamingResponse
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

@app.get("/report/download")
def download_report(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    latest_report = db.query(DBESGReport).filter(DBESGReport.user_id == user_id).order_by(DBESGReport.created_date.desc()).first()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#047857'),
        spaceAfter=20
    )
    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#06b6d4'),
        spaceBefore=10,
        spaceAfter=10
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    story.append(Paragraph("EcoSphere AI - ESG Audit Report", title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"<b>Organization Name:</b> {db_user.name}", body_style))
    story.append(Paragraph(f"<b>Email Address:</b> {db_user.email}", body_style))
    story.append(Paragraph(f"<b>Report Generated At:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    story.append(Spacer(1, 20))
    
    story.append(Paragraph("1. ESG Performance Score Summary", h2_style))
    overall_score = latest_report.green_score if latest_report else 84.5
    story.append(Paragraph(f"<b>Overall ESG Score:</b> {overall_score} / 100", body_style))
    
    details = json.loads(latest_report.emission_data) if latest_report and latest_report.emission_data else None
    env_rating = details.get("environmental_rating", 81.2) if details else 81.2
    sustainability_level = details.get("sustainability_level", "Gold") if details else "Gold"
    
    story.append(Paragraph(f"<b>Environmental Rating:</b> {env_rating}%", body_style))
    story.append(Paragraph(f"<b>Sustainability Achievement Level:</b> {sustainability_level}", body_style))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("2. AI Recommendations & Future Roadmap", h2_style))
    roadmap = details.get("roadmap", [
        "Increase renewable energy contract capacity from current levels to target >40% by Year 1.",
        "Implement Zero-Waste policy in packaging procurement to hit 80% recycling rate by Q3."
    ]) if details else [
        "Increase renewable energy contract capacity from current levels to target >40% by Year 1.",
        "Implement Zero-Waste policy in packaging procurement to hit 80% recycling rate by Q3."
    ]
    
    for idx, item in enumerate(roadmap):
        story.append(Paragraph(f"<b>Phase {idx+1}:</b> {item}", body_style))
        
    doc.build(story)
    buffer.seek(0)
    
    filename = f"ESG_Report_{db_user.name.replace(' ', '_')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/health")
def health():
    return {"status": "healthy"}

# Mount Next.js compiled frontend static files
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "out")

if os.path.exists(frontend_out_dir):
    # Mount asset directories so browser can load JS/CSS files
    next_static_dir = os.path.join(frontend_out_dir, "_next")
    if os.path.exists(next_static_dir):
        app.mount("/_next", StaticFiles(directory=next_static_dir), name="next-assets")
        
    @app.api_route("/{path:path}", methods=["GET", "HEAD"])
    def serve_html_pages(path: str):
        clean_path = path.strip("/")
        
        # If it has a file extension, try to serve it directly from out/
        if "." in clean_path:
            file_path = os.path.join(frontend_out_dir, clean_path)
            if os.path.exists(file_path):
                return FileResponse(file_path)
        else:
            # Check if <path>.html exists
            target_html = f"{clean_path}.html" if clean_path else "index.html"
            html_file = os.path.join(frontend_out_dir, target_html)
            if os.path.exists(html_file):
                return FileResponse(html_file)
            
            # Fallback to index.html for SPA client-side routing
            fallback = os.path.join(frontend_out_dir, "index.html")
            if os.path.exists(fallback):
                return FileResponse(fallback)
        
        raise HTTPException(status_code=404, detail="Not Found")
else:
    print(f"Warning: Frontend static directory not found at {frontend_out_dir}. Please run 'npm run build' inside the 'frontend' folder to merge frontend into this backend.")


