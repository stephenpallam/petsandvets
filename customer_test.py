#!/usr/bin/env python3
"""
Customer Management System API Testing
Tests the customer management endpoints that need testing according to test_result.md
"""

import requests
import json
import os
import sys
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

print(f"Testing Customer Management API at: {API_URL}")

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

# Admin credentials
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

admin_token = None
created_customer_id = None

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

def test_get_customers():
    """Test GET /api/customers endpoint"""
    if not admin_token:
        results.log_failure("Get Customers", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/customers", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "customers" in data:
                results.log_success("Get Customers (Paginated Response)")
                return True
            elif isinstance(data, list):
                results.log_success("Get Customers (List Response)")
                return True
        
        results.log_failure("Get Customers", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Customers", str(e))
        return False

def test_create_customer():
    """Test POST /api/customers endpoint"""
    global created_customer_id
    if not admin_token:
        results.log_failure("Create Customer", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        customer_data = {
            "name": "Fluffy Johnson",
            "pet_name": "Whiskers",
            "phone": "(555) 123-4567",
            "email": "fluffy.johnson@email.com",
            "sms_opt_in": True,
            "email_subscribed": True
        }
        
        response = requests.post(f"{API_URL}/customers", json=customer_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "id" in data and data.get("name") == "Fluffy Johnson":
                created_customer_id = data["id"]
                results.log_success("Create Customer")
                return True
        
        results.log_failure("Create Customer", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Customer", str(e))
        return False

def test_get_specific_customer():
    """Test GET /api/customers/{id} endpoint"""
    if not admin_token or not created_customer_id:
        results.log_failure("Get Specific Customer", "No admin token or customer ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/customers/{created_customer_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("id") == created_customer_id and data.get("name") == "Fluffy Johnson":
                results.log_success("Get Specific Customer")
                return True
        
        results.log_failure("Get Specific Customer", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Get Specific Customer", str(e))
        return False

def test_update_customer():
    """Test PUT /api/customers/{id} endpoint"""
    if not admin_token or not created_customer_id:
        results.log_failure("Update Customer", "No admin token or customer ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        update_data = {
            "name": "Fluffy Johnson Updated",
            "pet_name": "Whiskers Jr",
            "phone": "(555) 987-6543"
        }
        
        response = requests.put(f"{API_URL}/customers/{created_customer_id}", json=update_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("name") == "Fluffy Johnson Updated" and data.get("pet_name") == "Whiskers Jr":
                results.log_success("Update Customer")
                return True
        
        results.log_failure("Update Customer", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Update Customer", str(e))
        return False

def test_search_customers():
    """Test GET /api/customers with search parameter"""
    if not admin_token:
        results.log_failure("Search Customers", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/customers?search=Fluffy", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, dict) and "customers" in data:
                # Check if our created customer is in the search results
                customers = data["customers"]
                found = any(customer.get("name", "").startswith("Fluffy") for customer in customers)
                if found:
                    results.log_success("Search Customers")
                    return True
            elif isinstance(data, list):
                found = any(customer.get("name", "").startswith("Fluffy") for customer in data)
                if found:
                    results.log_success("Search Customers")
                    return True
        
        results.log_failure("Search Customers", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Search Customers", str(e))
        return False

def test_delete_customer():
    """Test DELETE /api/customers/{id} endpoint"""
    if not admin_token or not created_customer_id:
        results.log_failure("Delete Customer", "No admin token or customer ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.delete(f"{API_URL}/customers/{created_customer_id}", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                results.log_success("Delete Customer")
                return True
        
        results.log_failure("Delete Customer", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Delete Customer", str(e))
        return False

def main():
    print("🧪 CUSTOMER MANAGEMENT SYSTEM API TESTING")
    print("="*80)
    print("Testing Customer Management System API endpoints")
    print("="*80)
    
    # Login first
    if not test_admin_login():
        print("❌ Cannot proceed without admin authentication")
        return False
    
    print(f"\n👥 TESTING CUSTOMER MANAGEMENT ENDPOINTS")
    print("="*60)
    
    # Run customer management tests
    test_get_customers()
    test_create_customer()
    test_get_specific_customer()
    test_update_customer()
    test_search_customers()
    test_delete_customer()
    
    # Print final summary
    success = results.summary()
    
    if success:
        print("\n✅ ALL CUSTOMER MANAGEMENT TESTS PASSED!")
        print("The Customer Management System API is working correctly.")
    else:
        print("\n❌ SOME CUSTOMER MANAGEMENT TESTS FAILED - SEE DETAILS ABOVE")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)