# -*- coding: utf-8 -*-
import json
from odoo import http
from odoo.http import request

class EcoSphereController(http.Controller):

    @http.route('/ecosphere/esg_summary', type='json', auth='user', cors='*')
    def get_esg_summary(self):
        """Fetches active ESG scores, compliance lists and emission statistics."""
        # Querying mock/demo data for Hackathon readiness
        return {
            "status": "success",
            "overall_esg_score": 84.5,
            "environmental_score": 81.2,
            "social_score": 88.0,
            "governance_score": 84.3,
            "carbon_reduction_ytd": "12.4%",
            "active_employees_gamified": 184,
            "compliance_status": "92%"
        }

    @http.route('/ecosphere/copilot/query', type='json', auth='user', cors='*')
    def copilot_query(self, prompt):
        """Process natural queries and return structured answers, insights, and chart directives."""
        prompt_lower = prompt.lower()
        
        # Scenario mapping
        if "carbon" in prompt_lower or "emission" in prompt_lower:
            answer = "Carbon emissions increased by 4.2% last month primarily due to increased manufacturing activity in Production Line B and a 12% rise in logistics freight distances. I recommend transitioning production shifts to off-peak renewable hours and optimizing shipping routes."
            chart_data = {
                "type": "bar",
                "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                "datasets": [{"label": "CO2e (tonnes)", "data": [42, 45, 41, 44, 48, 50], "backgroundColor": "#10b981"}]
            }
        elif "supplier" in prompt_lower or "sustain" in prompt_lower:
            answer = "Currently, Acme Logistics and Apex Packaging have the lowest ESG sustainability ratings (52 and 58 respectively) due to non-recyclable materials and long shipping distances. I recommend switching to EcoBox Solutions (rating 94) to reduce scope 3 emissions."
            chart_data = None
        elif "risk" in prompt_lower or "department" in prompt_lower:
            answer = "The Logistics Department exhibits the highest overall ESG risk (58%) due to heavy fleet emissions and regulatory compliance exposure under new green transit rules. The HR department holds the lowest risk (12%)."
            chart_data = {
                "type": "radar",
                "labels": ["Compliance", "Environmental", "Governance", "Employee", "CSR"],
                "datasets": [{"label": "Logistics Risk Profile", "data": [65, 80, 45, 50, 50], "borderColor": "#ef4444"}]
            }
        elif "predict" in prompt_lower or "next month" in prompt_lower:
            answer = "Predictive analysis indicates a potential 3.5 point increase in our ESG Health Score (to 88.0) if the Solar Phase 1 installation completes on schedule. Under current baseline operations, the score is projected to hold steady at 84.5."
            chart_data = {
                "type": "line",
                "labels": ["Current", "Aug (Proj)", "Sep (Proj)", "Oct (Proj)"],
                "datasets": [{"label": "ESG Score Trend", "data": [84.5, 85.1, 86.8, 88.0], "borderColor": "#3b82f6"}]
            }
        else:
            answer = "I've analyzed our organizational ESG metrics. Here are the top three suggested actions to reduce footprint:\n1. Transition fleet to hybrid/EV models.\n2. Mandate the Green Office standard (hybrid work expansion).\n3. Re-evaluate Tier-2 suppliers on packaging practices."
            chart_data = None

        return {
            "answer": answer,
            "chart": chart_data,
            "suggestions": [
                "Why did carbon emissions increase this month?",
                "Which department has the highest ESG risk?",
                "Suggest methods to reduce emissions."
            ]
        }
