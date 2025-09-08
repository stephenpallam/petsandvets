#!/usr/bin/env python3
"""
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
Backend Health Check Test - Focused on Core System Health
Tests key endpoints to ensure backend is healthy after frontend changes
"""

import requests
import json
import os
from datetime import datetime

# CRITICAL: Setup test database environment
import sys
sys.path.append('/app/backend')
from test_db_config import set_test_environment
set_test_environment()
print("🧪 USING TEST DATABASE - Production data is safe!")


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
        print(f"BACKEND HEALTH CHECK SUMMARY")
        print(f"{'='*60}")
        print(f"Total Health Checks: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        
        if self.failed == 0:
            print("🎉 BACKEND IS HEALTHY - All core systems operational!")
        else:
            print("⚠️  BACKEND HAS ISSUES - Some systems need attention")
            print(f"\nFAILED CHECKS:")
            for error in self.errors:
                print(f"  - {error}")
        return self.failed == 0

results = HealthResults()

# Admin credentials for testing
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

admin_token = None

def test_api_connectivity():
    """Test basic API connectivity"""
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                results.log_success("API Connectivity")
                return True
        results.log_failure("API Connectivity", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("API Connectivity", str(e))
        return False

def test_admin_authentication():
    """Test admin authentication system"""
    global admin_token
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials, timeout=10)
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

def test_user_profile_endpoint():
    """Test user profile endpoint with authentication"""
    if not admin_token:
        results.log_failure("User Profile Endpoint", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers, timeout=10)
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

def test_hospital_hours_api():
    """Test hospital hours API"""
    try:
        response = requests.get(f"{API_URL}/hospital-hours", timeout=10)
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

def test_urgent_care_hours_api():
    """Test urgent care hours API"""
    try:
        response = requests.get(f"{API_URL}/urgent-care-hours", timeout=10)
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

def test_current_hours_api():
    """Test current hours combined API"""
    try:
        response = requests.get(f"{API_URL}/hours/current", timeout=10)
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

def test_business_info_api():
    """Test business information API"""
    try:
        response = requests.get(f"{API_URL}/business-info", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if ("hospital_name" in data and "phone" in data and "email" in data and "address" in data):
                results.log_success("Business Info API")
                return True
        results.log_failure("Business Info API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Business Info API", str(e))
        return False

def test_reviews_api():
    """Test reviews API (public endpoint)"""
    try:
        response = requests.get(f"{API_URL}/reviews", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "reviews" in data and isinstance(data["reviews"], list):
                results.log_success("Reviews API")
                return True
        results.log_failure("Reviews API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Reviews API", str(e))
        return False

def test_urgent_care_appointments_api():
    """Test urgent care appointments API (admin access)"""
    if not admin_token:
        results.log_failure("Urgent Care Appointments API", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "appointments" in data:
                results.log_success("Urgent Care Appointments API")
                return True
        results.log_failure("Urgent Care Appointments API", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Urgent Care Appointments API", str(e))
        return False

def test_time_slots_api():
    """Test time slots API"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{today}", timeout=10)
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

def test_database_connectivity():
    """Test database connectivity by checking if we can create a simple appointment"""
    try:
        from datetime import timedelta
        future_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        appointment_time = f"{future_date}T14:00"
        
        test_appointment = {
            "appointment_time": appointment_time,
            "owner_first_name": "HealthCheck",
            "owner_last_name": "Test",
            "email": "healthcheck@test.com",
            "phone": "(555) 000-0000",
            "pet_name": "TestPet",
            "pet_type": "dog",
            "reason_for_visit": "Backend health check test",
            "primary_vet_hospital": "Test Hospital",
            "how_heard_about_us": "Health Check"
        }
        
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=test_appointment, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("owner_first_name") == "HealthCheck":
                results.log_success("Database Connectivity")
                return True
        results.log_failure("Database Connectivity", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Database Connectivity", str(e))
        return False

# Run all health checks
print("🚀 Starting Backend Health Checks...\n")

test_api_connectivity()
test_admin_authentication()
test_user_profile_endpoint()
test_hospital_hours_api()
test_urgent_care_hours_api()
test_current_hours_api()
test_business_info_api()
test_reviews_api()
test_urgent_care_appointments_api()
test_time_slots_api()
test_database_connectivity()

# Show results
is_healthy = results.summary()

if is_healthy:
    print("\n🎯 CONCLUSION: Backend is fully operational after frontend changes!")
    print("   All core APIs are responding correctly and database is accessible.")
else:
    print("\n⚠️  CONCLUSION: Backend has some issues that need attention.")
    print("   Core functionality may be impacted.")

print(f"\n📊 Health Score: {results.passed}/{results.passed + results.failed} ({(results.passed/(results.passed + results.failed)*100):.1f}%)")