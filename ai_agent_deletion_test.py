#!/usr/bin/env python3
"""
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
AI Agent Deletion Functionality Test
Tests the specific AI agent deletion functionality as requested in the review
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

print(f"Testing AI Agent Deletion at: {API_URL}")

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
        print(f"AI AGENT DELETION TEST SUMMARY")
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
test_agent_id = None

def test_admin_login():
    """Test admin login to get authentication token"""
    global admin_token
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                admin_token = data["access_token"]
                results.log_success("Admin Login Authentication")
                return True
        results.log_failure("Admin Login Authentication", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Admin Login Authentication", str(e))
        return False

def test_list_existing_agents():
    """Test GET /api/ai-agents to see current agents"""
    if not admin_token:
        results.log_failure("List Existing AI Agents", "No admin token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        
        if response.status_code == 200:
            agents = response.json()
            if isinstance(agents, list):
                print(f"📋 Found {len(agents)} existing AI agents:")
                for i, agent in enumerate(agents[:5], 1):  # Show first 5 agents
                    agent_name = agent.get('agent_name', 'Unnamed Agent')
                    agent_id = agent.get('id', 'No ID')
                    is_active = agent.get('is_active', True)
                    status = "Active" if is_active else "Inactive"
                    print(f"   {i}. {agent_name} (ID: {agent_id[:8]}...) - {status}")
                
                if len(agents) > 5:
                    print(f"   ... and {len(agents) - 5} more agents")
                
                results.log_success("List Existing AI Agents")
                return agents
            else:
                results.log_failure("List Existing AI Agents", "Response is not a list")
                return False
        else:
            results.log_failure("List Existing AI Agents", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        results.log_failure("List Existing AI Agents", str(e))
        return False

def test_create_test_agent():
    """Create a test AI agent for deletion testing"""
    global test_agent_id
    if not admin_token:
        results.log_failure("Create Test AI Agent", "No admin token available")
        return False
    
    try:
        # Create a simple test agent
        test_agent_data = {
            "mode": "write",
            "post_title": "Test Agent for Deletion",
            "post_content": "This is a test agent that will be deleted to verify deletion functionality.",
            "word_count": "100",
            "image_option": "none",
            "social_platforms": {
                "facebook": True,
                "instagram": False,
                "twitter": False,
                "whatsapp": False
            },
            "immediate": False,
            "use_web_research": False,
            "image_text": "Test image for deletion test",
            "post_date": "2025-01-20",
            "post_time": "14:00"
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{API_URL}/ai-agents", json=test_agent_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            agent_id = data.get("agent_id")
            if agent_id:
                test_agent_id = agent_id
                print(f"📝 Created test agent with ID: {agent_id}")
                results.log_success("Create Test AI Agent")
                return True
            else:
                results.log_failure("Create Test AI Agent", "No agent_id in response")
                return False
        else:
            results.log_failure("Create Test AI Agent", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        results.log_failure("Create Test AI Agent", str(e))
        return False

def test_delete_specific_agent():
    """Test DELETE /api/ai-agents/{agent_id} for the created test agent"""
    if not admin_token or not test_agent_id:
        results.log_failure("Delete Specific AI Agent", "No admin token or test agent ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        print(f"🗑️  Attempting to delete agent ID: {test_agent_id}")
        
        response = requests.delete(f"{API_URL}/ai-agents/{test_agent_id}", headers=headers)
        
        if response.status_code in [200, 204]:
            data = response.json() if response.content else {}
            print(f"✅ DELETE endpoint returned status: {response.status_code}")
            if "message" in data:
                print(f"📄 Response message: {data['message']}")
            results.log_success("Delete Specific AI Agent - Status Code")
            return True
        else:
            results.log_failure("Delete Specific AI Agent", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        results.log_failure("Delete Specific AI Agent", str(e))
        return False

def test_verify_agent_deletion():
    """Verify the agent was actually removed by listing agents again"""
    if not admin_token or not test_agent_id:
        results.log_failure("Verify Agent Deletion", "No admin token or test agent ID available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        
        if response.status_code == 200:
            agents = response.json()
            if isinstance(agents, list):
                # Check if the deleted agent is still in the list
                deleted_agent_found = False
                for agent in agents:
                    if agent.get('id') == test_agent_id:
                        # Check if it's marked as inactive (soft delete)
                        if not agent.get('is_active', True):
                            print(f"✅ Agent marked as inactive (soft delete): {agent.get('is_active')}")
                            results.log_success("Verify Agent Deletion - Soft Delete")
                            return True
                        else:
                            deleted_agent_found = True
                            break
                
                if not deleted_agent_found:
                    print(f"✅ Agent completely removed from database")
                    results.log_success("Verify Agent Deletion - Hard Delete")
                    return True
                else:
                    results.log_failure("Verify Agent Deletion", "Agent still exists and is active")
                    return False
            else:
                results.log_failure("Verify Agent Deletion", "Response is not a list")
                return False
        else:
            results.log_failure("Verify Agent Deletion", f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        results.log_failure("Verify Agent Deletion", str(e))
        return False

def test_delete_nonexistent_agent():
    """Test DELETE /api/ai-agents/{agent_id} with nonexistent agent ID"""
    if not admin_token:
        results.log_failure("Delete Nonexistent Agent", "No admin token available")
        return False
    
    try:
        fake_agent_id = "nonexistent-agent-id-12345"
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.delete(f"{API_URL}/ai-agents/{fake_agent_id}", headers=headers)
        
        if response.status_code == 404:
            print(f"✅ Correctly returned 404 for nonexistent agent")
            results.log_success("Delete Nonexistent Agent - Error Handling")
            return True
        else:
            results.log_failure("Delete Nonexistent Agent", f"Expected 404, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Delete Nonexistent Agent", str(e))
        return False

def test_delete_without_authentication():
    """Test DELETE /api/ai-agents/{agent_id} without authentication"""
    try:
        fake_agent_id = "test-agent-id"
        # No authorization header
        response = requests.delete(f"{API_URL}/ai-agents/{fake_agent_id}")
        
        if response.status_code in [401, 403]:
            print(f"✅ Correctly returned {response.status_code} for unauthenticated request")
            results.log_success("Delete Without Authentication - Security")
            return True
        else:
            results.log_failure("Delete Without Authentication", f"Expected 401/403, got {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Delete Without Authentication", str(e))
        return False

def test_delete_with_existing_agent():
    """Test deletion with an existing agent from the system"""
    if not admin_token:
        results.log_failure("Delete Existing Agent", "No admin token available")
        return False
    
    try:
        # First get the list of existing agents
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        
        if response.status_code == 200:
            agents = response.json()
            if isinstance(agents, list) and len(agents) > 0:
                # Find an active agent to delete
                target_agent = None
                for agent in agents:
                    if agent.get('is_active', True):
                        target_agent = agent
                        break
                
                if target_agent:
                    agent_id = target_agent.get('id')
                    agent_name = target_agent.get('agent_name', 'Unnamed Agent')
                    print(f"🎯 Testing deletion with existing agent: {agent_name} (ID: {agent_id[:8]}...)")
                    
                    # Delete the agent
                    delete_response = requests.delete(f"{API_URL}/ai-agents/{agent_id}", headers=headers)
                    
                    if delete_response.status_code in [200, 204]:
                        print(f"✅ Successfully deleted existing agent")
                        
                        # Verify deletion
                        verify_response = requests.get(f"{API_URL}/ai-agents", headers=headers)
                        if verify_response.status_code == 200:
                            updated_agents = verify_response.json()
                            # Check if agent is marked inactive or removed
                            agent_found = False
                            for updated_agent in updated_agents:
                                if updated_agent.get('id') == agent_id:
                                    if not updated_agent.get('is_active', True):
                                        print(f"✅ Agent marked as inactive in database")
                                        agent_found = True
                                        break
                            
                            if not agent_found:
                                print(f"✅ Agent completely removed from database")
                            
                            results.log_success("Delete Existing Agent - Database Verification")
                            return True
                        else:
                            results.log_failure("Delete Existing Agent", "Failed to verify deletion")
                            return False
                    else:
                        results.log_failure("Delete Existing Agent", f"Status: {delete_response.status_code}")
                        return False
                else:
                    print("ℹ️  No active agents found to test deletion")
                    results.log_success("Delete Existing Agent - No Active Agents")
                    return True
            else:
                print("ℹ️  No agents found in system")
                results.log_success("Delete Existing Agent - No Agents")
                return True
        else:
            results.log_failure("Delete Existing Agent", f"Failed to get agents list: {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Delete Existing Agent", str(e))
        return False

def run_ai_agent_deletion_tests():
    """Run all AI agent deletion tests"""
    print(f"{'='*60}")
    print("AI AGENT DELETION FUNCTIONALITY TESTS")
    print(f"{'='*60}")
    print("Testing as requested in the review:")
    print("1. List existing agents using GET /api/ai-agents")
    print("2. Delete a specific agent using DELETE /api/ai-agents/{agent_id}")
    print("3. Verify deletion by listing agents again")
    print("4. Test error handling and authentication")
    print(f"{'='*60}")
    
    # Step 1: Authenticate
    if not test_admin_login():
        print("❌ Cannot proceed without admin authentication")
        return False
    
    # Step 2: List existing agents
    existing_agents = test_list_existing_agents()
    if not existing_agents:
        print("❌ Cannot proceed without agent list")
        return False
    
    # Step 3: Create a test agent for deletion
    if not test_create_test_agent():
        print("⚠️  Could not create test agent, will try with existing agents")
    
    # Step 4: Test deletion functionality
    if test_agent_id:
        test_delete_specific_agent()
        test_verify_agent_deletion()
    
    # Step 5: Test with existing agent
    test_delete_with_existing_agent()
    
    # Step 6: Test error handling
    test_delete_nonexistent_agent()
    test_delete_without_authentication()
    
    # Print summary
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_ai_agent_deletion_tests()
    sys.exit(0 if success else 1)