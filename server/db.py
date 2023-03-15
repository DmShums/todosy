""" DB connection """
from server.models.group import Group
from server.models.task import Task
from server.models.user import User
from server.models.basic_model import db

db.connect()
db.create_tables([User, Group, Task])

# user = User.create(email="v1@ucu.ua", name="name", surname="surname", password="123")
# group = Group.create(title="aaa", color="red", owner=user)
