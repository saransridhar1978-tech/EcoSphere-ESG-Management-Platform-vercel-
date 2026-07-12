# -*- coding: utf-8 -*-
# pyrefly: ignore [missing-import]
from odoo import models, fields, api

class EcoSphereEmployeeProfile(models.Model):
    _name = 'ecosphere.employee.profile'
    _description = 'EcoSphere Employee Gamification Profile'

    employee_id = fields.Many2one('hr.employee', string='Employee', required=True)
    name = fields.Char(related='employee_id.name', string='Employee Name', readonly=True)
    
    xp = fields.Integer(string='Experience Points (XP)', default=0)
    coins = fields.Integer(string='Eco Coins', default=0)
    
    level = fields.Integer(string='Current Level', compute='_compute_level', store=True)
    avatar_state = fields.Selection([
        ('seed', 'Seed'),
        ('plant', 'Plant'),
        ('tree', 'Tree'),
        ('forest_guardian', 'Forest Guardian'),
        ('earth_protector', 'Earth Protector'),
        ('planet_hero', 'Planet Hero'),
        ('global_sustainability_leader', 'Global Sustainability Leader'),
    ], string='Avatar Status', compute='_compute_avatar_state', store=True)

    badge_ids = fields.Many2many('gamification.badge', string='Badges')

    @api.depends('xp')
    def _compute_level(self):
        for record in self:
            # Level = (XP / 100) + 1
            record.level = int(record.xp / 100) + 1

    @api.depends('level')
    def _compute_avatar_state(self):
        for record in self:
            lvl = record.level
            if lvl <= 2:
                record.avatar_state = 'seed'
            elif lvl <= 5:
                record.avatar_state = 'plant'
            elif lvl <= 10:
                record.avatar_state = 'tree'
            elif lvl <= 15:
                record.avatar_state = 'forest_guardian'
            elif lvl <= 20:
                record.avatar_state = 'earth_protector'
            elif lvl <= 30:
                record.avatar_state = 'planet_hero'
            else:
                record.avatar_state = 'global_sustainability_leader'
