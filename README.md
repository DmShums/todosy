# todosy

## Installation and starting for development

## Back-End

Download [MySQL](https://www.mysql.com/) and install it. Start GUI or Terminal and create _todosy_ database. Here's a command for it to use:

```sql
CREATE DATABASE todosy;
```

Then open this folder in Terminal and run

```cmd
python3 -m venv venv
source venv/bin/activate

pip3 install -r requirements.txt
```

Create in the root of project and change information in _.env_ file. It looks like:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=11111111
DB_DATABASE=todosy
SECRET="UCU Velykden snow"
```

And start project

```cmd
python3 main.py
```

### Front-end

Go to [Node.js](https://nodejs.org/en/) and download latest LTS version. Run and install it.
After that open current folder in terminal and write:

```cmd
npm install
```

After that all dependencies for Front-End will installed.

To run Front-end run in console the following command

```cmd
npm start
```

and start coding.
