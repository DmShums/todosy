from flask import Blueprint, render_template, url_for, request, jsonify
from server.models.task import Task
from playhouse.shortcuts import model_to_dict, dict_to_model

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
        overall = end_time - start

    task = Task.create(title = title,
                        description = '123',
                        owner = 1,
                        is_work = is_work,
                        group = 1,
                        start_date = start,
                        end_date = end_date,
                        end_time = end_time,
                        overall = overall)

    result = model_to_dict(task)

    return jsonify(result)
