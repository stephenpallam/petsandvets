#!/usr/bin/env python3
"""
Focused Email Agent Testing for Recurring Email Agent Implementation
Tests the specific scenarios requested in the review
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

print(f"Testing Email Agent API at: {API_URL}")

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

# Admin credentials as specified in review request
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

admin_token = None

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

def test_recurring_email_agent_weekly_schedule():
    """Test 1: Create Recurring Email Agent (Weekly Schedule) - As requested in review"""
    if not admin_token:
        results.log_failure("Test 1 - Recurring Email Agent (Weekly Schedule)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data exactly as specified in the review request
        agent_data = {
            "agent_type": "email",
            "mode": "recurring",
            "agent_name": "Weekly Pet Care Tips",
            "topic": "Pet Health & Wellness",  # Required
            "word_count": "150",
            "schedule_type": "weekly",
            "days_of_week": {"monday": True, "wednesday": True, "friday": True},
            "post_time": "09:00",
            "email_content_template": "Dear [CUSTOMER_NAME], Hope you and [PET_NAME] are well! Weekly tips...",
            "image_option": "none",
            "image_text": "Pet Health Tips",
            "use_chatgpt_formatting": True,
            "post_destination": "in_review"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if ("agent_id" in data and 
                "message" in data and
                "agent created successfully" in data["message"]):
                results.log_success("Test 1 - Create Recurring Email Agent (Weekly Schedule)")
                return True
        elif response.status_code == 400:
            error_detail = response.json().get("detail", "")
            results.log_failure("Test 1 - Recurring Email Agent (Weekly Schedule)", f"Validation error: {error_detail}")
            return False
        
        results.log_failure("Test 1 - Recurring Email Agent (Weekly Schedule)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Test 1 - Recurring Email Agent (Weekly Schedule)", str(e))
        return False

def test_recurring_email_agent_monthly_schedule():
    """Test 2: Create Recurring Email Agent (Monthly Schedule) - As requested in review"""
    if not admin_token:
        results.log_failure("Test 2 - Recurring Email Agent (Monthly Schedule)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data exactly as specified in the review request
        agent_data = {
            "agent_type": "email",
            "mode": "recurring",
            "agent_name": "Monthly Reminder Agent",
            "topic": "Monthly Pet Care Reminders",
            "schedule_type": "monthly",
            "monthly_schedule": "first_monday",
            "post_time": "10:00",
            "image_option": "none",
            "use_chatgpt_formatting": False,
            "post_destination": "auto_send"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if ("agent_id" in data and 
                "message" in data and
                "agent created successfully" in data["message"]):
                results.log_success("Test 2 - Create Recurring Email Agent (Monthly Schedule)")
                return True
        elif response.status_code == 400:
            error_detail = response.json().get("detail", "")
            results.log_failure("Test 2 - Recurring Email Agent (Monthly Schedule)", f"Validation error: {error_detail}")
            return False
        
        results.log_failure("Test 2 - Recurring Email Agent (Monthly Schedule)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Test 2 - Recurring Email Agent (Monthly Schedule)", str(e))
        return False

def test_validation_missing_topic():
    """Test 3: Verify validation still works for missing required fields - missing topic"""
    if not admin_token:
        results.log_failure("Test 3a - Validation Missing Topic", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data with missing topic (should fail)
        agent_data = {
            "agent_type": "email",
            "mode": "recurring",
            # Missing topic field
            "schedule_type": "weekly",
            "days_of_week": {"monday": True},
            "post_time": "09:00"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        if response.status_code == 400:
            error_detail = response.json().get("detail", "")
            if "topic" in error_detail.lower() or "required" in error_detail.lower():
                results.log_success("Test 3a - Validation Missing Topic (Correctly Failed)")
                return True
            else:
                results.log_failure("Test 3a - Validation Missing Topic", f"Wrong error message: {error_detail}")
                return False
        elif response.status_code == 422:  # Validation error
            results.log_success("Test 3a - Validation Missing Topic (Correctly Failed with 422)")
            return True
        elif response.status_code == 200:
            results.log_failure("Test 3a - Validation Missing Topic", "❌ BUG: Agent created without topic when it should have failed!")
            return False
        
        results.log_failure("Test 3a - Validation Missing Topic", f"Unexpected status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Test 3a - Validation Missing Topic", str(e))
        return False

def test_validation_missing_agent_name():
    """Test 3: Verify validation still works for missing required fields - missing agent_name"""
    if not admin_token:
        results.log_failure("Test 3b - Validation Missing Agent Name", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test data with missing agent_name (should fail)
        agent_data = {
            "agent_type": "email",
            "mode": "recurring",
            # Missing agent_name field
            "topic": "Pet Health Tips",
            "schedule_type": "weekly",
            "days_of_week": {"monday": True},
            "post_time": "09:00"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
        
        if response.status_code == 400:
            error_detail = response.json().get("detail", "")
            if "agent_name" in error_detail.lower() or "required" in error_detail.lower():
                results.log_success("Test 3b - Validation Missing Agent Name (Correctly Failed)")
                return True
            else:
                results.log_failure("Test 3b - Validation Missing Agent Name", f"Wrong error message: {error_detail}")
                return False
        elif response.status_code == 422:  # Validation error
            results.log_success("Test 3b - Validation Missing Agent Name (Correctly Failed with 422)")
            return True
        elif response.status_code == 200:
            results.log_failure("Test 3b - Validation Missing Agent Name", "❌ BUG: Agent created without agent_name when it should have failed!")
            return False
        
        results.log_failure("Test 3b - Validation Missing Agent Name", f"Unexpected status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Test 3b - Validation Missing Agent Name", str(e))
        return False

def main():
    print("🧪 RECURRING EMAIL AGENT IMPLEMENTATION TESTING")
    print("="*80)
    print("Testing the updated Recurring Email Agent implementation with new form structure")
    print("="*80)
    
    # Login first
    if not test_admin_login():
        print("❌ Cannot proceed without admin authentication")
        return False
    
    print(f"\n📧 TESTING RECURRING EMAIL AGENT SCENARIOS")
    print("="*60)
    
    # Run the specific tests requested in the review
    test_recurring_email_agent_weekly_schedule()
    test_recurring_email_agent_monthly_schedule()
    test_validation_missing_topic()
    test_validation_missing_agent_name()
    
    # Print final summary
    success = results.summary()
    
    if success:
        print("\n✅ ALL RECURRING EMAIL AGENT TESTS PASSED!")
        print("The new recurring email agent implementation is working correctly.")
    else:
        print("\n❌ SOME RECURRING EMAIL AGENT TESTS FAILED - SEE DETAILS ABOVE")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)