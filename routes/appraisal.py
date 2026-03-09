from datetime import datetime

from bson import ObjectId
from flask import Blueprint, jsonify, request, session

from model.appraisalModel import appraisal_serializer, collection
from model.employeeModel import collection as employee_collection

appraisal_bp = Blueprint("appraisal", __name__, url_prefix="/api/appraisals")


@appraisal_bp.post("/")
def create_appraisal():
    """Create a new appraisal - uses logged-in reviewer from session"""
    try:
        # Check if user is logged in
        if "employee_id" not in session:
            return jsonify(
                {"error": "You must be logged in to create an appraisal"}
            ), 401

        data = request.get_json()

        # Only employee_id and appraisal_period are required (reviewer comes from session)
        required_fields = ["employee_id", "appraisal_period"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Get employee details
        employee = employee_collection.find_one({"employee_id": data["employee_id"]})
        if not employee:
            return jsonify(
                {"error": f"Employee with ID {data['employee_id']} not found"}
            ), 404

        # Get reviewer details from session
        reviewer_id = session["employee_id"]
        reviewer_name = session["employee_name"]

        # Create appraisal with both employee and reviewer data
        appraisal = {
            "employee_id": data["employee_id"],
            "employee_name": employee["employee_name"],
            "reviewer_id": reviewer_id,
            "reviewer_name": reviewer_name,
            "appraisal_period": data["appraisal_period"],
            "performance_rating": data.get("performance_rating", 0),
            "goals_achieved": data.get("goals_achieved", []),
            "strengths": data.get("strengths", ""),
            "areas_for_improvement": data.get("areas_for_improvement", ""),
            "comments": data.get("comments", ""),
            "status": data.get("status", "draft"),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        result = collection.insert_one(appraisal)
        appraisal["_id"] = result.inserted_id

        return jsonify(
            {
                "message": "Appraisal created successfully",
                "appraisal": appraisal_serializer(appraisal),
            }
        ), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appraisal_bp.get("/")
def get_all_appraisals():
    """Get all appraisals with optional filters"""
    try:
        employee_id = request.args.get("employee_id")
        status = request.args.get("status")

        query = {}
        if employee_id:
            query["employee_id"] = employee_id
        if status:
            query["status"] = status

        # Fetch appraisals
        appraisals = list(collection.find(query))

        return jsonify(
            {
                "count": len(appraisals),
                "appraisals": [
                    appraisal_serializer(appraisal) for appraisal in appraisals
                ],
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appraisal_bp.get("/<appraisal_id>")
def get_appraisal(appraisal_id):
    """Get a specific appraisal by ID"""
    try:
        if not ObjectId.is_valid(appraisal_id):
            return jsonify({"error": "Invalid appraisal ID"}), 400

        appraisal = collection.find_one({"_id": ObjectId(appraisal_id)})

        if not appraisal:
            return jsonify({"error": "Appraisal not found"}), 404

        return jsonify(appraisal_serializer(appraisal)), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appraisal_bp.put("/<appraisal_id>")
def update_appraisal(appraisal_id):
    """Update an existing appraisal"""
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(appraisal_id):
            return jsonify({"error": "Invalid appraisal ID"}), 400

        data = request.get_json()

        # Prepare update data
        update_data = {"updated_at": datetime.now()}

        # Update allowed fields (employee_name and reviewer_name are auto-looked up)
        allowed_fields = [
            "appraisal_period",
            "performance_rating",
            "goals_achieved",
            "strengths",
            "areas_for_improvement",
            "comments",
            "status",
        ]

        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]

        # Update in database
        result = collection.update_one(
            {"_id": ObjectId(appraisal_id)}, {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Appraisal not found"}), 404

        # Fetch updated appraisal
        updated_appraisal = collection.find_one({"_id": ObjectId(appraisal_id)})

        return jsonify(
            {
                "message": "Appraisal updated successfully",
                "appraisal": appraisal_serializer(updated_appraisal),
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appraisal_bp.delete("/<appraisal_id>")
def delete_appraisal(appraisal_id):
    """Delete an appraisal"""
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(appraisal_id):
            return jsonify({"error": "Invalid appraisal ID"}), 400

        # Delete from database
        result = collection.delete_one({"_id": ObjectId(appraisal_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Appraisal not found"}), 404

        return jsonify({"message": "Appraisal deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appraisal_bp.patch("/<appraisal_id>/status")
def update_appraisal_status(appraisal_id):
    """Update only the status of an appraisal (e.g., draft -> submitted -> approved)"""
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(appraisal_id):
            return jsonify({"error": "Invalid appraisal ID"}), 400

        data = request.get_json()

        if "status" not in data:
            return jsonify({"error": "Status field is required"}), 400

        # Validate status value
        valid_statuses = ["draft", "submitted", "approved", "rejected"]
        if data["status"] not in valid_statuses:
            return jsonify(
                {"error": f"Invalid status. Must be one of: {valid_statuses}"}
            ), 400

        # Update status
        result = collection.update_one(
            {"_id": ObjectId(appraisal_id)},
            {"$set": {"status": data["status"], "updated_at": datetime.now()}},
        )

        if result.matched_count == 0:
            return jsonify({"error": "Appraisal not found"}), 404

        # Fetch updated appraisal
        updated_appraisal = collection.find_one({"_id": ObjectId(appraisal_id)})

        return jsonify(
            {
                "message": "Appraisal status updated successfully",
                "appraisal": appraisal_serializer(updated_appraisal),
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appraisal_bp.get("/my/appraisals")
def get_my_appraisals():
    """Get appraisals for the currently logged-in employee"""
    try:
        # Check if user is logged in
        if "employee_id" not in session:
            return jsonify({"error": "You must be logged in"}), 401

        employee_id = session["employee_id"]

        # Get appraisals where this employee is the subject
        appraisals = list(collection.find({"employee_id": employee_id}))

        return jsonify(
            {
                "count": len(appraisals),
                "employee_id": employee_id,
                "appraisals": [
                    appraisal_serializer(appraisal) for appraisal in appraisals
                ],
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appraisal_bp.get("/my/reviews")
def get_my_reviews():
    """Get appraisals where the logged-in user is the reviewer"""
    try:
        # Check if user is logged in
        if "employee_id" not in session:
            return jsonify({"error": "You must be logged in"}), 401

        reviewer_id = session["employee_id"]

        # Get appraisals where this employee is the reviewer
        appraisals = list(collection.find({"reviewer_id": reviewer_id}))

        return jsonify(
            {
                "count": len(appraisals),
                "reviewer_id": reviewer_id,
                "appraisals": [
                    appraisal_serializer(appraisal) for appraisal in appraisals
                ],
            }
        ), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
