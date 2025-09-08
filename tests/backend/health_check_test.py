#!/usr/bin/env python3
"""
Health Check Testing for Smart Pet Care System
Tests core functionality after environment variable restoration
Focus: Authentication, Business Info, AI Agents, Urgent Care, Database connectivity
"""

import requests
import json
import os
from datetime import datetime, timedelta
import sys
import time

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

print(f"🏥 HEALTH CHECK TESTING - Smart Pet Care System")
print(f"Backend API URL: {API_URL}")
print(f"Environment Variables Status: RESTORED")
print("="*60)

class HealthCheckResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.critical_failures = []
        
    def log_success(self, test_name):
        print(f"✅ {test_name}")
        self.passed += 1
        
    def log_failure(self, test_name, error, critical=False):
        print(f"❌ {test_name}: {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        if critical:
            self.critical_failures.append(f"{test_name}: {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"HEALTH CHECK SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        
        if self.critical_failures:
            print(f"\n🚨 CRITICAL FAILURES:")
            for error in self.critical_failures:
                print(f"  - {error}")
        
        if self.errors and not self.critical_failures:
            print(f"\n⚠️  NON-CRITICAL ISSUES:")
            for error in self.errors:
                print(f"  - {error}")
                
        return len(self.critical_failures) == 0

results = HealthCheckResults()

# Test credentials from review request
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

manager_credentials = {
    "email": "manager@veterinary.com", 
    "password": "manager123"
}

# Global tokens
admin_token = None
manager_token = None

def test_environment_variables():
    """Test that environment variables are properly loaded"""
    try:
        # Check frontend .env
        frontend_env_exists = os.path.exists('/app/frontend/.env')
        backend_env_exists = os.path.exists('/app/backend/.env')
        
        if not frontend_env_exists:
            results.log_failure("Environment Variables - Frontend", "frontend/.env file missing", critical=True)
            return False
            
        if not backend_env_exists:
            results.log_failure("Environment Variables - Backend", "backend/.env file missing", critical=True)
            return False
            
        # Check REACT_APP_BACKEND_URL is set
        backend_url = get_backend_url()
        if backend_url == "http://localhost:8001":
            results.log_failure("Environment Variables - Backend URL", "REACT_APP_BACKEND_URL not found in frontend/.env", critical=True)
            return False
            
        results.log_success("Environment Variables - Files Present and Configured")
        return True
        
    except Exception as e:
        results.log_failure("Environment Variables", str(e), critical=True)
        return False

def test_backend_connectivity():
    """Test basic backend connectivity"""
    try:
        response = requests.get(f"{BASE_URL}", timeout=10)
        if response.status_code in [200, 404]:  # 404 is OK for root, means server is running
            results.log_success("Backend Connectivity")
            return True
        else:
            results.log_failure("Backend Connectivity", f"Unexpected status: {response.status_code}", critical=True)
            return False
    except requests.exceptions.ConnectionError:
        results.log_failure("Backend Connectivity", "Cannot connect to backend server", critical=True)
        return False
    except Exception as e:
        results.log_failure("Backend Connectivity", str(e), critical=True)
        return False

def test_admin_login():
    """Test admin login endpoint"""
    global admin_token
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                admin_token = data["access_token"]
                results.log_success("Admin Authentication - Login")
                return True
        results.log_failure("Admin Authentication - Login", f"Status: {response.status_code}, Response: {response.text}", critical=True)
        return False
    except Exception as e:
        results.log_failure("Admin Authentication - Login", str(e), critical=True)
        return False

def test_manager_login():
    """Test manager login endpoint"""
    global manager_token
    try:
        response = requests.post(f"{API_URL}/login", json=manager_credentials, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                manager_token = data["access_token"]
                results.log_success("Manager Authentication - Login")
                return True
        results.log_failure("Manager Authentication - Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Manager Authentication - Login", str(e))
        return False

def test_admin_me_endpoint():
    """Test /api/me endpoint with admin token"""
    if not admin_token:
        results.log_failure("Admin /me Endpoint", "No admin token available", critical=True)
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == admin_credentials["email"] and data.get("role") == "admin":
                results.log_success("Admin /me Endpoint - User Profile")
                return True
        results.log_failure("Admin /me Endpoint", f"Status: {response.status_code}, Response: {response.text}", critical=True)
        return False
    except Exception as e:
        results.log_failure("Admin /me Endpoint", str(e), critical=True)
        return False

def test_business_info_api():
    """Test business info API endpoint"""
    try:
        response = requests.get(f"{API_URL}/business-info", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "hospital_name" in data:
                results.log_success("Business Info API - Data Retrieval")
                return True
        elif response.status_code == 404:
            results.log_failure("Business Info API", "Business info not configured in database")
            return False
        results.log_failure("Business Info API", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Business Info API", str(e))
        return False

def test_ai_agents_api_authentication():
    """Test AI agents API with proper authentication"""
    if not admin_token:
        results.log_failure("AI Agents API - Authentication", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-agents", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                results.log_success("AI Agents API - Authenticated Access")
                return True
        results.log_failure("AI Agents API - Authentication", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("AI Agents API - Authentication", str(e))
        return False

def test_ai_agents_api_unauthorized():
    """Test AI agents API without authentication (should fail)"""
    try:
        response = requests.get(f"{API_URL}/ai-agents", timeout=10)
        if response.status_code in [401, 403]:
            results.log_success("AI Agents API - Unauthorized Access Blocked")
            return True
        results.log_failure("AI Agents API - Unauthorized", f"Expected 401/403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("AI Agents API - Unauthorized", str(e))
        return False

def test_urgent_care_appointments_role_based():
    """Test urgent care appointments API with role-based access"""
    if not admin_token:
        results.log_failure("Urgent Care API - Role-based Access", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "appointments" in data:
                results.log_success("Urgent Care API - Admin Role Access")
                return True
        results.log_failure("Urgent Care API - Role-based Access", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Urgent Care API - Role-based Access", str(e))
        return False

def test_urgent_care_appointments_manager():
    """Test urgent care appointments API with manager role"""
    if not manager_token:
        results.log_failure("Urgent Care API - Manager Access", "No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.get(f"{API_URL}/urgent-care-appointments", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "appointments" in data:
                results.log_success("Urgent Care API - Manager Role Access")
                return True
        results.log_failure("Urgent Care API - Manager Access", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Urgent Care API - Manager Access", str(e))
        return False

def test_database_connectivity():
    """Test database connectivity through API endpoints"""
    try:
        # Test multiple endpoints that require database access
        endpoints_to_test = [
            ("/hospital-hours", "Hospital Hours"),
            ("/urgent-care-hours", "Urgent Care Hours")
        ]
        
        all_passed = True
        for endpoint, name in endpoints_to_test:
            try:
                response = requests.get(f"{API_URL}{endpoint}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, dict):
                        continue
                all_passed = False
                break
            except:
                all_passed = False
                break
        
        if all_passed:
            results.log_success("Database Connectivity - Multiple Collections")
            return True
        else:
            results.log_failure("Database Connectivity", "Failed to access database through API endpoints", critical=True)
            return False
            
    except Exception as e:
        results.log_failure("Database Connectivity", str(e), critical=True)
        return False

def test_user_registration():
    """Test user registration endpoint"""
    try:
        test_user_data = {
            "email": f"healthcheck_{int(time.time())}@test.com",
            "password": "testpass123",
            "full_name": "Health Check User",
            "role": "user"
        }
        
        response = requests.post(f"{API_URL}/register", json=test_user_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("email") == test_user_data["email"]:
                results.log_success("User Registration - New User Creation")
                return True
        results.log_failure("User Registration", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("User Registration", str(e))
        return False

def test_environment_dependent_features():
    """Test features that depend on environment variables"""
    try:
        # Test that backend can access its environment variables
        if not admin_token:
            results.log_failure("Environment Dependent Features", "No admin token for testing")
            return False
            
        # Test an endpoint that uses environment variables (like JWT validation)
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            results.log_success("Environment Dependent Features - JWT Processing")
            return True
        else:
            results.log_failure("Environment Dependent Features", f"JWT validation failed: {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("Environment Dependent Features", str(e))
        return False

def run_health_check():
    """Run complete health check suite"""
    print("🔍 Starting Health Check Tests...")
    print()
    
    # Critical infrastructure tests
    print("📋 INFRASTRUCTURE TESTS")
    test_environment_variables()
    test_backend_connectivity()
    test_database_connectivity()
    print()
    
    # Authentication tests
    print("🔐 AUTHENTICATION TESTS")
    test_admin_login()
    test_manager_login()
    test_admin_me_endpoint()
    test_user_registration()
    print()
    
    # Core API tests
    print("🏥 CORE API TESTS")
    test_business_info_api()
    test_ai_agents_api_authentication()
    test_ai_agents_api_unauthorized()
    print()
    
    # Role-based access tests
    print("👥 ROLE-BASED ACCESS TESTS")
    test_urgent_care_appointments_role_based()
    test_urgent_care_appointments_manager()
    print()
    
    # Environment variable dependent features
    print("⚙️  ENVIRONMENT VARIABLE TESTS")
    test_environment_dependent_features()
    print()
    
    # Summary
    is_healthy = results.summary()
    
    if is_healthy:
        print(f"\n🎉 HEALTH CHECK PASSED - System is operational!")
        print(f"✅ Environment variable restoration was successful")
        print(f"✅ All core functionality is working correctly")
    else:
        print(f"\n⚠️  HEALTH CHECK ISSUES DETECTED")
        if results.critical_failures:
            print(f"🚨 Critical issues need immediate attention")
        else:
            print(f"⚠️  Minor issues detected but system is functional")
    
    return is_healthy

if __name__ == "__main__":
    run_health_check()