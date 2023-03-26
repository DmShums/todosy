from flask import Blueprint, render_template, url_for, request, jsonify
from server.models.task import Task
from server.models.group import Group
from playhouse.shortcuts import model_to_dict, dict_to_model
from datetime import datetime, timedelta, date
from pprint import pprint
import json

calendar_bp = Blueprint('index', __name__)

@calendar_bp.route('/', methods = ['GET'])
@calendar_bp.route('/calendar', methods = ['GET'])
def calendar():
    return render_template('index.html')

@calendar_bp.route('/calendar/task/create', methods = ['POST'])
def calendar_task_create():
    data = request.json

    title = data.get("title")
    group_id = data.get("group_id")
    start = data.get("start")
    is_work = data.get("is_work")
    end_time = data.get("end_time")
    end_date = data.get("end_date")

    overall = None
    if start and end_time:
        start_time = timedelta(hours=int(start.split(':')[0]), minutes=int(start.split(':')[1]))
        end_time = timedelta(hours=int(end_time.split(':')[0]), minutes=int(end_time.split(':')[1]))
        overall = end_time - start_time
        overall = overall.seconds

    task = Task.create(title = title,
                description = '123',
                owner = 1,
                is_work = is_work,
                group = group_id,
                start_date = start,
                end_date = end_date,
                end_time = end_time,
                overall = overall)

    result = model_to_dict(task)

    return json.dumps(result, default=str)

@calendar_bp.route('/calendar/group/create', methods = ['POST'])
def calendar_group_create():
    data = request.json

    title = data.get("title")
    color = data.get("color")
    owner = data.get("owner")

    group = Group(title = title,
                  color = color,
                  owner = owner)

    result = model_to_dict(group)
    return json.dumps(result, default=str)

@calendar_bp.route('/calendar/task/get/<date_day>', methods = ['GET'])
def get_tasks(date_day : str):
    if date_day :
        # date_format = datetime.strptime(date_day, '%Y-%m-%d')
        query = Task.select().where(str(Task.end_date) == date_day).execute()
        print([model_to_dict(x) for x in query])
