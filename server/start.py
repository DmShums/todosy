"""Register module"""
from flask import render_template, url_for, Blueprint

start_bp = Blueprint('start', __name__)


@start_bp.route('/', methods=['GET'])
def register():
    return render_template('index.html')
