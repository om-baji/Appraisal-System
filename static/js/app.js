// API Base URL
const API_BASE = '/api';

// Current user data
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('createAppraisalForm').addEventListener('submit', handleCreateAppraisal);
}

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/user/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            showDashboard();
        } else {
            showAuthPage();
        }
    } catch (error) {
        showAuthPage();
    }
}

// Show/Hide pages
function showAuthPage() {
    document.getElementById('authPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
    document.getElementById('navbar').style.display = 'none';
}

function showDashboard() {
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';
    document.getElementById('userGreeting').textContent = `Hello, ${currentUser.employee_name}`;
    
    // Load data
    loadMyAppraisals();
    loadMyReviews();
    loadAllEmployees();
}

// Auth functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showSignup() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_BASE}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = {
                employee_id: data.user.employee_id,
                employee_name: data.user.employee_name
            };
            showDashboard();
        } else {
            errorDiv.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const employee_name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const errorDiv = document.getElementById('signupError');
    
    try {
        const response = await fetch(`${API_BASE}/user/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ employee_name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Signup successful! Please login.');
            showLogin();
            document.getElementById('signupForm').reset();
        } else {
            errorDiv.textContent = data.error || 'Signup failed';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/user/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        currentUser = null;
        showAuthPage();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'myAppraisals') {
        document.getElementById('myAppraisalsTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        loadMyAppraisals();
    } else if (tabName === 'myReviews') {
        document.getElementById('myReviewsTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        loadMyReviews();
    } else if (tabName === 'allEmployees') {
        document.getElementById('allEmployeesTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        loadAllEmployees();
    }
}

// Load data
async function loadMyAppraisals() {
    try {
        const response = await fetch(`${API_BASE}/appraisals/my/appraisals`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayMyAppraisals(data.appraisals);
            
            // Update stats
            document.getElementById('myAppraisalsCount').textContent = data.count;
            const avgRating = calculateAverageRating(data.appraisals);
            document.getElementById('myAvgRating').textContent = avgRating.toFixed(1);
        }
    } catch (error) {
        console.error('Error loading appraisals:', error);
    }
}

async function loadMyReviews() {
    try {
        const response = await fetch(`${API_BASE}/appraisals/my/reviews`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayMyReviews(data.appraisals);
            document.getElementById('myReviewsCount').textContent = data.count;
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

async function loadAllEmployees() {
    try {
        const response = await fetch(`${API_BASE}/user/`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            displayEmployees(data.users);
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

// Display functions
function displayMyAppraisals(appraisals) {
    const container = document.getElementById('myAppraisalsList');
    
    if (!appraisals || appraisals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Appraisals Yet</h3>
                <p>You haven't received any appraisals.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appraisals.map(appraisal => `
        <div class="appraisal-card" onclick="viewAppraisal('${appraisal.id}')">
            <div class="appraisal-header">
                <div class="appraisal-title">
                    <h3>${appraisal.appraisal_period}</h3>
                    <p>Reviewed by: ${appraisal.reviewer_name}</p>
                </div>
                <span class="status-badge status-${appraisal.status}">${appraisal.status}</span>
            </div>
            <div class="rating-display">
                ${getStarRating(appraisal.performance_rating)}
            </div>
            <div class="appraisal-info">
                <p><strong>Strengths:</strong> ${appraisal.strengths || 'N/A'}</p>
                <p><strong>Improvements:</strong> ${appraisal.areas_for_improvement || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

function displayMyReviews(appraisals) {
    const container = document.getElementById('myReviewsList');
    
    if (!appraisals || appraisals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Reviews Created</h3>
                <p>You haven't created any appraisals yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appraisals.map(appraisal => `
        <div class="appraisal-card" onclick="viewAppraisal('${appraisal.id}')">
            <div class="appraisal-header">
                <div class="appraisal-title">
                    <h3>${appraisal.employee_name}</h3>
                    <p>Period: ${appraisal.appraisal_period}</p>
                </div>
                <span class="status-badge status-${appraisal.status}">${appraisal.status}</span>
            </div>
            <div class="rating-display">
                ${getStarRating(appraisal.performance_rating)}
            </div>
            <div class="appraisal-info">
                <p><strong>Goals:</strong> ${appraisal.goals_achieved.length || 0} achieved</p>
            </div>
        </div>
    `).join('');
}

function displayEmployees(employees) {
    const container = document.getElementById('employeesList');
    
    if (!employees || employees.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No Employees Found</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = employees.map(employee => `
        <div class="employee-card">
            <div class="employee-avatar">
                ${getInitials(employee.employee_name)}
            </div>
            <h3>${employee.employee_name}</h3>
            <p>${employee.employee_id}</p>
            <p>${employee.email}</p>
        </div>
    `).join('');
}

// Modal functions
function showCreateAppraisalModal() {
    document.getElementById('createAppraisalModal').classList.add('active');
}

function closeCreateAppraisalModal() {
    document.getElementById('createAppraisalModal').classList.remove('active');
    document.getElementById('createAppraisalForm').reset();
    document.getElementById('createAppraisalError').textContent = '';
}

async function handleCreateAppraisal(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('createAppraisalError');
    
    const goals = document.getElementById('appraisalGoals').value;
    const goalsArray = goals ? goals.split(',').map(g => g.trim()).filter(g => g) : [];
    
    const data = {
        employee_id: document.getElementById('appraisalEmployeeId').value,
        appraisal_period: document.getElementById('appraisalPeriod').value,
        performance_rating: parseInt(document.querySelector('input[name="rating"]:checked').value),
        goals_achieved: goalsArray,
        strengths: document.getElementById('appraisalStrengths').value,
        areas_for_improvement: document.getElementById('appraisalImprovement').value,
        comments: document.getElementById('appraisalComments').value,
        status: document.getElementById('appraisalStatus').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/appraisals/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            closeCreateAppraisalModal();
            loadMyReviews();
            showTab('myReviews');
            alert('Appraisal created successfully!');
        } else {
            errorDiv.textContent = result.error || 'Failed to create appraisal';
        }
    } catch (error) {
        errorDiv.textContent = 'Network error. Please try again.';
    }
}

async function viewAppraisal(id) {
    try {
        const response = await fetch(`${API_BASE}/appraisals/${id}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const appraisal = await response.json();
            showAppraisalDetails(appraisal);
        }
    } catch (error) {
        console.error('Error loading appraisal:', error);
    }
}

function showAppraisalDetails(appraisal) {
    const modal = document.getElementById('viewAppraisalModal');
    const detailsDiv = document.getElementById('appraisalDetails');
    
    detailsDiv.innerHTML = `
        <div class="detail-row">
            <h4>Employee</h4>
            <p>${appraisal.employee_name} (${appraisal.employee_id})</p>
        </div>
        <div class="detail-row">
            <h4>Reviewer</h4>
            <p>${appraisal.reviewer_name} (${appraisal.reviewer_id})</p>
        </div>
        <div class="detail-row">
            <h4>Period</h4>
            <p>${appraisal.appraisal_period}</p>
        </div>
        <div class="detail-row">
            <h4>Performance Rating</h4>
            <div class="rating-display">${getStarRating(appraisal.performance_rating)}</div>
        </div>
        <div class="detail-row">
            <h4>Status</h4>
            <span class="status-badge status-${appraisal.status}">${appraisal.status}</span>
        </div>
        <div class="detail-row">
            <h4>Goals Achieved</h4>
            <p>${appraisal.goals_achieved && appraisal.goals_achieved.length > 0 ? appraisal.goals_achieved.join(', ') : 'None listed'}</p>
        </div>
        <div class="detail-row">
            <h4>Strengths</h4>
            <p>${appraisal.strengths || 'N/A'}</p>
        </div>
        <div class="detail-row">
            <h4>Areas for Improvement</h4>
            <p>${appraisal.areas_for_improvement || 'N/A'}</p>
        </div>
        <div class="detail-row">
            <h4>Additional Comments</h4>
            <p>${appraisal.comments || 'N/A'}</p>
        </div>
        <div class="detail-row">
            <h4>Created</h4>
            <p>${new Date(appraisal.created_at).toLocaleString()}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeViewAppraisalModal() {
    document.getElementById('viewAppraisalModal').classList.remove('active');
}

// Utility functions
function getStarRating(rating) {
    const stars = '⭐'.repeat(rating || 0);
    return `${stars} (${rating}/5)`;
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function calculateAverageRating(appraisals) {
    if (!appraisals || appraisals.length === 0) return 0;
    const sum = appraisals.reduce((acc, curr) => acc + (curr.performance_rating || 0), 0);
    return sum / appraisals.length;
}
