# -*- coding: utf-8 -*-
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import datetime
from pydantic import BaseModel
from typing import List, Optional

from .database import engine, get_db, Base
from .models import User as DBUser, ESGReport as DBESGReport, AnalysisHistory as DBAnalysisHistory, ActivityLog as DBActivityLog, Content as DBContent
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
    topic: Optional[str] = ""
    cost: Optional[float] = 0.0
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
    path: Optional[str] = ""

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
    flow_rate_m3s: Optional[float] = 0.0
    head_height_m: Optional[float] = 0.0
    waste_feedstock_kg: Optional[float] = 0.0
    user_id: int

# Admin Schemas
class AdminUserUpdate(BaseModel):
    name: str
    email: str
    role: str
    status: str
    sustainability_score: float

class AdminContentCreate(BaseModel):
    title: str
    content_type: str
    detail: str
    active: int

class AdminCoinsUpdate(BaseModel):
    user_id: int
    amount: float
    action: str # "add" or "remove"


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
    result = GreenwashingDetectorAI.analyze(data.text, data.topic, data.cost)
    
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
    water = RenewableEnergyAI.predict_water(
        data.flow_rate_m3s,
        data.head_height_m
    )
    biogas = RenewableEnergyAI.predict_biogas(
        data.waste_feedstock_kg
    )
    
    result = {
        "solar": solar,
        "wind": wind,
        "water": water,
        "biogas": biogas,
        "combined_annual_generation_kwh": solar["annual_generation_kwh"] + wind["annual_generation_kwh"] + water["annual_generation_kwh"] + biogas["annual_generation_kwh"],
        "combined_annual_carbon_offset_kg": solar["annual_carbon_offset_kg"] + wind["annual_carbon_offset_kg"] + water["annual_carbon_offset_kg"] + biogas["annual_carbon_offset_kg"]
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
    path = data.path or ""
    
    # Contextual routing based on the active webpage
    if "tree" in path.lower() or "plant" in path.lower():
        if "teak" in msg_lower or "price" in msg_lower or "profit" in msg_lower or "yield" in msg_lower or "sandalwood" in msg_lower or "mahogany" in msg_lower or "rosewood" in msg_lower:
            reply = ("On this Tree Plantation page, we calculate actual and predicted prices:\n"
                     "- Sandalwood yields a massive ₹75,000 (5 yrs) to ₹1,50,000 (10 yrs) with actual market rates at ₹12,000/kg.\n"
                     "- Teak Wood logs are worth ₹10,000 at 5 yrs, predicted to rise to ₹18,000 at 10 yrs.\n"
                     "- Agriculture crop trees like Mango & Coconut yield annual fruits profit of ₹2,500 – ₹7,500.")
        else:
            reply = ("You are currently viewing the Tree Plantation Simulator.\n"
                     "You can adjust the sliders for Tree Count and Duration (up to 15 years/5475 days) for species like Teak wood, Mango, Rosewood, and Sandalwood to calculate carbon offsets and timber commercial profits.")
    elif "renewable" in path.lower():
        reply = ("You are currently viewing the Renewable Energy Predictor page.\n"
                 "This allows side-by-side modeling of:\n"
                 "- Solar capacity & active duration hours.\n"
                 "- Wind speed turbines capacity.\n"
                 "- Water Hydroelectric flow rate (m³/s) & head height.\n"
                 "- Biogas digester waste feedstock (kg/day).\n"
                 "Adjust variables to compute daily and annual energy in kWh.")
    elif "greenwash" in path.lower():
        reply = ("You are currently viewing the Greenwashing Detector & Plan Consultant.\n"
                 "Input marketing statements to detect greenwash probability, get recommended corrections to your plan, and construct a brand-new sustainability plan in Rupees (₹) customized to your target budget.")
    elif "ecogini" in path.lower() or "score" in path.lower():
        reply = ("You are currently viewing the Eco-Gini AI Scorecard page.\n"
                 "This page calculates audited ESG rating scores based on Tamil Nadu grids. It integrates a live Google Map view of your site and recommends compliance roadmap targets based on your custom command directive text.")
    elif "carbon" in path.lower() or "allocation" in path.lower():
        reply = ("You are currently viewing the Daily Work Allocation page.\n"
                 "Use this dashboard to allocate energy-saving tasks to workers, such as switching off water motors, maintaining the grassland lawn, or turning off electronic products on time.")
    elif "gamification" in path.lower() or "challenge" in path.lower() or "leaderboard" in path.lower():
        reply = ("You are currently viewing the Eco Gamification Hub.\n"
                 "Complete weekly challenges (e.g. Tree plantation, Lake cleanup, Biogas waste feedstock) with GPS geotagged photo proof to earn Eco Coins for social marketing platforms.")
    
    # Fallback to keyword matching if no path matched or path query is specific
    elif "hello" in msg_lower or "hi" in msg_lower or "hey" in msg_lower:
        reply = "Hello! I am your EcoSphere AI Assistant. How can I help you optimize your carbon footprint, audit renewable energy, calculate timber yields, or allocate daily work tasks today?"
    elif "carbon" in msg_lower or "reduce emissions" in msg_lower:
        reply = ("To reduce carbon emissions at your corporate campus:\n"
                 "1. Transition to local clean grids (Solar/Wind specs side-by-side).\n"
                 "2. Enable smart daily work routines (like turning off motors and appliances at time).\n"
                 "3. Introduce organic biogas digesters for food waste.\n"
                 "4. Plant high-yield carbon-sink trees like Mangroves to offset direct smoke.")
    elif "greenwash" in msg_lower or "detector" in msg_lower:
        reply = ("Our Greenwashing AI Detector helps you verify sustainability statements against industry standards (ISO 14001, GRI).\n"
                 "Simply input your claims and budget in INR (₹) to get concrete, audited roadmap changes and cost-effective plan modifications automatically.")
    elif "tree" in msg_lower or "plant" in msg_lower or "teak" in msg_lower or "sandalwood" in msg_lower:
        reply = ("Our Tree Plantation Impact Simulator models growth and returns up to 15 years:\n"
                 "- Timber category: Teak wood logs (₹10,000 to ₹18,000 per tree log) & Rosewood (₹18,000 to ₹35,000).\n"
                 "- Agriculture: Mango & Coconut (yielding ₹2,500 to ₹3,500 annual crop profits).\n"
                 "- Carbon capture: Mangroves absorb up to 25kg CO2 annually. Planting trees awards Eco Coins!")
    elif "renewable" in msg_lower or "solar" in msg_lower or "wind" in msg_lower or "hydro" in msg_lower or "water" in msg_lower or "biogas" in msg_lower:
        reply = ("EcoSphere supports four major renewable energy sources:\n"
                 "- Solar: Capacity (kW) multiplied by peak sun hours with duration time bars.\n"
                 "- Wind: Turbine output modeled on localized wind speed cubic factors.\n"
                 "- Hydroelectric (Water): Modeled on water flow rates (m³/s) and head height.\n"
                 "- Biogas: Continuous anaerobic digestion of organic waste feedstock.\n"
                 "Combine them to see your total annual CO2 offset in tonnes.")
    elif "tamil nadu" in msg_lower or "india" in msg_lower or "google maps" in msg_lower or "location" in msg_lower:
        reply = ("EcoSphere is customized for Tamil Nadu, India. The Eco-Gini Score page displays an active Google Maps iframe centering on your audited facility location.\n"
                 "This allows site verification and geo-coordinates matching for regulatory ESG compliance.")
    elif "worker" in msg_lower or "work allocation" in msg_lower or "task" in msg_lower or "motor" in msg_lower:
        reply = ("Our Daily Work Allocation system assigns eco-duties to campus workers, such as:\n"
                 "- Switching off the water motor on time to save electricity.\n"
                 "- Maintaining the grassland lawn to sustain local biodiversity.\n"
                 "- Turning off unused electronic products to prevent phantom power load.\n"
                 "Workers earn Eco Coins upon completion, promoting active green gamification.")
    elif "photo" in msg_lower or "review" in msg_lower or "upload" in msg_lower:
        reply = ("You can upload photos of campus assets in the Dashboard Review system or submit photos with geotags in the Gamification Weekly Challenges.\n"
                 "This verification process ensures tasks are completed transparent and certified by GPS coordinates.")
    elif "coin" in msg_lower or "reward" in msg_lower or "leaderboard" in msg_lower:
        reply = ("Eco Coins are earned by completing weekly challenges (e.g. Clean the Lake, Biogas digester usage) and plantation targets.\n"
                 "You can redeem these coins at our integrated Social Marketing platforms. Track your global standings on the Gamification Leaderboard!")
    elif "report" in msg_lower or "download" in msg_lower or "pdf" in msg_lower:
        reply = "You can download a comprehensive, dynamically generated PDF ESG Audit Report directly by clicking the 'Export ESG Report' button on the main dashboard."
    else:
        reply = ("I am your EcoSphere AI copilot. I can answer questions about:\n"
                 "• Daily Work Allocation for campus workers.\n"
                 "• Solar, Wind, Hydro, and Biogas specs side-by-side.\n"
                 "• Teak wood timber and Agri product price projections.\n"
                 "• Greenwashing claims verification in INR (₹).\n"
                 "• Tamil Nadu Google Maps location-based Eco-Gini score calculation.")
        
    return {"reply": reply}

# REST APIs

@app.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_exist = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_exist:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password (mock sha256 representation for security mock)
    import hashlib
    pw_hash = hashlib.sha256(user.password.encode()).hexdigest()
    
    new_user = DBUser(
        name=user.name,
        email=user.email,
        password_hash=pw_hash,
        role=user.role,
        status="Active",
        sustainability_score=75.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Activity log
    log = DBActivityLog(
        user_id=new_user.id,
        activity=f"User registration completed under role: {user.role}",
        is_suspicious=0,
        ip_address="127.0.0.1"
    )
    db.add(log)
    db.commit()

    return {"id": new_user.id, "name": new_user.name, "email": new_user.email, "role": new_user.role, "status": new_user.status, "sustainability_score": new_user.sustainability_score}

@app.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    import hashlib
    pw_hash = hashlib.sha256(credentials.password.encode()).hexdigest()

    db_user = db.query(DBUser).filter(DBUser.email == credentials.email).first()
    
    # Handle direct fallback for prototype passwords during transition
    valid = False
    if db_user:
        if db_user.password_hash == credentials.password or db_user.password_hash == pw_hash:
            valid = True

    if not db_user or not valid:
        # Failed attempts logged as suspicious activity
        log = DBActivityLog(
            user_id=db_user.id if db_user else None,
            activity=f"Failed login attempt for email: {credentials.email}",
            is_suspicious=1,
            ip_address="127.0.0.1"
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if db_user.status == "Blocked":
        log = DBActivityLog(
            user_id=db_user.id,
            activity=f"Blocked user attempted login: {credentials.email}",
            is_suspicious=1,
            ip_address="127.0.0.1"
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=403, detail="User account is blocked. Contact administrator.")

    # Successful login log
    log = DBActivityLog(
        user_id=db_user.id,
        activity=f"User signed in successfully: {credentials.email}",
        is_suspicious=0,
        ip_address="127.0.0.1"
    )
    db.add(log)
    db.commit()
    
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "status": db_user.status,
        "sustainability_score": db_user.sustainability_score
    }

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
    result = GreenwashingDetectorAI.analyze(data.text, data.topic, data.cost)
    
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
        emission_data=json.dumps(result),
        status="Approved" # default approved for score calculation
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
    water = RenewableEnergyAI.predict_water(
        data.flow_rate_m3s,
        data.head_height_m
    )
    biogas = RenewableEnergyAI.predict_biogas(
        data.waste_feedstock_kg
    )
    
    result = {
        "solar": solar,
        "wind": wind,
        "water": water,
        "biogas": biogas,
        "combined_annual_generation_kwh": solar["annual_generation_kwh"] + wind["annual_generation_kwh"] + water["annual_generation_kwh"] + biogas["annual_generation_kwh"],
        "combined_annual_carbon_offset_kg": solar["annual_carbon_offset_kg"] + wind["annual_carbon_offset_kg"] + water["annual_carbon_offset_kg"] + biogas["annual_carbon_offset_kg"]
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
    path = data.path or ""
    
    # Contextual routing based on the active webpage
    if "tree" in path.lower() or "plant" in path.lower():
        if "teak" in msg_lower or "price" in msg_lower or "profit" in msg_lower or "yield" in msg_lower or "sandalwood" in msg_lower or "mahogany" in msg_lower or "rosewood" in msg_lower:
            reply = ("On this Tree Plantation page, we calculate actual and predicted prices:\n"
                     "- Sandalwood yields a massive ₹75,000 (5 yrs) to ₹1,50,000 (10 yrs) with actual market rates at ₹12,000/kg.\n"
                     "- Teak Wood logs are worth ₹10,000 at 5 yrs, predicted to rise to ₹18,000 at 10 yrs.\n"
                     "- Agriculture crop trees like Mango & Coconut yield annual fruits profit of ₹2,500 – ₹7,500.")
        else:
            reply = ("You are currently viewing the Tree Plantation Simulator.\n"
                     "You can adjust the sliders for Tree Count and Duration (up to 15 years/5475 days) for species like Teak wood, Mango, Rosewood, and Sandalwood to calculate carbon offsets and timber commercial profits.")
    elif "renewable" in path.lower():
        reply = ("You are currently viewing the Renewable Energy Predictor page.\n"
                     "This allows side-by-side modeling of:\n"
                     "- Solar capacity & active duration hours.\n"
                     "- Wind speed turbines capacity.\n"
                     "- Water Hydroelectric flow rate (m³/s) & head height.\n"
                     "- Biogas digester waste feedstock (kg/day).\n"
                     "Adjust variables to compute daily and annual energy in kWh.")
    elif "greenwash" in path.lower():
        reply = ("You are currently viewing the Greenwashing Detector & Plan Consultant.\n"
                 "Input marketing statements to detect greenwash probability, get recommended corrections to your plan, and construct a brand-new sustainability plan in Rupees (₹) customized to your target budget.")
    elif "ecogini" in path.lower() or "score" in path.lower():
        reply = ("You are currently viewing the Eco-Gini AI Scorecard page.\n"
                 "This page calculates audited ESG rating scores based on Tamil Nadu grids. It integrates a live Google Map view of your site and recommends compliance roadmap targets based on your custom command directive text.")
    elif "carbon" in path.lower() or "allocation" in path.lower():
        reply = ("You are currently viewing the Daily Work Allocation page.\n"
                 "Use this dashboard to allocate energy-saving tasks to workers, such as switching off water motors, maintaining the grassland lawn, or turning off electronic products on time.")
    elif "gamification" in path.lower() or "challenge" in path.lower() or "leaderboard" in path.lower():
        reply = ("You are currently viewing the Eco Gamification Hub.\n"
                 "Complete weekly challenges (e.g. Tree plantation, Lake cleanup, Biogas waste feedstock) with GPS geotagged photo proof to earn Eco Coins for social marketing platforms.")
    
    # Fallback to keyword matching if no path matched or path query is specific
    elif "hello" in msg_lower or "hi" in msg_lower or "hey" in msg_lower:
        reply = "Hello! I am your EcoSphere AI Assistant. How can I help you optimize your carbon footprint, audit renewable energy, calculate timber yields, or allocate daily work tasks today?"
    elif "carbon" in msg_lower or "reduce emissions" in msg_lower:
        reply = ("To reduce carbon emissions at your corporate campus:\n"
                 "1. Transition to local clean grids (Solar/Wind specs side-by-side).\n"
                 "2. Enable smart daily work routines (like turning off motors and appliances at time).\n"
                 "3. Introduce organic biogas digesters for food waste.\n"
                 "4. Plant high-yield carbon-sink trees like Mangroves to offset direct smoke.")
    elif "greenwash" in msg_lower or "detector" in msg_lower:
        reply = ("Our Greenwashing AI Detector helps you verify sustainability statements against industry standards (ISO 14001, GRI).\n"
                 "Simply input your claims and budget in INR (₹) to get concrete, audited roadmap changes and cost-effective plan modifications automatically.")
    elif "tree" in msg_lower or "plant" in msg_lower or "teak" in msg_lower or "sandalwood" in msg_lower:
        reply = ("Our Tree Plantation Impact Simulator models growth and returns up to 15 years:\n"
                 "- Timber category: Teak wood logs (₹10,000 to ₹18,000 per tree log) & Rosewood (₹18,000 to ₹35,000).\n"
                 "- Agriculture: Mango & Coconut (yielding ₹2,500 to ₹3,500 annual crop profits).\n"
                 "- Carbon capture: Mangroves absorb up to 25kg CO2 annually. Planting trees awards Eco Coins!")
    elif "renewable" in msg_lower or "solar" in msg_lower or "wind" in msg_lower or "hydro" in msg_lower or "water" in msg_lower or "biogas" in msg_lower:
        reply = ("EcoSphere supports four major renewable energy sources:\n"
                 "- Solar: Capacity (kW) multiplied by peak sun hours with duration time bars.\n"
                 "- Wind: Turbine output modeled on localized wind speed cubic factors.\n"
                 "- Hydroelectric (Water): Modeled on water flow rates (m³/s) and head height.\n"
                 "- Biogas: Continuous anaerobic digestion of organic waste feedstock.\n"
                 "Combine them to see your total annual CO2 offset in tonnes.")
    elif "tamil nadu" in msg_lower or "india" in msg_lower or "google maps" in msg_lower or "location" in msg_lower:
        reply = ("EcoSphere is customized for Tamil Nadu, India. The Eco-Gini Score page displays an active Google Maps iframe centering on your audited facility location.\n"
                 "This allows site verification and geo-coordinates matching for regulatory ESG compliance.")
    elif "worker" in msg_lower or "work allocation" in msg_lower or "task" in msg_lower or "motor" in msg_lower:
        reply = ("Our Daily Work Allocation system assigns eco-duties to campus workers, such as:\n"
                 "- Switching off the water motor on time to save electricity.\n"
                 "- Maintaining the grassland lawn to sustain local biodiversity.\n"
                 "- Turning off unused electronic products to prevent phantom power load.\n"
                 "Workers earn Eco Coins upon completion, promoting active green gamification.")
    elif "photo" in msg_lower or "review" in msg_lower or "upload" in msg_lower:
        reply = ("You can upload photos of campus assets in the Dashboard Review system or submit photos with geotags in the Gamification Weekly Challenges.\n"
                 "This verification process ensures tasks are completed transparent and certified by GPS coordinates.")
    elif "coin" in msg_lower or "reward" in msg_lower or "leaderboard" in msg_lower:
        reply = ("Eco Coins are earned by completing weekly challenges (e.g. Clean the Lake, Biogas digester usage) and plantation targets.\n"
                 "You can redeem these coins at our integrated Social Marketing platforms. Track your global standings on the Gamification Leaderboard!")
    elif "report" in msg_lower or "download" in msg_lower or "pdf" in msg_lower:
        reply = "You can download a comprehensive, dynamically generated PDF ESG Audit Report directly by clicking the 'Export ESG Report' button on the main dashboard."
    else:
        reply = ("I am your EcoSphere AI copilot. I can answer questions about:\n"
                 "• Daily Work Allocation for campus workers.\n"
                 "• Solar, Wind, Hydro, and Biogas specs side-by-side.\n"
                 "• Teak wood timber and Agri product price projections.\n"
                 "• Greenwashing claims verification in INR (₹).\n"
                 "• Tamil Nadu Google Maps location-based Eco-Gini score calculation.")
        
    return {"reply": reply}

# Admin endpoints

# Helper Admin registration for testing
@app.get("/admin/init")
def initialize_admin(db: Session = Depends(get_db)):
    import hashlib
    # Check if admin already exists
    admin_exists = db.query(DBUser).filter(DBUser.role == "Admin").first()
    if admin_exists:
        return {"status": "already initialized", "email": admin_exists.email}
    
    # Create default admin
    admin_pw = hashlib.sha256("admin123".encode()).hexdigest()
    default_admin = DBUser(
        name="System Administrator",
        email="admin@ecosphere.com",
        password_hash=admin_pw,
        role="Admin",
        status="Active",
        sustainability_score=95.0
    )
    db.add(default_admin)
    
    # Initialize some mock contents
    default_contents = [
        ("Switch off grids", "tip", "Save at least 15% power by scheduling campus lights to switch off at 10 PM."),
        ("Eco challenge: Plantation", "challenge", "Plant 5 local teak wood saplings this week."),
        ("Recycle packaging", "recommendation", "Switch package wraps to starch-based biodegradable polymers.")
    ]
    for title, ctype, detail in default_contents:
        db.add(DBContent(title=title, content_type=ctype, detail=detail, active=1))

    db.commit()
    return {"status": "success", "email": "admin@ecosphere.com", "password": "admin123"}

@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "status": u.status, "sustainability_score": u.sustainability_score, "created_date": u.created_date} for u in users]

@app.put("/admin/users/{user_id}")
def update_user_details(user_id: int, details: AdminUserUpdate, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.name = details.name
    user.email = details.email
    user.role = details.role
    user.status = details.status
    user.sustainability_score = details.sustainability_score
    db.commit()
    
    log = DBActivityLog(
        user_id=None,
        activity=f"Admin updated user profile: {user.email}",
        is_suspicious=0
    )
    db.add(log)
    db.commit()
    return {"status": "success", "user_id": user_id}

@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    
    log = DBActivityLog(
        user_id=None,
        activity=f"Admin deleted user profile with ID: {user_id}",
        is_suspicious=0
    )
    db.add(log)
    db.commit()
    return {"status": "success"}

@app.get("/admin/activity-logs")
def get_activity_logs(db: Session = Depends(get_db)):
    logs = db.query(DBActivityLog).order_by(DBActivityLog.timestamp.desc()).limit(100).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "user_id": l.user_id,
            "activity": l.activity,
            "is_suspicious": l.is_suspicious,
            "ip_address": l.ip_address,
            "timestamp": l.timestamp
        })
    return results

@app.post("/admin/verify-company")
def verify_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(DBUser).filter(DBUser.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company user not found")
    company.status = "Active"
    db.commit()
    return {"status": "success", "message": f"Company {company.name} successfully verified."}

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
            "status": r.status or "Pending",
            "created_date": r.created_date,
            "details": json.loads(r.emission_data) if r.emission_data else {}
        })
    return results

@app.put("/admin/reports/{report_id}/approve")
def approve_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(DBESGReport).filter(DBESGReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "Approved"
    db.commit()
    return {"status": "success"}

@app.delete("/admin/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(DBESGReport).filter(DBESGReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"status": "success"}

@app.get("/admin/contents")
def get_contents(db: Session = Depends(get_db)):
    contents = db.query(DBContent).order_by(DBContent.timestamp.desc()).all()
    return [{"id": c.id, "title": c.title, "content_type": c.content_type, "detail": c.detail, "active": c.active} for c in contents]

@app.post("/admin/contents")
def create_content(content: AdminContentCreate, db: Session = Depends(get_db)):
    new_content = DBContent(
        title=content.title,
        content_type=content.content_type,
        detail=content.detail,
        active=content.active
    )
    db.add(new_content)
    db.commit()
    return {"status": "success", "id": new_content.id}

@app.put("/admin/contents/{content_id}")
def update_content(content_id: int, content: AdminContentCreate, db: Session = Depends(get_db)):
    db_content = db.query(DBContent).filter(DBContent.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    db_content.title = content.title
    db_content.content_type = content.content_type
    db_content.detail = content.detail
    db_content.active = content.active
    db_content.timestamp = datetime.datetime.utcnow()
    db.commit()
    return {"status": "success"}

@app.delete("/admin/contents/{content_id}")
def delete_content(content_id: int, db: Session = Depends(get_db)):
    db_content = db.query(DBContent).filter(DBContent.id == content_id).first()
    if not db_content:
        raise HTTPException(status_code=404, detail="Content not found")
    db.delete(db_content)
    db.commit()
    return {"status": "success"}


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


