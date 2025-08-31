#!/usr/bin/env python3
"""
Authentication Review Test - Focused on Review Request Requirements
Tests existing admin users, login functionality, and role-based authentication
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

print(f"🔍 AUTHENTICATION REVIEW TEST")
print(f"Testing Backend API at: {API_URL}")
print("="*60)

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
        print(f"\n{'='*60}")
        print(f"AUTHENTICATION REVIEW SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        return self.failed == 0

results = TestResults()

# Test credentials to try
test_credentials = [
    {"email": "admin@hospital.com", "password": "admin123", "expected_role": "admin"},
    {"email": "admin@test.com", "password": "admin123", "expected_role": "admin"},
    {"email": "admin@veterinary.com", "password": "admin123", "expected_role": "admin"},
    {"email": "manager@veterinary.com", "password": "manager123", "expected_role": "manager"},
    {"email": "technician@veterinary.com", "password": "tech123", "expected_role": "technician"},
    {"email": "testuser@veterinary.com", "password": "testpass123", "expected_role": "user"},
]

# Store successful logins
successful_logins = {}

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

def test_existing_admin_users():
    """Test login with common admin credentials to find existing users"""
    print(f"\n🔐 TESTING EXISTING ADMIN USERS")
    print("-" * 40)
    
    found_users = []
    
    for creds in test_credentials:
        try:
            response = requests.post(f"{API_URL}/login", json={
                "email": creds["email"],
                "password": creds["password"]
            }, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and data.get("token_type") == "bearer":
                    # Verify user details with /me endpoint
                    headers = {"Authorization": f"Bearer {data['access_token']}"}
                    me_response = requests.get(f"{API_URL}/me", headers=headers)
                    
                    if me_response.status_code == 200:
                        user_data = me_response.json()
                        found_users.append({
                            "email": creds["email"],
                            "role": user_data.get("role"),
                            "full_name": user_data.get("full_name"),
                            "token": data["access_token"]
                        })
                        successful_logins[creds["expected_role"]] = data["access_token"]
                        
                        results.log_success(f"Found User: {creds['email']} (Role: {user_data.get('role')})")
                    else:
                        results.log_failure(f"User Verification: {creds['email']}", f"Failed to get user details: {me_response.status_code}")
                else:
                    results.log_failure(f"Login Token: {creds['email']}", "Invalid token response format")
            elif response.status_code == 401:
                # Expected for non-existent users
                print(f"⚪ User not found: {creds['email']}")
            else:
                results.log_failure(f"Login Attempt: {creds['email']}", f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            results.log_failure(f"Login Test: {creds['email']}", str(e))
    
    if found_users:
        print(f"\n📋 FOUND EXISTING USERS:")
        for user in found_users:
            print(f"  • {user['email']} - {user['role']} - {user['full_name']}")
        return True
    else:
        results.log_failure("Existing Users", "No existing users found with test credentials")
        return False

def test_jwt_token_functionality():
    """Test JWT token generation and authentication persistence"""
    print(f"\n🎫 TESTING JWT TOKEN FUNCTIONALITY")
    print("-" * 40)
    
    if not successful_logins:
        results.log_failure("JWT Token Test", "No successful logins available")
        return False
    
    for role, token in successful_logins.items():
        try:
            # Test token persistence across multiple requests
            headers = {"Authorization": f"Bearer {token}"}
            
            # First request
            response1 = requests.get(f"{API_URL}/me", headers=headers)
            if response1.status_code != 200:
                results.log_failure(f"JWT Persistence ({role}) - Request 1", f"Status: {response1.status_code}")
                continue
            
            # Second request (should work with same token)
            response2 = requests.get(f"{API_URL}/me", headers=headers)
            if response2.status_code != 200:
                results.log_failure(f"JWT Persistence ({role}) - Request 2", f"Status: {response2.status_code}")
                continue
            
            # Verify same user data
            user1 = response1.json()
            user2 = response2.json()
            
            if user1.get("id") == user2.get("id") and user1.get("email") == user2.get("email"):
                results.log_success(f"JWT Token Persistence ({role})")
            else:
                results.log_failure(f"JWT Token Persistence ({role})", "User data inconsistent across requests")
                
        except Exception as e:
            results.log_failure(f"JWT Token Test ({role})", str(e))

def test_invalid_token_handling():
    """Test authentication with invalid tokens"""
    print(f"\n🚫 TESTING INVALID TOKEN HANDLING")
    print("-" * 40)
    
    invalid_tokens = [
        "invalid_token_123",
        "Bearer invalid_token",
        "expired.jwt.token",
        "",
        "null"
    ]
    
    for token in invalid_tokens:
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_URL}/me", headers=headers)
            
            if response.status_code == 401:
                results.log_success(f"Invalid Token Rejected: '{token[:20]}...'")
            else:
                results.log_failure(f"Invalid Token: '{token[:20]}...'", f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            results.log_failure(f"Invalid Token Test: '{token[:20]}...'", str(e))

def test_role_based_permissions():
    """Test role-based access control for different user roles"""
    print(f"\n👥 TESTING ROLE-BASED PERMISSIONS")
    print("-" * 40)
    
    # Test admin-only endpoints
    if "admin" in successful_logins:
        admin_token = successful_logins["admin"]
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test admin access to hospital hours update
        try:
            test_hours = {
                "monday": {"is_open": True, "open_time": "09:00", "close_time": "18:00"},
                "tuesday": {"is_open": True, "open_time": "09:00", "close_time": "18:00"},
                "wednesday": {"is_open": True, "open_time": "09:00", "close_time": "18:00"},
                "thursday": {"is_open": True, "open_time": "09:00", "close_time": "18:00"},
                "friday": {"is_open": True, "open_time": "09:00", "close_time": "18:00"},
                "saturday": {"is_open": True, "open_time": "09:00", "close_time": "17:00"},
                "sunday": {"is_open": False}
            }
            
            response = requests.put(f"{API_URL}/hospital-hours", json=test_hours, headers=headers)
            if response.status_code == 200:
                results.log_success("Admin Access: Hospital Hours Update")
            else:
                results.log_failure("Admin Access: Hospital Hours", f"Status: {response.status_code}")
        except Exception as e:
            results.log_failure("Admin Access Test", str(e))
    
    # Test manager access
    if "manager" in successful_logins:
        manager_token = successful_logins["manager"]
        headers = {"Authorization": f"Bearer {manager_token}"}
        
        try:
            # Test manager access to appointments
            response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
            if response.status_code == 200:
                results.log_success("Manager Access: Urgent Care Appointments")
            else:
                results.log_failure("Manager Access: Appointments", f"Status: {response.status_code}")
        except Exception as e:
            results.log_failure("Manager Access Test", str(e))
    
    # Test technician access
    if "technician" in successful_logins:
        tech_token = successful_logins["technician"]
        headers = {"Authorization": f"Bearer {tech_token}"}
        
        try:
            # Test technician access to appointments (should work)
            response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
            if response.status_code == 200:
                results.log_success("Technician Access: View Appointments")
            else:
                results.log_failure("Technician Access: Appointments", f"Status: {response.status_code}")
        except Exception as e:
            results.log_failure("Technician Access Test", str(e))
    
    # Test regular user restrictions
    if "user" in successful_logins:
        user_token = successful_logins["user"]
        headers = {"Authorization": f"Bearer {user_token}"}
        
        try:
            # Test user access to admin endpoints (should fail)
            response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers)
            if response.status_code == 403:
                results.log_success("User Restriction: Admin Endpoints Blocked")
            else:
                results.log_failure("User Restriction", f"Expected 403, got {response.status_code}")
        except Exception as e:
            results.log_failure("User Restriction Test", str(e))

def test_user_registration_with_roles():
    """Test user registration with different roles"""
    print(f"\n📝 TESTING USER REGISTRATION WITH ROLES")
    print("-" * 40)
    
    test_users = [
        {"email": "newuser@test.com", "password": "newpass123", "full_name": "New Test User", "role": "user"},
        {"email": "newtechnician@test.com", "password": "newtech123", "full_name": "New Technician", "role": "technician"},
        {"email": "newmanager@test.com", "password": "newmgr123", "full_name": "New Manager", "role": "manager"},
        {"email": "newadmin@test.com", "password": "newadmin123", "full_name": "New Admin", "role": "admin"},
    ]
    
    for user_data in test_users:
        try:
            response = requests.post(f"{API_URL}/register", json=user_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == user_data["role"] and data.get("email") == user_data["email"]:
                    results.log_success(f"Register {user_data['role'].title()}: {user_data['email']}")
                    
                    # Test login with new user
                    login_response = requests.post(f"{API_URL}/login", json={
                        "email": user_data["email"],
                        "password": user_data["password"]
                    })
                    
                    if login_response.status_code == 200:
                        results.log_success(f"Login New {user_data['role'].title()}: {user_data['email']}")
                    else:
                        results.log_failure(f"Login New {user_data['role'].title()}", f"Status: {login_response.status_code}")
                else:
                    results.log_failure(f"Register {user_data['role'].title()}", "Invalid response data")
            elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
                results.log_success(f"Register {user_data['role'].title()}: {user_data['email']} (already exists)")
            else:
                results.log_failure(f"Register {user_data['role'].title()}", f"Status: {response.status_code}")
                
        except Exception as e:
            results.log_failure(f"Register {user_data['role'].title()}", str(e))

def test_navigation_authentication():
    """Test authentication for navigation visibility (Home button test)"""
    print(f"\n🏠 TESTING NAVIGATION AUTHENTICATION")
    print("-" * 40)
    
    # Test that authenticated users can access protected endpoints
    for role, token in successful_logins.items():
        try:
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{API_URL}/me", headers=headers)
            
            if response.status_code == 200:
                user_data = response.json()
                results.log_success(f"Navigation Auth ({role}): User data available for UI")
                
                # Print user info for frontend navigation testing
                print(f"  📊 {role.upper()} USER DATA:")
                print(f"    - Email: {user_data.get('email')}")
                print(f"    - Role: {user_data.get('role')}")
                print(f"    - Name: {user_data.get('full_name')}")
                print(f"    - Active: {user_data.get('is_active')}")
            else:
                results.log_failure(f"Navigation Auth ({role})", f"Status: {response.status_code}")
                
        except Exception as e:
            results.log_failure(f"Navigation Auth ({role})", str(e))

def main():
    """Run all authentication review tests"""
    print("Starting Authentication Review Tests...")
    
    # Basic connectivity
    if not test_api_connectivity():
        print("❌ Cannot connect to API. Exiting.")
        return False
    
    # Core authentication tests
    test_existing_admin_users()
    test_jwt_token_functionality()
    test_invalid_token_handling()
    test_role_based_permissions()
    test_user_registration_with_roles()
    test_navigation_authentication()
    
    # Print summary
    success = results.summary()
    
    if success:
        print(f"\n🎉 ALL AUTHENTICATION TESTS PASSED!")
        print(f"✅ Login credentials are working correctly")
        print(f"✅ JWT tokens are functioning properly")
        print(f"✅ Role-based permissions are enforced")
        print(f"✅ Ready for Home button visibility testing")
    else:
        print(f"\n⚠️  Some authentication tests failed")
        print(f"🔧 Review failed tests above for issues")
    
    return success

if __name__ == "__main__":
    main()