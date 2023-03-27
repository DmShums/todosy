"""Register module"""
# import server.db
import json

from peewee import IntegrityError
from flask import render_template, request, url_for, Blueprint

from server.models.user import User
from server.utils import hash_password

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register_post():
    body = request.json

    user_nickname = body.get("nickname")
    user_email = body.get("email")
    user_password = hash_password(body.get("password"))

    # save data to database
    try:
        user = User.create(
            nickname = user_nickname,
            email = user_email,
            password = user_password
        )
    except IntegrityError:
        return json.dumps({'message': "User with the same email already exist."}), 409

    return json.dumps({'message':'Successfuly registered','user' : user})

@register_bp.route('/register', methods=['GET'])
def register():
    return render_template('register.html')
