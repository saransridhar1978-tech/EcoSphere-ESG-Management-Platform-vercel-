# -*- coding: utf-8 -*-

class Controller(object):
    pass

def route(*args, **kwargs):
    def decorator(func):
        return func
    return decorator

class Request(object):
    @property
    def env(self):
        from .models import Model
        return Model().env

request = Request()
