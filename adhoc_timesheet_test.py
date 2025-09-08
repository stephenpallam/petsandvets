#!/usr/bin/env python3
"""
Adhoc Timesheet Agent Creation Fix Testing
Tests the specific fix for "body: Field required" error in adhoc timesheet agent creation
"""

import requests
import json
import os
import sys
from datetime import datetime, timedelta

# Setup test environment
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
if BASE_URL.endswith('/api'):
    API_URL = BASE_URL
else:
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
        print(f"\n{'='*60}")
        print(f"ADHOC TIMESHEET AGENT CREATION FIX TEST SUMMARY")
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

# Admin credentials for testing
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

admin_token = None

def get_admin_token():
    """Get admin authentication token"""
    global admin_token
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            admin_token = data["access_token"]
            print("✅ Admin authentication successful")
            return True
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Admin login error: {e}")
        return False

def test_adhoc_timesheet_creation_with_required_fields():
    """Test 1: Adhoc timesheet agent creation with proper required fields"""
    if not admin_token:
        results.log_failure("Adhoc Timesheet Creation - Required Fields", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data with all required fields for adhoc timesheet agent
        agent_data = {
            "agent_name": "Test Adhoc Timesheet",
            "agent_type": "time_sheet",
            "mode": "adhoc",
            "report_period": "current_week"
            # Note: topic should NOT be required for timesheet agents
        }
        
        print(f"\n🔍 Testing adhoc timesheet creation with data: {json.dumps(agent_data, indent=2)}")
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if (data.get("agent_name") == "Test Adhoc Timesheet" and 
                data.get("agent_type") == "time_sheet" and
                data.get("mode") == "adhoc" and
                data.get("report_period") == "current_week"):
                results.log_success("Adhoc Timesheet Creation - Required Fields (Success)")
                return True
            else:
                results.log_failure("Adhoc Timesheet Creation - Required Fields", 
                                  f"Response data mismatch: {data}")
                return False
        else:
            error_detail = response.json().get("detail", response.text) if response.text else "No error detail"
            if "Field required" in error_detail:
                results.log_failure("Adhoc Timesheet Creation - Required Fields", 
                                  f"❌ CRITICAL BUG: Still getting 'Field required' error: {error_detail}")
            else:
                results.log_failure("Adhoc Timesheet Creation - Required Fields", 
                                  f"Unexpected error (Status {response.status_code}): {error_detail}")
            return False
    except Exception as e:
        results.log_failure("Adhoc Timesheet Creation - Required Fields", str(e))
        return False

def test_validation_missing_agent_name():
    """Test 2: Validation - Missing agent_name should return specific error"""
    if not admin_token:
        results.log_failure("Validation - Missing Agent Name", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data missing agent_name
        agent_data = {
            "agent_type": "time_sheet",
            "mode": "adhoc",
            "report_period": "current_week"
            # Missing agent_name
        }
        
        print(f"\n🔍 Testing validation without agent_name: {json.dumps(agent_data, indent=2)}")
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 400:
            error_detail = response.json().get("detail", "")
            if "Agent name is required" in error_detail:
                results.log_success("Validation - Missing Agent Name (Correct Error)")
                return True
            else:
                results.log_failure("Validation - Missing Agent Name", 
                                  f"Wrong error message: {error_detail}")
                return False
        else:
            results.log_failure("Validation - Missing Agent Name", 
                              f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Validation - Missing Agent Name", str(e))
        return False

def test_validation_missing_report_period():
    """Test 3: Validation - Missing report_period should return specific error"""
    if not admin_token:
        results.log_failure("Validation - Missing Report Period", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data missing report_period
        agent_data = {
            "agent_name": "Test Agent",
            "agent_type": "time_sheet",
            "mode": "adhoc"
            # Missing report_period
        }
        
        print(f"\n🔍 Testing validation without report_period: {json.dumps(agent_data, indent=2)}")
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 400:
            error_detail = response.json().get("detail", "")
            if "Report period is required" in error_detail:
                results.log_success("Validation - Missing Report Period (Correct Error)")
                return True
            else:
                results.log_failure("Validation - Missing Report Period", 
                                  f"Wrong error message: {error_detail}")
                return False
        else:
            results.log_failure("Validation - Missing Report Period", 
                              f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Validation - Missing Report Period", str(e))
        return False

def test_topic_not_required_for_timesheet():
    """Test 4: Verify topic is NOT required for timesheet agents"""
    if not admin_token:
        results.log_failure("Topic Not Required - Timesheet", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data without topic field (should work for timesheet agents)
        agent_data = {
            "agent_name": "Test Timesheet No Topic",
            "agent_type": "time_sheet",
            "mode": "adhoc",
            "report_period": "current_week"
            # Deliberately no topic field
        }
        
        print(f"\n🔍 Testing timesheet agent without topic: {json.dumps(agent_data, indent=2)}")
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            results.log_success("Topic Not Required - Timesheet (Success)")
            return True
        else:
            error_detail = response.json().get("detail", response.text) if response.text else "No error detail"
            if "topic" in error_detail.lower():
                results.log_failure("Topic Not Required - Timesheet", 
                                  f"❌ BUG: Topic still required for timesheet agents: {error_detail}")
            else:
                results.log_failure("Topic Not Required - Timesheet", 
                                  f"Unexpected error (Status {response.status_code}): {error_detail}")
            return False
    except Exception as e:
        results.log_failure("Topic Not Required - Timesheet", str(e))
        return False

def test_topic_required_for_social_media():
    """Test 5: Verify topic IS still required for social media agents (for comparison)"""
    if not admin_token:
        results.log_failure("Topic Required - Social Media", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data for social media agent without topic (should fail)
        agent_data = {
            "agent_name": "Test Social Media No Topic",
            "agent_type": "social_media",
            "mode": "adhoc",
            "platforms": ["facebook"],
            "image_option": "none"
            # Deliberately no topic field
        }
        
        print(f"\n🔍 Testing social media agent without topic: {json.dumps(agent_data, indent=2)}")
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 400:
            error_detail = response.json().get("detail", "")
            if "topic" in error_detail.lower():
                results.log_success("Topic Required - Social Media (Correct Validation)")
                return True
            else:
                results.log_failure("Topic Required - Social Media", 
                                  f"Wrong error message: {error_detail}")
                return False
        else:
            results.log_failure("Topic Required - Social Media", 
                              f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Topic Required - Social Media", str(e))
        return False

def test_custom_date_range_validation_valid():
    """Test 6: Custom date range validation - Valid range should work"""
    if not admin_token:
        results.log_failure("Custom Date Range - Valid", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data with valid custom date range
        agent_data = {
            "agent_name": "Test Custom Date Range",
            "agent_type": "time_sheet",
            "mode": "adhoc",
            "report_period": "custom",
            "custom_start_date": "2024-01-01",
            "custom_end_date": "2024-01-07"
        }
        
        print(f"\n🔍 Testing valid custom date range: {json.dumps(agent_data, indent=2)}")
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if (data.get("report_period") == "custom" and
                data.get("custom_start_date") == "2024-01-01" and
                data.get("custom_end_date") == "2024-01-07"):
                results.log_success("Custom Date Range - Valid (Success)")
                return True
            else:
                results.log_failure("Custom Date Range - Valid", 
                                  f"Response data mismatch: {data}")
                return False
        else:
            error_detail = response.json().get("detail", response.text) if response.text else "No error detail"
            results.log_failure("Custom Date Range - Valid", 
                              f"Unexpected error (Status {response.status_code}): {error_detail}")
            return False
    except Exception as e:
        results.log_failure("Custom Date Range - Valid", str(e))
        return False

def test_custom_date_range_validation_invalid():
    """Test 7: Custom date range validation - Invalid range (start after end) should fail"""
    if not admin_token:
        results.log_failure("Custom Date Range - Invalid", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data with invalid date range (start after end)
        agent_data = {
            "agent_name": "Test Invalid Date Range",
            "agent_type": "time_sheet",
            "mode": "adhoc",
            "report_period": "custom",
            "custom_start_date": "2024-01-07",
            "custom_end_date": "2024-01-01"  # End before start
        }
        
        print(f"\n🔍 Testing invalid custom date range: {json.dumps(agent_data, indent=2)}")
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code == 400:
            error_detail = response.json().get("detail", "")
            if "start date" in error_detail.lower() and "end date" in error_detail.lower():
                results.log_success("Custom Date Range - Invalid (Correct Validation)")
                return True
            else:
                results.log_failure("Custom Date Range - Invalid", 
                                  f"Wrong error message: {error_detail}")
                return False
        elif response.status_code == 200:
            results.log_failure("Custom Date Range - Invalid", 
                              "❌ BUG: Agent created with invalid date range!")
            return False
        else:
            results.log_failure("Custom Date Range - Invalid", 
                              f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Custom Date Range - Invalid", str(e))
        return False

def main():
    """Run all adhoc timesheet agent creation tests"""
    print("🧪 ADHOC TIMESHEET AGENT CREATION FIX TESTING")
    print("=" * 60)
    print("Testing the fix for 'body: Field required' error in adhoc timesheet agent creation")
    print("=" * 60)
    
    # Get admin token first
    if not get_admin_token():
        print("❌ Failed to get admin token. Cannot proceed with tests.")
        return False
    
    # Run all tests
    tests = [
        test_adhoc_timesheet_creation_with_required_fields,
        test_validation_missing_agent_name,
        test_validation_missing_report_period,
        test_topic_not_required_for_timesheet,
        test_topic_required_for_social_media,
        test_custom_date_range_validation_valid,
        test_custom_date_range_validation_invalid
    ]
    
    for test in tests:
        test()
    
    # Print summary
    success = results.summary()
    
    if success:
        print("\n🎉 ALL TESTS PASSED! Adhoc timesheet agent creation fix is working correctly.")
    else:
        print("\n⚠️  SOME TESTS FAILED! Issues found with adhoc timesheet agent creation.")
    
    return success

if __name__ == "__main__":
    main()