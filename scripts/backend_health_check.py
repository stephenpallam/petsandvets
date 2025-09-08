#!/usr/bin/env python3
"""
Backend Health Check for Privacy Policy Implementation
Tests core backend functionality to ensure nothing was broken
"""

import requests
import json
import os
from datetime import datetime

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

print(f"🔍 Backend Health Check at: {API_URL}")
print("=" * 60)

class HealthResults:
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
        print(f"\n{'='*60}")
        print(f"HEALTH CHECK SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        if self.errors:
            print(f"\nCRITICAL ISSUES:")
            for error in self.errors:
                print(f"  - {error}")
        return self.failed == 0

results = HealthResults()

# Test credentials
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

admin_token = None

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

def test_admin_login():
    """Test admin login endpoint"""
    global admin_token
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                admin_token = data["access_token"]
                results.log_success("Admin Authentication")
                return True
        results.log_failure("Admin Authentication", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Admin Authentication", str(e))
        return False

def test_get_current_user():
    """Test /me endpoint with admin token"""
    if not admin_token:
        results.log_failure("User Profile Endpoint", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == admin_credentials["email"] and data.get("role") == "admin":
                results.log_success("User Profile Endpoint")
                return True
        results.log_failure("User Profile Endpoint", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("User Profile Endpoint", str(e))
        return False

def test_hospital_hours():
    """Test hospital hours endpoints"""
    try:
        response = requests.get(f"{API_URL}/hospital-hours")
        if response.status_code == 200:
            data = response.json()
            required_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            if all(day in data for day in required_days):
                results.log_success("Hospital Hours API")
                return True
        results.log_failure("Hospital Hours API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Hospital Hours API", str(e))
        return False

def test_urgent_care_hours():
    """Test urgent care hours endpoints"""
    try:
        response = requests.get(f"{API_URL}/urgent-care-hours")
        if response.status_code == 200:
            data = response.json()
            required_days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            if all(day in data for day in required_days):
                results.log_success("Urgent Care Hours API")
                return True
        results.log_failure("Urgent Care Hours API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Urgent Care Hours API", str(e))
        return False

def test_current_hours():
    """Test current hours endpoint"""
    try:
        response = requests.get(f"{API_URL}/hours/current")
        if response.status_code == 200:
            data = response.json()
            if "type" in data and ("general_practice" in data and "urgent_care" in data):
                results.log_success("Current Hours API")
                return True
        results.log_failure("Current Hours API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Current Hours API", str(e))
        return False

def test_business_info():
    """Test business information endpoint"""
    try:
        response = requests.get(f"{API_URL}/business-info")
        if response.status_code == 200:
            data = response.json()
            if "hospital_name" in data and "phone" in data and "email" in data:
                results.log_success("Business Information API")
                return True
        results.log_failure("Business Information API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Business Information API", str(e))
        return False

def test_reviews_public():
    """Test public reviews endpoint"""
    try:
        response = requests.get(f"{API_URL}/reviews")
        if response.status_code == 200:
            data = response.json()
            if "reviews" in data and isinstance(data["reviews"], list):
                results.log_success("Public Reviews API")
                return True
        results.log_failure("Public Reviews API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Public Reviews API", str(e))
        return False

def test_appointments_admin():
    """Test appointments endpoint with admin access"""
    if not admin_token:
        results.log_failure("Appointments API", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "appointments" in data:
                results.log_success("Appointments API")
                return True
        results.log_failure("Appointments API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Appointments API", str(e))
        return False

def test_time_slots():
    """Test time slots endpoint"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{today}")
        if response.status_code == 200:
            data = response.json()
            if "available" in data and "date" in data:
                results.log_success("Time Slots API")
                return True
        results.log_failure("Time Slots API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Time Slots API", str(e))
        return False

def test_appointment_creation():
    """Test appointment creation endpoint"""
    try:
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T16:00"
        
        appointment_data = {
            "appointment_time": appointment_time,
            "owner_first_name": "Health",
            "owner_last_name": "Check",
            "email": "healthcheck@test.com",
            "phone": "(555) 123-4567",
            "pet_name": "TestPet",
            "pet_type": "dog",
            "reason_for_visit": "Health check test appointment",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Testing"
        }
        
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code == 200:
            data = response.json()
            if (data.get("owner_first_name") == "Health" and 
                data.get("pet_name") == "TestPet" and 
                "id" in data):
                results.log_success("Appointment Creation API")
                return True
        results.log_failure("Appointment Creation API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Appointment Creation API", str(e))
        return False

# Run all health checks
print("🚀 Starting Backend Health Check...")
print()

# Core API Tests
test_api_root()
test_admin_login()
test_get_current_user()

# Business Logic Tests
test_hospital_hours()
test_urgent_care_hours()
test_current_hours()
test_business_info()
test_reviews_public()

# Appointment System Tests
test_appointments_admin()
test_time_slots()
test_appointment_creation()

# Print summary
is_healthy = results.summary()

if is_healthy:
    print("\n🎉 BACKEND IS HEALTHY! All core APIs are working properly.")
    print("✅ Privacy Policy implementation did not break any backend functionality.")
else:
    print("\n⚠️  BACKEND HAS ISSUES! Some core APIs are not working properly.")
    print("❌ There may be issues that need attention.")

print(f"\n📊 Health Score: {results.passed}/{results.passed + results.failed} ({(results.passed/(results.passed + results.failed)*100):.1f}%)")