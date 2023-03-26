""" User model module """
from peewee import CharField
from server.models.basic_model import BaseModel

class User(BaseModel):
    """ User Model """
    nickname = CharField()
    email = CharField(unique=True)
    password = CharField()
