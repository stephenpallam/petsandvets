#!/usr/bin/env python3
"""
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
Write Your Post Mode with postDestination Field Testing
Tests the specific functionality requested in the review
"""

import requests
import json
import os
from datetime import datetime
import sys

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

print(f"Testing Write Your Post Mode at: {API_URL}")

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
        print(f"WRITE MODE TEST SUMMARY")
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

# Test credentials
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

# Global token
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

def test_create_write_mode_agent_in_review_destination():
    """Test creating Write Your Post AI agent with 'in_review' post destination"""
    if not admin_token:
        results.log_failure("Create Write Mode Agent (In Review Destination)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Write mode agent with in_review destination
        write_agent_data = {
            "mode": "write",
            "post_title": "Test Write Post with In Review Workflow",
            "post_content": "This is a test post to verify postDestination functionality with in_review workflow.",
            "word_count": "100",
            "post_date": "2025-01-15",
            "post_time": "10:00",
            "image_text": "Test Image Text for In Review",
            "image_option": "none",
            "social_platforms": {
                "facebook": True,
                "instagram": True,
                "twitter": False,
                "whatsapp": False
            },
            "immediate": False,
            "use_web_research": False,
            "post_destination": "in_review"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=write_agent_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "agent_id" in data:
                results.log_success("Create Write Mode Agent (In Review Destination)")
                return True
        results.log_failure("Create Write Mode Agent (In Review Destination)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Write Mode Agent (In Review Destination)", str(e))
        return False

def test_create_write_mode_agent_ready_to_publish_destination():
    """Test creating Write Your Post AI agent with 'ready_to_publish' post destination"""
    if not admin_token:
        results.log_failure("Create Write Mode Agent (Ready to Publish Destination)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Write mode agent with ready_to_publish destination
        write_agent_data = {
            "mode": "write",
            "post_title": "Test Write Post with Ready to Publish Workflow",
            "post_content": "This is a test post to verify postDestination functionality with ready_to_publish workflow.",
            "word_count": "150",
            "post_date": "2025-01-16",
            "post_time": "14:30",
            "image_text": "Test Image Text for Ready to Publish",
            "image_option": "none",
            "social_platforms": {
                "facebook": False,
                "instagram": True,
                "twitter": True,
                "whatsapp": False
            },
            "immediate": False,
            "use_web_research": True,
            "post_destination": "ready_to_publish"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=write_agent_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "agent_id" in data:
                results.log_success("Create Write Mode Agent (Ready to Publish Destination)")
                return True
        results.log_failure("Create Write Mode Agent (Ready to Publish Destination)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Write Mode Agent (Ready to Publish Destination)", str(e))
        return False

def test_write_mode_agent_data_persistence():
    """Test that Write Your Post agent data including postDestination is properly stored"""
    if not admin_token:
        results.log_failure("Write Mode Agent Data Persistence", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Create a write mode agent
        write_agent_data = {
            "mode": "write",
            "post_title": "Data Persistence Test Post",
            "post_content": "Testing that all write mode data including postDestination is stored correctly.",
            "word_count": "200",
            "post_date": "2025-01-17",
            "post_time": "16:00",
            "image_text": "Data Persistence Test Image",
            "image_option": "none",
            "social_platforms": {
                "facebook": True,
                "instagram": False,
                "twitter": True,
                "whatsapp": True
            },
            "immediate": True,
            "use_web_research": True,
            "post_destination": "in_review"
        }
        
        # Create the agent
        response = requests.post(f"{API_URL}/ai-agents", json=write_agent_data, headers=headers)
        
        if response.status_code != 200:
            results.log_failure("Write Mode Agent Data Persistence (Creation)", f"Failed to create agent: {response.status_code}")
            return False
        
        agent_id = response.json().get("agent_id")
        
        # Retrieve all agents to verify data persistence
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        
        if response.status_code == 200:
            agents = response.json()
            # Find our created agent
            created_agent = None
            for agent in agents:
                if agent.get("id") == agent_id:
                    created_agent = agent
                    break
            
            if created_agent:
                # Verify all write mode fields are present and correct
                if (created_agent.get("mode") == "write" and
                    created_agent.get("post_title") == "Data Persistence Test Post" and
                    created_agent.get("post_content") == "Testing that all write mode data including postDestination is stored correctly." and
                    created_agent.get("use_web_research") == True and
                    created_agent.get("immediate") == True):
                    results.log_success("Write Mode Agent Data Persistence")
                    return True
                else:
                    results.log_failure("Write Mode Agent Data Persistence", "Agent data not stored correctly")
                    return False
            else:
                results.log_failure("Write Mode Agent Data Persistence", "Created agent not found in list")
                return False
        
        results.log_failure("Write Mode Agent Data Persistence", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Write Mode Agent Data Persistence", str(e))
        return False

def test_write_mode_agent_validation_requirements():
    """Test Write Your Post agent validation for required fields"""
    if not admin_token:
        results.log_failure("Write Mode Agent Validation", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test missing post_title (should fail)
        invalid_agent_data = {
            "mode": "write",
            # Missing post_title
            "post_content": "This should fail due to missing post_title.",
            "word_count": "100",
            "post_date": "2025-01-19",
            "post_time": "09:00",
            "image_option": "none",
            "social_platforms": {
                "facebook": True,
                "instagram": False,
                "twitter": False,
                "whatsapp": False
            },
            "post_destination": "in_review"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=invalid_agent_data, headers=headers)
        
        if response.status_code == 400:
            results.log_success("Write Mode Agent Validation (Missing Post Title)")
        else:
            results.log_failure("Write Mode Agent Validation", f"Expected 400 for missing post_title, got {response.status_code}")
            return False
        
        # Test missing post_content (should fail)
        invalid_agent_data2 = {
            "mode": "write",
            "post_title": "Valid Title",
            # Missing post_content
            "word_count": "100",
            "post_date": "2025-01-19",
            "post_time": "09:00",
            "image_option": "none",
            "social_platforms": {
                "facebook": True,
                "instagram": False,
                "twitter": False,
                "whatsapp": False
            },
            "post_destination": "ready_to_publish"
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=invalid_agent_data2, headers=headers)
        
        if response.status_code == 400:
            results.log_success("Write Mode Agent Validation (Missing Post Content)")
            return True
        else:
            results.log_failure("Write Mode Agent Validation", f"Expected 400 for missing post_content, got {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("Write Mode Agent Validation Requirements", str(e))
        return False

def run_write_mode_tests():
    """Run Write Your Post mode tests with postDestination field"""
    print("Starting Write Your Post Mode Tests...")
    print(f"Backend URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print("="*50)
    
    # Login first
    test_admin_login()
    
    print("\n" + "="*50)
    print("WRITE YOUR POST MODE WITH POST DESTINATION TESTS")
    print("="*50)
    
    # Write Mode with postDestination Tests
    test_create_write_mode_agent_in_review_destination()
    test_create_write_mode_agent_ready_to_publish_destination()
    test_write_mode_agent_data_persistence()
    test_write_mode_agent_validation_requirements()
    
    # Print summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_write_mode_tests()
    sys.exit(0 if success else 1)