# Employee Appraisal System

Full-stack Employee Appraisal System with Flask, MongoDB, React, TypeScript, TanStack Query, and Jotai.

## Overview

This project provides:

- Session-based authentication.
- Employee onboarding and profile retrieval.
- Appraisal lifecycle management from draft to review decision.
- Reviewer queue and user performance summary APIs.
- Responsive frontend with light mode as default and optional dark mode toggle.

## Tech Stack

- Backend: Flask, PyMongo, python-dotenv, bcrypt.
- Database: MongoDB.
- Frontend: React 19, TypeScript, Vite.
- State and Data: Jotai, TanStack Query, Axios.
- API Contract: OpenAPI 3.0 in [openapi.yaml](openapi.yaml).

## Repository Structure

- Backend entry: [app.py](app.py)
- API routes: [routes/employee.py](routes/employee.py), [routes/appraisal.py](routes/appraisal.py)
- Mongo models/helpers: [model/employeeModel.py](model/employeeModel.py), [model/appraisalModel.py](model/appraisalModel.py)
- Frontend app: [client](client)
- API tests: [test_apis.py](test_apis.py)

## Prerequisites

- Python 3.11+ recommended.
- Node.js 20+.
- pnpm.
- MongoDB Atlas URI for local mode or Docker for container mode.

## Environment Variables

Create a .env file in project root with:

- SECRET_KEY=replace_with_secure_value
- MONGO_ATLAS_URI=mongodb+srv://...
- MONGO_USERNAME=admin
- MONGO_PASSWORD=admin123
- IN_DOCKER=false

Notes:

- Local run uses MONGO_ATLAS_URI when IN_DOCKER=false.
- Docker compose uses MONGO_USERNAME and MONGO_PASSWORD with internal mongo service.

## Local Development Setup

### Backend

1. Install dependencies:

	 pip install -r requirements.txt

2. Start backend:

	 python app.py

3. Backend runs on http://localhost:5000

### Frontend

1. Go to frontend folder:

	 cd client

2. Install dependencies:

	 pnpm install

3. Start development server:

	 pnpm dev

4. Frontend runs on Vite default host and proxies API calls to backend based on frontend config.

## Docker Development

Use the compose file [docker-development.yml](docker-development.yml):

docker compose -f docker-development.yml up --build

Services:

- web on port 5000.
- mongo on port 27017.

## API Documentation

- Swagger UI: http://localhost:5000/docs
- OpenAPI spec: http://localhost:5000/openapi.yaml

## Core API Endpoints

### General

- GET /
- GET /health
- GET /docs
- GET /openapi.yaml

### Auth and Employees

- POST /api/user/signup
- POST /api/user/login
- POST /api/user/logout
- GET /api/user/me
- GET /api/user/
- GET /api/user/{employee_id}

### Appraisals

- POST /api/appraisals/
- GET /api/appraisals/
- GET /api/appraisals/{appraisal_id}
- PUT /api/appraisals/{appraisal_id}
- DELETE /api/appraisals/{appraisal_id}
- PATCH /api/appraisals/{appraisal_id}/status
- POST /api/appraisals/{appraisal_id}/submit
- PATCH /api/appraisals/{appraisal_id}/decision
- GET /api/appraisals/my/appraisals
- GET /api/appraisals/my/reviews
- GET /api/appraisals/my/summary
- GET /api/appraisals/my/review-queue
- GET /api/appraisals/employee/{employee_id}/history

## Frontend Features

- Authentication pages for signup and login.
- Protected routes for authenticated users.
- Dashboard with:
	- My appraisals count.
	- Pending reviews count.
	- Approved count.
	- Average rating.
	- Review queue section.
- Appraisal creation, editing, status transition, submission, and decision flows.
- Employee listing and appraisal browsing pages.
- Light mode by default with persistent theme toggle in top bar.

## Requirement Coverage

Based on current implementation status:

- Add, update, delete, and manage employee profiles: Partially implemented.
	- Implemented: create employee, list employees, get employee by employee_id.
	- Missing for full completion: update and delete employee profile APIs and matching frontend UI.
- Define appraisal criteria and performance metrics: Implemented.
	- Supports appraisal_period, goals_achieved, strengths, areas_for_improvement, comments, and performance_rating.
- Allow managers to evaluate employees based on predefined parameters: Implemented.
	- Reviewer-driven appraisal creation, submit workflow, and approve/reject decision endpoints.
- Enable self-appraisal submissions by employees: Partially implemented.
	- Employee can create appraisal records if authenticated, but there is no dedicated role-based self-appraisal workflow yet.
- Calculate overall performance ratings automatically: Partially implemented.
	- System computes average rating in summary APIs; weighted or rule-driven auto-scoring is not yet implemented.
- Generate appraisal reports and performance summaries: Implemented.
	- User summary, review queue, and employee appraisal history endpoints are available.
- Provide secure login access for HR, managers, and employees: Partially implemented.
	- Session login is implemented.
	- Role-based authorization for HR, manager, and employee is not yet implemented.

## Testing

Run backend tests:

python -m pytest -q

Run frontend production build check:

cd client && pnpm build
