#!/usr/bin/env python3
"""
AI Agent Deletion Debug Test
Specifically tests the AI agent deletion issue reported by the user
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

print(f"🔍 AI AGENT DELETION DEBUG TEST")
print(f"Testing Backend API at: {API_URL}")
print("="*60)

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
        
    def log_info(self, message):
        print(f"ℹ️  {message}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"AI AGENT DELETION DEBUG SUMMARY")
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

# Admin credentials as specified in the review request
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

admin_token = None

def test_admin_login():
    """Test admin login to get authentication token"""
    global admin_token
    try:
        print(f"\n🔐 STEP 1: Admin Authentication")
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                admin_token = data["access_token"]
                results.log_success("Admin Login (admin@hospital.com/admin123)")
                return True
        results.log_failure("Admin Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Admin Login", str(e))
        return False

def test_list_all_existing_agents():
    """Test 1: List all existing agents using GET /api/ai-agents"""
    if not admin_token:
        results.log_failure("List All Existing Agents", "No admin token available")
        return False, []
    
    try:
        print(f"\n📋 STEP 2: List All Existing AI Agents")
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                results.log_success(f"List All Existing Agents - Found {len(data)} agents")
                
                # Display agent information
                if data:
                    results.log_info("Agent Details:")
                    for i, agent in enumerate(data[:10], 1):  # Show first 10 agents
                        agent_id = agent.get('id', 'NO_ID')
                        agent_name = agent.get('topic', agent.get('post_title', 'NO_NAME'))
                        is_active = agent.get('is_active', 'UNKNOWN')
                        results.log_info(f"  {i}. ID: {agent_id} | Name: {agent_name} | Active: {is_active}")
                    
                    if len(data) > 10:
                        results.log_info(f"  ... and {len(data) - 10} more agents")
                    
                    # Analyze ID format
                    sample_ids = [agent.get('id') for agent in data[:5] if agent.get('id')]
                    if sample_ids:
                        results.log_info(f"Sample Agent ID formats:")
                        for agent_id in sample_ids:
                            id_length = len(str(agent_id))
                            id_format = "UUID" if len(str(agent_id)) == 36 and '-' in str(agent_id) else "Other"
                            results.log_info(f"  - {agent_id} (Length: {id_length}, Format: {id_format})")
                else:
                    results.log_info("No agents found in the system")
                
                return True, data
            else:
                results.log_failure("List All Existing Agents", f"Expected list, got {type(data)}")
                return False, []
        else:
            results.log_failure("List All Existing Agents", f"Status: {response.status_code}, Response: {response.text}")
            return False, []
    except Exception as e:
        results.log_failure("List All Existing Agents", str(e))
        return False, []

def test_delete_with_real_agent_id(agents_list):
    """Test 2: Test deletion with a real agent ID"""
    if not admin_token:
        results.log_failure("Delete With Real Agent ID", "No admin token available")
        return False
    
    if not agents_list:
        results.log_failure("Delete With Real Agent ID", "No agents available for testing")
        return False
    
    try:
        print(f"\n🗑️  STEP 3: Test Deletion with Real Agent ID")
        
        # Pick the first agent for deletion testing
        test_agent = agents_list[0]
        agent_id = test_agent.get('id')
        agent_name = test_agent.get('topic', test_agent.get('post_title', 'Unknown'))
        
        if not agent_id:
            results.log_failure("Delete With Real Agent ID", "Selected agent has no ID")
            return False
        
        results.log_info(f"Testing deletion of Agent ID: {agent_id}")
        results.log_info(f"Agent Name: {agent_name}")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.delete(f"{API_URL}/ai-agents/{agent_id}", headers=headers)
        
        results.log_info(f"DELETE Response Status: {response.status_code}")
        results.log_info(f"DELETE Response Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            results.log_info(f"DELETE Response Body: {json.dumps(response_data, indent=2)}")
        except:
            results.log_info(f"DELETE Response Body (raw): {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and ("deleted" in data["message"].lower() or "success" in data["message"].lower()):
                results.log_success("Delete With Real Agent ID - Success")
                return True
            else:
                results.log_failure("Delete With Real Agent ID", f"Unexpected success response: {data}")
                return False
        elif response.status_code == 204:
            results.log_success("Delete With Real Agent ID - Success (No Content)")
            return True
        elif response.status_code == 404:
            results.log_failure("Delete With Real Agent ID", "Agent not found (404) - ID format or lookup issue")
            return False
        elif response.status_code == 403:
            results.log_failure("Delete With Real Agent ID", "Forbidden (403) - Permission issue")
            return False
        elif response.status_code == 401:
            results.log_failure("Delete With Real Agent ID", "Unauthorized (401) - Authentication issue")
            return False
        elif response.status_code == 500:
            results.log_failure("Delete With Real Agent ID", f"Server Error (500) - Backend issue: {response.text}")
            return False
        else:
            results.log_failure("Delete With Real Agent ID", f"Unexpected status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        results.log_failure("Delete With Real Agent ID", str(e))
        return False

def test_delete_nonexistent_agent():
    """Test 3: Test deletion with non-existent agent ID"""
    if not admin_token:
        results.log_failure("Delete Nonexistent Agent", "No admin token available")
        return False
    
    try:
        print(f"\n🚫 STEP 4: Test Deletion with Non-existent Agent ID")
        
        fake_agent_id = "nonexistent-agent-id-12345"
        results.log_info(f"Testing deletion of fake Agent ID: {fake_agent_id}")
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.delete(f"{API_URL}/ai-agents/{fake_agent_id}", headers=headers)
        
        results.log_info(f"DELETE Response Status: {response.status_code}")
        
        try:
            response_data = response.json()
            results.log_info(f"DELETE Response Body: {json.dumps(response_data, indent=2)}")
        except:
            results.log_info(f"DELETE Response Body (raw): {response.text}")
        
        if response.status_code == 404:
            results.log_success("Delete Nonexistent Agent - Correctly returns 404")
            return True
        else:
            results.log_failure("Delete Nonexistent Agent", f"Expected 404, got {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("Delete Nonexistent Agent", str(e))
        return False

def test_delete_without_authentication():
    """Test 4: Test deletion without authentication"""
    try:
        print(f"\n🔒 STEP 5: Test Deletion without Authentication")
        
        fake_agent_id = "test-agent-id"
        results.log_info(f"Testing deletion without auth token")
        
        # No headers (no authentication)
        response = requests.delete(f"{API_URL}/ai-agents/{fake_agent_id}")
        
        results.log_info(f"DELETE Response Status: {response.status_code}")
        
        try:
            response_data = response.json()
            results.log_info(f"DELETE Response Body: {json.dumps(response_data, indent=2)}")
        except:
            results.log_info(f"DELETE Response Body (raw): {response.text}")
        
        if response.status_code in [401, 403]:
            results.log_success("Delete Without Authentication - Correctly forbidden")
            return True
        else:
            results.log_failure("Delete Without Authentication", f"Expected 401/403, got {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("Delete Without Authentication", str(e))
        return False

def test_id_format_analysis(agents_list):
    """Test 5: Analyze ID formats for potential issues"""
    try:
        print(f"\n🔍 STEP 6: ID Format Analysis")
        
        if not agents_list:
            results.log_info("No agents available for ID format analysis")
            return True
        
        results.log_info("Analyzing Agent ID formats:")
        
        uuid_count = 0
        other_count = 0
        
        for agent in agents_list:
            agent_id = agent.get('id')
            if agent_id:
                id_str = str(agent_id)
                if len(id_str) == 36 and id_str.count('-') == 4:
                    uuid_count += 1
                else:
                    other_count += 1
                    results.log_info(f"  Non-UUID ID found: {id_str} (Length: {len(id_str)})")
        
        results.log_info(f"UUID format IDs: {uuid_count}")
        results.log_info(f"Other format IDs: {other_count}")
        
        if other_count > 0:
            results.log_info("⚠️  Mixed ID formats detected - this could cause lookup issues")
        
        results.log_success("ID Format Analysis Complete")
        return True
        
    except Exception as e:
        results.log_failure("ID Format Analysis", str(e))
        return False

def main():
    """Main test execution"""
    print("Starting AI Agent Deletion Debug Tests...")
    
    # Step 1: Login
    if not test_admin_login():
        print("❌ Cannot proceed without admin authentication")
        return False
    
    # Step 2: List all agents
    success, agents_list = test_list_all_existing_agents()
    if not success:
        print("❌ Cannot proceed without agent list")
        return False
    
    # Step 3: Test deletion with real agent ID
    test_delete_with_real_agent_id(agents_list)
    
    # Step 4: Test deletion with non-existent ID
    test_delete_nonexistent_agent()
    
    # Step 5: Test deletion without authentication
    test_delete_without_authentication()
    
    # Step 6: ID format analysis
    test_id_format_analysis(agents_list)
    
    # Summary
    success = results.summary()
    
    print(f"\n🎯 DEBUGGING CONCLUSIONS:")
    print("="*60)
    
    if len(agents_list) == 0:
        print("• No AI agents found in system - this could be the issue")
    else:
        print(f"• Found {len(agents_list)} AI agents in system")
    
    print("• Check the detailed logs above for specific error messages")
    print("• Pay attention to response status codes and error details")
    print("• Look for ID format mismatches or authentication issues")
    
    return success

if __name__ == "__main__":
    main()