from flask import Flask, request 
from model.Employee_mode import collection 

app = Flask(__name__) 

@app.get('/')
def index(): 
    return "Service is up and running" 


@app.post('/addUser')
def addUser(): 
    body = request.get_json()
    try: 
        if not body['username']: 
                return "No usernamme", 400 
        findUser = collection.find_one({"username": body['username']}, {"_id": 0})
        if findUser: 
            return "User already exist", 400
        query = { "username": body['username'], "password": body["password"] }
        collection.insert_one(query)
        return f"{body['username']} added to the Database", 200 
    except Exception as e : 
        return {str(e)} , 400

@app.get("/getUsers")
def getUsers(): 
    try: 
        employees = list(collection.find({}, {"_id": 0}))
        return employees, 200 
    except Exception as e: 
        return str(e), 400 


if __name__ == "__main__": 
    app.run(port=5000, host="0.0.0.0", debug=True)