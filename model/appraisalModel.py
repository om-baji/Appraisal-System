from connection.mongoConnect import client
from bson import ObjectId
from datetime import datetime

# Get the database
db = client["appraisal_db"]

# Get the collection
collection = db["appraisals"]

# Helper function to serialize MongoDB document
def appraisal_serializer(appraisal) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    return {
        "id": str(appraisal["_id"]),
        "employee_id": appraisal.get("employee_id"),
        "employee_name": appraisal.get("employee_name"),
        "reviewer_id": appraisal.get("reviewer_id"),
        "reviewer_name": appraisal.get("reviewer_name"),
        "appraisal_period": appraisal.get("appraisal_period"),
        "performance_rating": appraisal.get("performance_rating"),
        "goals_achieved": appraisal.get("goals_achieved", []),
        "strengths": appraisal.get("strengths", ""),
        "areas_for_improvement": appraisal.get("areas_for_improvement", ""),
        "comments": appraisal.get("comments", ""),
        "status": appraisal.get("status", "draft"),  # draft, submitted, approved
        "created_at": appraisal.get("created_at"),
        "updated_at": appraisal.get("updated_at")
    }

# Example appraisal schema (for reference, MongoDB is schemaless)
"""
{
    "_id": ObjectId,
    "employee_id": str,
    "employee_name": str,
    "reviewer_id": str,
    "reviewer_name": str,
    "appraisal_period": str,  # e.g., "Q1 2026", "2026"
    "performance_rating": int,  # 1-5 scale
    "goals_achieved": [str],  # List of achieved goals
    "strengths": str,
    "areas_for_improvement": str,
    "comments": str,
    "status": str,  # draft, submitted, approved
    "created_at": datetime,
    "updated_at": datetime
}
"""
