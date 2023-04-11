import datetime

from flask import request, Blueprint
from flask_cors import cross_origin
from bs4 import BeautifulSoup
import json

from server.models.task import Task
from server.utils import get_user

moodle_bp = Blueprint('moodle', __name__)

URK_MONTHS = ['січень', 'лютий', 'березень', 'квітень', 'травень', 'червень', 'липень', 'серпень', 'вересень', 'жовтень', 'листопад', 'грудень']
ENG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


@moodle_bp.route('/moodle/parse', methods=['POST'])
@cross_origin()
def get_data():
    try:
        owner = get_user(request)
    except (ValueError, IndexError, AttributeError) as e:
        return json.dumps({"message": "Authorization required"}), 403

    req_json = request.json

    html = req_json['text']
    soup = BeautifulSoup(html, 'html.parser')
    container = soup.select_one("#page-container-1")

    dates_elements = container.select("h5.h6.mt-3.mb-0")
    dates = []

    for date_element in dates_elements:
        date_text = date_element.text.split(', ')[1]
        day, month, year = date_text.split(' ')
        month = URK_MONTHS.index(month) if month in URK_MONTHS else ENG_MONTHS.index(month)
        month += 1

        dates.append((int(day), month, int(year)))

    deadline_groups = container.select("h5.h6.mt-3.mb-0 ~ div")
    deadlines = []

    for deadline_group in deadline_groups:
        deadlines_wrapper = deadline_group.select(".list-group-item")

        day_deadlines = []

        for deadline in deadlines_wrapper:
            title = deadline.select_one('.event-name').text.strip()

            for ending in (' закрито', ' спливає', ' is due', ' closed'):
                if title.endswith(ending):
                    title = title[:-len(ending)]

            for staring in ('Строк ',):
                if title.startswith(staring):
                    title = title[len(staring):]

            subject = deadline.select_one('small.text-muted.text-truncate.mb-0').text.strip()
            end_time = deadline.select_one('small.text-right.text-nowrap.ml-1').text.strip()
            item_id = deadline.select_one('.event-name-container a').get('href').split('=')[-1]

            day_deadlines.append((title, subject, end_time, item_id))

        deadlines.append(day_deadlines)

    for (day, month, year), day_deadlines in zip(dates, deadlines):
        date = datetime.datetime(year, month, day)

        for (title, subject, end_time, moodle_id) in day_deadlines:
            query = Task.select().where((Task.owner == owner) & (Task.moodle == moodle_id))

            if query.exists():
                continue

            Task.create(
                title=f"{title}. {subject}",
                owner=owner,
                is_work=True,
                group=3,
                start_time=end_time,
                end_date=date,
                end_time=end_time,
                overall=0,
                moodle=moodle_id
            )

    return json.dumps({"message": "good"}), 201
