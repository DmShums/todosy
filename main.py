""" Main module to start """
from flask import Flask, url_for
import server.db

from server.calendar import calendar_bp
from server.login import login_bp
from server.register import register_bp
from server.start import start_bp
from server.moodle import moodle_bp
from flask_cors import CORS

app = Flask(__name__, template_folder='./client', static_folder='./client')
CORS(app)

app.register_blueprint(start_bp)
app.register_blueprint(register_bp)
app.register_blueprint(login_bp)
app.register_blueprint(calendar_bp)
app.register_blueprint(moodle_bp)


if __name__ == "__main__":
    app.run(debug=True, port=5050)
