#!/usr/bin/env python3
"""
Write Your Email Agent Save and Update Functionality Test

This test specifically focuses on testing the "Write Your Email" agent save and update functionality,
particularly the post_date and post_time fields as requested in the review.

Test Cases:
1. Create a new "Write Your Email" agent with specific post_date and post_time
2. Verify the agent is created with correct post_date and post_time fields
3. Update the same agent with new post_date and post_time
4. Verify the update is successful and the new values are saved correctly
"""

import asyncio
import sys
import os
import json
import requests
from datetime import datetime, date
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(backend_dir / '.env')

class WriteEmailAgentTester:
    def __init__(self):
        # Use the frontend environment variable for backend URL
        frontend_env_path = Path(__file__).parent / "frontend" / ".env"
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.base_url = line.split('=', 1)[1].strip()
                        break
        else:
            self.base_url = "https://vetssms.preview.emergentagent.com"
        
        self.api_url = f"{self.base_url}/api"
        self.headers = {"Content-Type": "application/json"}
        self.auth_token = None
        self.test_agent_id = None
        
        print(f"🔗 Using API URL: {self.api_url}")
    
    async def authenticate(self):
        """Authenticate with the API to get access token"""
        print("\n=== AUTHENTICATION ===")
        
        # Try to login with default admin credentials
        login_data = {
            "email": "admin@hospital.com",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.api_url}/login", json=login_data, headers=self.headers)
            
            if response.status_code == 200:
                token_data = response.json()
                self.auth_token = token_data.get("access_token")
                self.headers["Authorization"] = f"Bearer {self.auth_token}"
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
    
    def test_create_write_email_agent(self):
        """Test Case 1: Create a new 'Write Your Email' agent with specific post_date and post_time"""
        print("\n=== TEST CASE 1: CREATE WRITE EMAIL AGENT ===")
        
        # Test data as specified in the review request
        agent_data = {
            "agent_name": "Test Write Email Agent",
            "agent_type": "email",
            "mode": "write",
            "email_subject": "Test Subject",
            "email_content": "Test email content",
            "post_date": "2025-09-15",
            "post_time": "14:30",
            "image_option": "none",
            "use_chatgpt_formatting": True,
            "use_customer_database": True,
            "email_type": "bulk"
        }
        
        print(f"📤 Creating agent with data:")
        print(f"   Agent Name: {agent_data['agent_name']}")
        print(f"   Email Subject: {agent_data['email_subject']}")
        print(f"   Email Content: {agent_data['email_content']}")
        print(f"   Post Date: {agent_data['post_date']}")
        print(f"   Post Time: {agent_data['post_time']}")
        print(f"   Image Option: {agent_data['image_option']}")
        print(f"   Use ChatGPT Formatting: {agent_data['use_chatgpt_formatting']}")
        
        try:
            response = requests.post(f"{self.api_url}/ai-agents", json=agent_data, headers=self.headers)
            
            if response.status_code == 200:
                result = response.json()
                self.test_agent_id = result.get("agent_id")
                print(f"✅ Agent created successfully!")
                print(f"   Agent ID: {self.test_agent_id}")
                return True
            else:
                print(f"❌ Agent creation failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Agent creation error: {str(e)}")
            return False
    
    def test_verify_agent_creation(self):
        """Test Case 2: Verify the agent is created with correct post_date and post_time fields"""
        print("\n=== TEST CASE 2: VERIFY AGENT CREATION ===")
        
        if not self.test_agent_id:
            print("❌ No agent ID available for verification")
            return False
        
        try:
            # Get all agents and find our test agent
            response = requests.get(f"{self.api_url}/ai-agents", headers=self.headers)
            
            if response.status_code == 200:
                agents = response.json()
                test_agent = None
                
                for agent in agents:
                    if agent.get("id") == self.test_agent_id:
                        test_agent = agent
                        break
                
                if test_agent:
                    print("✅ Agent found in database")
                    print(f"   Agent ID: {test_agent.get('id')}")
                    print(f"   Agent Name: {test_agent.get('agent_name')}")
                    print(f"   Agent Type: {test_agent.get('agent_type')}")
                    print(f"   Mode: {test_agent.get('mode')}")
                    print(f"   Email Subject: {test_agent.get('email_subject')}")
                    print(f"   Email Content: {test_agent.get('email_content')}")
                    print(f"   Post Date: {test_agent.get('post_date')}")
                    print(f"   Post Time: {test_agent.get('post_time')}")
                    print(f"   Use ChatGPT Formatting: {test_agent.get('use_chatgpt_formatting')}")
                    
                    # Verify the specific fields from the review request
                    expected_values = {
                        "agent_name": "Test Write Email Agent",
                        "email_subject": "Test Subject",
                        "email_content": "Test email content",
                        "post_date": "2025-09-15",
                        "post_time": "14:30",
                        "use_chatgpt_formatting": True
                    }
                    
                    verification_passed = True
                    for field, expected_value in expected_values.items():
                        actual_value = test_agent.get(field)
                        if actual_value == expected_value:
                            print(f"   ✅ {field}: {actual_value} (matches expected)")
                        else:
                            print(f"   ❌ {field}: {actual_value} (expected: {expected_value})")
                            verification_passed = False
                    
                    if verification_passed:
                        print("✅ All field verification passed!")
                        return True
                    else:
                        print("❌ Some field verifications failed")
                        return False
                else:
                    print(f"❌ Agent with ID {self.test_agent_id} not found in database")
                    return False
            else:
                print(f"❌ Failed to get agents: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Agent verification error: {str(e)}")
            return False
    
    def test_update_agent_dates(self):
        """Test Case 3: Update the same agent with new post_date and post_time"""
        print("\n=== TEST CASE 3: UPDATE AGENT DATES ===")
        
        if not self.test_agent_id:
            print("❌ No agent ID available for update")
            return False
        
        # New values as specified in the review request
        update_data = {
            "agent_name": "Test Write Email Agent",  # Keep same name
            "agent_type": "email",
            "mode": "write",
            "email_subject": "Test Subject",  # Keep same subject
            "email_content": "Test email content",  # Keep same content
            "post_date": "2025-09-20",  # NEW DATE
            "post_time": "10:00",  # NEW TIME
            "image_option": "none",
            "use_chatgpt_formatting": True,
            "use_customer_database": True,
            "email_type": "bulk"
        }
        
        print(f"📤 Updating agent with new dates:")
        print(f"   New Post Date: {update_data['post_date']} (was: 2025-09-15)")
        print(f"   New Post Time: {update_data['post_time']} (was: 14:30)")
        
        try:
            response = requests.put(f"{self.api_url}/ai-agents/{self.test_agent_id}", json=update_data, headers=self.headers)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Agent updated successfully!")
                print(f"   Response: {result}")
                return True
            else:
                print(f"❌ Agent update failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Agent update error: {str(e)}")
            return False
    
    def test_verify_agent_update(self):
        """Test Case 4: Verify the update is successful and the new post_date and post_time are saved correctly"""
        print("\n=== TEST CASE 4: VERIFY AGENT UPDATE ===")
        
        if not self.test_agent_id:
            print("❌ No agent ID available for verification")
            return False
        
        try:
            # Get all agents and find our test agent
            response = requests.get(f"{self.api_url}/ai-agents", headers=self.headers)
            
            if response.status_code == 200:
                agents = response.json()
                test_agent = None
                
                for agent in agents:
                    if agent.get("id") == self.test_agent_id:
                        test_agent = agent
                        break
                
                if test_agent:
                    print("✅ Updated agent found in database")
                    print(f"   Agent ID: {test_agent.get('id')}")
                    print(f"   Post Date: {test_agent.get('post_date')}")
                    print(f"   Post Time: {test_agent.get('post_time')}")
                    
                    # Verify the updated values
                    expected_post_date = "2025-09-20"
                    expected_post_time = "10:00"
                    
                    actual_post_date = test_agent.get('post_date')
                    actual_post_time = test_agent.get('post_time')
                    
                    date_correct = actual_post_date == expected_post_date
                    time_correct = actual_post_time == expected_post_time
                    
                    if date_correct:
                        print(f"   ✅ Post Date: {actual_post_date} (matches expected)")
                    else:
                        print(f"   ❌ Post Date: {actual_post_date} (expected: {expected_post_date})")
                    
                    if time_correct:
                        print(f"   ✅ Post Time: {actual_post_time} (matches expected)")
                    else:
                        print(f"   ❌ Post Time: {actual_post_time} (expected: {expected_post_time})")
                    
                    if date_correct and time_correct:
                        print("✅ Update verification passed! Both post_date and post_time are correctly saved.")
                        return True
                    else:
                        print("❌ Update verification failed! post_date and/or post_time not saved correctly.")
                        return False
                else:
                    print(f"❌ Agent with ID {self.test_agent_id} not found in database")
                    return False
            else:
                print(f"❌ Failed to get agents: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Update verification error: {str(e)}")
            return False
    
    def cleanup_test_agent(self):
        """Clean up the test agent after testing"""
        print("\n=== CLEANUP ===")
        
        if not self.test_agent_id:
            print("ℹ️  No test agent to clean up")
            return
        
        try:
            # Note: There might not be a delete endpoint, so we'll just mark it as inactive
            # or leave it for manual cleanup
            print(f"ℹ️  Test agent {self.test_agent_id} left in database for manual review")
            print("   (No delete endpoint available for cleanup)")
            
        except Exception as e:
            print(f"⚠️  Cleanup error: {str(e)}")
    
    async def run_comprehensive_test(self):
        """Run all test cases for Write Your Email agent functionality"""
        print("🧪 STARTING WRITE YOUR EMAIL AGENT COMPREHENSIVE TEST")
        print("=" * 70)
        
        test_results = {
            "authentication": False,
            "create_agent": False,
            "verify_creation": False,
            "update_agent": False,
            "verify_update": False
        }
        
        try:
            # Step 1: Authenticate
            test_results["authentication"] = await self.authenticate()
            if not test_results["authentication"]:
                print("❌ Cannot proceed without authentication")
                return test_results
            
            # Step 2: Create Write Email Agent
            test_results["create_agent"] = self.test_create_write_email_agent()
            
            # Step 3: Verify Agent Creation
            if test_results["create_agent"]:
                test_results["verify_creation"] = self.test_verify_agent_creation()
            
            # Step 4: Update Agent Dates
            if test_results["verify_creation"]:
                test_results["update_agent"] = self.test_update_agent_dates()
            
            # Step 5: Verify Agent Update
            if test_results["update_agent"]:
                test_results["verify_update"] = self.test_verify_agent_update()
            
            # Cleanup
            self.cleanup_test_agent()
            
            # Final Results
            print("\n" + "=" * 70)
            print("🎯 FINAL TEST RESULTS")
            print("=" * 70)
            
            for test_name, result in test_results.items():
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"   {test_name.replace('_', ' ').title()}: {status}")
            
            all_passed = all(test_results.values())
            
            if all_passed:
                print("\n🎉 ALL TESTS PASSED! Write Your Email agent save and update functionality is working correctly.")
                print("   ✅ post_date and post_time fields are properly saved and updated")
            else:
                print("\n⚠️  SOME TESTS FAILED! Issues found with Write Your Email agent functionality.")
                failed_tests = [name for name, result in test_results.items() if not result]
                print(f"   Failed tests: {', '.join(failed_tests)}")
            
            return test_results
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return test_results

async def main():
    """Main test function"""
    tester = WriteEmailAgentTester()
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())