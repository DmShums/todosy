"""
Login module.
"""
import json

from flask import render_template, request, Blueprint, url_for

from server.models.user import User
from server.utils import hash_password

login_bp = Blueprint('login', __name__)


@login_bp.route('/login', methods=['POST'])
def login_post():
    body = request.json

    user_email = body.get("email")
    user_password = hash_password(body.get("password"))

    try:
        user = User.get(User.email == user_email)

        if user_password == user.password:
            return json.dumps({"user": user}, default=str), 200

        return json.dumps({"message": "Wrong password"}), 403
    except Exception:
        return json.dumps({"message": "there is no user with this email"}), 404


@login_bp.route('/login', methods=['GET'])
def login():
    return render_template('login.html')
