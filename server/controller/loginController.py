# import sys
# sys.path.append("..")
from server.models.user import User
from main import app
from flask import render_template, request

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
    return render_template('login.html', message = mesage)

# app.run(debug=True)