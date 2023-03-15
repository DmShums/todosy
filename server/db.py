""" DB connection """
from models.group import Group
from models.task import Task
from models.user import User
from models.basic_model import db


db.connect()
db.create_tables([User, Group, Task])

user = User.create(email="v1@ucu.ua", name="name", surname="surname", password="123")
group = Group.create(title="aaa", color="red", owner=user)
