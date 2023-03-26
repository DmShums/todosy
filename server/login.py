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
import json

app = Flask(__name__, template_folder='../src/templates', static_folder='../src/static')


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == "POST":
        user_email = request.form.get("email")
        user_password = hash_password(request.form.get("password"))

        try:
            user = User.get(User.email == user_email)
            print(user.password)
            # server.models.user.UserDoesNotExist: <Model: User> instance matching query does not exist:
        except Exception:
            return "there is no use with this email"

        return json.dumps(user, default=str)

    if request.method == "GET":
        return render_template('login.html')


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