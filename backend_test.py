#!/usr/bin/env python3
"""
Backend API Testing for Hospital Hours Management System
Tests all authentication, hospital hours, and admin endpoints
"""

import requests
import json
import os
from datetime import datetime
import sys

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        return "http://localhost:8001"
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing Backend API at: {API_URL}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def log_success(self, test_name):
        print(f"✅ {test_name}")
        self.passed += 1
        
    def log_failure(self, test_name, error):
        print(f"❌ {test_name}: {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*50}")
        print(f"TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        return self.failed == 0

results = TestResults()

# Test data
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

regular_user_data = {
    "email": "testuser@veterinary.com",
    "password": "testpass123",
    "full_name": "Dr. Sarah Johnson",
    "role": "user"
}

regular_user_login = {
    "email": "testuser@veterinary.com", 
    "password": "testpass123"
}

# Role-based test users
technician_user_data = {
    "email": "technician@veterinary.com",
    "password": "tech123",
    "full_name": "Alex Thompson",
    "role": "technician"
}

manager_user_data = {
    "email": "manager@veterinary.com", 
    "password": "manager123",
    "full_name": "Dr. Maria Garcia",
    "role": "manager"
}

admin_user_data = {
    "email": "newadmin@veterinary.com",
    "password": "newadmin123", 
    "full_name": "Dr. John Smith",
    "role": "admin"
}

# Global variables for tokens
admin_token = None
user_token = None
technician_token = None
manager_token = None
new_admin_token = None

def test_api_root():
    """Test API root endpoint"""
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                results.log_success("API Root Endpoint")
                return True
        results.log_failure("API Root Endpoint", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("API Root Endpoint", str(e))
        return False

def test_user_registration():
    """Test user registration endpoint"""
    try:
        response = requests.post(f"{API_URL}/register", json=regular_user_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == regular_user_data["email"]:
                results.log_success("User Registration")
                return True
        elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
            results.log_success("User Registration (already exists)")
            return True
        results.log_failure("User Registration", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("User Registration", str(e))
        return False

def test_admin_login():
    """Test admin login endpoint"""
    global admin_token
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                admin_token = data["access_token"]
                results.log_success("Admin Login")
                return True
        results.log_failure("Admin Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Admin Login", str(e))
        return False

def test_regular_user_login():
    """Test regular user login endpoint"""
    global user_token
    try:
        response = requests.post(f"{API_URL}/login", json=regular_user_login)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                user_token = data["access_token"]
                results.log_success("Regular User Login")
                return True
        results.log_failure("Regular User Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Regular User Login", str(e))
        return False

def test_get_current_user_admin():
    """Test /me endpoint with admin token"""
    if not admin_token:
        results.log_failure("Get Current User (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == admin_credentials["email"] and data.get("role") == "admin":
                results.log_success("Get Current User (Admin)")
                return True
        results.log_failure("Get Current User (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Current User (Admin)", str(e))
        return False

def test_get_current_user_regular():
    """Test /me endpoint with regular user token"""
    if not user_token:
        results.log_failure("Get Current User (Regular)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == regular_user_login["email"] and data.get("role") == "user":
                results.log_success("Get Current User (Regular)")
                return True
        results.log_failure("Get Current User (Regular)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Current User (Regular)", str(e))
        return False

def test_authentication_middleware():
    """Test authentication middleware with invalid token"""
    try:
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 401:
            results.log_success("Authentication Middleware (Invalid Token)")
            return True
        results.log_failure("Authentication Middleware", f"Expected 401, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Authentication Middleware", str(e))
        return False

# ============================================================================
# ROLE-BASED AUTHENTICATION SYSTEM TESTS - NEW FEATURES
# ============================================================================

def test_register_technician_user():
    """Test registering a technician user"""
    try:
        response = requests.post(f"{API_URL}/register", json=technician_user_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == technician_user_data["email"] and data.get("role") == "technician":
                results.log_success("Register Technician User")
                return True
        elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
            results.log_success("Register Technician User (already exists)")
            return True
        results.log_failure("Register Technician User", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Register Technician User", str(e))
        return False

def test_register_manager_user():
    """Test registering a manager user"""
    try:
        response = requests.post(f"{API_URL}/register", json=manager_user_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == manager_user_data["email"] and data.get("role") == "manager":
                results.log_success("Register Manager User")
                return True
        elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
            results.log_success("Register Manager User (already exists)")
            return True
        results.log_failure("Register Manager User", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Register Manager User", str(e))
        return False

def test_register_admin_user():
    """Test registering an admin user"""
    try:
        response = requests.post(f"{API_URL}/register", json=admin_user_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == admin_user_data["email"] and data.get("role") == "admin":
                results.log_success("Register Admin User")
                return True
        elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
            results.log_success("Register Admin User (already exists)")
            return True
        results.log_failure("Register Admin User", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Register Admin User", str(e))
        return False

def test_register_invalid_role():
    """Test registering with invalid role"""
    try:
        invalid_role_data = {
            "email": "invalid@veterinary.com",
            "password": "invalid123",
            "full_name": "Invalid Role User",
            "role": "invalid_role"
        }
        response = requests.post(f"{API_URL}/register", json=invalid_role_data)
        if response.status_code == 422:  # Validation error
            results.log_success("Register Invalid Role (Validation Error)")
            return True
        results.log_failure("Register Invalid Role", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Register Invalid Role", str(e))
        return False

def test_technician_login():
    """Test technician login endpoint"""
    global technician_token
    try:
        technician_login = {
            "email": technician_user_data["email"],
            "password": technician_user_data["password"]
        }
        response = requests.post(f"{API_URL}/login", json=technician_login)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                technician_token = data["access_token"]
                results.log_success("Technician Login")
                return True
        results.log_failure("Technician Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Technician Login", str(e))
        return False

def test_manager_login():
    """Test manager login endpoint"""
    global manager_token
    try:
        manager_login = {
            "email": manager_user_data["email"],
            "password": manager_user_data["password"]
        }
        response = requests.post(f"{API_URL}/login", json=manager_login)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                manager_token = data["access_token"]
                results.log_success("Manager Login")
                return True
        results.log_failure("Manager Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Manager Login", str(e))
        return False

def test_new_admin_login():
    """Test new admin login endpoint"""
    global new_admin_token
    try:
        new_admin_login = {
            "email": admin_user_data["email"],
            "password": admin_user_data["password"]
        }
        response = requests.post(f"{API_URL}/login", json=new_admin_login)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                new_admin_token = data["access_token"]
                results.log_success("New Admin Login")
                return True
        results.log_failure("New Admin Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("New Admin Login", str(e))
        return False

def test_get_current_user_technician():
    """Test /me endpoint with technician token"""
    if not technician_token:
        results.log_failure("Get Current User (Technician)", "No technician token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {technician_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == technician_user_data["email"] and data.get("role") == "technician":
                results.log_success("Get Current User (Technician)")
                return True
        results.log_failure("Get Current User (Technician)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Current User (Technician)", str(e))
        return False

def test_get_current_user_manager():
    """Test /me endpoint with manager token"""
    if not manager_token:
        results.log_failure("Get Current User (Manager)", "No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == manager_user_data["email"] and data.get("role") == "manager":
                results.log_success("Get Current User (Manager)")
                return True
        results.log_failure("Get Current User (Manager)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Current User (Manager)", str(e))
        return False

def test_get_current_user_new_admin():
    """Test /me endpoint with new admin token"""
    if not new_admin_token:
        results.log_failure("Get Current User (New Admin)", "No new admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {new_admin_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == admin_user_data["email"] and data.get("role") == "admin":
                results.log_success("Get Current User (New Admin)")
                return True
        results.log_failure("Get Current User (New Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Current User (New Admin)", str(e))
        return False

# ============================================================================
# ROLE-BASED PERMISSIONS TESTS FOR URGENT CARE APPOINTMENTS
# ============================================================================

def test_get_appointments_technician():
    """Test GET /urgent-care-appointments with technician token (should work - staff access)"""
    if not technician_token:
        results.log_failure("Get Appointments (Technician)", "No technician token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {technician_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "appointments" in data:
                results.log_success("Get Appointments (Technician - Staff Access)")
                return True
        results.log_failure("Get Appointments (Technician)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Appointments (Technician)", str(e))
        return False

def test_get_appointments_manager():
    """Test GET /urgent-care-appointments with manager token (should work - staff access)"""
    if not manager_token:
        results.log_failure("Get Appointments (Manager)", "No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "appointments" in data:
                results.log_success("Get Appointments (Manager - Staff Access)")
                return True
        results.log_failure("Get Appointments (Manager)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Appointments (Manager)", str(e))
        return False

def test_update_appointment_status_technician():
    """Test PATCH /urgent-care-appointments/{id}/status with technician token (should work - staff access)"""
    if not technician_token:
        results.log_failure("Update Appointment Status (Technician)", "No technician token available")
        return False
    
    try:
        # First create an appointment to update
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T14:30"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "TechUpdate",
            "owner_last_name": "TestUser",
            "email": "techupdate@test.com",
            "phone": "(555) 444-5555",
            "pet_name": "TechPet",
            "pet_type": "dog",
            "reason_for_visit": "Test appointment for technician status update",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Update Appointment Status (Technician - Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Update status with technician token
        headers = {"Authorization": f"Bearer {technician_token}"}
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{appointment_id}/status",
            params={"status": "verified"},
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "verified":
                results.log_success("Update Appointment Status (Technician - Staff Access)")
                return True
        results.log_failure("Update Appointment Status (Technician)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Appointment Status (Technician)", str(e))
        return False

def test_update_appointment_status_manager():
    """Test PATCH /urgent-care-appointments/{id}/status with manager token (should work - staff access)"""
    if not manager_token:
        results.log_failure("Update Appointment Status (Manager)", "No manager token available")
        return False
    
    try:
        # First create an appointment to update
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=9)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T15:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "ManagerUpdate",
            "owner_last_name": "TestUser",
            "email": "managerupdate@test.com",
            "phone": "(555) 555-6666",
            "pet_name": "ManagerPet",
            "pet_type": "cat",
            "reason_for_visit": "Test appointment for manager status update",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Update Appointment Status (Manager - Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Update status with manager token
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{appointment_id}/status",
            params={"status": "checked_in"},
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "checked_in":
                results.log_success("Update Appointment Status (Manager - Staff Access)")
                return True
        results.log_failure("Update Appointment Status (Manager)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Appointment Status (Manager)", str(e))
        return False

def test_delete_appointment_manager():
    """Test DELETE /urgent-care-appointments/{id} with manager token (should work - manager/admin access)"""
    if not manager_token:
        results.log_failure("Delete Appointment (Manager)", "No manager token available")
        return False
    
    try:
        # First create an appointment to delete
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T16:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "ManagerDelete",
            "owner_last_name": "TestUser",
            "email": "managerdelete@test.com",
            "phone": "(555) 666-7777",
            "pet_name": "DeletePet",
            "pet_type": "dog",
            "reason_for_visit": "Test appointment for manager deletion",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Delete Appointment (Manager - Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Delete with manager token
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.delete(f"{API_URL}/urgent-care-appointments/{appointment_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "freed_slot" in data:
                results.log_success("Delete Appointment (Manager - Manager/Admin Access)")
                return True
        results.log_failure("Delete Appointment (Manager)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Delete Appointment (Manager)", str(e))
        return False

def test_delete_appointment_technician():
    """Test DELETE /urgent-care-appointments/{id} with technician token (should fail - manager/admin only)"""
    if not technician_token:
        results.log_failure("Delete Appointment (Technician - Should Fail)", "No technician token available")
        return False
    
    try:
        # First create an appointment to attempt deletion
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=11)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T17:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "TechDelete",
            "owner_last_name": "TestUser",
            "email": "techdelete@test.com",
            "phone": "(555) 777-8888",
            "pet_name": "CantDeletePet",
            "pet_type": "cat",
            "reason_for_visit": "Test appointment for technician deletion attempt",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Delete Appointment (Technician - Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Try to delete with technician token (should fail)
        headers = {"Authorization": f"Bearer {technician_token}"}
        response = requests.delete(f"{API_URL}/urgent-care-appointments/{appointment_id}", headers=headers)
        
        if response.status_code == 403:
            results.log_success("Delete Appointment (Technician - Correctly Forbidden)")
            return True
        results.log_failure("Delete Appointment (Technician)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Delete Appointment (Technician)", str(e))
        return False

def test_get_appointment_details_technician():
    """Test GET /urgent-care-appointments/{id} with technician token (should work - staff access)"""
    if not technician_token:
        results.log_failure("Get Appointment Details (Technician)", "No technician token available")
        return False
    
    try:
        # First create an appointment to view
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T18:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "TechView",
            "owner_last_name": "TestUser",
            "email": "techview@test.com",
            "phone": "(555) 888-9999",
            "pet_name": "ViewPet",
            "pet_type": "dog",
            "reason_for_visit": "Test appointment for technician viewing",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Get Appointment Details (Technician - Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # View with technician token
        headers = {"Authorization": f"Bearer {technician_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments/{appointment_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("id") == appointment_id and data.get("owner_first_name") == "TechView":
                results.log_success("Get Appointment Details (Technician - Staff Access)")
                return True
        results.log_failure("Get Appointment Details (Technician)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Appointment Details (Technician)", str(e))
        return False

def test_get_hospital_hours():
    """Test GET /hospital-hours endpoint"""
    try:
        response = requests.get(f"{API_URL}/hospital-hours")
        if response.status_code == 200:
            data = response.json()
            required_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            if all(day in data for day in required_days):
                results.log_success("Get Hospital Hours")
                return True
        results.log_failure("Get Hospital Hours", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Hospital Hours", str(e))
        return False

def test_get_urgent_care_hours():
    """Test GET /urgent-care-hours endpoint"""
    try:
        response = requests.get(f"{API_URL}/urgent-care-hours")
        if response.status_code == 200:
            data = response.json()
            required_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            if all(day in data for day in required_days):
                results.log_success("Get Urgent Care Hours")
                return True
        results.log_failure("Get Urgent Care Hours", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Urgent Care Hours", str(e))
        return False

def test_get_current_hours():
    """Test GET /hours/current endpoint"""
    try:
        response = requests.get(f"{API_URL}/hours/current")
        if response.status_code == 200:
            data = response.json()
            if "type" in data and ("general_practice" in data and "urgent_care" in data):
                results.log_success("Get Current Hours")
                return True
        results.log_failure("Get Current Hours", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Current Hours", str(e))
        return False

def test_update_hospital_hours_admin():
    """Test PUT /hospital-hours endpoint with admin token"""
    if not admin_token:
        results.log_failure("Update Hospital Hours (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_data = {
            "monday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "tuesday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "wednesday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "thursday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "friday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "saturday": {"is_open": True, "open_time": "09:00", "close_time": "17:00"},
            "sunday": {"is_open": False}
        }
        response = requests.put(f"{API_URL}/hospital-hours", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("monday", {}).get("open_time") == "08:00":
                results.log_success("Update Hospital Hours (Admin)")
                return True
        results.log_failure("Update Hospital Hours (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Hospital Hours (Admin)", str(e))
        return False

def test_update_hospital_hours_regular_user():
    """Test PUT /hospital-hours endpoint with regular user token (should fail)"""
    if not user_token:
        results.log_failure("Update Hospital Hours (Regular User - Should Fail)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        update_data = {
            "monday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "tuesday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "wednesday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "thursday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "friday": {"is_open": True, "open_time": "08:00", "close_time": "19:00"},
            "saturday": {"is_open": True, "open_time": "09:00", "close_time": "17:00"},
            "sunday": {"is_open": False}
        }
        response = requests.put(f"{API_URL}/hospital-hours", json=update_data, headers=headers)
        if response.status_code == 403:
            results.log_success("Update Hospital Hours (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Update Hospital Hours (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Hospital Hours (Regular User)", str(e))
        return False

def test_update_urgent_care_hours_admin():
    """Test PUT /urgent-care-hours endpoint with admin token"""
    if not admin_token:
        results.log_failure("Update Urgent Care Hours (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_data = {
            "monday": {"is_open": True, "open_time": "14:00", "close_time": "23:00"},
            "tuesday": {"is_open": True, "open_time": "14:00", "close_time": "23:00"},
            "wednesday": {"is_open": True, "open_time": "14:00", "close_time": "23:00"},
            "thursday": {"is_open": True, "open_time": "14:00", "close_time": "23:00"},
            "friday": {"is_open": True, "open_time": "14:00", "close_time": "23:00"},
            "saturday": {"is_open": True, "open_time": "14:00", "close_time": "23:00"},
            "sunday": {"is_open": True, "open_time": "14:00", "close_time": "23:00"}
        }
        response = requests.put(f"{API_URL}/urgent-care-hours", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("monday", {}).get("open_time") == "14:00":
                results.log_success("Update Urgent Care Hours (Admin)")
                return True
        results.log_failure("Update Urgent Care Hours (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Urgent Care Hours (Admin)", str(e))
        return False

# Global variables for appointment testing
created_appointment_id = None

def test_get_time_slots_today():
    """Test GET /urgent-care-time-slots/{date} for today"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{today}")
        if response.status_code == 200:
            data = response.json()
            if "available" in data and "date" in data:
                if data["available"] and "slots" in data and isinstance(data["slots"], list):
                    results.log_success("Get Time Slots (Today - Available)")
                    return True
                elif not data["available"] and "message" in data:
                    results.log_success("Get Time Slots (Today - Closed)")
                    return True
        results.log_failure("Get Time Slots (Today)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Time Slots (Today)", str(e))
        return False

def test_get_time_slots_future():
    """Test GET /urgent-care-time-slots/{date} for future date"""
    try:
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{future_date}")
        if response.status_code == 200:
            data = response.json()
            if "available" in data and "date" in data and data["date"] == future_date:
                if data["available"] and "slots" in data and isinstance(data["slots"], list):
                    # Verify slot format
                    if data["slots"] and all("time" in slot and "value" in slot for slot in data["slots"]):
                        results.log_success("Get Time Slots (Future Date)")
                        return True
                elif not data["available"] and "message" in data:
                    results.log_success("Get Time Slots (Future Date - Closed)")
                    return True
        results.log_failure("Get Time Slots (Future Date)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Time Slots (Future Date)", str(e))
        return False

def test_get_time_slots_sunday():
    """Test GET /urgent-care-time-slots/{date} for Sunday (should be open based on default hours)"""
    try:
        from datetime import timedelta
        # Find next Sunday
        today = datetime.now()
        days_ahead = 6 - today.weekday()  # Sunday is 6
        if days_ahead <= 0:
            days_ahead += 7
        sunday = today + timedelta(days_ahead)
        sunday_str = sunday.strftime("%Y-%m-%d")
        
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{sunday_str}")
        if response.status_code == 200:
            data = response.json()
            if "available" in data and "date" in data:
                # Based on default urgent care hours, Sunday should be open 14:00-23:00
                if data["available"] and "slots" in data:
                    results.log_success("Get Time Slots (Sunday - Open)")
                    return True
                elif not data["available"]:
                    results.log_success("Get Time Slots (Sunday - Closed)")
                    return True
        results.log_failure("Get Time Slots (Sunday)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Time Slots (Sunday)", str(e))
        return False

def test_create_urgent_care_appointment():
    """Test POST /urgent-care-appointments"""
    global created_appointment_id
    try:
        from datetime import timedelta
        # Get a future appointment time
        future_date = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T16:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "Emily",
            "owner_last_name": "Rodriguez",
            "email": "emily.rodriguez@email.com",
            "phone": "(555) 123-4567",
            "pet_name": "Bella",
            "pet_type": "dog",
            "reason_for_visit": "Limping and appears to be in pain",
            "primary_vet_hospital": "Chantilly Animal Hospital",
            "how_heard_about_us": "Google search"
        }
        
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code == 200:
            data = response.json()
            if (data.get("owner_first_name") == "Emily" and 
                data.get("pet_name") == "Bella" and 
                data.get("appointment_time") == appointment_time and
                "id" in data and "created_at" in data):
                created_appointment_id = data["id"]
                results.log_success("Create Urgent Care Appointment")
                return True
        results.log_failure("Create Urgent Care Appointment", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Urgent Care Appointment", str(e))
        return False

def test_create_appointment_validation():
    """Test POST /urgent-care-appointments with missing required fields"""
    try:
        incomplete_data = {
            "appointment_time": "2025-01-20T16:30",
            "owner_first_name": "John",
            # Missing required fields
        }
        
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=incomplete_data)
        if response.status_code == 422:  # Validation error
            results.log_success("Create Appointment Validation (Missing Fields)")
            return True
        results.log_failure("Create Appointment Validation", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Create Appointment Validation", str(e))
        return False

def test_get_appointments_admin():
    """Test GET /urgent-care-appointments (admin only) - Enhanced with pagination"""
    if not admin_token:
        results.log_failure("Get Appointments (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
        if response.status_code == 200:
            data = response.json()
            # Check new pagination response format
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and 
                "page" in data and 
                "page_size" in data and 
                "total_pages" in data):
                results.log_success("Get Appointments (Admin - Enhanced Format)")
                return True
            elif isinstance(data, list):
                # Fallback for old format
                results.log_success("Get Appointments (Admin - Legacy Format)")
                return True
        results.log_failure("Get Appointments (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Appointments (Admin)", str(e))
        return False

def test_get_appointments_regular_user():
    """Test GET /urgent-care-appointments with regular user (should fail)"""
    if not user_token:
        results.log_failure("Get Appointments (Regular User - Should Fail)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
        if response.status_code == 403:
            results.log_success("Get Appointments (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Get Appointments (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Get Appointments (Regular User)", str(e))
        return False

def test_get_appointment_details():
    """Test GET /urgent-care-appointments/{id} (admin only)"""
    if not admin_token or not created_appointment_id:
        results.log_failure("Get Appointment Details", "No admin token or appointment ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments/{created_appointment_id}", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("id") == created_appointment_id and 
                data.get("owner_first_name") == "Emily" and
                data.get("pet_name") == "Bella"):
                results.log_success("Get Appointment Details (Admin)")
                return True
        results.log_failure("Get Appointment Details", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Appointment Details", str(e))
        return False

def test_get_appointment_details_not_found():
    """Test GET /urgent-care-appointments/{id} with invalid ID"""
    if not admin_token:
        results.log_failure("Get Appointment Details (Not Found)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_id = "non-existent-appointment-id"
        response = requests.get(f"{API_URL}/urgent-care-appointments/{fake_id}", headers=headers)
        if response.status_code == 404:
            results.log_success("Get Appointment Details (Not Found)")
            return True
        results.log_failure("Get Appointment Details (Not Found)", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Get Appointment Details (Not Found)", str(e))
        return False

def test_time_slots_exclude_booked():
    """Test that time slots exclude already booked appointments"""
    try:
        # First, create an appointment for a specific time
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T17:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "Michael",
            "owner_last_name": "Chen",
            "email": "michael.chen@email.com",
            "phone": "(555) 987-6543",
            "pet_name": "Max",
            "pet_type": "cat",
            "reason_for_visit": "Vomiting and lethargy",
            "primary_vet_hospital": "Local Vet Clinic",
            "how_heard_about_us": "Referral"
        }
        
        # Create the appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Time Slots Exclude Booked (Setup)", f"Failed to create test appointment: {response.status_code}")
            return False
        
        # Now check if that time slot is excluded from available slots
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{future_date}")
        if response.status_code == 200:
            data = response.json()
            if data.get("available") and "slots" in data:
                # Check that 17:00 slot is not in the available slots
                slot_times = [slot["time"] for slot in data["slots"]]
                if "17:00" not in slot_times:
                    results.log_success("Time Slots Exclude Booked Appointments")
                    return True
                else:
                    results.log_failure("Time Slots Exclude Booked", "Booked slot still appears as available")
                    return False
            elif not data.get("available"):
                results.log_success("Time Slots Exclude Booked (Day Closed)")
                return True
        results.log_failure("Time Slots Exclude Booked", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Time Slots Exclude Booked", str(e))
        return False

# ============================================================================
# ENHANCED URGENT CARE BOOKING SYSTEM TESTS - NEW FEATURES
# ============================================================================

def test_appointments_pagination():
    """Test GET /urgent-care-appointments with pagination parameters"""
    if not admin_token:
        results.log_failure("Appointments Pagination", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test with specific page size
        response = requests.get(f"{API_URL}/urgent-care-appointments?page=1&page_size=5", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and 
                "page" in data and data["page"] == 1 and
                "page_size" in data and data["page_size"] == 5 and
                "total_pages" in data and
                isinstance(data["appointments"], list)):
                results.log_success("Appointments Pagination (Page Size 5)")
                return True
        results.log_failure("Appointments Pagination", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Appointments Pagination", str(e))
        return False

def test_appointments_filtering_today():
    """Test GET /urgent-care-appointments with today filter"""
    if not admin_token:
        results.log_failure("Appointments Filtering (Today)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments?filter_days=today", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and
                isinstance(data["appointments"], list)):
                results.log_success("Appointments Filtering (Today)")
                return True
        results.log_failure("Appointments Filtering (Today)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Appointments Filtering (Today)", str(e))
        return False

def test_appointments_filtering_last_7_days():
    """Test GET /urgent-care-appointments with last_7_days filter"""
    if not admin_token:
        results.log_failure("Appointments Filtering (Last 7 Days)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments?filter_days=last_7_days", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and
                isinstance(data["appointments"], list)):
                results.log_success("Appointments Filtering (Last 7 Days)")
                return True
        results.log_failure("Appointments Filtering (Last 7 Days)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Appointments Filtering (Last 7 Days)", str(e))
        return False

def test_appointments_filtering_last_30_days():
    """Test GET /urgent-care-appointments with last_30_days filter"""
    if not admin_token:
        results.log_failure("Appointments Filtering (Last 30 Days)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments?filter_days=last_30_days", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and
                isinstance(data["appointments"], list)):
                results.log_success("Appointments Filtering (Last 30 Days)")
                return True
        results.log_failure("Appointments Filtering (Last 30 Days)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Appointments Filtering (Last 30 Days)", str(e))
        return False

def test_appointments_filtering_last_1_year():
    """Test GET /urgent-care-appointments with last_1_year filter"""
    if not admin_token:
        results.log_failure("Appointments Filtering (Last 1 Year)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments?filter_days=last_1_year", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and
                isinstance(data["appointments"], list)):
                results.log_success("Appointments Filtering (Last 1 Year)")
                return True
        results.log_failure("Appointments Filtering (Last 1 Year)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Appointments Filtering (Last 1 Year)", str(e))
        return False

def test_appointments_pagination_multiple_pages():
    """Test GET /urgent-care-appointments with multiple pages"""
    if not admin_token:
        results.log_failure("Appointments Pagination (Multiple Pages)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # First, create several appointments to test pagination
        from datetime import timedelta
        appointments_created = []
        
        for i in range(3):
            future_date = (datetime.now() + timedelta(days=i+5)).strftime("%Y-%m-%d")
            appointment_time = f"{future_date}T16:{30 + i*10:02d}"
            
            appointment_data = {
                "appointment_time": appointment_time,
                "owner_first_name": f"TestOwner{i}",
                "owner_last_name": "PaginationTest",
                "email": f"test{i}@pagination.com",
                "phone": f"(555) 123-456{i}",
                "pet_name": f"Pet{i}",
                "pet_type": "dog",
                "reason_for_visit": f"Pagination test appointment {i}",
                "primary_vet_hospital": "Test Hospital",
                "how_heard_about_us": "Testing"
            }
            
            response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
            if response.status_code == 200:
                appointments_created.append(response.json()["id"])
        
        # Test pagination with page_size=2
        response = requests.get(f"{API_URL}/urgent-care-appointments?page=1&page_size=2&filter_days=last_1_year", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and
                "page" in data and data["page"] == 1 and
                "page_size" in data and data["page_size"] == 2 and
                "total_pages" in data and
                len(data["appointments"]) <= 2):
                results.log_success("Appointments Pagination (Multiple Pages)")
                return True
        results.log_failure("Appointments Pagination (Multiple Pages)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Appointments Pagination (Multiple Pages)", str(e))
        return False

def test_delete_appointment_admin():
    """Test DELETE /urgent-care-appointments/{id} with admin authentication"""
    if not admin_token:
        results.log_failure("Delete Appointment (Admin)", "No admin token available")
        return False
    
    try:
        # First create an appointment to delete
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T18:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "DeleteTest",
            "owner_last_name": "AdminUser",
            "email": "delete.test@admin.com",
            "phone": "(555) 999-0001",
            "pet_name": "DeleteMe",
            "pet_type": "cat",
            "reason_for_visit": "Test appointment for deletion",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Delete Appointment (Admin - Setup)", f"Failed to create test appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Now delete it
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.delete(f"{API_URL}/urgent-care-appointments/{appointment_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and 
                "freed_slot" in data and 
                data["freed_slot"] == appointment_time):
                results.log_success("Delete Appointment (Admin)")
                return True
        results.log_failure("Delete Appointment (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Delete Appointment (Admin)", str(e))
        return False

def test_delete_appointment_regular_user():
    """Test DELETE /urgent-care-appointments/{id} with regular user (should fail)"""
    if not user_token:
        results.log_failure("Delete Appointment (Regular User - Should Fail)", "No user token available")
        return False
    
    try:
        # First create an appointment to attempt deletion
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T19:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "DeleteTest",
            "owner_last_name": "RegularUser",
            "email": "delete.test@user.com",
            "phone": "(555) 999-0002",
            "pet_name": "CantDeleteMe",
            "pet_type": "dog",
            "reason_for_visit": "Test appointment for failed deletion",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Delete Appointment (Regular User - Setup)", f"Failed to create test appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Try to delete with regular user token (should fail)
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.delete(f"{API_URL}/urgent-care-appointments/{appointment_id}", headers=headers)
        
        if response.status_code == 403:
            results.log_success("Delete Appointment (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Delete Appointment (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Delete Appointment (Regular User)", str(e))
        return False

def test_delete_appointment_invalid_id():
    """Test DELETE /urgent-care-appointments/{id} with invalid ID (should return 404)"""
    if not admin_token:
        results.log_failure("Delete Appointment (Invalid ID)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_id = "non-existent-appointment-id-12345"
        response = requests.delete(f"{API_URL}/urgent-care-appointments/{fake_id}", headers=headers)
        
        if response.status_code == 404:
            results.log_success("Delete Appointment (Invalid ID - 404)")
            return True
        results.log_failure("Delete Appointment (Invalid ID)", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Delete Appointment (Invalid ID)", str(e))
        return False

def test_data_consistency_filtering_pagination():
    """Test data consistency across filtering and pagination"""
    if not admin_token:
        results.log_failure("Data Consistency (Filtering + Pagination)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create appointments with different dates
        from datetime import timedelta
        appointments_created = []
        
        # Create one appointment for today (if possible)
        today = datetime.now().strftime("%Y-%m-%d")
        today_appointment = {
            "appointment_time": f"{today}T20:00",
            "owner_first_name": "TodayTest",
            "owner_last_name": "Consistency",
            "email": "today@consistency.com",
            "phone": "(555) 111-0001",
            "pet_name": "TodayPet",
            "pet_type": "dog",
            "reason_for_visit": "Today's appointment for consistency test",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create future appointments
        for i in range(2):
            future_date = (datetime.now() + timedelta(days=i+10)).strftime("%Y-%m-%d")
            appointment_time = f"{future_date}T17:{30 + i*15:02d}"
            
            appointment_data = {
                "appointment_time": appointment_time,
                "owner_first_name": f"FutureTest{i}",
                "owner_last_name": "Consistency",
                "email": f"future{i}@consistency.com",
                "phone": f"(555) 111-000{i+2}",
                "pet_name": f"FuturePet{i}",
                "pet_type": "cat",
                "reason_for_visit": f"Future appointment {i} for consistency test",
                "primary_vet_hospital": "Test Hospital",
                "how_heard_about_us": "Testing"
            }
            
            response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
            if response.status_code == 200:
                appointments_created.append(response.json()["id"])
        
        # Test filtering with pagination
        response = requests.get(f"{API_URL}/urgent-care-appointments?filter_days=last_1_year&page=1&page_size=10", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (isinstance(data, dict) and 
                "appointments" in data and 
                "total_count" in data and
                "page" in data and
                "page_size" in data and
                "total_pages" in data and
                isinstance(data["appointments"], list)):
                
                # Verify that total_count matches the actual number of appointments
                total_count = data["total_count"]
                if total_count >= len(appointments_created):
                    results.log_success("Data Consistency (Filtering + Pagination)")
                    return True
        results.log_failure("Data Consistency (Filtering + Pagination)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Data Consistency (Filtering + Pagination)", str(e))
        return False

# ============================================================================
# NEW STATUS MANAGEMENT TESTS - ENHANCED URGENT CARE BOOKING SYSTEM
# ============================================================================

# Global variables for status testing
status_test_appointment_id = None

def test_create_appointment_for_status_testing():
    """Create an appointment specifically for status management testing"""
    global status_test_appointment_id
    try:
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T15:30"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "Status",
            "owner_last_name": "TestOwner",
            "email": "status.test@veterinary.com",
            "phone": "(555) 777-8888",
            "pet_name": "StatusPet",
            "pet_type": "dog",
            "reason_for_visit": "Limping after playing in the yard",
            "primary_vet_hospital": "Chantilly Animal Hospital",
            "how_heard_about_us": "Google search"
        }
        
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("status") == "scheduled":
                status_test_appointment_id = data["id"]
                results.log_success("Create Appointment for Status Testing")
                return True
        results.log_failure("Create Appointment for Status Testing", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Appointment for Status Testing", str(e))
        return False

def test_update_appointment_status_valid():
    """Test PATCH /urgent-care-appointments/{id}/status with valid status values"""
    if not admin_token or not status_test_appointment_id:
        results.log_failure("Update Appointment Status (Valid)", "No admin token or test appointment available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test updating to "completed" status
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{status_test_appointment_id}/status",
            params={"status": "completed"},
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            if (data.get("status") == "completed" and 
                "message" in data and 
                "completed" in data["message"]):
                results.log_success("Update Appointment Status (Valid - Completed)")
                return True
        results.log_failure("Update Appointment Status (Valid)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Appointment Status (Valid)", str(e))
        return False

def test_update_appointment_status_invalid():
    """Test PATCH /urgent-care-appointments/{id}/status with invalid status"""
    if not admin_token or not status_test_appointment_id:
        results.log_failure("Update Appointment Status (Invalid)", "No admin token or test appointment available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test with invalid status
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{status_test_appointment_id}/status",
            params={"status": "invalid_status"},
            headers=headers
        )
        
        if response.status_code == 400:
            data = response.json()
            if "Invalid status" in data.get("detail", ""):
                results.log_success("Update Appointment Status (Invalid - 400 Error)")
                return True
        results.log_failure("Update Appointment Status (Invalid)", f"Expected 400, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Appointment Status (Invalid)", str(e))
        return False

def test_update_appointment_status_not_found():
    """Test PATCH /urgent-care-appointments/{id}/status with invalid appointment ID"""
    if not admin_token:
        results.log_failure("Update Appointment Status (Not Found)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_id = "non-existent-appointment-id-12345"
        
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{fake_id}/status",
            params={"status": "completed"},
            headers=headers
        )
        
        if response.status_code == 404:
            results.log_success("Update Appointment Status (Not Found - 404)")
            return True
        results.log_failure("Update Appointment Status (Not Found)", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Appointment Status (Not Found)", str(e))
        return False

def test_update_appointment_status_regular_user():
    """Test PATCH /urgent-care-appointments/{id}/status with regular user (should fail)"""
    if not user_token or not status_test_appointment_id:
        results.log_failure("Update Appointment Status (Regular User)", "No user token or test appointment available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{status_test_appointment_id}/status",
            params={"status": "cancelled"},
            headers=headers
        )
        
        if response.status_code == 403:
            results.log_success("Update Appointment Status (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Update Appointment Status (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Appointment Status (Regular User)", str(e))
        return False

def test_abandoned_appointment_slot_release():
    """Test that abandoned appointments release their time slots"""
    if not admin_token:
        results.log_failure("Abandoned Appointment Slot Release", "No admin token available")
        return False
    
    try:
        from datetime import timedelta
        
        # Create appointment for a specific time slot
        future_date = (datetime.now() + timedelta(days=4)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T16:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "Abandoned",
            "owner_last_name": "SlotTest",
            "email": "abandoned@slottest.com",
            "phone": "(555) 888-9999",
            "pet_name": "AbandonedPet",
            "pet_type": "cat",
            "reason_for_visit": "Vomiting and not eating",
            "primary_vet_hospital": "Local Vet",
            "how_heard_about_us": "Referral"
        }
        
        # Create the appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Abandoned Appointment Slot Release (Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Verify slot is not available (booked)
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{future_date}")
        if response.status_code != 200:
            results.log_failure("Abandoned Appointment Slot Release (Check Booked)", f"Failed to get time slots: {response.status_code}")
            return False
        
        slots_data = response.json()
        if slots_data.get("available"):
            slot_times = [slot["time"] for slot in slots_data.get("slots", [])]
            if "16:00" in slot_times:
                results.log_failure("Abandoned Appointment Slot Release", "Slot should be booked but appears available")
                return False
        
        # Update appointment status to "abandoned"
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{appointment_id}/status",
            params={"status": "abandoned"},
            headers=headers
        )
        
        if response.status_code != 200:
            results.log_failure("Abandoned Appointment Slot Release (Update Status)", f"Failed to update status: {response.status_code}")
            return False
        
        # Verify slot becomes available again
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{future_date}")
        if response.status_code == 200:
            slots_data = response.json()
            if slots_data.get("available"):
                slot_times = [slot["time"] for slot in slots_data.get("slots", [])]
                if "16:00" in slot_times:
                    results.log_success("Abandoned Appointment Slot Release (Slot Available Again)")
                    return True
                else:
                    results.log_failure("Abandoned Appointment Slot Release", "Slot not released after abandoning appointment")
                    return False
            else:
                results.log_success("Abandoned Appointment Slot Release (Day Closed)")
                return True
        results.log_failure("Abandoned Appointment Slot Release (Check Released)", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Abandoned Appointment Slot Release", str(e))
        return False

def test_other_statuses_dont_release_slots():
    """Test that completed, cancelled, no_show statuses don't release time slots"""
    if not admin_token:
        results.log_failure("Other Statuses Don't Release Slots", "No admin token available")
        return False
    
    try:
        from datetime import timedelta
        
        # Create appointment for a specific time slot
        future_date = (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T17:30"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "NoRelease",
            "owner_last_name": "SlotTest",
            "email": "norelease@slottest.com",
            "phone": "(555) 777-6666",
            "pet_name": "NoReleasePet",
            "pet_type": "dog",
            "reason_for_visit": "Coughing and wheezing",
            "primary_vet_hospital": "Main Vet Clinic",
            "how_heard_about_us": "Website"
        }
        
        # Create the appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Other Statuses Don't Release Slots (Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Update appointment status to "completed" (should NOT release slot)
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.patch(
            f"{API_URL}/urgent-care-appointments/{appointment_id}/status",
            params={"status": "completed"},
            headers=headers
        )
        
        if response.status_code != 200:
            results.log_failure("Other Statuses Don't Release Slots (Update Status)", f"Failed to update status: {response.status_code}")
            return False
        
        # Verify slot is still NOT available (not released)
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{future_date}")
        if response.status_code == 200:
            slots_data = response.json()
            if slots_data.get("available"):
                slot_times = [slot["time"] for slot in slots_data.get("slots", [])]
                if "17:30" not in slot_times:
                    results.log_success("Other Statuses Don't Release Slots (Slot Still Blocked)")
                    return True
                else:
                    results.log_failure("Other Statuses Don't Release Slots", "Slot was incorrectly released for completed status")
                    return False
            else:
                results.log_success("Other Statuses Don't Release Slots (Day Closed)")
                return True
        results.log_failure("Other Statuses Don't Release Slots (Check)", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Other Statuses Don't Release Slots", str(e))
        return False

def test_all_valid_status_values():
    """Test updating appointment to all valid status values"""
    if not admin_token:
        results.log_failure("All Valid Status Values", "No admin token available")
        return False
    
    try:
        from datetime import timedelta
        
        # Create appointment for testing all statuses
        future_date = (datetime.now() + timedelta(days=6)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T18:30"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "AllStatus",
            "owner_last_name": "TestUser",
            "email": "allstatus@test.com",
            "phone": "(555) 999-1111",
            "pet_name": "AllStatusPet",
            "pet_type": "cat",
            "reason_for_visit": "Behavioral changes and lethargy",
            "primary_vet_hospital": "Emergency Vet",
            "how_heard_about_us": "Emergency referral"
        }
        
        # Create the appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("All Valid Status Values (Setup)", f"Failed to create appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test all valid statuses
        valid_statuses = ["scheduled", "completed", "cancelled", "no_show", "abandoned"]
        
        for status in valid_statuses:
            response = requests.patch(
                f"{API_URL}/urgent-care-appointments/{appointment_id}/status",
                params={"status": status},
                headers=headers
            )
            
            if response.status_code != 200:
                results.log_failure("All Valid Status Values", f"Failed to update to {status}: {response.status_code}")
                return False
            
            data = response.json()
            if data.get("status") != status:
                results.log_failure("All Valid Status Values", f"Status not updated correctly to {status}")
                return False
        
        results.log_success("All Valid Status Values (All 5 Statuses)")
        return True
    except Exception as e:
        results.log_failure("All Valid Status Values", str(e))
        return False

def test_time_slots_exclude_abandoned_appointments():
    """Test that time slots API excludes abandoned appointments but includes others"""
    try:
        from datetime import timedelta
        
        # Create two appointments for the same day
        future_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
        
        # First appointment - will be abandoned
        abandoned_appointment_data = {
            "appointment_time": f"{future_date}T19:00",
            "owner_first_name": "WillBeAbandoned",
            "owner_last_name": "TestUser",
            "email": "abandoned@exclude.com",
            "phone": "(555) 111-2222",
            "pet_name": "AbandonedPet",
            "pet_type": "dog",
            "reason_for_visit": "Will be abandoned",
            "primary_vet_hospital": "Test Clinic",
            "how_heard_about_us": "Testing"
        }
        
        # Second appointment - will remain scheduled
        scheduled_appointment_data = {
            "appointment_time": f"{future_date}T19:30",
            "owner_first_name": "WillStayScheduled",
            "owner_last_name": "TestUser",
            "email": "scheduled@exclude.com",
            "phone": "(555) 333-4444",
            "pet_name": "ScheduledPet",
            "pet_type": "cat",
            "reason_for_visit": "Will stay scheduled",
            "primary_vet_hospital": "Test Clinic",
            "how_heard_about_us": "Testing"
        }
        
        # Create both appointments
        response1 = requests.post(f"{API_URL}/urgent-care-appointments", json=abandoned_appointment_data)
        response2 = requests.post(f"{API_URL}/urgent-care-appointments", json=scheduled_appointment_data)
        
        if response1.status_code != 200 or response2.status_code != 200:
            results.log_failure("Time Slots Exclude Abandoned (Setup)", "Failed to create test appointments")
            return False
        
        abandoned_id = response1.json()["id"]
        scheduled_id = response2.json()["id"]
        
        # Update first appointment to abandoned
        if admin_token:
            headers = {"Authorization": f"Bearer {admin_token}"}
            response = requests.patch(
                f"{API_URL}/urgent-care-appointments/{abandoned_id}/status",
                params={"status": "abandoned"},
                headers=headers
            )
            
            if response.status_code != 200:
                results.log_failure("Time Slots Exclude Abandoned (Update)", f"Failed to abandon appointment: {response.status_code}")
                return False
        
        # Check time slots - should show 19:00 as available but not 19:30
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{future_date}")
        if response.status_code == 200:
            slots_data = response.json()
            if slots_data.get("available"):
                slot_times = [slot["time"] for slot in slots_data.get("slots", [])]
                
                # 19:00 should be available (abandoned appointment)
                # 19:30 should NOT be available (scheduled appointment)
                if "19:00" in slot_times and "19:30" not in slot_times:
                    results.log_success("Time Slots Exclude Abandoned (Correct Filtering)")
                    return True
                elif "19:00" not in slot_times and "19:30" not in slot_times:
                    results.log_failure("Time Slots Exclude Abandoned", "Both slots blocked - abandoned slot not released")
                    return False
                else:
                    results.log_failure("Time Slots Exclude Abandoned", f"Unexpected slot availability: 19:00={19:00 in slot_times}, 19:30={'19:30' in slot_times}")
                    return False
            else:
                results.log_success("Time Slots Exclude Abandoned (Day Closed)")
                return True
        results.log_failure("Time Slots Exclude Abandoned (Check)", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Time Slots Exclude Abandoned", str(e))
        return False

def test_deleted_appointments_removed_from_results():
    """Test that deleted appointments are properly removed from filtered results"""
    if not admin_token:
        results.log_failure("Deleted Appointments Removed", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create an appointment
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T16:30"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "DeletedTest",
            "owner_last_name": "RemovalCheck",
            "email": "deleted@removal.com",
            "phone": "(555) 222-0001",
            "pet_name": "WillBeDeleted",
            "pet_type": "dog",
            "reason_for_visit": "Appointment to be deleted for removal test",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        # Create appointment
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code != 200:
            results.log_failure("Deleted Appointments Removed (Setup)", f"Failed to create test appointment: {response.status_code}")
            return False
        
        appointment_id = response.json()["id"]
        
        # Get appointments count before deletion
        response = requests.get(f"{API_URL}/urgent-care-appointments?filter_days=last_1_year", headers=headers)
        if response.status_code != 200:
            results.log_failure("Deleted Appointments Removed (Pre-Delete Count)", f"Failed to get appointments: {response.status_code}")
            return False
        
        count_before = response.json()["total_count"]
        
        # Delete the appointment
        response = requests.delete(f"{API_URL}/urgent-care-appointments/{appointment_id}", headers=headers)
        if response.status_code != 200:
            results.log_failure("Deleted Appointments Removed (Delete)", f"Failed to delete appointment: {response.status_code}")
            return False
        
        # Get appointments count after deletion
        response = requests.get(f"{API_URL}/urgent-care-appointments?filter_days=last_1_year", headers=headers)
        if response.status_code == 200:
            count_after = response.json()["total_count"]
            if count_after == count_before - 1:
                results.log_success("Deleted Appointments Removed from Results")
                return True
            else:
                results.log_failure("Deleted Appointments Removed", f"Count before: {count_before}, Count after: {count_after}")
                return False
        results.log_failure("Deleted Appointments Removed (Post-Delete Count)", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Deleted Appointments Removed", str(e))
        return False

# ============================================================================
# PATIENT REGISTRATION PDF SYSTEM TESTS
# ============================================================================

# Global variables for patient registration testing
created_registration_id = None

def test_patient_registration_submit():
    """Test POST /api/patient-registration - Submit patient registration form data"""
    global created_registration_id
    try:
        # Complete form data with all required and optional fields
        registration_data = {
            # Owner Information (Required)
            "owner_first_name": "Sarah",
            "owner_last_name": "Johnson",
            "address": "123 Maple Street",
            "city": "Chantilly",
            "state": "VA",
            "zip_code": "20151",
            "email": "sarah.johnson@email.com",
            "phone": "(571) 555-0123",
            
            # Emergency Contact (Optional)
            "emergency_contact_name": "Michael Johnson",
            "emergency_contact_phone": "(571) 555-0124",
            
            # Pet Information (Required)
            "pet_name": "Bella",
            "pet_species": "Dog",
            "pet_gender": "Female",
            "pet_age": "3 years",
            
            # Pet Information (Optional)
            "pet_breed": "Golden Retriever",
            "pet_weight": "65 lbs",
            "pet_color": "Golden",
            "spayed_neutered": "Yes",
            
            # Medical History (Optional)
            "current_medications": "None",
            "allergies": "None known",
            "previous_vet": "Chantilly Animal Hospital",
            "previous_vet_phone": "(703) 555-0100",
            "last_visit_date": "2024-06-15",
            "vaccination_history": "Up to date on all core vaccines",
            "medical_conditions": "None",
            
            # Additional Information (Optional)
            "how_heard_about_us": "Google search",
            "preferred_appointment_type": "In-person",
            "special_instructions": "Bella is very friendly but gets nervous around other dogs"
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=registration_data)
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and 
                "registration_id" in data and 
                "successfully" in data["message"].lower()):
                created_registration_id = data["registration_id"]
                results.log_success("Patient Registration Submit (Complete Data)")
                return True
        results.log_failure("Patient Registration Submit", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Submit", str(e))
        return False

def test_patient_registration_validation():
    """Test POST /api/patient-registration with missing required fields"""
    try:
        # Missing required fields
        incomplete_data = {
            "owner_first_name": "John",
            "pet_name": "Max",
            # Missing other required fields like owner_last_name, address, etc.
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=incomplete_data)
        if response.status_code == 422:  # Validation error
            results.log_success("Patient Registration Validation (Missing Required Fields)")
            return True
        results.log_failure("Patient Registration Validation", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Validation", str(e))
        return False

def test_patient_registration_minimal_data():
    """Test POST /api/patient-registration with only required fields"""
    try:
        # Only required fields
        minimal_data = {
            "owner_first_name": "Emily",
            "owner_last_name": "Davis",
            "address": "456 Oak Avenue",
            "city": "Ashburn",
            "state": "VA",
            "zip_code": "20147",
            "email": "emily.davis@email.com",
            "phone": "(571) 555-0200",
            "pet_name": "Charlie",
            "pet_species": "Cat",
            "pet_gender": "Male",
            "pet_age": "2 years"
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=minimal_data)
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and 
                "registration_id" in data and 
                "successfully" in data["message"].lower()):
                results.log_success("Patient Registration Submit (Minimal Required Data)")
                return True
        results.log_failure("Patient Registration Submit (Minimal)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Submit (Minimal)", str(e))
        return False

def test_patient_registration_pdf_generation():
    """Test POST /api/patient-registration/pdf - Generate PDF and store data"""
    try:
        # Complete form data for PDF generation
        pdf_registration_data = {
            "owner_first_name": "Michael",
            "owner_last_name": "Rodriguez",
            "address": "789 Pine Street",
            "city": "South Riding",
            "state": "VA",
            "zip_code": "20152",
            "email": "michael.rodriguez@email.com",
            "phone": "(571) 555-0300",
            "emergency_contact_name": "Maria Rodriguez",
            "emergency_contact_phone": "(571) 555-0301",
            "pet_name": "Luna",
            "pet_species": "Dog",
            "pet_breed": "Border Collie",
            "pet_gender": "Female",
            "pet_age": "1.5 years",
            "pet_weight": "45 lbs",
            "pet_color": "Black and White",
            "spayed_neutered": "No",
            "current_medications": "Heartworm prevention",
            "allergies": "Chicken",
            "previous_vet": "Aldie Animal Hospital",
            "previous_vet_phone": "(703) 555-0200",
            "last_visit_date": "2024-08-20",
            "vaccination_history": "Puppy series completed, due for annual boosters",
            "medical_conditions": "Mild hip dysplasia",
            "how_heard_about_us": "Veterinarian referral",
            "preferred_appointment_type": "Urgent care",
            "special_instructions": "Luna is very energetic and may need extra handling during examination"
        }
        
        response = requests.post(f"{API_URL}/patient-registration/pdf", json=pdf_registration_data)
        if response.status_code == 200:
            # Check if response is PDF
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            if ('application/pdf' in content_type and 
                'attachment' in content_disposition and 
                'patient_registration_' in content_disposition and
                len(response.content) > 1000):  # PDF should be substantial size
                results.log_success("Patient Registration PDF Generation (Complete)")
                return True
            else:
                results.log_failure("Patient Registration PDF Generation", f"Invalid PDF response - Content-Type: {content_type}, Size: {len(response.content)}")
                return False
        results.log_failure("Patient Registration PDF Generation", f"Status: {response.status_code}, Response: {response.text[:200]}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Generation", str(e))
        return False

def test_patient_registration_pdf_minimal():
    """Test POST /api/patient-registration/pdf with minimal required data"""
    try:
        minimal_pdf_data = {
            "owner_first_name": "Jennifer",
            "owner_last_name": "Wilson",
            "address": "321 Cedar Lane",
            "city": "Herndon",
            "state": "VA",
            "zip_code": "20170",
            "email": "jennifer.wilson@email.com",
            "phone": "(571) 555-0400",
            "pet_name": "Whiskers",
            "pet_species": "Cat",
            "pet_gender": "Male",
            "pet_age": "5 years"
        }
        
        response = requests.post(f"{API_URL}/patient-registration/pdf", json=minimal_pdf_data)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            if ('application/pdf' in content_type and 
                'attachment' in content_disposition and
                len(response.content) > 500):
                results.log_success("Patient Registration PDF Generation (Minimal Data)")
                return True
        results.log_failure("Patient Registration PDF Generation (Minimal)", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Generation (Minimal)", str(e))
        return False

def test_get_existing_registration_pdf():
    """Test GET /api/patient-registration/{id}/pdf - Retrieve PDF for existing registration"""
    if not created_registration_id:
        results.log_failure("Get Existing Registration PDF", "No registration ID available from previous test")
        return False
    
    try:
        response = requests.get(f"{API_URL}/patient-registration/{created_registration_id}/pdf")
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            if ('application/pdf' in content_type and 
                'attachment' in content_disposition and 
                'patient_registration_' in content_disposition and
                len(response.content) > 1000):
                results.log_success("Get Existing Registration PDF")
                return True
        results.log_failure("Get Existing Registration PDF", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Get Existing Registration PDF", str(e))
        return False

def test_get_nonexistent_registration_pdf():
    """Test GET /api/patient-registration/{id}/pdf with invalid registration ID"""
    try:
        fake_id = "non-existent-registration-id-12345"
        response = requests.get(f"{API_URL}/patient-registration/{fake_id}/pdf")
        if response.status_code == 404:
            results.log_success("Get Nonexistent Registration PDF (404)")
            return True
        results.log_failure("Get Nonexistent Registration PDF", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Get Nonexistent Registration PDF", str(e))
        return False

def test_patient_registration_data_persistence():
    """Test that patient registration data is properly stored in database"""
    try:
        # Create registration with specific data
        test_data = {
            "owner_first_name": "DataTest",
            "owner_last_name": "Persistence",
            "address": "999 Test Street",
            "city": "Centreville",
            "state": "VA",
            "zip_code": "20121",
            "email": "datatest@persistence.com",
            "phone": "(571) 555-9999",
            "pet_name": "TestPet",
            "pet_species": "Dog",
            "pet_gender": "Female",
            "pet_age": "4 years",
            "pet_breed": "Labrador",
            "special_instructions": "This is a test for data persistence"
        }
        
        # Submit registration
        response = requests.post(f"{API_URL}/patient-registration", json=test_data)
        if response.status_code == 200:
            data = response.json()
            registration_id = data.get("registration_id")
            
            if registration_id:
                # Try to retrieve PDF (which reads from database)
                pdf_response = requests.get(f"{API_URL}/patient-registration/{registration_id}/pdf")
                if pdf_response.status_code == 200:
                    content_type = pdf_response.headers.get('content-type', '')
                    if 'application/pdf' in content_type:
                        results.log_success("Patient Registration Data Persistence")
                        return True
        results.log_failure("Patient Registration Data Persistence", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Data Persistence", str(e))
        return False

def test_patient_registration_unique_ids():
    """Test that each registration gets a unique ID"""
    try:
        registration_ids = []
        
        # Create multiple registrations
        for i in range(3):
            test_data = {
                "owner_first_name": f"UniqueTest{i}",
                "owner_last_name": "IDGeneration",
                "address": f"{100 + i} Unique Street",
                "city": "Reston",
                "state": "VA",
                "zip_code": "20190",
                "email": f"unique{i}@idtest.com",
                "phone": f"(571) 555-{1000 + i}",
                "pet_name": f"UniquePet{i}",
                "pet_species": "Cat",
                "pet_gender": "Male",
                "pet_age": f"{i + 1} years"
            }
            
            response = requests.post(f"{API_URL}/patient-registration", json=test_data)
            if response.status_code == 200:
                data = response.json()
                registration_id = data.get("registration_id")
                if registration_id:
                    registration_ids.append(registration_id)
        
        # Check that all IDs are unique
        if len(registration_ids) == 3 and len(set(registration_ids)) == 3:
            results.log_success("Patient Registration Unique IDs")
            return True
        results.log_failure("Patient Registration Unique IDs", f"Generated IDs: {registration_ids}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Unique IDs", str(e))
        return False

def test_patient_registration_email_validation():
    """Test patient registration with invalid email format"""
    try:
        invalid_email_data = {
            "owner_first_name": "Invalid",
            "owner_last_name": "Email",
            "address": "123 Invalid Street",
            "city": "Chantilly",
            "state": "VA",
            "zip_code": "20151",
            "email": "invalid-email-format",  # Invalid email
            "phone": "(571) 555-0500",
            "pet_name": "InvalidEmailPet",
            "pet_species": "Dog",
            "pet_gender": "Male",
            "pet_age": "2 years"
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=invalid_email_data)
        if response.status_code == 422:  # Validation error for invalid email
            results.log_success("Patient Registration Email Validation (Invalid Email)")
            return True
        results.log_failure("Patient Registration Email Validation", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Email Validation", str(e))
        return False

def test_patient_registration_pdf_filename():
    """Test that PDF filename includes pet name and registration ID"""
    try:
        filename_test_data = {
            "owner_first_name": "Filename",
            "owner_last_name": "Test",
            "address": "123 Filename Street",
            "city": "Ashburn",
            "state": "VA",
            "zip_code": "20147",
            "email": "filename@test.com",
            "phone": "(571) 555-0600",
            "pet_name": "FilenameTestPet",
            "pet_species": "Cat",
            "pet_gender": "Female",
            "pet_age": "3 years"
        }
        
        response = requests.post(f"{API_URL}/patient-registration/pdf", json=filename_test_data)
        if response.status_code == 200:
            content_disposition = response.headers.get('content-disposition', '')
            
            if ('attachment' in content_disposition and 
                'patient_registration_' in content_disposition and
                'FilenameTestPet' in content_disposition and
                '.pdf' in content_disposition):
                results.log_success("Patient Registration PDF Filename Format")
                return True
        results.log_failure("Patient Registration PDF Filename", f"Content-Disposition: {content_disposition}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Filename", str(e))
        return False

# ============================================================================
# REVIEWS API TESTS - NEW IMPLEMENTATION
# ============================================================================

# Global variables for reviews testing
created_review_ids = []

def test_get_reviews_public():
    """Test GET /api/reviews (public endpoint for home page)"""
    try:
        response = requests.get(f"{API_URL}/reviews")
        if response.status_code == 200:
            data = response.json()
            if ("reviews" in data and 
                isinstance(data["reviews"], list) and
                len(data["reviews"]) <= 3):  # Max 3 reviews
                results.log_success("Get Reviews (Public Endpoint)")
                return True
        results.log_failure("Get Reviews (Public)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Reviews (Public)", str(e))
        return False

def test_get_reviews_manage_admin():
    """Test GET /api/reviews/manage (admin-only endpoint)"""
    if not admin_token:
        results.log_failure("Get Reviews Manage (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/reviews/manage", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if ("reviews" in data and 
                isinstance(data["reviews"], list)):
                results.log_success("Get Reviews Manage (Admin)")
                return True
        results.log_failure("Get Reviews Manage (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Reviews Manage (Admin)", str(e))
        return False

def test_get_reviews_manage_regular_user():
    """Test GET /api/reviews/manage with regular user (should fail)"""
    if not user_token:
        results.log_failure("Get Reviews Manage (Regular User - Should Fail)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        response = requests.get(f"{API_URL}/reviews/manage", headers=headers)
        if response.status_code == 403:
            results.log_success("Get Reviews Manage (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Get Reviews Manage (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Get Reviews Manage (Regular User)", str(e))
        return False

def test_create_review_admin():
    """Test POST /api/reviews (admin-only endpoint)"""
    global created_review_ids
    if not admin_token:
        results.log_failure("Create Review (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        review_data = {
            "text": "Dr. Johnson and her team provided exceptional care for my golden retriever Max. The staff was professional, compassionate, and took the time to explain everything thoroughly.",
            "pet_name": "Max",
            "owner_name": "Sarah Thompson"
        }
        
        response = requests.post(f"{API_URL}/reviews", json=review_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("text") == review_data["text"] and
                data.get("pet_name") == review_data["pet_name"] and
                data.get("owner_name") == review_data["owner_name"] and
                data.get("rating") == 5 and  # Always 5 stars
                "id" in data and
                "created_at" in data and
                "updated_at" in data):
                created_review_ids.append(data["id"])
                results.log_success("Create Review (Admin)")
                return True
        results.log_failure("Create Review (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Review (Admin)", str(e))
        return False

def test_create_review_regular_user():
    """Test POST /api/reviews with regular user (should fail)"""
    if not user_token:
        results.log_failure("Create Review (Regular User - Should Fail)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        review_data = {
            "text": "Great service for my cat Whiskers!",
            "pet_name": "Whiskers",
            "owner_name": "John Doe"
        }
        
        response = requests.post(f"{API_URL}/reviews", json=review_data, headers=headers)
        if response.status_code == 403:
            results.log_success("Create Review (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Create Review (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Create Review (Regular User)", str(e))
        return False

def test_create_multiple_reviews():
    """Test creating multiple reviews to test the 3-review limit"""
    global created_review_ids
    if not admin_token:
        results.log_failure("Create Multiple Reviews", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create second review
        review_data_2 = {
            "text": "Outstanding emergency care for my cat Luna. The veterinary team was quick to diagnose and treat her condition. Highly recommend this clinic!",
            "pet_name": "Luna",
            "owner_name": "Michael Rodriguez"
        }
        
        response = requests.post(f"{API_URL}/reviews", json=review_data_2, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                created_review_ids.append(data["id"])
        
        # Create third review
        review_data_3 = {
            "text": "The preventive care program has kept my dog Bella healthy for years. The staff remembers us every visit and provides personalized attention.",
            "pet_name": "Bella",
            "owner_name": "Emily Chen"
        }
        
        response = requests.post(f"{API_URL}/reviews", json=review_data_3, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                created_review_ids.append(data["id"])
                results.log_success("Create Multiple Reviews (Up to 3)")
                return True
        results.log_failure("Create Multiple Reviews", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Multiple Reviews", str(e))
        return False

def test_create_review_limit_enforcement():
    """Test that creating a 4th review fails (3-review limit)"""
    if not admin_token:
        results.log_failure("Create Review Limit Enforcement", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        review_data_4 = {
            "text": "This should fail due to 3-review limit.",
            "pet_name": "TestPet",
            "owner_name": "Test Owner"
        }
        
        response = requests.post(f"{API_URL}/reviews", json=review_data_4, headers=headers)
        if response.status_code == 400:
            data = response.json()
            if "Maximum of 3 reviews allowed" in data.get("detail", ""):
                results.log_success("Create Review Limit Enforcement (3-Review Limit)")
                return True
        results.log_failure("Create Review Limit Enforcement", f"Expected 400 with limit message, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Create Review Limit Enforcement", str(e))
        return False

def test_update_review_admin():
    """Test PUT /api/reviews/{review_id} (admin-only endpoint)"""
    if not admin_token or not created_review_ids:
        results.log_failure("Update Review (Admin)", "No admin token or review ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        review_id = created_review_ids[0]
        
        update_data = {
            "text": "Updated review text: Dr. Johnson and her team provided absolutely exceptional care for my golden retriever Max. The entire experience was outstanding!",
            "pet_name": "Max (Updated)",
            "owner_name": "Sarah Thompson-Updated"
        }
        
        response = requests.put(f"{API_URL}/reviews/{review_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("text") == update_data["text"] and
                data.get("pet_name") == update_data["pet_name"] and
                data.get("owner_name") == update_data["owner_name"] and
                data.get("rating") == 5 and  # Should remain 5
                data.get("id") == review_id):
                results.log_success("Update Review (Admin)")
                return True
        results.log_failure("Update Review (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Review (Admin)", str(e))
        return False

def test_update_review_partial():
    """Test PUT /api/reviews/{review_id} with partial update"""
    if not admin_token or not created_review_ids:
        results.log_failure("Update Review (Partial)", "No admin token or review ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        review_id = created_review_ids[0]
        
        # Only update text, leave other fields unchanged
        update_data = {
            "text": "Partially updated review text with new content."
        }
        
        response = requests.put(f"{API_URL}/reviews/{review_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("text") == update_data["text"] and
                data.get("rating") == 5 and
                data.get("id") == review_id):
                results.log_success("Update Review (Partial Update)")
                return True
        results.log_failure("Update Review (Partial)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Review (Partial)", str(e))
        return False

def test_update_review_regular_user():
    """Test PUT /api/reviews/{review_id} with regular user (should fail)"""
    if not user_token or not created_review_ids:
        results.log_failure("Update Review (Regular User - Should Fail)", "No user token or review ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        review_id = created_review_ids[0]
        
        update_data = {
            "text": "This update should fail."
        }
        
        response = requests.put(f"{API_URL}/reviews/{review_id}", json=update_data, headers=headers)
        if response.status_code == 403:
            results.log_success("Update Review (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Update Review (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Review (Regular User)", str(e))
        return False

def test_update_review_not_found():
    """Test PUT /api/reviews/{review_id} with invalid review ID"""
    if not admin_token:
        results.log_failure("Update Review (Not Found)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_review_id = "non-existent-review-id-12345"
        
        update_data = {
            "text": "This should fail."
        }
        
        response = requests.put(f"{API_URL}/reviews/{fake_review_id}", json=update_data, headers=headers)
        if response.status_code == 404:
            results.log_success("Update Review (Not Found - 404)")
            return True
        results.log_failure("Update Review (Not Found)", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Review (Not Found)", str(e))
        return False

def test_delete_review_admin():
    """Test DELETE /api/reviews/{review_id} (admin-only endpoint)"""
    if not admin_token or not created_review_ids:
        results.log_failure("Delete Review (Admin)", "No admin token or review ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Delete the last created review
        review_id = created_review_ids[-1]
        
        response = requests.delete(f"{API_URL}/reviews/{review_id}", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "deleted successfully" in data["message"]:
                created_review_ids.remove(review_id)  # Remove from our tracking
                results.log_success("Delete Review (Admin)")
                return True
        results.log_failure("Delete Review (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Delete Review (Admin)", str(e))
        return False

def test_delete_review_regular_user():
    """Test DELETE /api/reviews/{review_id} with regular user (should fail)"""
    if not user_token or not created_review_ids:
        results.log_failure("Delete Review (Regular User - Should Fail)", "No user token or review ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        review_id = created_review_ids[0]
        
        response = requests.delete(f"{API_URL}/reviews/{review_id}", headers=headers)
        if response.status_code == 403:
            results.log_success("Delete Review (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Delete Review (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Delete Review (Regular User)", str(e))
        return False

def test_delete_review_not_found():
    """Test DELETE /api/reviews/{review_id} with invalid review ID"""
    if not admin_token:
        results.log_failure("Delete Review (Not Found)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_review_id = "non-existent-review-id-67890"
        
        response = requests.delete(f"{API_URL}/reviews/{fake_review_id}", headers=headers)
        if response.status_code == 404:
            results.log_success("Delete Review (Not Found - 404)")
            return True
        results.log_failure("Delete Review (Not Found)", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Delete Review (Not Found)", str(e))
        return False

def test_create_review_after_deletion():
    """Test creating a new review after deletion (should work within 3-review limit)"""
    if not admin_token:
        results.log_failure("Create Review After Deletion", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        review_data = {
            "text": "New review created after deletion. The surgical team did an amazing job with my dog's procedure.",
            "pet_name": "Rocky",
            "owner_name": "David Wilson"
        }
        
        response = requests.post(f"{API_URL}/reviews", json=review_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("text") == review_data["text"] and
                data.get("pet_name") == review_data["pet_name"] and
                data.get("owner_name") == review_data["owner_name"] and
                data.get("rating") == 5 and
                "id" in data):
                created_review_ids.append(data["id"])
                results.log_success("Create Review After Deletion")
                return True
        results.log_failure("Create Review After Deletion", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Review After Deletion", str(e))
        return False

def test_reviews_database_storage():
    """Test that reviews are properly stored in MongoDB with correct fields"""
    if not admin_token:
        results.log_failure("Reviews Database Storage", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get all reviews via management endpoint
        response = requests.get(f"{API_URL}/reviews/manage", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "reviews" in data and len(data["reviews"]) > 0:
                review = data["reviews"][0]
                required_fields = ["id", "text", "pet_name", "owner_name", "rating", "created_at", "updated_at"]
                
                if all(field in review for field in required_fields):
                    if (review["rating"] == 5 and  # Always 5 stars
                        isinstance(review["text"], str) and
                        isinstance(review["pet_name"], str) and
                        isinstance(review["owner_name"], str)):
                        results.log_success("Reviews Database Storage (Correct Fields)")
                        return True
        results.log_failure("Reviews Database Storage", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Reviews Database Storage", str(e))
        return False

def test_reviews_public_endpoint_limit():
    """Test that public endpoint returns maximum 3 reviews"""
    try:
        response = requests.get(f"{API_URL}/reviews")
        if response.status_code == 200:
            data = response.json()
            if ("reviews" in data and 
                isinstance(data["reviews"], list) and
                len(data["reviews"]) <= 3):
                results.log_success("Reviews Public Endpoint (Max 3 Reviews)")
                return True
        results.log_failure("Reviews Public Endpoint Limit", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Reviews Public Endpoint Limit", str(e))
        return False

def test_review_validation():
    """Test review creation with missing required fields"""
    if not admin_token:
        results.log_failure("Review Validation", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test with missing required fields
        incomplete_review = {
            "text": "This review is missing pet_name and owner_name"
            # Missing pet_name and owner_name
        }
        
        response = requests.post(f"{API_URL}/reviews", json=incomplete_review, headers=headers)
        if response.status_code == 422:  # Validation error
            results.log_success("Review Validation (Missing Required Fields)")
            return True
        results.log_failure("Review Validation", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Review Validation", str(e))
        return False

# ============================================================================
# BUSINESS INFORMATION API TESTS - NEW IMPLEMENTATION
# ============================================================================

def test_get_business_info_public():
    """Test GET /api/business-info (public endpoint)"""
    try:
        response = requests.get(f"{API_URL}/business-info")
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "hospital_name", "tagline", "phone", "email", "address", "created_at", "updated_at"]
            optional_fields = ["facebook_link", "instagram_link", "twitter_link"]
            
            if all(field in data for field in required_fields):
                # Check that default values are created if no data exists
                if (data.get("hospital_name") == "Pets and Vets Animal Hospital & Urgent Care" and
                    data.get("tagline") == "Compassionate Care for Your Beloved Pets" and
                    data.get("phone") == "(703) 957-3297" and
                    data.get("email") == "vet@petsandvetsanimalhospital.com"):
                    results.log_success("Get Business Info (Public - Default Values)")
                    return True
                else:
                    results.log_success("Get Business Info (Public - Existing Data)")
                    return True
        results.log_failure("Get Business Info (Public)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Business Info (Public)", str(e))
        return False

def test_get_business_info_creates_default():
    """Test that GET /api/business-info creates default values if none exist"""
    try:
        # First call should create default values
        response = requests.get(f"{API_URL}/business-info")
        if response.status_code == 200:
            data = response.json()
            
            # Verify default values are present
            if (data.get("hospital_name") and
                data.get("tagline") and
                data.get("phone") and
                data.get("email") and
                data.get("address") and
                "id" in data and
                "created_at" in data and
                "updated_at" in data):
                
                # Second call should return the same data
                response2 = requests.get(f"{API_URL}/business-info")
                if response2.status_code == 200:
                    data2 = response2.json()
                    if data["id"] == data2["id"]:
                        results.log_success("Get Business Info (Creates Default Values)")
                        return True
        results.log_failure("Get Business Info (Creates Default)", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Get Business Info (Creates Default)", str(e))
        return False

def test_update_business_info_admin():
    """Test PUT /api/business-info with admin authentication (full update)"""
    if not admin_token:
        results.log_failure("Update Business Info (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_data = {
            "hospital_name": "Updated Pets and Vets Animal Hospital",
            "tagline": "Updated Compassionate Care for Your Beloved Pets",
            "phone": "(703) 957-3298",
            "email": "updated@petsandvetsanimalhospital.com",
            "address": "Updated 43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
            "facebook_link": "https://facebook.com/petsandvets",
            "instagram_link": "https://instagram.com/petsandvets",
            "twitter_link": "https://twitter.com/petsandvets"
        }
        
        response = requests.put(f"{API_URL}/business-info", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("hospital_name") == update_data["hospital_name"] and
                data.get("tagline") == update_data["tagline"] and
                data.get("phone") == update_data["phone"] and
                data.get("email") == update_data["email"] and
                data.get("address") == update_data["address"] and
                data.get("facebook_link") == update_data["facebook_link"] and
                data.get("instagram_link") == update_data["instagram_link"] and
                data.get("twitter_link") == update_data["twitter_link"] and
                "id" in data and
                "created_at" in data and
                "updated_at" in data):
                results.log_success("Update Business Info (Admin - Full Update)")
                return True
        results.log_failure("Update Business Info (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Business Info (Admin)", str(e))
        return False

def test_update_business_info_partial():
    """Test PUT /api/business-info with partial updates"""
    if not admin_token:
        results.log_failure("Update Business Info (Partial)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Only update hospital name and tagline
        partial_update = {
            "hospital_name": "Partially Updated Hospital Name",
            "tagline": "Partially Updated Tagline"
        }
        
        response = requests.put(f"{API_URL}/business-info", json=partial_update, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("hospital_name") == partial_update["hospital_name"] and
                data.get("tagline") == partial_update["tagline"] and
                "phone" in data and  # Should retain existing values
                "email" in data and
                "address" in data and
                "id" in data):
                results.log_success("Update Business Info (Partial Update)")
                return True
        results.log_failure("Update Business Info (Partial)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Business Info (Partial)", str(e))
        return False

def test_update_business_info_no_auth():
    """Test PUT /api/business-info without authentication (should fail)"""
    try:
        update_data = {
            "hospital_name": "Unauthorized Update Attempt"
        }
        
        response = requests.put(f"{API_URL}/business-info", json=update_data)
        if response.status_code == 401:
            results.log_success("Update Business Info (No Auth - Correctly Unauthorized)")
            return True
        results.log_failure("Update Business Info (No Auth)", f"Expected 401, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Business Info (No Auth)", str(e))
        return False

def test_update_business_info_regular_user():
    """Test PUT /api/business-info with regular user (should fail with 403)"""
    if not user_token:
        results.log_failure("Update Business Info (Regular User - Should Fail)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        update_data = {
            "hospital_name": "Regular User Update Attempt"
        }
        
        response = requests.put(f"{API_URL}/business-info", json=update_data, headers=headers)
        if response.status_code == 403:
            results.log_success("Update Business Info (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Update Business Info (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Business Info (Regular User)", str(e))
        return False

def test_business_info_social_media_optional():
    """Test that social media fields are optional and handle empty strings"""
    if not admin_token:
        results.log_failure("Business Info Social Media Optional", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Update with empty social media links
        update_data = {
            "hospital_name": "Test Hospital for Social Media",
            "facebook_link": "",
            "instagram_link": "",
            "twitter_link": ""
        }
        
        response = requests.put(f"{API_URL}/business-info", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("hospital_name") == update_data["hospital_name"] and
                data.get("facebook_link") == "" and
                data.get("instagram_link") == "" and
                data.get("twitter_link") == ""):
                results.log_success("Business Info Social Media Optional (Empty Strings)")
                return True
        results.log_failure("Business Info Social Media Optional", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Business Info Social Media Optional", str(e))
        return False

def test_business_info_database_storage():
    """Test that business info is properly stored in MongoDB with all fields"""
    if not admin_token:
        results.log_failure("Business Info Database Storage", "No admin token available")
        return False
    
    try:
        # First, update with known data
        headers = {"Authorization": f"Bearer {admin_token}"}
        test_data = {
            "hospital_name": "Database Storage Test Hospital",
            "tagline": "Testing Database Storage",
            "phone": "(703) 999-0001",
            "email": "dbtest@hospital.com",
            "address": "123 Database Test Street, Test City, VA 20000",
            "facebook_link": "https://facebook.com/dbtest",
            "instagram_link": "https://instagram.com/dbtest",
            "twitter_link": "https://twitter.com/dbtest"
        }
        
        response = requests.put(f"{API_URL}/business-info", json=test_data, headers=headers)
        if response.status_code != 200:
            results.log_failure("Business Info Database Storage (Setup)", f"Failed to update: {response.status_code}")
            return False
        
        # Now retrieve and verify all fields are stored correctly
        response = requests.get(f"{API_URL}/business-info")
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "hospital_name", "tagline", "phone", "email", "address", "facebook_link", "instagram_link", "twitter_link", "created_at", "updated_at"]
            
            if (all(field in data for field in required_fields) and
                data.get("hospital_name") == test_data["hospital_name"] and
                data.get("tagline") == test_data["tagline"] and
                data.get("phone") == test_data["phone"] and
                data.get("email") == test_data["email"] and
                data.get("address") == test_data["address"] and
                data.get("facebook_link") == test_data["facebook_link"] and
                data.get("instagram_link") == test_data["instagram_link"] and
                data.get("twitter_link") == test_data["twitter_link"]):
                results.log_success("Business Info Database Storage (All Fields)")
                return True
        results.log_failure("Business Info Database Storage", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Business Info Database Storage", str(e))
        return False

def test_business_info_timestamps():
    """Test that created_at and updated_at timestamps are properly managed"""
    if not admin_token:
        results.log_failure("Business Info Timestamps", "No admin token available")
        return False
    
    try:
        # Get initial business info
        response1 = requests.get(f"{API_URL}/business-info")
        if response1.status_code != 200:
            results.log_failure("Business Info Timestamps (Initial Get)", f"Status: {response1.status_code}")
            return False
        
        data1 = response1.json()
        initial_created_at = data1.get("created_at")
        initial_updated_at = data1.get("updated_at")
        
        # Wait a moment and update
        import time
        time.sleep(1)
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_data = {
            "hospital_name": "Timestamp Test Hospital"
        }
        
        response2 = requests.put(f"{API_URL}/business-info", json=update_data, headers=headers)
        if response2.status_code == 200:
            data2 = response2.json()
            new_created_at = data2.get("created_at")
            new_updated_at = data2.get("updated_at")
            
            # created_at should remain the same, updated_at should be different
            if (new_created_at == initial_created_at and
                new_updated_at != initial_updated_at and
                new_updated_at > initial_updated_at):
                results.log_success("Business Info Timestamps (Proper Management)")
                return True
        results.log_failure("Business Info Timestamps", f"Status: {response2.status_code}")
        return False
    except Exception as e:
        results.log_failure("Business Info Timestamps", str(e))
        return False

# ============================================================================
# TEAM MEMBER MANAGEMENT API TESTS - NEW IMPLEMENTATION
# ============================================================================

# Global variables for team member testing
created_team_member_ids = []

def test_get_team_members_public():
    """Test GET /api/team-members (public endpoint)"""
    try:
        response = requests.get(f"{API_URL}/team-members")
        if response.status_code == 200:
            data = response.json()
            if ("team_members" in data and 
                isinstance(data["team_members"], list)):
                results.log_success("Get Team Members (Public Endpoint)")
                return True
        results.log_failure("Get Team Members (Public)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Team Members (Public)", str(e))
        return False

def test_create_team_member_admin():
    """Test POST /api/team-members (admin-only endpoint)"""
    global created_team_member_ids
    if not admin_token:
        results.log_failure("Create Team Member (Admin)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        team_member_data = {
            "name": "Dr. Jennifer Smith",
            "title": "Lead Veterinarian",
            "bio": "Dr. Smith has over 15 years of experience in veterinary medicine, specializing in small animal care and emergency medicine. She graduated from Virginia Tech College of Veterinary Medicine and is passionate about providing compassionate care to pets and their families.",
            "credentials": "DVM, Virginia Tech College of Veterinary Medicine",
            "photo_url": "https://example.com/photos/dr-jennifer-smith.jpg",
            "order": 1
        }
        
        response = requests.post(f"{API_URL}/team-members", json=team_member_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("name") == team_member_data["name"] and
                data.get("title") == team_member_data["title"] and
                data.get("bio") == team_member_data["bio"] and
                data.get("credentials") == team_member_data["credentials"] and
                data.get("photo_url") == team_member_data["photo_url"] and
                data.get("order") == team_member_data["order"] and
                "id" in data and
                "created_at" in data and
                "updated_at" in data):
                created_team_member_ids.append(data["id"])
                results.log_success("Create Team Member (Admin)")
                return True
        results.log_failure("Create Team Member (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Team Member (Admin)", str(e))
        return False

def test_create_team_member_regular_user():
    """Test POST /api/team-members with regular user (should fail)"""
    if not user_token:
        results.log_failure("Create Team Member (Regular User - Should Fail)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        team_member_data = {
            "name": "Dr. Test User",
            "title": "Test Veterinarian",
            "bio": "This should fail",
            "credentials": "Test Credentials",
            "photo_url": "https://example.com/test.jpg",
            "order": 99
        }
        
        response = requests.post(f"{API_URL}/team-members", json=team_member_data, headers=headers)
        if response.status_code == 403:
            results.log_success("Create Team Member (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Create Team Member (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Create Team Member (Regular User)", str(e))
        return False

def test_create_team_member_no_auth():
    """Test POST /api/team-members without authentication (should fail)"""
    try:
        team_member_data = {
            "name": "Dr. No Auth",
            "title": "Unauthorized Veterinarian",
            "bio": "This should fail",
            "credentials": "No Auth Credentials",
            "photo_url": "https://example.com/noauth.jpg",
            "order": 99
        }
        
        response = requests.post(f"{API_URL}/team-members", json=team_member_data)
        if response.status_code == 401:
            results.log_success("Create Team Member (No Auth - Correctly Unauthorized)")
            return True
        results.log_failure("Create Team Member (No Auth)", f"Expected 401, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Create Team Member (No Auth)", str(e))
        return False

def test_create_multiple_team_members():
    """Test creating multiple team members with different order values"""
    global created_team_member_ids
    if not admin_token:
        results.log_failure("Create Multiple Team Members", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create second team member
        team_member_data_2 = {
            "name": "Dr. Michael Carter",
            "title": "Emergency Veterinarian",
            "bio": "Dr. Carter specializes in emergency and critical care medicine. He has extensive experience in trauma surgery and intensive care management for critically ill pets.",
            "credentials": "DVM, Emergency and Critical Care Certification",
            "photo_url": "https://example.com/photos/dr-michael-carter.jpg",
            "order": 2
        }
        
        response = requests.post(f"{API_URL}/team-members", json=team_member_data_2, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                created_team_member_ids.append(data["id"])
        
        # Create third team member
        team_member_data_3 = {
            "name": "Sarah Thompson",
            "title": "Veterinary Technician",
            "bio": "Sarah is a certified veterinary technician with 8 years of experience. She assists with surgical procedures, patient care, and client education.",
            "credentials": "CVT, Certified Veterinary Technician",
            "photo_url": "https://example.com/photos/sarah-thompson.jpg",
            "order": 3
        }
        
        response = requests.post(f"{API_URL}/team-members", json=team_member_data_3, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "id" in data:
                created_team_member_ids.append(data["id"])
                results.log_success("Create Multiple Team Members (3 Total)")
                return True
        results.log_failure("Create Multiple Team Members", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Multiple Team Members", str(e))
        return False

def test_get_team_members_ordered():
    """Test that GET /api/team-members returns team members ordered by 'order' field"""
    try:
        response = requests.get(f"{API_URL}/team-members")
        if response.status_code == 200:
            data = response.json()
            if ("team_members" in data and 
                isinstance(data["team_members"], list) and
                len(data["team_members"]) >= 2):
                
                team_members = data["team_members"]
                # Check if they are ordered by the 'order' field
                orders = [member.get("order", 0) for member in team_members]
                if orders == sorted(orders):
                    results.log_success("Get Team Members (Ordered by Order Field)")
                    return True
                else:
                    results.log_failure("Get Team Members (Ordering)", f"Not properly ordered: {orders}")
                    return False
            else:
                results.log_success("Get Team Members (Ordered - No Members to Check)")
                return True
        results.log_failure("Get Team Members (Ordered)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Team Members (Ordered)", str(e))
        return False

def test_update_team_member_admin():
    """Test PUT /api/team-members/{member_id} (admin-only endpoint)"""
    if not admin_token or not created_team_member_ids:
        results.log_failure("Update Team Member (Admin)", "No admin token or team member ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        member_id = created_team_member_ids[0]
        
        update_data = {
            "name": "Dr. Jennifer Smith (Updated)",
            "title": "Senior Lead Veterinarian",
            "bio": "Updated bio: Dr. Smith has over 20 years of experience in veterinary medicine, specializing in small animal care, emergency medicine, and surgical procedures.",
            "credentials": "DVM, Virginia Tech College of Veterinary Medicine, Board Certified",
            "photo_url": "https://example.com/photos/dr-jennifer-smith-updated.jpg",
            "order": 1
        }
        
        response = requests.put(f"{API_URL}/team-members/{member_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("name") == update_data["name"] and
                data.get("title") == update_data["title"] and
                data.get("bio") == update_data["bio"] and
                data.get("credentials") == update_data["credentials"] and
                data.get("photo_url") == update_data["photo_url"] and
                data.get("order") == update_data["order"] and
                data.get("id") == member_id):
                results.log_success("Update Team Member (Admin)")
                return True
        results.log_failure("Update Team Member (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Team Member (Admin)", str(e))
        return False

def test_update_team_member_partial():
    """Test PUT /api/team-members/{member_id} with partial update"""
    if not admin_token or not created_team_member_ids:
        results.log_failure("Update Team Member (Partial)", "No admin token or team member ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        member_id = created_team_member_ids[0]
        
        # Only update name and title, leave other fields unchanged
        partial_update = {
            "name": "Dr. Jennifer Smith (Partially Updated)",
            "title": "Chief Veterinarian"
        }
        
        response = requests.put(f"{API_URL}/team-members/{member_id}", json=partial_update, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("name") == partial_update["name"] and
                data.get("title") == partial_update["title"] and
                data.get("id") == member_id and
                "bio" in data and  # Should retain existing values
                "credentials" in data and
                "photo_url" in data):
                results.log_success("Update Team Member (Partial Update)")
                return True
        results.log_failure("Update Team Member (Partial)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Team Member (Partial)", str(e))
        return False

def test_update_team_member_regular_user():
    """Test PUT /api/team-members/{member_id} with regular user (should fail)"""
    if not user_token or not created_team_member_ids:
        results.log_failure("Update Team Member (Regular User - Should Fail)", "No user token or team member ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        member_id = created_team_member_ids[0]
        
        update_data = {
            "name": "This update should fail"
        }
        
        response = requests.put(f"{API_URL}/team-members/{member_id}", json=update_data, headers=headers)
        if response.status_code == 403:
            results.log_success("Update Team Member (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Update Team Member (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Team Member (Regular User)", str(e))
        return False

def test_update_team_member_not_found():
    """Test PUT /api/team-members/{member_id} with invalid member ID"""
    if not admin_token:
        results.log_failure("Update Team Member (Not Found)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_member_id = "non-existent-team-member-id-12345"
        
        update_data = {
            "name": "This should fail"
        }
        
        response = requests.put(f"{API_URL}/team-members/{fake_member_id}", json=update_data, headers=headers)
        if response.status_code == 404:
            results.log_success("Update Team Member (Not Found - 404)")
            return True
        results.log_failure("Update Team Member (Not Found)", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Update Team Member (Not Found)", str(e))
        return False

def test_delete_team_member_admin():
    """Test DELETE /api/team-members/{member_id} (admin-only endpoint)"""
    if not admin_token or not created_team_member_ids:
        results.log_failure("Delete Team Member (Admin)", "No admin token or team member ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        # Delete the last created team member
        member_id = created_team_member_ids[-1]
        
        response = requests.delete(f"{API_URL}/team-members/{member_id}", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "deleted successfully" in data["message"]:
                created_team_member_ids.remove(member_id)  # Remove from our tracking
                results.log_success("Delete Team Member (Admin)")
                return True
        results.log_failure("Delete Team Member (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Delete Team Member (Admin)", str(e))
        return False

def test_delete_team_member_regular_user():
    """Test DELETE /api/team-members/{member_id} with regular user (should fail)"""
    if not user_token or not created_team_member_ids:
        results.log_failure("Delete Team Member (Regular User - Should Fail)", "No user token or team member ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        member_id = created_team_member_ids[0]
        
        response = requests.delete(f"{API_URL}/team-members/{member_id}", headers=headers)
        if response.status_code == 403:
            results.log_success("Delete Team Member (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("Delete Team Member (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Delete Team Member (Regular User)", str(e))
        return False

def test_delete_team_member_not_found():
    """Test DELETE /api/team-members/{member_id} with invalid member ID"""
    if not admin_token:
        results.log_failure("Delete Team Member (Not Found)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        fake_member_id = "non-existent-team-member-id-67890"
        
        response = requests.delete(f"{API_URL}/team-members/{fake_member_id}", headers=headers)
        if response.status_code == 404:
            results.log_success("Delete Team Member (Not Found - 404)")
            return True
        results.log_failure("Delete Team Member (Not Found)", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Delete Team Member (Not Found)", str(e))
        return False

def test_team_member_validation():
    """Test team member creation with missing required fields"""
    if not admin_token:
        results.log_failure("Team Member Validation", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test with missing required fields
        incomplete_team_member = {
            "name": "Dr. Incomplete",
            # Missing title, bio, credentials, photo_url
        }
        
        response = requests.post(f"{API_URL}/team-members", json=incomplete_team_member, headers=headers)
        if response.status_code == 422:  # Validation error
            results.log_success("Team Member Validation (Missing Required Fields)")
            return True
        results.log_failure("Team Member Validation", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Team Member Validation", str(e))
        return False

def test_team_member_database_storage():
    """Test that team members are properly stored in MongoDB with all fields"""
    if not admin_token or not created_team_member_ids:
        results.log_failure("Team Member Database Storage", "No admin token or team member ID available")
        return False
    
    try:
        # Get team members and verify all fields are stored correctly
        response = requests.get(f"{API_URL}/team-members")
        if response.status_code == 200:
            data = response.json()
            if "team_members" in data and len(data["team_members"]) > 0:
                team_member = data["team_members"][0]
                required_fields = ["id", "name", "title", "bio", "credentials", "photo_url", "order", "created_at", "updated_at"]
                
                if all(field in team_member for field in required_fields):
                    if (isinstance(team_member["name"], str) and
                        isinstance(team_member["title"], str) and
                        isinstance(team_member["bio"], str) and
                        isinstance(team_member["credentials"], str) and
                        isinstance(team_member["photo_url"], str) and
                        isinstance(team_member["order"], int)):
                        results.log_success("Team Member Database Storage (Correct Fields)")
                        return True
        results.log_failure("Team Member Database Storage", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Team Member Database Storage", str(e))
        return False

def test_team_member_order_functionality():
    """Test that team members are returned in correct order and order field works"""
    if not admin_token:
        results.log_failure("Team Member Order Functionality", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create a team member with a specific order
        team_member_data = {
            "name": "Dr. Order Test",
            "title": "Order Test Veterinarian",
            "bio": "Testing order functionality",
            "credentials": "Test Credentials",
            "photo_url": "https://example.com/order-test.jpg",
            "order": 0  # Should appear first
        }
        
        response = requests.post(f"{API_URL}/team-members", json=team_member_data, headers=headers)
        if response.status_code == 200:
            order_test_id = response.json()["id"]
            
            # Get all team members
            response = requests.get(f"{API_URL}/team-members")
            if response.status_code == 200:
                data = response.json()
                if "team_members" in data and len(data["team_members"]) > 0:
                    # The team member with order=0 should be first
                    first_member = data["team_members"][0]
                    if first_member.get("id") == order_test_id and first_member.get("order") == 0:
                        # Clean up
                        requests.delete(f"{API_URL}/team-members/{order_test_id}", headers=headers)
                        results.log_success("Team Member Order Functionality (Correct Ordering)")
                        return True
        results.log_failure("Team Member Order Functionality", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Team Member Order Functionality", str(e))
        return False

def run_all_tests():
    """Run all backend API tests"""
    print("Starting Backend API Tests...")
    print(f"Backend URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print("="*50)
    
    # Basic API tests
    test_api_root()
    
    # Authentication tests
    test_user_registration()
    test_admin_login()
    test_regular_user_login()
    test_get_current_user_admin()
    test_get_current_user_regular()
    test_authentication_middleware()
    
    print("\n" + "="*50)
    print("ROLE-BASED AUTHENTICATION SYSTEM TESTS - NEW FEATURES")
    print("="*50)
    
    # Role-based user registration tests
    test_register_technician_user()
    test_register_manager_user()
    test_register_admin_user()
    test_register_invalid_role()
    
    # Role-based login tests
    test_technician_login()
    test_manager_login()
    test_new_admin_login()
    
    # Role-based /me endpoint tests
    test_get_current_user_technician()
    test_get_current_user_manager()
    test_get_current_user_new_admin()
    
    # Role-based permissions for urgent care appointments
    test_get_appointments_technician()
    test_get_appointments_manager()
    test_update_appointment_status_technician()
    test_update_appointment_status_manager()
    test_delete_appointment_manager()
    test_delete_appointment_technician()
    test_get_appointment_details_technician()
    
    # Hospital hours tests
    test_get_hospital_hours()
    test_get_urgent_care_hours()
    test_get_current_hours()
    
    # Admin-only tests
    test_update_hospital_hours_admin()
    test_update_hospital_hours_regular_user()
    test_update_urgent_care_hours_admin()
    
    print("\n" + "="*50)
    print("URGENT CARE BOOKING SYSTEM TESTS")
    print("="*50)
    
    # Urgent Care Time Slots API tests
    test_get_time_slots_today()
    test_get_time_slots_future()
    test_get_time_slots_sunday()
    
    # Urgent Care Appointment Creation API tests
    test_create_urgent_care_appointment()
    test_create_appointment_validation()
    
    # Admin Appointments API tests
    test_get_appointments_admin()
    test_get_appointments_regular_user()
    test_get_appointment_details()
    test_get_appointment_details_not_found()
    
    # Integration tests
    test_time_slots_exclude_booked()
    
    print("\n" + "="*50)
    print("ENHANCED URGENT CARE BOOKING SYSTEM TESTS - NEW FEATURES")
    print("="*50)
    
    # Enhanced Appointments API with Pagination & Filtering
    test_appointments_pagination()
    test_appointments_filtering_today()
    test_appointments_filtering_last_7_days()
    test_appointments_filtering_last_30_days()
    test_appointments_filtering_last_1_year()
    test_appointments_pagination_multiple_pages()
    
    # Delete Appointment API
    test_delete_appointment_admin()
    test_delete_appointment_regular_user()
    test_delete_appointment_invalid_id()
    
    # Data Consistency Tests
    test_data_consistency_filtering_pagination()
    test_deleted_appointments_removed_from_results()
    
    print("\n" + "="*50)
    print("PATIENT REGISTRATION PDF SYSTEM TESTS")
    print("="*50)
    
    # Patient Registration Form Submission Tests
    test_patient_registration_submit()
    test_patient_registration_validation()
    test_patient_registration_minimal_data()
    test_patient_registration_email_validation()
    
    # Patient Registration PDF Generation Tests
    test_patient_registration_pdf_generation()
    test_patient_registration_pdf_minimal()
    test_patient_registration_pdf_filename()
    
    # Patient Registration PDF Retrieval Tests
    test_get_existing_registration_pdf()
    test_get_nonexistent_registration_pdf()
    
    # Patient Registration Data Integrity Tests
    test_patient_registration_data_persistence()
    test_patient_registration_unique_ids()
    
    print("\n" + "="*50)
    print("REVIEWS API TESTS")
    print("="*50)
    
    # Reviews API Tests - NEW
    test_get_reviews_public()
    test_get_reviews_manage_admin()
    test_get_reviews_manage_regular_user()
    test_create_review_admin()
    test_create_review_regular_user()
    test_create_multiple_reviews()
    test_create_review_limit_enforcement()
    test_update_review_admin()
    test_update_review_partial()
    test_update_review_regular_user()
    test_update_review_not_found()
    test_delete_review_admin()
    test_delete_review_regular_user()
    test_delete_review_not_found()
    test_create_review_after_deletion()
    test_reviews_database_storage()
    test_reviews_public_endpoint_limit()
    test_review_validation()
    
    print("\n" + "="*50)
    print("BUSINESS INFORMATION API TESTS")
    print("="*50)
    
    # Business Information API Tests - NEW
    test_get_business_info_public()
    test_get_business_info_creates_default()
    test_update_business_info_admin()
    test_update_business_info_partial()
    test_update_business_info_no_auth()
    test_update_business_info_regular_user()
    test_business_info_social_media_optional()
    test_business_info_database_storage()
    test_business_info_timestamps()
    
    # Print summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)