import json
from datetime import datetime

import pytest
from bson import ObjectId

from app import create_app
from connection.mongoConnect import client as mongo_client
from model.appraisalModel import collection as appraisal_collection
from model.employeeModel import collection as employee_collection


@pytest.fixture
def app():
    app = create_app()
    app.config.update(
        {
            "TESTING": True,
        }
    )
    return app


@pytest.fixture
def client(app):
    # Clear databases before each test
    employee_collection.delete_many({})
    appraisal_collection.delete_many({})

    # Clear counters
    db = mongo_client["employee_db"]
    counters_collection = db["counters"]
    counters_collection.delete_many({})

    yield app.test_client()

    # Cleanup after test
    employee_collection.delete_many({})
    appraisal_collection.delete_many({})
    counters_collection.delete_many({})


def test_health(client):
    """Test health check endpoint"""
    res = client.get("/health")
    assert res.status_code == 200


def test_openapi_spec(client):
    """Test OpenAPI spec endpoint"""
    res = client.get("/openapi.yaml")
    assert res.status_code == 200


def test_docs_endpoint(client):
    """Test docs endpoint"""
    res = client.get("/docs")
    assert res.status_code == 200


def test_signup_success(client):
    """Test successful user signup"""
    response = client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "User successfully added in the database"
    assert data["user"]["employee_name"] == "John Doe"
    assert data["user"]["email"] == "john@example.com"
    assert "password" not in data["user"]  # Password should not be returned


def test_signup_missing_name(client):
    """Test signup with missing employee name"""
    response = client.post(
        "/api/user/signup",
        json={"email": "john@example.com", "password": "securepassword123"},
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field" in data["error"]


def test_signup_missing_email(client):
    """Test signup with missing email"""
    response = client.post(
        "/api/user/signup",
        json={"employee_name": "John Doe", "password": "securepassword123"},
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field" in data["error"]


def test_signup_missing_password(client):
    """Test signup with missing password"""
    response = client.post(
        "/api/user/signup",
        json={"employee_name": "John Doe", "email": "john@example.com"},
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field" in data["error"]


def test_signup_duplicate_email(client):
    """Test signup with duplicate email"""
    # First signup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    # Attempt duplicate signup
    response = client.post(
        "/api/user/signup",
        json={
            "employee_name": "Jane Doe",
            "email": "john@example.com",
            "password": "different_password",
        },
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Email already exist" in data["error"]


def test_signup_with_form_data(client):
    """Test signup with form data instead of JSON"""
    response = client.post(
        "/api/user/signup",
        data={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["user"]["employee_name"] == "John Doe"


def test_login_success(client):
    """Test successful login"""
    # First signup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    # Then login
    response = client.post(
        "/api/user/login",
        json={"email": "john@example.com", "password": "securepassword123"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Login sucessfull"
    assert data["user"]["email"] == "john@example.com"


def test_login_nonexistent_email(client):
    """Test login with non-existent email"""
    response = client.post(
        "/api/user/login",
        json={"email": "nonexistent@example.com", "password": "anypassword"},
    )

    assert response.status_code == 401
    data = response.get_json()
    assert "Wrong email or password" in data["error"]


def test_login_wrong_password(client):
    """Test login with wrong password"""
    # First signup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    # Try login with wrong password
    response = client.post(
        "/api/user/login",
        json={"email": "john@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    data = response.get_json()
    assert "Wrong username or password" in data["error"]


def test_login_missing_email(client):
    """Test login with missing email"""
    response = client.post("/api/user/login", json={"password": "somepassword"})

    assert response.status_code == 400
    data = response.get_json()
    assert "Missing field required" in data["error"]


def test_login_missing_password(client):
    """Test login with missing password"""
    response = client.post("/api/user/login", json={"email": "john@example.com"})

    assert response.status_code == 400
    data = response.get_json()
    assert "Missing field required" in data["error"]


def test_login_with_form_data(client):
    """Test login with form data"""
    # Signup first
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    # Login with form data
    response = client.post(
        "/api/user/login",
        data={"email": "john@example.com", "password": "securepassword123"},
    )

    assert response.status_code == 200


def test_login_sets_session(client):
    """Test that login properly sets session"""
    # Signup first
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    # Login
    response = client.post(
        "/api/user/login",
        json={"email": "john@example.com", "password": "securepassword123"},
    )

    assert response.status_code == 200
    # Session should be set (we can verify by checking /api/user/me)


def test_get_all_users(client):
    """Test getting all users"""
    # Create multiple users
    for i in range(3):
        client.post(
            "/api/user/signup",
            json={
                "employee_name": f"User {i}",
                "email": f"user{i}@example.com",
                "password": "password123",
            },
        )

    response = client.get("/api/user/")

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Fetched all users successfully"
    assert len(data["users"]) == 3


def test_get_all_users_empty(client):
    """Test getting all users when none exist"""
    response = client.get("/api/user/")

    assert response.status_code == 200
    data = response.get_json()
    assert len(data["users"]) == 0


def test_get_user_by_id(client):
    """Test getting a specific user by ID"""
    # Create a user
    signup_response = client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    user_id = signup_response.get_json()["user"]["employee_id"]

    # Get user
    response = client.get(f"/api/user/{user_id}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["user"]["employee_id"] == user_id
    assert data["user"]["employee_name"] == "John Doe"


def test_get_current_user_not_logged_in(client):
    """Test getting current user when not logged in"""
    response = client.get("/api/user/me")

    assert response.status_code == 401
    data = response.get_json()
    assert data["logged_in"] is False


def test_get_current_user_logged_in(client):
    """Test getting current user when logged in"""
    # Signup and login
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "john@example.com", "password": "securepassword123"},
    )

    # Get current user
    response = client.get("/api/user/me")

    assert response.status_code == 200
    data = response.get_json()
    assert data["logged_in"] is True
    assert data["employee_name"] == "John Doe"


def test_logout_success(client):
    """Test successful logout"""
    # Signup and login
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "John Doe",
            "email": "john@example.com",
            "password": "securepassword123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "john@example.com", "password": "securepassword123"},
    )

    # Logout
    response = client.post("/api/user/logout")

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Logout successful"

    # Verify session is cleared
    me_response = client.get("/api/user/me")
    assert me_response.status_code == 401


def test_create_appraisal_success(client):
    """Test successful appraisal creation"""
    # Create two users: employee and reviewer
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee One",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer One",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    # Login as reviewer
    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    # Create appraisal
    response = client.post(
        "/api/appraisals/",
        json={
            "employee_id": "EMP001",
            "appraisal_period": "Q1 2026",
            "performance_rating": 4,
            "goals_achieved": ["Goal 1", "Goal 2"],
            "strengths": "Good communication",
            "areas_for_improvement": "Time management",
            "comments": "Great work overall",
        },
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data["message"] == "Appraisal created successfully"
    assert data["appraisal"]["employee_id"] == "EMP001"
    assert data["appraisal"]["appraisal_period"] == "Q1 2026"
    assert data["appraisal"]["status"] == "draft"


def test_create_appraisal_not_logged_in(client):
    """Test appraisal creation when not logged in"""
    response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    assert response.status_code == 401
    data = response.get_json()
    assert "must be logged in" in data["error"]


def test_create_appraisal_missing_employee_id(client):
    """Test appraisal creation with missing employee_id"""
    # Login first
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    response = client.post("/api/appraisals/", json={"appraisal_period": "Q1 2026"})

    assert response.status_code == 400
    data = response.get_json()
    assert "Missing required field" in data["error"]


def test_create_appraisal_missing_period(client):
    """Test appraisal creation with missing appraisal_period"""
    # Login first
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    response = client.post("/api/appraisals/", json={"employee_id": "EMP001"})

    assert response.status_code == 400


def test_create_appraisal_nonexistent_employee(client):
    """Test appraisal creation for non-existent employee"""
    # Login first
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP999", "appraisal_period": "Q1 2026"},
    )

    assert response.status_code == 404
    data = response.get_json()
    assert "not found" in data["error"]


def test_get_all_appraisals(client):
    """Test getting all appraisals"""
    # Setup: create users and appraisal
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    # Get all appraisals
    response = client.get("/api/appraisals/")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1
    assert len(data["appraisals"]) == 1


def test_get_all_appraisals_empty(client):
    """Test getting all appraisals when none exist"""
    response = client.get("/api/appraisals/")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 0


def test_get_all_appraisals_with_employee_filter(client):
    """Test getting appraisals filtered by employee_id"""
    # Setup: create users and multiple appraisals
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee One",
            "email": "emp1@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee Two",
            "email": "emp2@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP002", "appraisal_period": "Q1 2026"},
    )

    # Filter by employee
    response = client.get("/api/appraisals/?employee_id=EMP001")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1
    assert data["appraisals"][0]["employee_id"] == "EMP001"


def test_get_all_appraisals_with_status_filter(client):
    """Test getting appraisals filtered by status"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    client.post(
        "/api/appraisals/",
        json={
            "employee_id": "EMP001",
            "appraisal_period": "Q1 2026",
            "status": "draft",
        },
    )

    # Filter by status
    response = client.get("/api/appraisals/?status=draft")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1


def test_get_appraisal_by_id(client):
    """Test getting a specific appraisal by ID"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    appraisal_id = create_response.get_json()["appraisal"]["id"]

    # Get appraisal
    response = client.get(f"/api/appraisals/{appraisal_id}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == appraisal_id


def test_get_appraisal_invalid_id(client):
    """Test getting appraisal with invalid ID"""
    response = client.get("/api/appraisals/invalid_id")

    assert response.status_code == 400
    data = response.get_json()
    assert "Invalid appraisal ID" in data["error"]


def test_get_appraisal_not_found(client):
    """Test getting non-existent appraisal"""
    # Create a valid ObjectId that doesn't exist
    valid_id = "507f1f77bcf86cd799439011"

    response = client.get(f"/api/appraisals/{valid_id}")

    assert response.status_code == 404
    data = response.get_json()
    assert "not found" in data["error"]


def test_update_appraisal_success(client):
    """Test successful appraisal update"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    create_response = client.post(
        "/api/appraisals/",
        json={
            "employee_id": "EMP001",
            "appraisal_period": "Q1 2026",
            "performance_rating": 3,
        },
    )

    appraisal_id = create_response.get_json()["appraisal"]["id"]

    # Update appraisal
    response = client.put(
        f"/api/appraisals/{appraisal_id}",
        json={"performance_rating": 5, "strengths": "Excellent performance"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Appraisal updated successfully"
    assert data["appraisal"]["performance_rating"] == 5
    assert data["appraisal"]["strengths"] == "Excellent performance"


def test_update_appraisal_invalid_id(client):
    """Test updating appraisal with invalid ID"""
    response = client.put("/api/appraisals/invalid_id", json={"performance_rating": 5})

    assert response.status_code == 400


def test_update_appraisal_not_found(client):
    """Test updating non-existent appraisal"""
    valid_id = "507f1f77bcf86cd799439011"

    response = client.put(f"/api/appraisals/{valid_id}", json={"performance_rating": 5})

    assert response.status_code == 404


def test_delete_appraisal_success(client):
    """Test successful appraisal deletion"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    appraisal_id = create_response.get_json()["appraisal"]["id"]

    # Delete appraisal
    response = client.delete(f"/api/appraisals/{appraisal_id}")

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Appraisal deleted successfully"

    # Verify it's deleted
    get_response = client.get(f"/api/appraisals/{appraisal_id}")
    assert get_response.status_code == 404


def test_delete_appraisal_invalid_id(client):
    """Test deleting appraisal with invalid ID"""
    response = client.delete("/api/appraisals/invalid_id")

    assert response.status_code == 400


def test_delete_appraisal_not_found(client):
    """Test deleting non-existent appraisal"""
    valid_id = "507f1f77bcf86cd799439011"

    response = client.delete(f"/api/appraisals/{valid_id}")

    assert response.status_code == 404


def test_update_appraisal_status_success(client):
    """Test successful appraisal status update"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    appraisal_id = create_response.get_json()["appraisal"]["id"]

    # Update status
    response = client.patch(
        f"/api/appraisals/{appraisal_id}/status", json={"status": "submitted"}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Appraisal status updated successfully"
    assert data["appraisal"]["status"] == "submitted"


def test_update_appraisal_status_missing_status(client):
    """Test status update with missing status field"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    appraisal_id = create_response.get_json()["appraisal"]["id"]

    # Update without status
    response = client.patch(f"/api/appraisals/{appraisal_id}/status", json={})

    assert response.status_code == 400
    data = response.get_json()
    assert "Status field is required" in data["error"]


def test_update_appraisal_status_invalid_status(client):
    """Test status update with invalid status value"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    appraisal_id = create_response.get_json()["appraisal"]["id"]

    # Update with invalid status
    response = client.patch(
        f"/api/appraisals/{appraisal_id}/status", json={"status": "invalid_status"}
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Invalid status" in data["error"]


def test_update_appraisal_status_invalid_id(client):
    """Test updating status with invalid appraisal ID"""
    response = client.patch(
        "/api/appraisals/invalid_id/status", json={"status": "approved"}
    )

    assert response.status_code == 400


def test_update_appraisal_status_not_found(client):
    """Test updating status of non-existent appraisal"""
    valid_id = "507f1f77bcf86cd799439011"

    response = client.patch(
        f"/api/appraisals/{valid_id}/status", json={"status": "approved"}
    )

    assert response.status_code == 404


def test_update_appraisal_status_all_valid_values(client):
    """Test updating status with all valid status values"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    appraisal_id = create_response.get_json()["appraisal"]["id"]

    # Test all valid statuses
    valid_statuses = ["draft", "submitted", "approved", "rejected"]

    for status in valid_statuses:
        response = client.patch(
            f"/api/appraisals/{appraisal_id}/status", json={"status": status}
        )

        assert response.status_code == 200
        assert response.get_json()["appraisal"]["status"] == status


def test_get_my_appraisals_logged_in(client):
    """Test getting user's own appraisals when logged in"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee One",
            "email": "emp1@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    # Create appraisal as reviewer
    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    # Login as employee
    client.post("/api/user/logout")
    client.post(
        "/api/user/login", json={"email": "emp1@example.com", "password": "password123"}
    )

    # Get my appraisals
    response = client.get("/api/appraisals/my/appraisals")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1
    assert data["appraisals"][0]["employee_id"] == "EMP001"


def test_get_my_appraisals_not_logged_in(client):
    """Test getting my appraisals when not logged in"""
    response = client.get("/api/appraisals/my/appraisals")

    assert response.status_code == 401
    data = response.get_json()
    assert "must be logged in" in data["error"]


def test_get_my_appraisals_empty(client):
    """Test getting my appraisals when none exist"""
    # Signup and login
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "employee@example.com", "password": "password123"},
    )

    # Get my appraisals
    response = client.get("/api/appraisals/my/appraisals")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 0


def test_get_my_reviews_logged_in(client):
    """Test getting reviews where user is reviewer"""
    # Setup
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer One",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    # Create appraisal as reviewer
    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )

    # Get my reviews
    response = client.get("/api/appraisals/my/reviews")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1
    assert data["appraisals"][0]["reviewer_id"] == response.get_json()["reviewer_id"]


def test_get_my_reviews_not_logged_in(client):
    """Test getting my reviews when not logged in"""
    response = client.get("/api/appraisals/my/reviews")

    assert response.status_code == 401
    data = response.get_json()
    assert "must be logged in" in data["error"]


def test_get_my_reviews_empty(client):
    """Test getting my reviews when none exist"""
    # Signup and login
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )

    # Get my reviews
    response = client.get("/api/appraisals/my/reviews")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 0


def test_get_my_summary_logged_in(client):
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )
    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )
    appraisal_id = create_response.get_json()["appraisal"]["id"]
    client.post(f"/api/appraisals/{appraisal_id}/submit")

    response = client.get("/api/appraisals/my/summary")

    assert response.status_code == 200
    data = response.get_json()
    assert data["my_reviews_count"] == 1
    assert data["submitted_reviews_count"] == 1


def test_get_my_review_queue_default_submitted(client):
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )
    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )
    appraisal_id = create_response.get_json()["appraisal"]["id"]
    client.post(f"/api/appraisals/{appraisal_id}/submit")

    response = client.get("/api/appraisals/my/review-queue")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1
    assert data["status"] == "submitted"


def test_get_employee_appraisal_history_with_limit(client):
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )
    client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )
    client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q2 2026"},
    )

    response = client.get("/api/appraisals/employee/EMP001/history?limit=1")

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1
    assert data["employee_id"] == "EMP001"


def test_submit_appraisal_requires_draft_status(client):
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )
    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )
    appraisal_id = create_response.get_json()["appraisal"]["id"]

    first_submit = client.post(f"/api/appraisals/{appraisal_id}/submit")
    second_submit = client.post(f"/api/appraisals/{appraisal_id}/submit")

    assert first_submit.status_code == 200
    assert second_submit.status_code == 409


def test_decide_appraisal_success(client):
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Employee",
            "email": "employee@example.com",
            "password": "password123",
        },
    )
    client.post(
        "/api/user/signup",
        json={
            "employee_name": "Reviewer",
            "email": "reviewer@example.com",
            "password": "password123",
        },
    )

    client.post(
        "/api/user/login",
        json={"email": "reviewer@example.com", "password": "password123"},
    )
    create_response = client.post(
        "/api/appraisals/",
        json={"employee_id": "EMP001", "appraisal_period": "Q1 2026"},
    )
    appraisal_id = create_response.get_json()["appraisal"]["id"]
    client.post(f"/api/appraisals/{appraisal_id}/submit")

    decision_response = client.patch(
        f"/api/appraisals/{appraisal_id}/decision",
        json={"decision": "approved", "comments": "Great quarter"},
    )

    assert decision_response.status_code == 200
    data = decision_response.get_json()
    assert data["appraisal"]["status"] == "approved"
    assert data["appraisal"]["comments"] == "Great quarter"
