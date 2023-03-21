from flask import Blueprint, render_template, url_for, request, flash, jsonify
from server.models.task import Task

calendar_bp = Blueprint('index', __name__)

@calendar_bp.route('/')
@calendar_bp.route('/calendar')
def calendar(methods = ['GET', 'POST']):
    if request.method == 'POST':
        title = request.form.get("title")
        group_id = request.form.get("group_id")
        start = request.form.get("start")
        is_work = request.form.get("is_work")
        end_time = request.form.get("end_time")
        end_date = request.form.get("end_date")

        overall = None
        if start and end_time:
            overall = end_time - start
        task = Task.create(title = title,
                           description = None,
                           owner = None,
                           is_work = is_work,
                           group = group_id,
                           start_dare = start,
                           end_date = end_date,
                           end_time = end_time,
                           overall = overall)
        return jsonify(task)
    return render_template('index.html')
