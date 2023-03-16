""" Group model module """
from peewee import CharField, ForeignKeyField

from server.models.basic_model import BaseModel
from server.models.user import User

class Group(BaseModel):
    """ Group Model """
    title = CharField()
    color = CharField()
    owner = ForeignKeyField(User)

var = "group.py"