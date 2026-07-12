# -*- coding: utf-8 -*-

class Model(object):
    _name = ''
    _description = ''
    _order = ''

    def __init__(self, *args, **kwargs):
        pass

    @property
    def env(self):
        class Company(object):
            def __init__(self):
                self.id = 1
                self.name = 'Mock Company'
        
        class Env(object):
            def __init__(self):
                self.company = Company()
        return Env()
