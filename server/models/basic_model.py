""" Basic model and db connection """
import os
from peewee import MySQLDatabase, Model
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

db = MySQLDatabase(
    host=os.environ.get("DB_HOST"),
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database=os.environ.get("DB_DATABASE")
)

class BaseModel(Model):
    """ Base model """
    class Meta:
        """ idk what is it for, but it's in every tutorial """
        database = db
