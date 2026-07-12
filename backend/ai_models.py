# -*- coding: utf-8 -*-
import re

class CarbonAnalyzerAI:
    @staticmethod
    def calculate(electricity_kwh, vehicle_km, waste_kg, water_m3, industrial_val):
        # Emission factors (CO2e equivalents)
        electricity_co2 = electricity_kwh * 0.85
        vehicle_co2 = vehicle_km * 0.21
        waste_co2 = waste_kg * 0.45
        water_co2 = water_m3 * 0.35
        industrial_co2 = industrial_val * 1.5
        
        total_co2_kg = electricity_co2 + vehicle_co2 + waste_co2 + water_co2 + industrial_co2
        total_co2_tonnes = total_co2_kg / 1000.0
        
        # Carbon footprint score out of 100 (lower emissions -> higher score)
        # Baseline organization emitting ~50 tonnes has score 50
        footprint_score = max(0.0, min(100.0, 100.0 - (total_co2_tonnes * 1.2)))
        
        # Generate target recommendations
        suggestions = []
        if electricity_kwh > 2000:
            suggestions.append("Transition to high-efficiency LED lights and install automated smart thermostats to reduce electricity draw.")
        if vehicle_km > 5000:
            suggestions.append("Implement a hybrid work policy or optimize corporate shuttle routes to decrease vehicle logistics emissions.")
        if waste_kg > 500:
            suggestions.append("Enact a circular packaging policy and double down on organic/e-waste recycling programs.")
        if water_m3 > 100:
            suggestions.append("Upgrade facility fixtures with low-flow aerators and initiate rainwater harvesting loops.")
            
        if not suggestions:
            suggestions.append("Maintain current sustainability standards. Consider purchasing certified carbon offsets to reach carbon neutrality.")
            
        return {
            "total_co2_tonnes": round(total_co2_tonnes, 2),
            "footprint_score": round(footprint_score, 1),
            "breakdown": {
                "electricity": round(electricity_co2 / 1000.0, 2),
                "vehicle": round(vehicle_co2 / 1000.0, 2),
                "waste": round(waste_co2 / 1000.0, 2),
                "water": round(water_co2 / 1000.0, 2),
                "industrial": round(industrial_co2 / 1000.0, 2)
            },
            "suggestions": suggestions
        }

class GreenwashingDetectorAI:
    GREENWASH_KEYWORDS = [
        "100% natural", "eco-friendly", "pure green", "biodegradable", 
        "carbon-neutral product", "clean energy offset", "completely organic",
        "zero carbon emission", "environmentally safe", "sustainable choice"
    ]
    
    EVIDENCE_KEYWORDS = [
        "certified", "iso 14001", "carbon trust", "third-party audit", 
        "verified", "sustainalytics", "gri aligned", "ghg protocol"
    ]

    @staticmethod
    def analyze(text):
        text_lower = text.lower()
        
        # Count suspicious claims
        buzzwords_found = [kw for kw in GreenwashingDetectorAI.GREENWASH_KEYWORDS if kw in text_lower]
        evidence_found = [kw for kw in GreenwashingDetectorAI.EVIDENCE_KEYWORDS if kw in text_lower]
        
        # Heuristic classification
        score = 15.0  # Base line probability
        explanations = []
        
        if buzzwords_found:
            score += len(buzzwords_found) * 20.0
            explanations.append(f"Contains high-level buzzwords with low specificity: {', '.join(buzzwords_found)}")
        else:
            explanations.append("Minimal use of typical green marketing buzzwords.")
            
        if not evidence_found:
            score += 25.0
            explanations.append("No reference to external certifications, audits, or standardized protocols (e.g. ISO, GRI).")
        else:
            score -= len(evidence_found) * 10.0
            explanations.append(f"Provides verifiable reference to standards: {', '.join(evidence_found)}")
            
        # Bound score between 0 and 100
        probability = max(5.0, min(98.0, score))
        
        suggestions = []
        if probability > 50:
            suggestions.append("Incorporate third-party verification details (e.g., USDA Organic, Carbon Trust, ISO 14064).")
            suggestions.append("Provide concrete statistics (e.g., exact carbon tonnage offsets instead of saying 'carbon-neutral').")
        else:
            suggestions.append("Maintain transparency and publish raw environmental data on your open public portal.")
            
        return {
            "greenwashing_probability": round(probability, 1),
            "explanation": explanations,
            "suggestions": suggestions
        }

class EcoGiniScorerAI:
    @staticmethod
    def calculate(energy_usage, waste_recycle_rate, renewable_pct, carbon_emission, social_score=85, gov_score=80):
        # Calculate Environmental Score (0-100)
        # Base starts at 60
        e_score = 60.0
        
        # Energy usage modifier (lower is better, baseline 5000 kWh)
        if energy_usage < 3000:
            e_score += 10.0
        elif energy_usage > 7000:
            e_score -= 10.0
            
        # Recycling rate (percentage 0-100)
        e_score += (waste_recycle_rate - 50.0) * 0.3
        
        # Renewable energy percentage (0-100)
        e_score += (renewable_pct) * 0.4
        
        # Carbon emissions penalty
        e_score -= min(20.0, carbon_emission * 0.2)
        
        e_score = max(10.0, min(100.0, e_score))
        
        # Overall ESG Score
        overall = (e_score * 0.5) + (social_score * 0.25) + (gov_score * 0.25)
        
        # Sustainability Level classification
        level = "Bronze"
        if overall >= 85: level = "Platinum"
        elif overall >= 70: level = "Gold"
        elif overall >= 55: level = "Silver"
        
        # Roadmap creation
        roadmap = []
        if renewable_pct < 40:
            roadmap.append("Increase renewable energy contract capacity from current levels to target >40% by Year 1.")
        if waste_recycle_rate < 75:
            roadmap.append("Implement Zero-Waste policy in packaging procurement to hit 80% recycling rate by Q3.")
        if e_score < 75:
            roadmap.append("Audit all scope-1 thermal infrastructure for energy efficiency leakages.")
            
        if not roadmap:
            roadmap.append("Excel current initiatives. Standardize metrics and apply for B-Corp Certification.")

        return {
            "overall_esg_score": round(overall, 1),
            "environmental_rating": round(e_score, 1),
            "sustainability_level": level,
            "roadmap": roadmap
        }

class TreePlantationAI:
    @staticmethod
    def simulate(tree_count, tree_type, years):
        # Absorption factor per tree per year (kg CO2)
        if tree_type.lower() == "mangrove":
            factor = 25.0
        elif tree_type.lower() == "pine":
            factor = 18.0
        elif tree_type.lower() == "oak":
            factor = 22.0
        else: # Default
            factor = 20.0
            
        annual_co2_absorption = tree_count * factor
        total_co2_absorption = annual_co2_absorption * years
        
        # Environmental impact points (scale 1-100)
        impact_points = min(100.0, (tree_count * 0.5) + (years * 2.0))
        
        return {
            "annual_co2_absorption_kg": round(annual_co2_absorption, 1),
            "total_co2_absorption_kg": round(total_co2_absorption, 1),
            "environmental_impact_rating": round(impact_points, 1),
            "equivalent_car_miles_saved": round(total_co2_absorption * 2.4, 1)
        }

class CampusPollutionAI:
    @staticmethod
    def predict(students, vehicles, waste_generation_kg, energy_kwh):
        # Heuristic indexes for Pollution Level (0-100 AQI scale equivalent)
        aqi = 25.0
        aqi += (students * 0.005)
        aqi += (vehicles * 0.15)
        aqi += (waste_generation_kg * 0.02)
        aqi += (energy_kwh * 0.001)
        
        aqi = min(150.0, aqi) # Bound reasonably
        
        risk_level = "Low"
        if aqi > 100: risk_level = "Hazardous/High"
        elif aqi > 60: risk_level = "Moderate"
        
        solutions = []
        if vehicles > 200:
            solutions.append("Encourage student shuttle options, introduce e-bike rental points, or add electric vehicle chargers on campus.")
        if waste_generation_kg > 1000:
            solutions.append("Introduce multi-category recycling bins across all academic buildings and ban single-use plastics in canteens.")
        if energy_kwh > 10000:
            solutions.append("Install rooftop solar panels on lecture halls and implement smart building occupancy sensors.")
            
        return {
            "aqi_index": round(aqi, 1),
            "risk_level": risk_level,
            "solutions": solutions
        }

class RenewableEnergyAI:
    @staticmethod
    def predict_solar(panel_capacity_kw, direct_sun_hours, efficiency_coef=0.78):
        # Daily generation in kWh
        daily_generation = panel_capacity_kw * direct_sun_hours * efficiency_coef
        monthly_generation = daily_generation * 30
        annual_generation = daily_generation * 365
        
        # Carbon Offset (approx 0.85 kg CO2 saved per solar kWh)
        annual_carbon_offset_kg = annual_generation * 0.85
        
        return {
            "daily_generation_kwh": round(daily_generation, 1),
            "monthly_generation_kwh": round(monthly_generation, 1),
            "annual_generation_kwh": round(annual_generation, 1),
            "annual_carbon_offset_kg": round(annual_carbon_offset_kg, 1),
            "equivalent_trees_planted": int(annual_carbon_offset_kg / 22.0)
        }

    @staticmethod
    def predict_wind(turbine_capacity_kw, wind_speed_ms, efficiency_coef=0.40):
        # Rated wind speed is typically 12 m/s. Load factor varies with speed cube
        normalized_speed = min(1.0, max(0.0, wind_speed_ms / 12.0))
        load_factor = (normalized_speed ** 3) * efficiency_coef
        
        daily_generation = turbine_capacity_kw * 24.0 * load_factor
        monthly_generation = daily_generation * 30
        annual_generation = daily_generation * 365
        
        # Carbon Offset
        annual_carbon_offset_kg = annual_generation * 0.85
        
        return {
            "daily_generation_kwh": round(daily_generation, 1),
            "monthly_generation_kwh": round(monthly_generation, 1),
            "annual_generation_kwh": round(annual_generation, 1),
            "annual_carbon_offset_kg": round(annual_carbon_offset_kg, 1),
            "equivalent_trees_planted": int(annual_carbon_offset_kg / 22.0)
        }

