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

# Global variables for tokens
admin_token = None
user_token = None

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
    
    # Hospital hours tests
    test_get_hospital_hours()
    test_get_urgent_care_hours()
    test_get_current_hours()
    
    # Admin-only tests
    test_update_hospital_hours_admin()
    test_update_hospital_hours_regular_user()
    test_update_urgent_care_hours_admin()
    
    # Print summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)