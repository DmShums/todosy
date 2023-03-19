""" Main module to start """
from flask import Flask
import server.db

from server.calendar import calendar_bp

app = Flask(__name__, template_folder='./src/templates')

app.register_blueprint(calendar_bp)

if __name__ == "__main__":
    app.run()
