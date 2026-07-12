# -*- coding: utf-8 -*-
# pyrefly: ignore [missing-import]
from odoo import models, fields, api

class EcoSphereSupplierESG(models.Model):
    _name = 'ecosphere.supplier.esg'
    _description = 'EcoSphere Supplier ESG Profiles'
    _order = 'esg_score desc'

    partner_id = fields.Many2one('res.partner', string='Supplier', required=True, domain=[('supplier_rank', '>', 0)])
    name = fields.Char(related='partner_id.name', string='Supplier Name', readonly=True)
    
    esg_score = fields.Float(string='ESG Sustainability Score (0-100)', compute='_compute_esg_score', store=True)
    
    # ESG criteria
    carbon_footprint = fields.Float(string='Supplier Avg Carbon Footprint (kg CO2e/ton)', default=100.0)
    transport_distance = fields.Float(string='Avg Transportation Distance (km)', default=150.0)
    packaging_eco_rating = fields.Selection([
        ('1', 'Non-Recyclable Plastic'),
        ('2', 'Partially Recyclable'),
        ('3', 'Standard Cardboard / Recycled'),
        ('4', 'Fully Biodegradable'),
        ('5', 'Zero-Packaging / Circular'),
    ], string='Packaging Eco-Rating', default='3')
    
    delivery_reliability = fields.Float(string='On-Time Delivery Rate (%)', default=95.0)
    has_iso_14001 = fields.Boolean(string='ISO 14001 Certified', default=False)
    waste_generation = fields.Float(string='Waste Generation (kg/ton produced)', default=50.0)
    renewable_energy_ratio = fields.Float(string='Renewable Energy Usage (%)', default=20.0)
    
    supplier_rank = fields.Integer(string='EcoSphere Rank', compute='_compute_supplier_rank', store=True)

    @api.depends('carbon_footprint', 'transport_distance', 'packaging_eco_rating', 'has_iso_14001', 'renewable_energy_ratio', 'waste_generation')
    def _compute_esg_score(self):
        for record in self:
            # Score formula: 100 - penalties
            carbon_penalty = min(record.carbon_footprint / 15.0, 30.0) # max 30 pts penalty for carbon
            distance_penalty = min(record.transport_distance / 40.0, 15.0) # max 15 pts penalty for distance
            packaging_score = int(record.packaging_eco_rating or 3) * 5.0 # max 25 pts
            cert_bonus = 15.0 if record.has_iso_14001 else 0.0
            renewable_bonus = min(record.renewable_energy_ratio * 0.15, 15.0) # max 15 pts
            waste_penalty = min(record.waste_generation / 10.0, 10.0) # max 10 pts penalty

            score = 100.0 - carbon_penalty - distance_penalty + packaging_score + cert_bonus + renewable_bonus - waste_penalty
            record.esg_score = max(min(score, 100.0), 0.0)

    @api.depends('esg_score')
    def _compute_supplier_rank(self):
        # Odoo ranking based on sorted score
        all_records = self.search([], order='esg_score desc')
        rank = 1
        for rec in all_records:
            rec.supplier_rank = rank
            rank += 1
