from flask import Flask
from flask import render_template
from flask import request

import shelve
import json

db = shelve.open("db")
app = Flask(__name__)

@app.route('/a/')
def a():
    return render_template('a.html')

@app.route('/b/',methods=['GET','POST'])
def b():

    if request.method=="GET":
        return render_template('c.html')
    else:
        print request.form["user"]
        user = json.loads(request.form.get('user'))
        count=db.get(user["email"],0)
        count+=1
        db[user["email"]]=count
        return render_template('b.html', user=user, count=count)


if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0')
