import server.db
from flask import Flask, render_template, request

app = Flask(__name__, template_folder='./src/templates')

import server.controller.registrationController
import server.controller.loginController
app.run(debug=True)