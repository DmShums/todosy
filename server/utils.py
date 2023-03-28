import hashlib


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
