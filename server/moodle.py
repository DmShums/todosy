from flask import render_template, request, Blueprint, url_for
from flask_cors import cross_origin

moodle_bp = Blueprint('moodle', __name__)

@moodle_bp.route('/moodle/parse', methods = ['POST'])
@cross_origin()
def get_data():
    req_json = request.json

    html = req_json['text']
    print(html)
    with open('html_page.html', 'w', encoding="utf-8") as file:
        file.write(html)
