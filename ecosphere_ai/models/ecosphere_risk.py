# -*- coding: utf-8 -*-
# pyrefly: ignore [missing-import]
from odoo import models, fields, api

class EcoSphereRiskPrediction(models.Model):
    _name = 'ecosphere.risk.prediction'
    _description = 'EcoSphere ESG Risk Prediction'
    _order = 'compliance_risk_pct desc'

    department_id = fields.Many2one('hr.department', string='Department', required=True)
    name = fields.Char(related='department_id.name', string='Department Name', readonly=True)

    # Risk Percentages
    compliance_risk_pct = fields.Float(string='Compliance Risk (%)', default=15.0)
    environmental_risk_pct = fields.Float(string='Environmental Risk (%)', default=25.0)
    governance_risk_pct = fields.Float(string='Governance Risk (%)', default=10.0)
    employee_engagement_risk_pct = fields.Float(string='Employee Engagement Risk (%)', default=20.0)
    csr_participation_risk_pct = fields.Float(string='CSR Participation Risk (%)', default=30.0)

    # Aggregated Risk
    overall_risk_level = fields.Selection([
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('critical', 'Critical Risk'),
    ], string='Overall Risk Level', compute='_compute_overall_risk', store=True)

    prediction_timeline = fields.Char(string='Prediction Timeline', default='Next 30 - 90 Days')
    ai_explanation = fields.Text(string='AI Explanation')
    recommended_action = fields.Text(string='Recommended Action')

    @api.depends('compliance_risk_pct', 'environmental_risk_pct', 'governance_risk_pct', 'employee_engagement_risk_pct', 'csr_participation_risk_pct')
    def _compute_overall_risk(self):
        for record in self:
            avg_risk = (
                record.compliance_risk_pct + 
                record.environmental_risk_pct + 
                record.governance_risk_pct + 
                record.employee_engagement_risk_pct + 
                record.csr_participation_risk_pct
            ) / 5.0
            
            if avg_risk < 20:
                record.overall_risk_level = 'low'
            elif avg_risk < 50:
                record.overall_risk_level = 'medium'
            elif avg_risk < 75:
                record.overall_risk_level = 'high'
            else:
                record.overall_risk_level = 'critical'
