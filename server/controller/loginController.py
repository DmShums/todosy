import sys
sys.path.append("..")
from models.user import User
from models.basic_model import db
from controller.registrationController import app
import re
from flask import Flask, render_template, request

db.connect()
# app = Flask(__name__)
@app.route('/login', methods =['GET', 'POST'])
def login():
    mesage = ''
    if request.method == 'POST' and 'password' in request.form and 'email' in request.form :
        user_password = request.form['password']
        user_email = request.form['email']
        query = User.select().where(User.email == user_email)
        print(query)
        if query.exists():
            print('Success')
            mesage = 'You have successfully registered !'
        else:
            mesage = 'Wrong email or password!'
            print('Wrong email or password!')
    return render_template('login.html', mesage = mesage)

app.run(debug=True)