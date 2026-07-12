# -*- coding: utf-8 -*-
{
    'name': 'EcoSphere AI - ESG Intelligence System',
    'version': '1.0.0',
    'summary': 'Autonomous ESG Intelligence System (Monitor, Predict, Optimize & Automate ESG operations with AI)',
    'description': """
EcoSphere AI ESG Management Platform
====================================
An Autonomous ESG Intelligence System developed for Odoo to monitor, predict, optimize and automate Environmental, Social, and Governance operations using AI.
    """,
    'author': 'EcoSphere Team',
    'category': 'Sustainability',
    'depends': ['base', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'views/ecosphere_menus.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'ecosphere_ai/static/src/css/style.css',
            'ecosphere_ai/static/src/js/copilot.js',
            'ecosphere_ai/static/src/js/digital_twin.js',
            'ecosphere_ai/static/src/js/gamification.js',
            'ecosphere_ai/static/src/js/supplier_engine.js',
            'ecosphere_ai/static/src/js/dashboard.js',
            'ecosphere_ai/static/src/xml/dashboard.xml',
        ],
    },
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
