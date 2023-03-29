import hashlib
import json
import os

import jwt


def hash_password(pswrd: str):
    # Declaring Password
    password = pswrd
    # adding 5gz as password
    salt = "5gz"
    # Adding salt at the last of the password
    database_password = password+salt
    # Encoding the password
    hashed = hashlib.md5(database_password.encode())

    # Printing the Hash
    return hashed.hexdigest()


def get_user(request):
    jwt_code = request.headers.get("Authorization").split(' ')[1]
    owner = jwt.decode(jwt_code, os.environ.get("SECRET"), algorithms=["HS256"])['id']

    return owner
