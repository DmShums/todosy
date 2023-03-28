import json
from  datetime import datetime, timedelta

from flask import Blueprint, render_template, url_for, request
from playhouse.shortcuts import model_to_dict
from peewee import fn

from server.models.task import Task
from server.models.group import Group
from pprint import pprint

calendar_bp = Blueprint('index', __name__)

@calendar_bp.route('/calendar', methods=['GET'])
def calendar():
    return render_template('index.html')

@calendar_bp.route('/calendar/task/create', methods=['POST'])
def calendar_task_create():
    data = request.json

    title = data.get("title")
    group_id = data.get("group_id")
    start = data.get("start")
    is_work = data.get("is_work")
    end_time = data.get("end_time")
    end_date = data.get("end_date")
    owner = data.get("owner")

    overall = None
    if start and end_time:
        start_time = timedelta(hours=int(start.split(':')[0]), minutes=int(start.split(':')[1]))
        end_time = timedelta(hours=int(end_time.split(':')[0]), minutes=int(end_time.split(':')[1]))
        overall = end_time - start_time
        overall = overall.seconds

    print(owner)

    task = Task.create(title = title,
                description = '123',
                owner = owner,
                is_work = is_work,
                group = group_id,
                start_date = start,
                end_date = end_date,
                end_time = end_time,
                overall = overall)

    result =  model_to_dict(task, recurse=False)

    return json.dumps(result, default=str), 201

@calendar_bp.route('/calendar/group/create', methods = ['POST'])
def calendar_group_create():
    data = request.json

    title = data.get("title")
    color = data.get("color")
    owner = data.get("owner")

    group = Group.create(title = title,
                  color = color,
                  owner = owner)

    result = model_to_dict(group)
    return json.dumps(result, default=str), 201

@calendar_bp.route('/calendar/task/get/<date_day>', methods=['GET'])
def get_tasks(date_day : str):
    if date_day:
        owner = int(request.headers.get("Authorization").split(' ')[1])
        date_format = datetime.strptime(date_day, '%Y-%m-%d')
        local_date = date_format - timedelta(days=7)

        while local_date.weekday() != 0:
            local_date += timedelta(days=1)

        weekday_date_list = [local_date + timedelta(days=x) for x in range(7)]
        query = [[week_date, Task.select().where((week_date == Task.end_date ) & (Task.owner == owner)).get_or_none()]
                                                    for week_date in weekday_date_list]
        pprint([(x[0], model_to_dict(x[1])) for x in query if x[1]])
