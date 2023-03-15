from peewee import *

db = MySQLDatabase(
    host='localhost',
    user='root',
    password='vashenko5398',
    database='todosy'
)

class BaseModel(Model):
    class Meta:
        database = db
