"""Register module"""
# import server.db
from flask import Flask, render_template, request, url_for

app = Flask(__name__, template_folder='../src/templates', static_folder='../src/static')


@app.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == "POST":
        nickname = request.form.get("nickname")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")

        # save data to database
        # user = User(

        # )

        print(nickname)
    return render_template('register.html')



if __name__ == "__main__":
    app.run(debug=True)

app.run(debug=True)