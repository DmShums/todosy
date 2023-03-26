'''
Login module.
'''
import server.db
from flask import Flask, render_template, request

app = Flask(__name__, template_folder='./src/templates')

# import server.db
from flask import Flask, render_template, request, url_for, jsonify
from server.models.user import User
from playhouse.shortcuts import model_to_dict
import hashlib

app = Flask(__name__, template_folder='../src/templates', static_folder='../src/static')


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == "POST":
        user_email = request.form.get("email")
        user_password = hash_password(request.form.get("password"))
        # save data to database

        user = model_to_dict(user)

        return jsonify(user)

    if request.method == "GET":
        return render_template('register.html')


def hash_password(pswrd):
    # Declaring Password
    password = pswrd
    # adding 5gz as password
    salt = "5gz"
    # Adding salt at the last of the password
    dataBase_password = password+salt
    # Encoding the password
    hashed = hashlib.md5(dataBase_password.encode())

    # Printing the Hash
    return hashed.hexdigest()


if __name__ == "__main__":
    app.run(debug=True)

app.run(debug=True)



#import server.controller.registrationController
#import server.controller.loginController
app.run(debug=True)