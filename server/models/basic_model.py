from peewee import *

db = MySQLDatabase(
    host='localhost',
    user='root',
    password='11111111',
    database='todosy'
)

class BaseModel(Model):
    class Meta:
        database = db
