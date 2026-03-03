import bcrypt
from flask import Blueprint, request, jsonify, session
from connection.mongoConnect import client
from model.employeeModel import employee_serialiser, collection, get_next_employee_id 
from bson import ObjectId 

employee_bp = Blueprint("employee", __name__, url_prefix='/api/user') 
salt = bcrypt.gensalt()
@employee_bp.post('/signup')
def create_employee(): 
    try: 
        # Support both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        required_fields = ["employee_name", "password", "email"]
        for field in required_fields: 
            if field not in data: 
                return jsonify({"error": f"Missing required field: {field}"}), 400 
        user = collection.find_one({"email": data["email"]})
        if user : 
            return jsonify({"error": "Email already exist use different one"}), 400 
        hashed_password = bcrypt.hashpw(data["password"].encode('utf-8'), salt)
        employee = {
            "employee_id": get_next_employee_id(), 
            "employee_name": data["employee_name"], 
            "password": hashed_password,  
            "email": data["email"]
        }

        result = collection.insert_one(employee)
        employee["_id"] = result.inserted_id 

        return jsonify({
            "message": "User successfully added in the database", 
            "user": employee_serialiser(employee) 
        }), 201 
    except Exception as e: 
        return jsonify({"error": str(e)}), 500

@employee_bp.post('/login')
def login_user(): 
    try:
        # Support both JSON and form data
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        required_fields = ["email", "password"]
        for field in required_fields:
            if field not in data : 
                return jsonify({"error": f"Missing field required: {field}"}), 400 
        user = collection.find_one({"email": data["email"]}) 
        if not user :
            return jsonify({"error": "Wrong email or password"}), 401 
        if not bcrypt.checkpw(data["password"].encode('utf-8'), user["password"]):
            return jsonify({"error": "Wrong username or password"}), 401
        
        session['employee_name'] = user['employee_name']
        session['employee_id'] = user['employee_id'] 
        return jsonify({
            "message": "Login sucessfull", 
            "user": employee_serialiser(user) 
        }), 200 
    except Exception as e: 
        return jsonify({
            "message": "Something went wrong"
        }), 500 

@employee_bp.get('/')
def get_all_users(): 
    try: 
        employees = collection.find() 
        return jsonify({
            "message": "Fetched all users successfully", 
            "users": [ employee_serialiser(user) for user in employees ] 
        }), 200 
    except Exception as e : 
        return jsonify({
            "message": "Error in Fetching users", 
            "error": str(e)
        }), 500 

@employee_bp.get('/<employee_id>')
def get_user(employee_id):
    try: 
        user = collection.find_one({"employee_id": employee_id}) 
        return jsonify({
            "message": "Got user successfully", 
            "user": employee_serialiser(user)
        }), 200
    except Exception as e:
        return jsonify({
            "message": "Error in fetching user", 
            "error": str(e) 
        }), 500 

@employee_bp.post('/logout')
def logout_user():
    """Logout user and clear session"""
    try:
        session.clear()
        return jsonify({
            "message": "Logout successful"
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@employee_bp.get('/me')
def get_current_user():
    """Get currently logged in user from session"""
    try:
        if 'employee_id' not in session:
            return jsonify({
                "error": "Not logged in",
                "logged_in": False
            }), 401
        
        return jsonify({
            "logged_in": True,
            "employee_id": session['employee_id'],
            "employee_name": session['employee_name']
        }), 200
    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500 

