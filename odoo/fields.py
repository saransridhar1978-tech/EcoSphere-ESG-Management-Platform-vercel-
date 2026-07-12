# -*- coding: utf-8 -*-
import datetime

class Field(object):
    def __init__(self, *args, **kwargs):
        self.string = kwargs.get('string', None)
        for k, v in kwargs.items():
            setattr(self, k, v)

class Char(Field):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if args and not self.string:
            self.string = args[0]

class Selection(Field):
    def __init__(self, selection=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selection = selection
        if args and not self.string:
            self.string = args[0]

class Float(Field):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if args and not self.string:
            self.string = args[0]

class Boolean(Field):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if args and not self.string:
            self.string = args[0]

class Integer(Field):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if args and not self.string:
            self.string = args[0]

class Text(Field):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if args and not self.string:
            self.string = args[0]

class Date(Field):
    @staticmethod
    def context_today(*args, **kwargs):
        return datetime.date.today()

class Datetime(Field):
    @staticmethod
    def now(*args, **kwargs):
        return datetime.datetime.now()

class Many2one(Field):
    def __init__(self, comodel_name=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.comodel_name = comodel_name
        if args and not self.string:
            self.string = args[0]

class One2many(Field):
    def __init__(self, comodel_name=None, inverse_name=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.comodel_name = comodel_name
        self.inverse_name = inverse_name
        if args and not self.string:
            self.string = args[0]

class Many2many(Field):
    def __init__(self, comodel_name=None, relation=None, column1=None, column2=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.comodel_name = comodel_name
        self.relation = relation
        self.column1 = column1
        self.column2 = column2
        if args and not self.string:
            self.string = args[0]
