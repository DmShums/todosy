"""Register module"""
# import server.db
import peewee
from flask import Flask, render_template, request, url_for, jsonify, Blueprint
from server.models.user import User
from playhouse.shortcuts import model_to_dict
import hashlib
import json

register_bp = Blueprint('register', __name__)
# app = Flask(__name__, template_folder='../src/templates', static_folder='../src/')

@register_bp.route('/', methods=['POST', 'GET'])
@register_bp.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == "POST":
        user_nickname = request.form.get("nickname")
        user_email = request.form.get("email")
        user_password = hash_password(request.form.get("password"))

        # save data to database
        try:
            user = User.create(
                nickname = user_nickname,
                email = user_email,
                password = user_password
            )
        except peewee.IntegrityError:
            # add alert
            return render_template('register.html')

        user = model_to_dict(user)

        return json.dumps(user, default=str)

    if request.method == "GET":
        return render_template('register.html')


def hash_password(pswrd):
    # Declaring Password
    password = pswrd
    # adding 5gz as password
    salt = "5gz"
    # Adding salt at the last of the password
    dataBase_password = password+salt
    # Encoding the password
    hashed = hashlib.md5(dataBase_password.encode())

    # Printing the Hash
    return hashed.hexdigest()
