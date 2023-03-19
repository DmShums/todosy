# import sys
# sys.path.append("..")
from server.models.group import Group
from server.models.user import User
from main import app
from flask import render_template, request

@app.route('/register', methods =['GET', 'POST'])
def register():
    mesage = ''
    if request.method == 'POST' and 'name' in request.form and\
         'surname' in request.form and 'password' in request.form and 'email' in request.form :
        user_name = request.form['name']
        user_surname = request.form['surname']
        user_password = request.form['password']
        user_email = request.form['email']
        query = User.select().where(User.email == user_email)
        print(query)
        if not query.exists():
            user = User.create(email=user_email, name=user_name,\
                                surname=user_surname, password=user_password)
            group = Group.create(title="aaa", color="red", owner=user.id)
            mesage = 'You have successfully registered !'
        else:
            mesage = 'Email already in use!'
    return render_template('register.html', message = mesage)
