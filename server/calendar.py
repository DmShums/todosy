import json
from datetime import datetime, timedelta

from flask import Blueprint, render_template, url_for, request
from playhouse.shortcuts import model_to_dict

from server.models.task import Task
from server.models.group import Group

from server.utils import get_user

calendar_bp = Blueprint('index', __name__)


@calendar_bp.route('/calendar', methods=['GET'])
def calendar():
    return render_template('calendar.html')


@calendar_bp.route('/calendar/task/create', methods=['POST'])
def calendar_task_create():
    try:
        owner = get_user(request)
    except (ValueError, IndexError, AttributeError):
        return json.dumps({"message": "Authorization required"}), 403

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

    task = Task.create(
        title=title,
        owner=owner,
        is_work=is_work,
        group=group_id,
        start_time=start,
        end_date=end_date,
        end_time=end_time,
        overall=overall
    )

    result = model_to_dict(task, exclude=[Task.group.owner, Task.owner])

    return json.dumps(result, default=str), 201


@calendar_bp.route('/calendar/task/delete/<task_id>', methods=['DELETE'])
def calendar_task_edit(task_id: int):
    try:
        owner = get_user(request)
    except (ValueError, IndexError, AttributeError):
        return json.dumps({"message": "Authorization required"}), 403

    try:
        Task.delete().where((task_id == Task.id) & (Task.owner == owner)).execute()
    except:
        return json.dumps({"message": "Task with such id not found"}), 404

    return json.dumps({"message": "Task successfully deleted"}), 200


@calendar_bp.route('/calendar/group/create', methods=['POST'])
def calendar_group_create():
    try:
        owner = get_user(request)
    except (ValueError, IndexError, AttributeError):
        return json.dumps({"message": "Authorization required"}), 403

    data = request.json

    title = data.get("title")
    color = data.get("color")

    group = Group.create(title=title,
                         color=color,
                         owner=owner)

    result = model_to_dict(group, exclude=[Group.owner.password])
    result['message'] = "Group was successfully created."

    return json.dumps(result, default=str), 201


@calendar_bp.route('/calendar/task/get/<date_day>', methods=['GET'])
def get_tasks(date_day: str):
    if date_day:
        try:
            owner = get_user(request)
        except (ValueError, IndexError, AttributeError):
            return json.dumps({"message": "Authorization required"}), 403

        date_format = datetime.strptime(date_day, '%Y-%m-%d')
        local_date = date_format
        if date_format.weekday() != 0:
            local_date = date_format - timedelta(days=7)

        while local_date.weekday() != 0:
            local_date += timedelta(days=1)

        query = []
        work_time = 1
        leisure_time = 1
        for week_date in (local_date + timedelta(days=x) for x in range(7)):
            day = []

            for task in Task.select().where((week_date == Task.end_date) & (Task.owner == owner)).order_by(
                    Task.end_time):
                if task:
                    task_dict = model_to_dict(task)
                    day.append({
                        'id': task_dict['id'],
                        'end_date': task_dict['end_date'],
                        'end_time': task_dict['end_time'],
                        'is_work': task_dict['is_work'],
                        'title': task_dict['title'],
                        'overall': task_dict['overall'],
                        'is_done': task_dict['is_done'],
                        'start_time': task_dict['start_time'],
                        'group': {
                            'color': task_dict['group']['color'],
                            'id': task_dict['group']['id'],
                        }
                    })

                    if task_dict['is_work']:
                        work_time += task_dict['overall']
                    else:
                        leisure_time += task_dict['overall']

            query.append(day)

        percentage = (1 + (work_time * 1.618 - leisure_time) /
                      (work_time * 1.618 + leisure_time)) / 2

        return json.dumps({'query': query, 'percentage': percentage}, default=str), 200

    return json.dumps({"message": "Bad request"}), 400


@calendar_bp.route('/calendar/day/get/<date_day>', methods=['GET'])
def day_summary(date_day: str):
    if date_day:
        try:
            owner = get_user(request)
        except (ValueError, IndexError, AttributeError):
            return json.dumps({"message": "Authorization required"}), 403

        date_format = datetime.strptime(date_day, '%Y-%m-%d')

        working_time = 0
        leisure_time = 0
        groups_time = {}
        for task in Task.select().where((date_format == Task.end_date) & (Task.owner == owner)):
            if task:
                task_dict = model_to_dict(task)
                if task_dict['is_work']:
                    working_time += task_dict['overall']
                else:
                    leisure_time += task_dict['overall']

                if task_dict['group']['title'] not in groups_time:
                    groups_time[task_dict['group']['title']] = {
                        'time': task_dict['overall'],
                        'color': task_dict['group']['color']
                    }
                else:
                    groups_time[task_dict['group']['title']]['time'] += task_dict['overall']

        spent_time = working_time + leisure_time
        respond = {
            "groups_time": groups_time,
            "spent_time": spent_time,
            "working_time": working_time,
            "leisure_time": leisure_time
        }
        return json.dumps(respond, default=str), 200

    return json.dumps({"message": "Bad request"}), 400


@calendar_bp.route('/calendar/groups/get', methods=['GET'])
def get_groups():
    try:
        owner = get_user(request)
    except (ValueError, IndexError, AttributeError):
        return json.dumps({"message": "Authorization required"}), 403

    query = []
    groups = []

    for group in Group.select().where((Group.owner_id == owner) | (Group.owner_id == 1)):
        if group:
            group_dict = model_to_dict(group)
            groups.append({
                'id': group_dict['id'],
                'title': group_dict['title'],
                'color': group_dict['color'],
            })

    query.append(groups)
    return json.dumps(query, default=str), 200


@calendar_bp.route('/calendar/task/edit/<task_id>', methods=['PATCH'])
def edit(task_id):
    try:
        owner = get_user(request)
        new_task_json = request.json

        overall = None
        start = new_task_json['start']
        end_time = new_task_json['end_time']

        if start and end_time:
            start_time = timedelta(hours=int(start.split(':')[0]), minutes=int(start.split(':')[1]))
            end_time = timedelta(hours=int(end_time.split(':')[0]), minutes=int(end_time.split(':')[1]))
            overall = end_time - start_time
            overall = overall.seconds

        task = Task.update({
            Task.title: new_task_json['title'],
            Task.is_work: new_task_json['is_work'],
            Task.group: new_task_json['group_id'],
            Task.start_time: new_task_json['start'],
            Task.end_time: new_task_json['end_time'],
            Task.overall: overall,
        }).where((Task.id == task_id) & (Task.owner == owner)).execute()

        return json.dumps(task, default=str), 201
    except (ValueError, IndexError, AttributeError):
        return json.dumps({"message": "Authorization required"}), 403


@calendar_bp.route('/calendar/task/done/<task_id>', methods=['PATCH'])
def done(task_id):
    try:
        owner = get_user(request)
    except (ValueError, IndexError, AttributeError) as e:
        return json.dumps({"message": "Authorization required"}), 403

    task_is_done = Task.select(Task.is_done).where((Task.id == task_id) & (Task.owner == owner)).get()
    is_done = not model_to_dict(task_is_done)['is_done']

    task = Task.update({Task.is_done: is_done}).where(
        (Task.id == task_id) & (Task.owner == owner)).execute()

    return json.dumps(task, default=str), 201
