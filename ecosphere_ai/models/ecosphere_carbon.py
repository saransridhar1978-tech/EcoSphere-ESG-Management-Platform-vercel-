# -*- coding: utf-8 -*-
# pyrefly: ignore [missing-import]
from odoo import models, fields, api

class EcoSphereCarbonEmission(models.Model):
    _name = 'ecosphere.carbon.emission'
    _description = 'EcoSphere Carbon Emission Record'
    _order = 'date desc'

    name = fields.Char(string='Source Name', required=True)
    date = fields.Date(string='Calculation Date', default=fields.Date.context_today)
    source_type = fields.Selection([
        ('purchasing', 'Purchasing'),
        ('manufacturing', 'Manufacturing'),
        ('inventory', 'Inventory'),
        ('fleet', 'Fleet/Logistics'),
        ('travel', 'Business Travel'),
        ('electricity', 'Electricity'),
        ('water', 'Water Usage'),
        ('waste', 'Waste Disposal'),
    ], string='Emission Source Type', required=True, default='manufacturing')
    
    quantity = fields.Float(string='Input Quantity', required=True, help='e.g., kWh of electricity, Liters of fuel, tonnes of waste')
    uom_id = fields.Many2one('uom.uom', string='Unit of Measure')
    uom_name = fields.Char(related='uom_id.name', string='UoM Name')
    
    emission_factor = fields.Float(string='Emission Factor (kg CO2e / unit)', required=True, default=1.0)
    total_co2e = fields.Float(string='Total CO2e (kg)', compute='_compute_total_co2e', store=True)
    
    department_id = fields.Many2one('hr.department', string='Department')
    company_id = fields.Many2one('res.company', string='Company', default=lambda self: self.env.company)

    @api.depends('quantity', 'emission_factor')
    def _compute_total_co2e(self):
        for record in self:
            record.total_co2e = record.quantity * record.emission_factor

class EcoSphereEmissionFactor(models.Model):
    _name = 'ecosphere.emission.factor'
    _description = 'EcoSphere Emission Factor Configuration'

    name = fields.Char(string='Category', required=True)
    source_type = fields.Selection([
        ('purchasing', 'Purchasing'),
        ('manufacturing', 'Manufacturing'),
        ('inventory', 'Inventory'),
        ('fleet', 'Fleet/Logistics'),
        ('travel', 'Business Travel'),
        ('electricity', 'Electricity'),
        ('water', 'Water Usage'),
        ('waste', 'Waste Disposal'),
    ], string='Source Type', required=True)
    
    factor = fields.Float(string='CO2e Factor (kg per Unit)', required=True, default=0.0)
    unit_label = fields.Char(string='Unit Label', required=True, placeholder='e.g. kWh, Liter, Tonne')
    active = fields.Boolean(string='Active', default=True)
