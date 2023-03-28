"""Register module"""
# import server.db
import json

from peewee import IntegrityError
from flask import render_template, request, url_for, Blueprint

start_bp = Blueprint('start', __name__)

@start_bp.route('/', methods=['GET'])
def register():
    return render_template('index.html')
