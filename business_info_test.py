#!/usr/bin/env python3
"""
Business Information API Testing
Tests the newly implemented Business Information API endpoints
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

print(f"Testing Business Information API at: {API_URL}")

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
        print(f"BUSINESS INFORMATION API TEST SUMMARY")
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

regular_user_login = {
    "email": "testuser@veterinary.com", 
    "password": "testpass123"
}

# Global variables for tokens
admin_token = None
user_token = None

def setup_authentication():
    """Setup admin and user tokens for testing"""
    global admin_token, user_token
    
    # Admin login
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            admin_token = data["access_token"]
            print("✅ Admin authentication setup successful")
        else:
            print("❌ Admin authentication setup failed")
            return False
    except Exception as e:
        print(f"❌ Admin authentication setup error: {e}")
        return False
    
    # Regular user login
    try:
        response = requests.post(f"{API_URL}/login", json=regular_user_login)
        if response.status_code == 200:
            data = response.json()
            user_token = data["access_token"]
            print("✅ Regular user authentication setup successful")
        else:
            print("❌ Regular user authentication setup failed")
    except Exception as e:
        print(f"❌ Regular user authentication setup error: {e}")
    
    return True

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
                    results.log_success("GET /api/business-info (Public - Default Values)")
                    return True
                else:
                    results.log_success("GET /api/business-info (Public - Existing Data)")
                    return True
        results.log_failure("GET /api/business-info (Public)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("GET /api/business-info (Public)", str(e))
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
                        results.log_success("Default Business Info Creation")
                        return True
        results.log_failure("Default Business Info Creation", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Default Business Info Creation", str(e))
        return False

def test_update_business_info_admin():
    """Test PUT /api/business-info with admin authentication (full update)"""
    if not admin_token:
        results.log_failure("PUT /api/business-info (Admin)", "No admin token available")
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
                results.log_success("PUT /api/business-info (Admin - Full Update)")
                return True
        results.log_failure("PUT /api/business-info (Admin)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("PUT /api/business-info (Admin)", str(e))
        return False

def test_update_business_info_partial():
    """Test PUT /api/business-info with partial updates"""
    if not admin_token:
        results.log_failure("PUT /api/business-info (Partial)", "No admin token available")
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
                results.log_success("PUT /api/business-info (Partial Update)")
                return True
        results.log_failure("PUT /api/business-info (Partial)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("PUT /api/business-info (Partial)", str(e))
        return False

def test_update_business_info_no_auth():
    """Test PUT /api/business-info without authentication (should fail)"""
    try:
        update_data = {
            "hospital_name": "Unauthorized Update Attempt"
        }
        
        response = requests.put(f"{API_URL}/business-info", json=update_data)
        if response.status_code in [401, 403]:  # Both are acceptable for no auth
            results.log_success("PUT /api/business-info (No Auth - Correctly Rejected)")
            return True
        results.log_failure("PUT /api/business-info (No Auth)", f"Expected 401/403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("PUT /api/business-info (No Auth)", str(e))
        return False

def test_update_business_info_regular_user():
    """Test PUT /api/business-info with regular user (should fail with 403)"""
    if not user_token:
        results.log_failure("PUT /api/business-info (Regular User)", "No user token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {user_token}"}
        update_data = {
            "hospital_name": "Regular User Update Attempt"
        }
        
        response = requests.put(f"{API_URL}/business-info", json=update_data, headers=headers)
        if response.status_code == 403:
            results.log_success("PUT /api/business-info (Regular User - Correctly Forbidden)")
            return True
        results.log_failure("PUT /api/business-info (Regular User)", f"Expected 403, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("PUT /api/business-info (Regular User)", str(e))
        return False

def test_business_info_social_media_optional():
    """Test that social media fields are optional and handle empty strings"""
    if not admin_token:
        results.log_failure("Social Media Fields Optional", "No admin token available")
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
                results.log_success("Social Media Fields Optional (Empty Strings)")
                return True
        results.log_failure("Social Media Fields Optional", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Social Media Fields Optional", str(e))
        return False

def test_business_info_database_storage():
    """Test that business info is properly stored in MongoDB with all fields"""
    if not admin_token:
        results.log_failure("Database Storage Verification", "No admin token available")
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
            results.log_failure("Database Storage Verification (Setup)", f"Failed to update: {response.status_code}")
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
                results.log_success("Database Storage Verification (All Fields)")
                return True
        results.log_failure("Database Storage Verification", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Database Storage Verification", str(e))
        return False

def run_business_info_tests():
    """Run all Business Information API tests"""
    print("="*60)
    print("BUSINESS INFORMATION API TESTS")
    print("="*60)
    
    # Setup authentication
    if not setup_authentication():
        print("❌ Authentication setup failed. Cannot proceed with tests.")
        return False
    
    print("\n" + "="*50)
    print("Testing Business Information API Endpoints...")
    print("="*50)
    
    # Test scenarios as requested in the review
    test_get_business_info_public()
    test_get_business_info_creates_default()
    test_update_business_info_admin()
    test_update_business_info_partial()
    test_update_business_info_no_auth()
    test_update_business_info_regular_user()
    test_business_info_social_media_optional()
    test_business_info_database_storage()
    
    # Print summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_business_info_tests()
    sys.exit(0 if success else 1)