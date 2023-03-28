import json
from datetime import datetime, timedelta

from flask import Blueprint, render_template, url_for, request
from playhouse.shortcuts import model_to_dict

from server.models.task import Task
from server.models.group import Group
from pprint import pprint

calendar_bp = Blueprint('index', __name__)


@calendar_bp.route('/calendar', methods=['GET'])
def calendar():
    return render_template('calendar.html')


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

    task = Task.create(title=title,
                       description='123',
                       owner=owner,
                       is_work=is_work,
                       group=group_id,
                       start_time=start,
                       end_date=end_date,
                       end_time=end_time,
                       overall=overall)

    result = model_to_dict(task, recurse=False)

    return json.dumps(result, default=str), 201


@calendar_bp.route('/calendar/group/create', methods=['POST'])
def calendar_group_create():
    data = request.json

    title = data.get("title")
    color = data.get("color")
    owner = data.get("owner")

    group = Group.create(title=title,
                         color=color,
                         owner=owner)

    result = model_to_dict(group)
    return json.dumps(result, default=str), 201


@calendar_bp.route('/calendar/task/get/<date_day>', methods=['GET'])
def get_tasks(date_day: str):
    if date_day:
        try:
            owner = int(request.headers.get("Authorization").split(' ')[1])
        except (ValueError, IndexError, AttributeError):
            return json.dumps({"message": "Authorization required"}), 403

        date_format = datetime.strptime(date_day, '%Y-%m-%d')
        local_date = date_format - timedelta(days=7)

        while local_date.weekday() != 0:
            local_date += timedelta(days=1)

        query = []
        for week_date in (local_date + timedelta(days=x) for x in range(7)):
            day = []

            for task in Task.select().where((week_date == Task.end_date) & (Task.owner == owner)):
                if task:
                    task_dict = model_to_dict(task)
                    day.append({
                        'end_date': task_dict['end_date'],
                        'end_time': task_dict['end_time'],
                        'group': {
                            'color': task_dict['group']['color'],
                            'id': task_dict['group']['id'],
                        },
                        'is_work': task_dict['is_work'],
                        'title': task_dict['title'],
                        'overall': task_dict['overall'],
                        'start_time': task_dict['start_time'],
                    })

            query.append(day)

        return json.dumps(query, default=str), 200

    return json.dumps({"message": "Bad request"}), 400
