from flask import Flask, request 
from mongoConnect import collection, client

app = Flask(__name__) 

@app.get('/')
def index(): 
    return "Service is up and running" 


@app.post('/addUser')
def addUser(): 
    body = request.get_json()
    try: 
        username = body['user']
        if not username: 
                return "No usernamme", 400 
        query = { "name": username }
        collection.insert_one(query)
        return "Added to the Database", 200 
    except Exception as e : 
        return e , 400

@app.get("/getUsers")
def getUsers(): 
    try: 
        employees = list(collection.find({}, {"name": True, "_id": False }))
        return employees, 200 
    except Exception as e: 
        return e, 400 


if __name__ == "__main__": 
    app.run(port=5000, host="0.0.0.0", debug=True)