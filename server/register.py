"""Register module"""
import json
import os
from datetime import datetime, timedelta

import jwt
from peewee import IntegrityError
from flask import render_template, request, url_for, Blueprint

from server.models.task import Task
from server.models.user import User
from server.utils import hash_password

register_bp = Blueprint('register', __name__)


@register_bp.route('/register', methods=['POST'])
def register_post():
    body = request.json

    user_nickname = body.get("nickname")
    user_email = body.get("email")
    user_password = hash_password(body.get("password"))

    try:
        # save data to database
        user = User.create(
            nickname=user_nickname,
            email=user_email,
            password=user_password
        )

        Task.create(
            title="Example of task",
            owner=user.id,
            is_work=False,
            group=2,
            start_time="19:00",
            end_date=datetime.now() - timedelta(days=1),
            end_time="19:30",
            overall=1800
        )

        Task.create(
            title="Left-click to create task",
            owner=user.id,
            is_work=True,
            group=1,
            start_time="20:00",
            end_date=datetime.now() - timedelta(days=1),
            end_time="21:00",
            overall=3600
        )

        Task.create(
            title="Right-click to create group",
            owner=user.id,
            is_work=True,
            group=1,
            start_time="20:30",
            end_date=datetime.now() + timedelta(days=1),
            end_time="21:30",
            overall=3600
        )
    except IntegrityError:
        return json.dumps({'message': "User with the same email already exist."}), 409
    except:
        return json.dumps({'message': "Something went wrong. Try again later"}), 500

    user_jwt = jwt.encode({"id": user.id}, os.environ.get("SECRET"), algorithm="HS256")
    return json.dumps({"user": user_jwt}, default=str), 201


@register_bp.route('/register', methods=['GET'])
def register():
    return render_template('register.html')
