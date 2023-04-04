import os
import platform

has_venv = os.path.exists('./venv/')


def main():
    if not has_venv:
        print("Creating venv...")
        os.system("python3 -m venv venv")

        print("Activating venv...")
        # Darwin == Mac
        if platform.system() == 'Darwin':
            os.system("source venv/bin/activate")
        else:
            os.system("venv/Scripts/activate")

        print("Installing requirements...")
        os.system("pip3 install -r requirements.txt")

        # run current file again but with installed venv
        os.system(f"python3 {os.path.basename(__file__)}")
    else:
        import pymysql
        from dotenv import load_dotenv
        from server.models.group import Group
        from server.models.task import Task
        from server.models.user import User
        from server.models.basic_model import db

        load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

        print("Creating DATABASE todosy")
        conn = pymysql.connect(
            host=os.environ.get("DB_HOST"),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASSWORD")
        )
        conn.cursor().execute('CREATE DATABASE todosy')
        conn.close()

        print("Creating TABLES user, group, task")
        db.connect()
        db.create_tables([User, Group, Task])

        print("Creating default user and groups (work and leisure)")
        user = User.create(email="test@gmail.com", name="name", surname="surname", password="super mega pass")
        Group.create(title="Work", color="#412344", owner=user.id)
        Group.create(title="Leisure", color="#2D3923", owner=user.id)


if __name__ == "__main__":
    main()
