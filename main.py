""" Main module to start """
from flask import Flask, url_for
import server.db

from server.calendar import calendar_bp

app = Flask(__name__, template_folder='./client', static_folder='./client')

app.register_blueprint(calendar_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5050)
