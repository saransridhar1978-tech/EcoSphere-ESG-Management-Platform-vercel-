# -*- coding: utf-8 -*-

def depends(*args, **kwargs):
    def decorator(func):
        return func
    return decorator

def model(func):
    return func

def multi(func):
    return func

def constrains(*args, **kwargs):
    def decorator(func):
        return func
    return decorator

def onchange(*args, **kwargs):
    def decorator(func):
        return func
    return decorator
