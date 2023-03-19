from flask import Blueprint, render_template, url_for

calendar_bp = Blueprint('index', __name__)

@calendar_bp.route('/')
@calendar_bp.route('/calendar')
def calendar():
    return render_template('index.html')
