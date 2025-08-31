#!/usr/bin/env python3
"""
Navigation Authentication Testing
Tests user authentication and JWT token generation for frontend navigation changes
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

print(f"🔐 Navigation Authentication Testing")
print(f"Backend API: {API_URL}")
print("="*60)

class AuthTestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.working_credentials = []
        
    def log_success(self, test_name, details=None):
        print(f"✅ {test_name}")
        if details:
            print(f"   {details}")
        self.passed += 1
        
    def log_failure(self, test_name, error):
        print(f"❌ {test_name}: {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        
    def add_working_credential(self, role, email, password, token, user_data):
        self.working_credentials.append({
            "role": role,
            "email": email, 
            "password": password,
            "token": token,
            "user_data": user_data
        })
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"🔐 NAVIGATION AUTHENTICATION TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        
        if self.working_credentials:
            print(f"\n🎯 WORKING LOGIN CREDENTIALS FOR NAVIGATION TESTING:")
            print(f"{'='*60}")
            for cred in self.working_credentials:
                print(f"Role: {cred['role'].upper()}")
                print(f"Email: {cred['email']}")
                print(f"Password: {cred['password']}")
                print(f"Full Name: {cred['user_data'].get('full_name', 'N/A')}")
                print(f"JWT Token: {cred['token'][:50]}...")
                print(f"User ID: {cred['user_data'].get('id', 'N/A')}")
                print("-" * 40)
        
        if self.errors:
            print(f"\n❌ FAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        
        return self.failed == 0

results = AuthTestResults()

# Test credentials from existing system
test_users = [
    {
        "role": "admin",
        "email": "admin@hospital.com",
        "password": "admin123",
        "description": "Default Admin User"
    },
    {
        "role": "manager", 
        "email": "manager@veterinary.com",
        "password": "manager123",
        "description": "Manager User"
    },
    {
        "role": "technician",
        "email": "technician@veterinary.com", 
        "password": "tech123",
        "description": "Technician User"
    },
    {
        "role": "user",
        "email": "testuser@veterinary.com",
        "password": "testpass123", 
        "description": "Regular User"
    }
]

def test_create_new_test_user():
    """Create a new test user for navigation testing"""
    try:
        new_user_data = {
            "email": "navtest@veterinary.com",
            "password": "navtest123",
            "full_name": "Navigation Test User",
            "role": "user"
        }
        
        response = requests.post(f"{API_URL}/register", json=new_user_data)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == new_user_data["email"]:
                results.log_success("Create New Test User", f"Created user: {new_user_data['email']}")
                return new_user_data
        elif response.status_code == 400 and "already registered" in response.json().get("detail", ""):
            results.log_success("Create New Test User", f"User already exists: {new_user_data['email']}")
            return new_user_data
        else:
            results.log_failure("Create New Test User", f"Status: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        results.log_failure("Create New Test User", str(e))
        return None

def test_user_login_and_token(user_info):
    """Test user login and JWT token generation"""
    try:
        login_data = {
            "email": user_info["email"],
            "password": user_info["password"]
        }
        
        response = requests.post(f"{API_URL}/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                token = data["access_token"]
                results.log_success(f"Login {user_info['role'].title()}", 
                                  f"JWT token generated for {user_info['email']}")
                return token
        results.log_failure(f"Login {user_info['role'].title()}", 
                          f"Status: {response.status_code}, Response: {response.text}")
        return None
    except Exception as e:
        results.log_failure(f"Login {user_info['role'].title()}", str(e))
        return None

def test_token_with_me_endpoint(user_info, token):
    """Test JWT token with /api/me endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if (data.get("email") == user_info["email"] and 
                data.get("role") == user_info["role"]):
                results.log_success(f"Token Verification {user_info['role'].title()}", 
                                  f"Token works with /api/me for {user_info['email']}")
                results.add_working_credential(user_info["role"], user_info["email"], 
                                             user_info["password"], token, data)
                return True
        results.log_failure(f"Token Verification {user_info['role'].title()}", 
                          f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure(f"Token Verification {user_info['role'].title()}", str(e))
        return False

def test_token_persistence(user_info, token):
    """Test token persistence across multiple requests"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Make multiple requests to verify token persistence
        endpoints = ["/me", "/hospital-hours", "/urgent-care-hours"]
        
        for endpoint in endpoints:
            response = requests.get(f"{API_URL}{endpoint}", headers=headers)
            if response.status_code not in [200, 403]:  # 403 is OK for role restrictions
                results.log_failure(f"Token Persistence {user_info['role'].title()}", 
                                  f"Token failed on {endpoint}: {response.status_code}")
                return False
        
        results.log_success(f"Token Persistence {user_info['role'].title()}", 
                          f"Token works across multiple requests")
        return True
    except Exception as e:
        results.log_failure(f"Token Persistence {user_info['role'].title()}", str(e))
        return False

def test_role_based_access(user_info, token):
    """Test role-based access for navigation features"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test access to admin endpoints based on role
        admin_endpoints = [
            "/urgent-care-appointments",  # Staff access (admin, manager, technician)
            "/hospital-hours",  # Public access
            "/reviews/manage"  # Manager/Admin access
        ]
        
        expected_access = {
            "admin": [200, 200, 200],
            "manager": [200, 200, 200], 
            "technician": [200, 200, 403],
            "user": [403, 200, 403]
        }
        
        actual_responses = []
        for endpoint in admin_endpoints:
            response = requests.get(f"{API_URL}{endpoint}", headers=headers)
            actual_responses.append(response.status_code)
        
        expected = expected_access.get(user_info["role"], [403, 200, 403])
        
        if actual_responses == expected:
            results.log_success(f"Role Access {user_info['role'].title()}", 
                              f"Correct access permissions: {actual_responses}")
            return True
        else:
            results.log_failure(f"Role Access {user_info['role'].title()}", 
                              f"Expected {expected}, got {actual_responses}")
            return False
    except Exception as e:
        results.log_failure(f"Role Access {user_info['role'].title()}", str(e))
        return False

def main():
    """Main test execution"""
    print("🚀 Starting Navigation Authentication Tests...\n")
    
    # Test 1: Create a new test user
    new_user = test_create_new_test_user()
    if new_user:
        test_users.append(new_user)
    
    print(f"\n📋 Testing {len(test_users)} user accounts for navigation authentication...\n")
    
    # Test each user account
    for user_info in test_users:
        print(f"🔍 Testing {user_info['role'].upper()} user: {user_info['email']}")
        
        # Test login and get token
        token = test_user_login_and_token(user_info)
        if not token:
            continue
            
        # Test token with /api/me endpoint
        if not test_token_with_me_endpoint(user_info, token):
            continue
            
        # Test token persistence
        test_token_persistence(user_info, token)
        
        # Test role-based access
        test_role_based_access(user_info, token)
        
        print()  # Add spacing between users
    
    # Final summary
    success = results.summary()
    
    if success and results.working_credentials:
        print(f"\n🎉 SUCCESS! All authentication tests passed.")
        print(f"✅ Found {len(results.working_credentials)} working user accounts for navigation testing.")
        print(f"🔗 These credentials can be used to test frontend navigation changes.")
    else:
        print(f"\n⚠️  Some tests failed. Check the errors above.")
    
    return success

if __name__ == "__main__":
    main()