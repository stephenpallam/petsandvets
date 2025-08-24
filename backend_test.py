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
    
    # Print summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)