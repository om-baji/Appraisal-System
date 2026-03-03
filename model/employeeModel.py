from connection.mongoConnect import client 

db = client["employee_db"]
collection = db["employees"]
# Counter collection for auto-incrementing employee_id
counters_collection = db["counters"]

def get_next_employee_id():
    """Generate next auto-incremented employee_id"""
    result = counters_collection.find_one_and_update(
        {"_id": "employee_id"},
        {"$inc": {"sequence_value": 1}},
        upsert=True,
        return_document=True
    )
    
    if result is None:
        # First time initialization
        counters_collection.insert_one({"_id": "employee_id", "sequence_value": 1})
        return "EMP001"
    
    # Format as EMP001, EMP002, etc.
    return f"EMP{result['sequence_value']:03d}"

def employee_serialiser(employee) -> dict: 
    return {
        "id": str(employee['_id']), 
        "employee_id": employee.get("employee_id"), 
        "employee_name": employee.get("employee_name"), 
        "email": employee.get("email")
        # Password is intentionally excluded for security
    }