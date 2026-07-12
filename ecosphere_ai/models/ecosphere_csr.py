# -*- coding: utf-8 -*-
# pyrefly: ignore [missing-import]
from odoo import models, fields, api

class EcoSphereCSRCampaign(models.Model):
    _name = 'ecosphere.csr.campaign'
    _description = 'EcoSphere CSR Sustainability Campaign'

    name = fields.Char(string='Campaign Name', required=True)
    budget = fields.Float(string='Allocated Budget ($)', required=True, default=5000.0)
    employee_target = fields.Integer(string='Target Employee Count', default=50)
    location = fields.Char(string='Location / Region', default='HQ & Regional Offices')
    
    start_date = fields.Date(string='Start Date', default=fields.Date.context_today)
    end_date = fields.Date(string='End Date')
    
    objective = fields.Selection([
        ('emissions', 'Reduce Office Carbon Footprint'),
        ('planting', 'Tree Planting & Reforestation'),
        ('recycling', 'Waste & E-Waste Drive'),
        ('education', 'Green Work Practice Seminars'),
    ], string='Core Objective', default='planting')
    
    # Projections
    expected_participation_pct = fields.Float(string='Predicted Employee Participation (%)', default=65.0)
    projected_esg_boost = fields.Float(string='ESG Score Improvement (pts)', compute='_compute_csr_impact', store=True)
    budget_efficiency = fields.Selection([
        ('high', 'Highly Efficient'),
        ('moderate', 'Moderate Return'),
        ('low', 'Low Return / Long Term'),
    ], string='Budget Efficiency Rating', compute='_compute_csr_impact', store=True)

    @api.depends('budget', 'objective', 'employee_target')
    def _compute_csr_impact(self):
        for record in self:
            # Simple modeling logic
            if record.objective == 'planting':
                record.projected_esg_boost = (record.budget / 1000.0) * 0.8
                record.budget_efficiency = 'high' if record.budget < 10000 else 'moderate'
            elif record.objective == 'emissions':
                record.projected_esg_boost = (record.budget / 1000.0) * 1.2
                record.budget_efficiency = 'high'
            elif record.objective == 'recycling':
                record.projected_esg_boost = (record.budget / 1000.0) * 0.5
                record.budget_efficiency = 'moderate'
            else:
                record.projected_esg_boost = 1.5
                record.budget_efficiency = 'moderate'
