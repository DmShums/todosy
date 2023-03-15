""" Group model module """
from peewee import CharField, ForeignKeyField
from .basic_model import BaseModel
from .user import User

class Group(BaseModel):
    """ Group Model """
    title = CharField()
    color = CharField()
    owner = ForeignKeyField(User)
