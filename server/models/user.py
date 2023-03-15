""" User model module """
from peewee import CharField
from server.models.basic_model import BaseModel

class User(BaseModel):
    """ User Model """
    email = CharField(unique=True)
    name = CharField()
    surname = CharField()
    password = CharField()
