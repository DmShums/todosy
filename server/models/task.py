""" Task model module """
from peewee import CharField, ForeignKeyField, TextField, BooleanField, DateTimeField, DateField, TimeField, IntegerField

from server.models.basic_model import BaseModel
from server.models.group import Group
from server.models.user import User

class Task(BaseModel):
    """ Task Model """
    title = CharField()
    description = TextField()
    owner = ForeignKeyField(User)
    is_work = BooleanField()
    group = ForeignKeyField(Group)
    start_date = DateTimeField()
    end_date = DateField()
    end_time = TimeField()
    overall = IntegerField()
