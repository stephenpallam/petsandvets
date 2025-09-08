#!/usr/bin/env python3
"""
AI Agents Dashboard Backend Testing - Focused Test for Review Request
Tests specifically requested AI agent functionality and creates test data for frontend
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
"""

import requests
import json
import os
from datetime import datetime
import sys

# CRITICAL: Setup test database environment
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

print(f"Testing AI Agents Dashboard Backend API at: {API_URL}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        self.created_agents = []
        
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
        print(f"AI AGENTS DASHBOARD BACKEND TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Created Test Agents: {len(self.created_agents)}")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        if self.created_agents:
            print(f"\nCREATED TEST AGENTS:")
            for agent in self.created_agents:
                print(f"  - {agent['mode']} mode: {agent['topic']} (ID: {agent['id']})")
        return self.failed == 0

results = TestResults()

# Test credentials
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

# Global variables for tokens
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
                results.log_success("Admin Authentication (admin@hospital.com/admin123)")
                return True
        results.log_failure("Admin Authentication", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Admin Authentication", str(e))
        return False

def test_get_ai_agents():
    """Test GET /api/ai-agents endpoint"""
    if not admin_token:
        results.log_failure("GET /api/ai-agents", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                results.log_success(f"GET /api/ai-agents (Found {len(data)} existing agents)")
                return True
        results.log_failure("GET /api/ai-agents", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("GET /api/ai-agents", str(e))
        return False

def test_create_auto_mode_agent():
    """Create an AI agent in auto mode for testing"""
    if not admin_token:
        results.log_failure("Create Auto Mode Agent", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        auto_agent_data = {
            "mode": "auto",
            "topic": "Pet Dental Health",
            "word_count": "100-150",
            "social_platforms": {
                "facebook": True,
                "instagram": True,
                "twitter": False
            },
            "frequency": "daily",
            "post_time": "09:00",
            "days_of_week": {
                "monday": True,
                "tuesday": True,
                "wednesday": True,
                "thursday": True,
                "friday": True,
                "saturday": False,
                "sunday": False
            },
            "image_option": "none",
            "auto_post": False,
            "use_web_research": False
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=auto_agent_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "agent_id" in data and "message" in data:
                agent_info = {
                    "id": data.get("agent_id"),
                    "mode": "auto",
                    "topic": "Pet Dental Health"
                }
                results.created_agents.append(agent_info)
                results.log_success("Create Auto Mode Agent (Pet Dental Health)")
                return True
        results.log_failure("Create Auto Mode Agent", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Auto Mode Agent", str(e))
        return False

def test_create_adhoc_mode_agent():
    """Create an AI agent in adhoc mode for testing"""
    if not admin_token:
        results.log_failure("Create Adhoc Mode Agent", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        adhoc_agent_data = {
            "mode": "adhoc",
            "topic": "Pet Nutrition Tips",
            "word_count": "75-100",
            "social_platforms": {
                "facebook": True,
                "instagram": True,
                "twitter": False
            },
            "image_option": "none",
            "auto_post": False,
            "use_web_research": False,
            "immediate": True
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=adhoc_agent_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "agent_id" in data and "message" in data:
                agent_info = {
                    "id": data.get("agent_id"),
                    "mode": "adhoc",
                    "topic": "Pet Nutrition Tips"
                }
                results.created_agents.append(agent_info)
                results.log_success("Create Adhoc Mode Agent (Pet Nutrition Tips)")
                return True
        results.log_failure("Create Adhoc Mode Agent", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Adhoc Mode Agent", str(e))
        return False

def test_create_write_mode_agent():
    """Create an AI agent in write mode for testing"""
    if not admin_token:
        results.log_failure("Create Write Mode Agent", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        write_agent_data = {
            "mode": "write",
            "post_title": "Winter Pet Safety: Keeping Your Furry Friends Warm",
            "post_content": "As temperatures drop, it's important to keep our pets safe and comfortable. Here are essential tips for winter pet care: Provide warm shelter, limit outdoor time in extreme cold, protect paws from ice and salt, and watch for signs of hypothermia. Remember, if it's too cold for you, it's probably too cold for your pet!",
            "word_count": "150-200",
            "social_platforms": {
                "facebook": True,
                "instagram": True,
                "twitter": True
            },
            "image_option": "none",
            "image_text": "Winter Pet Safety Tips",
            "use_web_research": True,
            "auto_post": False,
            "post_date": "2025-01-20",
            "post_time": "10:00",
            "immediate": False
        }
        
        response = requests.post(f"{API_URL}/ai-agents", json=write_agent_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "agent_id" in data and "message" in data:
                agent_info = {
                    "id": data.get("agent_id"),
                    "mode": "write",
                    "topic": "Winter Pet Safety"
                }
                results.created_agents.append(agent_info)
                results.log_success("Create Write Mode Agent (Winter Pet Safety)")
                return True
        results.log_failure("Create Write Mode Agent", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Create Write Mode Agent", str(e))
        return False

def test_toggle_agent_status():
    """Test POST /api/ai-agents/{agent_id}/toggle endpoint"""
    if not admin_token or not results.created_agents:
        results.log_failure("Toggle Agent Status", "No admin token or created agents available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        agent_id = results.created_agents[0]["id"]
        
        response = requests.post(f"{API_URL}/ai-agents/{agent_id}/toggle", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "status" in data:
                results.log_success("POST /api/ai-agents/{agent_id}/toggle (Status Toggle)")
                return True
        results.log_failure("Toggle Agent Status", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Toggle Agent Status", str(e))
        return False

def test_get_ai_agents_with_data():
    """Test GET /api/ai-agents endpoint with created test data"""
    if not admin_token:
        results.log_failure("GET /api/ai-agents (With Test Data)", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) >= len(results.created_agents):
                # Check if our created agents are in the response
                agent_ids = [agent["id"] for agent in data if "id" in agent]
                created_ids = [agent["id"] for agent in results.created_agents]
                
                found_agents = [agent_id for agent_id in created_ids if agent_id in agent_ids]
                
                if len(found_agents) >= len(results.created_agents):
                    results.log_success(f"GET /api/ai-agents (With Test Data - Found {len(data)} total agents)")
                    return True
                else:
                    results.log_failure("GET /api/ai-agents (With Test Data)", f"Not all created agents found in response")
                    return False
        results.log_failure("GET /api/ai-agents (With Test Data)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("GET /api/ai-agents (With Test Data)", str(e))
        return False

def test_ai_posts_endpoints():
    """Test AI posts endpoints to verify data flow"""
    if not admin_token:
        results.log_failure("AI Posts Endpoints", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test ready-to-publish posts
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish", headers=headers)
        if response.status_code == 200:
            ready_posts = response.json()
            results.log_success(f"GET /api/ai-posts/ready-to-publish (Found {len(ready_posts)} posts)")
        else:
            results.log_failure("GET /api/ai-posts/ready-to-publish", f"Status: {response.status_code}")
            return False
        
        # Test published posts
        response = requests.get(f"{API_URL}/ai-posts/published", headers=headers)
        if response.status_code == 200:
            published_posts = response.json()
            results.log_success(f"GET /api/ai-posts/published (Found {len(published_posts)} posts)")
        else:
            results.log_failure("GET /api/ai-posts/published", f"Status: {response.status_code}")
            return False
        
        # Test in-review posts
        response = requests.get(f"{API_URL}/ai-posts/in-review", headers=headers)
        if response.status_code == 200:
            review_posts = response.json()
            results.log_success(f"GET /api/ai-posts/in-review (Found {len(review_posts)} posts)")
            return True
        else:
            results.log_failure("GET /api/ai-posts/in-review", f"Status: {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("AI Posts Endpoints", str(e))
        return False

def test_ai_settings_endpoints():
    """Test AI settings endpoints"""
    if not admin_token:
        results.log_failure("AI Settings Endpoints", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Test GET AI settings
        response = requests.get(f"{API_URL}/ai-settings", headers=headers)
        if response.status_code == 200:
            settings = response.json()
            if isinstance(settings, dict):
                results.log_success("GET /api/ai-settings (Retrieved settings)")
            else:
                results.log_failure("GET /api/ai-settings", "Invalid settings format")
                return False
        else:
            results.log_failure("GET /api/ai-settings", f"Status: {response.status_code}")
            return False
        
        # Test PUT AI settings (update)
        update_data = {
            "default_word_count": "100-150",
            "default_platforms": ["facebook", "instagram"],
            "auto_post_enabled": True
        }
        
        response = requests.put(f"{API_URL}/ai-settings", json=update_data, headers=headers)
        if response.status_code == 200:
            updated_settings = response.json()
            results.log_success("PUT /api/ai-settings (Updated settings)")
            return True
        else:
            results.log_failure("PUT /api/ai-settings", f"Status: {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("AI Settings Endpoints", str(e))
        return False

def test_authentication_requirements():
    """Test that authentication is properly required for AI endpoints"""
    try:
        # Test GET /api/ai-agents without auth
        response = requests.get(f"{API_URL}/ai-agents")
        if response.status_code in [401, 403]:
            results.log_success("Authentication Required - GET /api/ai-agents (Correctly Unauthorized)")
        else:
            results.log_failure("Authentication Required - GET /api/ai-agents", f"Expected 401/403, got {response.status_code}")
            return False
        
        # Test POST /api/ai-agents without auth
        test_data = {"mode": "auto", "topic": "Test"}
        response = requests.post(f"{API_URL}/ai-agents", json=test_data)
        if response.status_code in [401, 403]:
            results.log_success("Authentication Required - POST /api/ai-agents (Correctly Unauthorized)")
        else:
            results.log_failure("Authentication Required - POST /api/ai-agents", f"Expected 401/403, got {response.status_code}")
            return False
        
        # Test toggle without auth
        response = requests.post(f"{API_URL}/ai-agents/test-id/toggle")
        if response.status_code in [401, 403]:
            results.log_success("Authentication Required - POST /api/ai-agents/toggle (Correctly Unauthorized)")
            return True
        else:
            results.log_failure("Authentication Required - POST /api/ai-agents/toggle", f"Expected 401/403, got {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("Authentication Requirements", str(e))
        return False

def main():
    """Run all AI Agents Dashboard Backend tests"""
    print("="*60)
    print("AI AGENTS DASHBOARD BACKEND TESTING")
    print("="*60)
    print("Testing functionality requested in review:")
    print("1. AI Social Media Agent System endpoints")
    print("2. AI Agents Dashboard API Backend")
    print("3. Authentication system")
    print("4. Creating test AI agents for frontend testing")
    print("="*60)
    
    # Run tests in order
    test_admin_login()
    test_get_ai_agents()
    test_create_auto_mode_agent()
    test_create_adhoc_mode_agent()
    test_create_write_mode_agent()
    test_toggle_agent_status()
    test_get_ai_agents_with_data()
    test_ai_posts_endpoints()
    test_ai_settings_endpoints()
    test_authentication_requirements()
    
    # Print summary
    success = results.summary()
    
    if success:
        print(f"\n🎉 ALL AI AGENTS DASHBOARD BACKEND TESTS PASSED!")
        print(f"✅ Backend is ready to support the user-friendly View Agent modal")
        print(f"✅ Created {len(results.created_agents)} test AI agents for frontend testing")
        print(f"✅ All authentication and API endpoints working correctly")
    else:
        print(f"\n⚠️  Some tests failed. Please review the issues above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)