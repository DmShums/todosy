from flask import Blueprint, render_template, url_for, request, jsonify
from server.models.task import Task
from playhouse.shortcuts import model_to_dict, dict_to_model
from datetime import datetime, timedelta, date
from pprint import pprint
import json

calendar_bp = Blueprint('index', __name__)

@calendar_bp.route('/', methods = ['GET'])
@calendar_bp.route('/calendar', methods = ['GET'])
def calendar():
    return render_template('index.html')

@calendar_bp.route('/calendar/create', methods = ['POST'])
def calendar_create():
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


@calendar_bp.route('/calendar/get', methods=["GET"])
def calendar_get():
    data = request.args

    id = data.get('id')
    week = data.get('week')

    dt = datetime.fromtimestamp(int(week) / 1000)
    start = dt - timedelta(days=dt.weekday())
    end = start + timedelta(days=7)

    tasks = Task\
            .select(Task.title, Task.description, Task.group, Task.start_date, Task.end_date)\
            .where(start <= Task.end_date <= end and Task.owner == 1)\
            .order_by(Task.end_date)

    pprint({'rows':[model_to_dict(c) for c in tasks]})

    result = ([], [], [], [], [], [], [])

    for task in tasks:
        result[task.end_date.weekday()].append(model_to_dict(task))

    return json.dumps(result, default=str)

# title = CharField()
#     description = TextField()
#     owner = ForeignKeyField(User)
#     is_work = BooleanField()
#     group = ForeignKeyField(Group)
#     start_date = DateTimeField()
#     end_date = DateField()
#     end_time = TimeField()
#     overall = IntegerField()