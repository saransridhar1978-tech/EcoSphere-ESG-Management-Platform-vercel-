# -*- coding: utf-8 -*-
# pyrefly: ignore [missing-import]
from odoo import models, fields, api

class EcoSphereDigitalTwinScenario(models.Model):
    _name = 'ecosphere.digital.twin.scenario'
    _description = 'EcoSphere Digital Twin Scenario'

    name = fields.Char(string='Scenario Name', required=True)
    scenario_type = fields.Selection([
        ('solar', 'Install Solar Panels'),
        ('hybrid', 'Hybrid Work Policy'),
        ('ev', 'EV Fleet Transition'),
        ('waste', 'Waste Reduction Program'),
        ('renewable', 'Renewable Energy Contract'),
    ], string='Scenario Type', required=True)

    investment_cost = fields.Float(string='Estimated Investment Cost ($)', default=50000.0)
    target_reduction_pct = fields.Float(string='Target Emissions Reduction (%)', default=15.0)

    # Projections calculated by AI or Formulas
    projected_carbon_reduction = fields.Float(string='Projected Carbon Reduction (tons CO2e/year)', compute='_compute_projections', store=True)
    projected_savings = fields.Float(string='Projected Financial Savings ($/year)', compute='_compute_projections', store=True)
    roi_years = fields.Float(string='Estimated ROI (Years)', compute='_compute_projections', store=True)
    esg_score_boost = fields.Float(string='Projected ESG Score Boost (pts)', compute='_compute_projections', store=True)

    active = fields.Boolean(string='Active', default=True)

    @api.depends('scenario_type', 'investment_cost', 'target_reduction_pct')
    def _compute_projections(self):
        for record in self:
            if record.scenario_type == 'solar':
                record.projected_carbon_reduction = record.investment_cost * 0.005 * (record.target_reduction_pct / 10.0)
                record.projected_savings = record.investment_cost * 0.12
                record.esg_score_boost = 8.5
            elif record.scenario_type == 'hybrid':
                record.projected_carbon_reduction = 45.0 * (record.target_reduction_pct / 10.0)
                record.projected_savings = 25000.0
                record.esg_score_boost = 4.2
            elif record.scenario_type == 'ev':
                record.projected_carbon_reduction = record.investment_cost * 0.003
                record.projected_savings = record.investment_cost * 0.08
                record.esg_score_boost = 9.0
            elif record.scenario_type == 'waste':
                record.projected_carbon_reduction = 12.0 * (record.target_reduction_pct / 5.0)
                record.projected_savings = 8000.0
                record.esg_score_boost = 5.0
            else:
                record.projected_carbon_reduction = record.investment_cost * 0.004
                record.projected_savings = record.investment_cost * 0.05
                record.esg_score_boost = 6.0

            if record.projected_savings > 0:
                record.roi_years = record.investment_cost / record.projected_savings
            else:
                record.roi_years = 99.0
