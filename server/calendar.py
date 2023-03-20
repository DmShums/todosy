from flask import Blueprint, render_template, url_for, request, flash
from server.models.task import Task

calendar_bp = Blueprint('index', __name__)

@calendar_bp.route('/')
@calendar_bp.route('/calendar')
def calendar(methods = ['GET', 'POST']):
    if request.method == 'POST':
        task_name = request.form.get("task_name")
        flash(task_name)
        group_name = request.form.get("group_name")
        start = request.form.get("start")
        deadline = request.form.get("deadline")
        task = Task.create(title = task_name,
                           description = None,
                           owner = None,
                           is_work = False,
                           group = group_name,
                           start_dare = start,
                           end_date = deadline,
                           end_time = None,
                           overall = None)
    return render_template('index.html')
