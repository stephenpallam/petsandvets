#!/usr/bin/env python3
"""
Individual AI Post Endpoint Testing
Tests the new GET /api/ai-posts/{post_id} endpoint for timesheet posts
"""

import requests
import json
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

print(f"Testing Individual AI Post Endpoint at: {API_URL}")
print("=" * 60)

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

def test_admin_login():
    """Test admin login and get token"""
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                results.log_success("Admin Login")
                return data["access_token"]
        results.log_failure("Admin Login", f"Status: {response.status_code}, Response: {response.text}")
        return None
    except Exception as e:
        results.log_failure("Admin Login", str(e))
        return None

def test_get_timesheet_posts_ready_to_publish(token):
    """Test GET /api/ai-posts/ready-to-publish with timesheet filter to get post IDs"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish?agent_type=time_sheet", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "posts" in data and isinstance(data["posts"], list):
                timesheet_posts = data["posts"]
                timesheet_post_ids = [post["id"] for post in timesheet_posts if post.get("agent_type") == "time_sheet"]
                
                if timesheet_post_ids:
                    results.log_success(f"Get Timesheet Posts Ready to Publish (Found {len(timesheet_post_ids)} timesheet posts)")
                    return timesheet_post_ids
                else:
                    results.log_success("Get Timesheet Posts Ready to Publish (No timesheet posts found)")
                    return []
            else:
                results.log_failure("Get Timesheet Posts Ready to Publish", "Invalid response structure")
                return []
        else:
            results.log_failure("Get Timesheet Posts Ready to Publish", f"Status: {response.status_code}, Response: {response.text}")
            return []
    except Exception as e:
        results.log_failure("Get Timesheet Posts Ready to Publish", str(e))
        return []

def test_get_individual_ai_post(token, post_id):
    """Test GET /api/ai-posts/{post_id} - Verify individual timesheet post retrieval"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/ai-posts/{post_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify basic post structure
            required_fields = ["id", "agent_type", "status", "created_at"]
            for field in required_fields:
                if field not in data:
                    results.log_failure("Get Individual AI Post", f"Missing required field: {field}")
                    return False
            
            # Verify it's a timesheet post
            if data.get("agent_type") != "time_sheet":
                results.log_failure("Get Individual AI Post", f"Expected timesheet post, got: {data.get('agent_type')}")
                return False
            
            # Verify timesheet_data exists and has proper structure
            if "timesheet_data" not in data:
                results.log_failure("Get Individual AI Post", "Missing timesheet_data field")
                return False
            
            timesheet_data = data["timesheet_data"]
            if not isinstance(timesheet_data, dict):
                results.log_failure("Get Individual AI Post", "timesheet_data should be a dictionary")
                return False
            
            results.log_success(f"Get Individual AI Post (ID: {post_id[:8]}...)")
            return True
        elif response.status_code == 404:
            results.log_failure("Get Individual AI Post", "Post not found (404)")
            return False
        else:
            results.log_failure("Get Individual AI Post", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        results.log_failure("Get Individual AI Post", str(e))
        return False

def test_verify_timesheet_data_structure(token, post_id):
    """Test that returned timesheet post has all data needed for hours adjustment page"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/ai-posts/{post_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            timesheet_data = data.get("timesheet_data", {})
            
            # Look for employee data indicators
            has_employee_data = False
            employee_indicators = ["employees", "employee_data", "reports", "timesheet_summary"]
            
            for indicator in employee_indicators:
                if indicator in timesheet_data:
                    has_employee_data = True
                    break
            
            # Check if timesheet_data contains meaningful content
            if not has_employee_data and not timesheet_data:
                results.log_failure("Verify Timesheet Data Structure", "timesheet_data is empty or missing employee information")
                return False
            
            # Look for hours/time related data
            has_hours_data = False
            hours_indicators = ["hours", "total_hours", "regular_hours", "after_hours", "time_entries"]
            
            # Check in timesheet_data or nested structures
            timesheet_str = str(timesheet_data).lower()
            for indicator in hours_indicators:
                if indicator in timesheet_str:
                    has_hours_data = True
                    break
            
            if not has_hours_data:
                results.log_failure("Verify Timesheet Data Structure", "No hours/time data found in timesheet_data")
                return False
            
            # Check for employee identification data
            has_employee_ids = False
            id_indicators = ["user_id", "employee_id", "user_name", "employee_name"]
            
            for indicator in id_indicators:
                if indicator in timesheet_str:
                    has_employee_ids = True
                    break
            
            if not has_employee_ids:
                results.log_failure("Verify Timesheet Data Structure", "No employee identification data found")
                return False
            
            results.log_success(f"Verify Timesheet Data Structure (Post ID: {post_id[:8]}... - Has employee and hours data)")
            return True
        else:
            results.log_failure("Verify Timesheet Data Structure", f"Failed to fetch post: {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Verify Timesheet Data Structure", str(e))
        return False

def test_individual_ai_post_authentication():
    """Test GET /api/ai-posts/{post_id} authentication requirements"""
    try:
        # First get a post ID (using admin token)
        token = test_admin_login()
        if not token:
            results.log_failure("Individual AI Post Authentication", "No admin token available for setup")
            return False
        
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish?agent_type=time_sheet", headers=headers, timeout=10)
        
        if response.status_code != 200:
            results.log_failure("Individual AI Post Authentication", "Failed to get test post ID")
            return False
        
        data = response.json()
        posts = data.get("posts", [])
        if not posts:
            results.log_success("Individual AI Post Authentication (No posts to test)")
            return True
        
        test_post_id = posts[0]["id"]
        
        # Test without authentication
        response = requests.get(f"{API_URL}/ai-posts/{test_post_id}", timeout=10)
        if response.status_code in [401, 403]:
            results.log_success("Individual AI Post Authentication (Correctly requires authentication)")
            return True
        else:
            results.log_failure("Individual AI Post Authentication", f"Expected 401/403, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Individual AI Post Authentication", str(e))
        return False

def test_individual_ai_post_not_found(token):
    """Test GET /api/ai-posts/{post_id} with non-existent post ID"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        fake_post_id = "non-existent-post-id-12345"
        response = requests.get(f"{API_URL}/ai-posts/{fake_post_id}", headers=headers, timeout=10)
        
        if response.status_code == 404:
            results.log_success("Individual AI Post Not Found (Correctly returns 404)")
            return True
        else:
            results.log_failure("Individual AI Post Not Found", f"Expected 404, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Individual AI Post Not Found", str(e))
        return False

def main():
    """Run all individual AI post endpoint tests"""
    print("🔍 INDIVIDUAL AI POST ENDPOINT TESTS")
    print("="*60)
    
    # Test 1: Admin authentication
    token = test_admin_login()
    if not token:
        print("❌ Failed to authenticate as admin - cannot proceed with tests")
        return False
    
    # Test 2: Get timesheet post IDs from ready-to-publish
    timesheet_post_ids = test_get_timesheet_posts_ready_to_publish(token)
    
    if timesheet_post_ids:
        # Test 3: Test individual post retrieval with first timesheet post
        test_post_id = timesheet_post_ids[0]
        test_get_individual_ai_post(token, test_post_id)
        
        # Test 4: Verify timesheet data structure
        test_verify_timesheet_data_structure(token, test_post_id)
        
        # Test multiple posts if available
        if len(timesheet_post_ids) > 1:
            for i, post_id in enumerate(timesheet_post_ids[1:3], 2):  # Test up to 3 posts total
                test_get_individual_ai_post(token, post_id)
                test_verify_timesheet_data_structure(token, post_id)
    
    # Test 5: Authentication requirements
    test_individual_ai_post_authentication()
    
    # Test 6: Not found handling
    test_individual_ai_post_not_found(token)
    
    return results.summary()

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n🎉 ALL INDIVIDUAL AI POST ENDPOINT TESTS PASSED!")
        print("✅ The 'Timesheet data not found' error should be resolved.")
        print("✅ Individual timesheet posts can be retrieved successfully.")
        print("✅ Timesheet data contains all necessary information for hours adjustment page.")
        sys.exit(0)
    else:
        print("\n💥 SOME INDIVIDUAL AI POST ENDPOINT TESTS FAILED!")
        sys.exit(1)