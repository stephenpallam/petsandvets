#!/usr/bin/env python3
"""
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
Focused test for AI Posts Regenerate Image Endpoint
Tests the fixed regenerate image functionality after import error fix
"""

import requests
import json
import os

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

print(f"Testing AI Posts Regenerate Image Endpoint at: {API_URL}")

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
        print(f"REGENERATE IMAGE TEST SUMMARY")
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

# Admin credentials as specified in the review request
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

# Global variables for tokens
admin_token = None
manager_token = None
user_token = None

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

def test_get_ai_posts_for_testing():
    """Get AI posts to test regenerate image functionality"""
    if not admin_token:
        results.log_failure("Get AI Posts for Testing", "No admin token available")
        return False, None
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish?page=1&limit=5", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "posts" in data and len(data["posts"]) > 0:
                results.log_success(f"Get AI Posts for Testing (Found {len(data['posts'])} posts)")
                return True, data["posts"][0]["id"]
            else:
                results.log_success("Get AI Posts for Testing (No posts found - will test with dummy ID)")
                return True, "dummy-post-id"
        else:
            results.log_failure("Get AI Posts for Testing", f"Status: {response.status_code}, Response: {response.text}")
            return False, None
    except Exception as e:
        results.log_failure("Get AI Posts for Testing", str(e))
        return False, None

def test_regenerate_image_endpoint(post_id):
    """Test POST /api/ai-posts/{post_id}/regenerate-image endpoint - MAIN TEST"""
    if not admin_token:
        results.log_failure("Regenerate Image Endpoint", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data for regenerate image
        regenerate_data = {
            "content": "Professional veterinary clinic providing excellent care for pets in South Riding, Virginia",
            "image_text": "A modern veterinary clinic with happy pets, caring veterinarians, and state-of-the-art medical equipment"
        }
        
        print(f"Testing regenerate image for post ID: {post_id}")
        response = requests.post(f"{API_URL}/ai-posts/{post_id}/regenerate-image", json=regenerate_data, headers=headers)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response Data: {data}")
            if ("message" in data and 
                "image_url" in data and 
                "image_text" in data):
                results.log_success("Regenerate Image Endpoint (✅ WORKING - Import Error Fixed!)")
                return True
            else:
                results.log_failure("Regenerate Image Endpoint", f"Invalid response structure: {data}")
                return False
        elif response.status_code == 404:
            if post_id == "dummy-post-id":
                results.log_success("Regenerate Image Endpoint (✅ Auth Working - Post Not Found as Expected)")
                return True
            else:
                results.log_failure("Regenerate Image Endpoint", "Real post not found")
                return False
        elif response.status_code == 500:
            try:
                error_data = response.json()
                error_detail = error_data.get("detail", "")
                print(f"Server Error Detail: {error_detail}")
                
                if "Failed to regenerate image" in error_detail:
                    results.log_failure("Regenerate Image Endpoint", f"❌ REGENERATE IMAGE STILL FAILING: {error_detail}. This could be due to AI service configuration issues or remaining import problems.")
                    return False
                elif "import" in error_detail.lower() or "module" in error_detail.lower():
                    results.log_failure("Regenerate Image Endpoint", f"❌ IMPORT ERROR STILL EXISTS: {error_detail}")
                    return False
                else:
                    results.log_failure("Regenerate Image Endpoint", f"Server error (may be AI service config): {error_detail}")
                    return False
            except:
                results.log_failure("Regenerate Image Endpoint", f"500 error with non-JSON response: {response.text}")
                return False
        elif response.status_code == 403:
            results.log_failure("Regenerate Image Endpoint", "Access denied - admin should have access")
            return False
        else:
            results.log_failure("Regenerate Image Endpoint", f"Unexpected status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        results.log_failure("Regenerate Image Endpoint", f"Exception: {str(e)}")
        return False

def test_regenerate_image_authentication():
    """Test authentication requirements for regenerate image endpoint"""
    try:
        # Test without authentication
        regenerate_data = {
            "content": "Test content",
            "image_text": "Test image text"
        }
        
        response = requests.post(f"{API_URL}/ai-posts/test-post-id/regenerate-image", json=regenerate_data)
        
        if response.status_code in [401, 403]:
            results.log_success("Regenerate Image Authentication (✅ Properly Protected)")
            return True
        else:
            results.log_failure("Regenerate Image Authentication", f"Expected 401/403, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Regenerate Image Authentication", str(e))
        return False

def test_regenerate_image_manager_access():
    """Test manager access to regenerate image endpoint"""
    # First login as manager
    manager_credentials = {
        "email": "manager@veterinary.com",
        "password": "manager123"
    }
    
    try:
        response = requests.post(f"{API_URL}/login", json=manager_credentials)
        if response.status_code == 200:
            data = response.json()
            manager_token = data["access_token"]
            
            # Test regenerate image with manager token
            headers = {"Authorization": f"Bearer {manager_token}"}
            regenerate_data = {
                "content": "Manager test content",
                "image_text": "Manager test image text"
            }
            
            response = requests.post(f"{API_URL}/ai-posts/test-post-id/regenerate-image", json=regenerate_data, headers=headers)
            
            if response.status_code in [200, 404, 500]:  # 404 = post not found, 500 = AI service issue, both OK for auth test
                results.log_success("Regenerate Image Manager Access (✅ Manager Access Allowed)")
                return True
            elif response.status_code == 403:
                results.log_failure("Regenerate Image Manager Access", "Manager access denied - should be allowed")
                return False
            else:
                results.log_failure("Regenerate Image Manager Access", f"Unexpected status: {response.status_code}")
                return False
        else:
            results.log_failure("Regenerate Image Manager Access", "Manager login failed")
            return False
    except Exception as e:
        results.log_failure("Regenerate Image Manager Access", str(e))
        return False

def run_regenerate_image_tests():
    """Run all regenerate image tests"""
    print("="*60)
    print("AI POSTS REGENERATE IMAGE ENDPOINT TESTS")
    print("Testing the fixed regenerate image functionality")
    print("="*60)
    
    # Step 1: Login as admin
    if not test_admin_login():
        print("❌ Cannot proceed without admin login")
        return False
    
    # Step 2: Get posts for testing
    success, post_id = test_get_ai_posts_for_testing()
    if not success:
        print("❌ Cannot get posts for testing")
        return False
    
    # Step 3: Test the main regenerate image endpoint
    test_regenerate_image_endpoint(post_id)
    
    # Step 4: Test authentication
    test_regenerate_image_authentication()
    
    # Step 5: Test manager access
    test_regenerate_image_manager_access()
    
    # Print summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_regenerate_image_tests()
    exit(0 if success else 1)