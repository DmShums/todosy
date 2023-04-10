""" Basic model and db connection """
import os
from peewee import MySQLDatabase, Model
from dotenv import load_dotenv
from playhouse.shortcuts import ReconnectMixin

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))


class DB(ReconnectMixin, MySQLDatabase):
    pass


db = DB(
    host=os.environ.get("DB_HOST"),
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    database=os.environ.get("DB_DATABASE")
)


class BaseModel(Model):
    """ Base model """

    class Meta:
        """ IDK what is it for, but it's in every tutorial """
        database = db

    @classmethod
    def get_or_none(cls, *query, **kwargs):
        try:
            return cls.get(*query)
        except cls.DoesNotExist:
            return None
