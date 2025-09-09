#!/usr/bin/env python3
"""
SMS Agent Comprehensive Testing Suite

This test suite comprehensively tests the newly implemented SMS Agent functionality:
1. SMS Agent Creation with different modes (write, recurring, adhoc)
2. SMS Agent Validation (name required, content required for write mode, 160 char limit, provider validation)
3. SMS Generation (run SMS agents, verify posts created with agent_type="sms_agent")
4. SMS Agent Endpoints (POST, GET, PUT, POST run)
5. Integration Tests (SMS agents in lists, posts in review/ready-to-publish, agent_type filter)
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

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

class SMSAgentTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        
        # Get backend URL from frontend .env
        frontend_env_path = Path(__file__).parent / "frontend" / ".env"
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.backend_url = line.split('=', 1)[1].strip()
                        break
        else:
            self.backend_url = "https://smartpetsai.preview.emergentagent.com"
        
        self.api_base = f"{self.backend_url}/api"
        self.test_results = []
        self.auth_token = None
        self.headers = {}
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
    
    async def authenticate(self):
        """Authenticate with the API"""
        try:
            # Try to login with admin credentials
            login_data = {
                "email": "admin@hospital.com",
                "password": "admin123"
            }
            
            response = requests.post(f"{self.api_base}/login", json=login_data)
            
            if response.status_code == 200:
                token_data = response.json()
                self.auth_token = token_data.get('access_token')
                self.headers = {
                    'Authorization': f'Bearer {self.auth_token}',
                    'Content-Type': 'application/json'
                }
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def log_test_result(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    async def test_sms_agent_creation_write_mode(self):
        """Test creating SMS agent in write mode with sms_content"""
        print("\n=== TEST: SMS Agent Creation - Write Mode ===")
        
        try:
            # Test data for write mode SMS agent
            sms_agent_data = {
                "agent_name": "Test SMS Write Agent",
                "agent_type": "sms_agent",
                "mode": "write",
                "sms_content": "Visit our clinic for your pet's health checkup! Call us at (555) 123-4567 to schedule. Limited time offer!",
                "sms_provider": "twilio",
                "use_sms_chatgpt_formatting": True,
                "sms_type": "bulk",
                "sms_character_limit": 160
            }
            
            # Make API request
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            if response.status_code == 200:
                agent_data = response.json()
                agent_id = agent_data.get('id')
                
                # Verify agent was created with correct fields
                if (agent_data.get('agent_type') == 'sms_agent' and 
                    agent_data.get('mode') == 'write' and
                    agent_data.get('sms_content') == sms_agent_data['sms_content']):
                    
                    self.log_test_result(
                        "SMS Agent Creation - Write Mode", 
                        True, 
                        f"Agent created with ID: {agent_id}"
                    )
                    return agent_id
                else:
                    self.log_test_result(
                        "SMS Agent Creation - Write Mode", 
                        False, 
                        f"Agent created but fields incorrect: {agent_data}"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Creation - Write Mode", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Creation - Write Mode", 
                False, 
                f"Exception: {str(e)}"
            )
        
        return None
    
    async def test_sms_agent_creation_recurring_mode(self):
        """Test creating SMS agent in recurring mode with topic"""
        print("\n=== TEST: SMS Agent Creation - Recurring Mode ===")
        
        try:
            sms_agent_data = {
                "agent_name": "Test SMS Recurring Agent",
                "agent_type": "sms_agent", 
                "mode": "recurring",
                "topic": "Pet vaccination reminders",
                "frequency": "weekly",
                "sms_provider": "sendgrid",
                "use_sms_chatgpt_formatting": False,
                "sms_type": "bulk",
                "sms_character_limit": 160
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            if response.status_code == 200:
                agent_data = response.json()
                agent_id = agent_data.get('id')
                
                if (agent_data.get('agent_type') == 'sms_agent' and 
                    agent_data.get('mode') == 'recurring' and
                    agent_data.get('topic') == sms_agent_data['topic']):
                    
                    self.log_test_result(
                        "SMS Agent Creation - Recurring Mode", 
                        True, 
                        f"Agent created with ID: {agent_id}"
                    )
                    return agent_id
                else:
                    self.log_test_result(
                        "SMS Agent Creation - Recurring Mode", 
                        False, 
                        f"Agent created but fields incorrect: {agent_data}"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Creation - Recurring Mode", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Creation - Recurring Mode", 
                False, 
                f"Exception: {str(e)}"
            )
        
        return None
    
    async def test_sms_agent_creation_adhoc_mode(self):
        """Test creating SMS agent in adhoc mode"""
        print("\n=== TEST: SMS Agent Creation - Adhoc Mode ===")
        
        try:
            sms_agent_data = {
                "agent_name": "Test SMS Adhoc Agent",
                "agent_type": "sms_agent",
                "mode": "adhoc", 
                "topic": "Emergency clinic hours update",
                "sms_provider": "twilio",
                "use_sms_chatgpt_formatting": True,
                "sms_type": "bulk",
                "sms_character_limit": 160
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            if response.status_code == 200:
                agent_data = response.json()
                agent_id = agent_data.get('id')
                
                if (agent_data.get('agent_type') == 'sms_agent' and 
                    agent_data.get('mode') == 'adhoc' and
                    agent_data.get('topic') == sms_agent_data['topic']):
                    
                    self.log_test_result(
                        "SMS Agent Creation - Adhoc Mode", 
                        True, 
                        f"Agent created with ID: {agent_id}"
                    )
                    return agent_id
                else:
                    self.log_test_result(
                        "SMS Agent Creation - Adhoc Mode", 
                        False, 
                        f"Agent created but fields incorrect: {agent_data}"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Creation - Adhoc Mode", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Creation - Adhoc Mode", 
                False, 
                f"Exception: {str(e)}"
            )
        
        return None
    
    async def test_sms_agent_validation_missing_name(self):
        """Test validation: Agent name required for SMS agents"""
        print("\n=== TEST: SMS Agent Validation - Missing Agent Name ===")
        
        try:
            sms_agent_data = {
                # Missing agent_name
                "agent_type": "sms_agent",
                "mode": "write",
                "sms_content": "Test SMS content",
                "sms_provider": "twilio"
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            if response.status_code == 400:
                error_text = response.text.lower()
                if "agent name is required" in error_text:
                    self.log_test_result(
                        "SMS Agent Validation - Missing Agent Name", 
                        True, 
                        "Correctly rejected with 'Agent name is required'"
                    )
                else:
                    self.log_test_result(
                        "SMS Agent Validation - Missing Agent Name", 
                        False, 
                        f"Wrong error message: {response.text}"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Validation - Missing Agent Name", 
                    False, 
                    f"Expected 400 error, got {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Validation - Missing Agent Name", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_sms_agent_validation_missing_content_write_mode(self):
        """Test validation: SMS content required for write mode"""
        print("\n=== TEST: SMS Agent Validation - Missing SMS Content (Write Mode) ===")
        
        try:
            sms_agent_data = {
                "agent_name": "Test SMS Agent",
                "agent_type": "sms_agent",
                "mode": "write",
                # Missing sms_content for write mode
                "sms_provider": "twilio"
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            # This might pass creation but fail during execution
            if response.status_code == 200:
                # Try to run the agent to see if it fails
                agent_data = response.json()
                agent_id = agent_data.get('id')
                
                run_response = requests.post(f"{self.api_base}/ai-agents/{agent_id}/run")
                
                if run_response.status_code != 200:
                    self.log_test_result(
                        "SMS Agent Validation - Missing SMS Content (Write Mode)", 
                        True, 
                        "Agent creation allowed but run fails without SMS content"
                    )
                else:
                    self.log_test_result(
                        "SMS Agent Validation - Missing SMS Content (Write Mode)", 
                        False, 
                        "Agent runs successfully without SMS content"
                    )
            else:
                # Check if it was rejected at creation
                error_text = response.text.lower()
                if "sms content" in error_text or "content" in error_text:
                    self.log_test_result(
                        "SMS Agent Validation - Missing SMS Content (Write Mode)", 
                        True, 
                        f"Correctly rejected at creation: {response.text}"
                    )
                else:
                    self.log_test_result(
                        "SMS Agent Validation - Missing SMS Content (Write Mode)", 
                        False, 
                        f"Unexpected error: {response.text}"
                    )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Validation - Missing SMS Content (Write Mode)", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_sms_agent_validation_character_limit(self):
        """Test validation: SMS character limit (160 characters)"""
        print("\n=== TEST: SMS Agent Validation - Character Limit ===")
        
        try:
            # Create SMS content that exceeds 160 characters
            long_sms_content = "This is a very long SMS message that definitely exceeds the standard 160 character limit for SMS messages. It should be rejected by the validation logic implemented in the backend system for SMS agents."
            
            sms_agent_data = {
                "agent_name": "Test SMS Long Content Agent",
                "agent_type": "sms_agent",
                "mode": "write",
                "sms_content": long_sms_content,  # 201 characters
                "sms_provider": "twilio",
                "sms_character_limit": 160
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            if response.status_code == 400:
                error_text = response.text.lower()
                if "character limit" in error_text or "160" in error_text:
                    self.log_test_result(
                        "SMS Agent Validation - Character Limit", 
                        True, 
                        f"Correctly rejected long SMS: {response.text}"
                    )
                else:
                    self.log_test_result(
                        "SMS Agent Validation - Character Limit", 
                        False, 
                        f"Wrong error message: {response.text}"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Validation - Character Limit", 
                    False, 
                    f"Expected 400 error, got {response.status_code}. Long SMS was accepted."
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Validation - Character Limit", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_sms_agent_validation_invalid_provider(self):
        """Test validation: SMS provider validation (twilio/sendgrid only)"""
        print("\n=== TEST: SMS Agent Validation - Invalid Provider ===")
        
        try:
            sms_agent_data = {
                "agent_name": "Test SMS Invalid Provider Agent",
                "agent_type": "sms_agent",
                "mode": "write",
                "sms_content": "Test SMS content",
                "sms_provider": "invalid_provider"  # Should be rejected
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            if response.status_code == 400:
                error_text = response.text.lower()
                if "provider" in error_text and ("twilio" in error_text or "sendgrid" in error_text):
                    self.log_test_result(
                        "SMS Agent Validation - Invalid Provider", 
                        True, 
                        f"Correctly rejected invalid provider: {response.text}"
                    )
                else:
                    self.log_test_result(
                        "SMS Agent Validation - Invalid Provider", 
                        False, 
                        f"Wrong error message: {response.text}"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Validation - Invalid Provider", 
                    False, 
                    f"Expected 400 error, got {response.status_code}. Invalid provider was accepted."
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Validation - Invalid Provider", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_sms_agent_run_and_post_generation(self, agent_id):
        """Test running SMS agent and verifying post generation"""
        print(f"\n=== TEST: SMS Agent Run and Post Generation (Agent: {agent_id}) ===")
        
        if not agent_id:
            self.log_test_result(
                "SMS Agent Run and Post Generation", 
                False, 
                "No valid agent ID provided"
            )
            return None
        
        try:
            # Run the SMS agent
            response = requests.post(f"{self.api_base}/ai-agents/{agent_id}/run", headers=self.headers)
            
            if response.status_code == 200:
                run_result = response.json()
                
                # Wait a moment for post generation
                await asyncio.sleep(2)
                
                # Check if SMS post was created in ai_posts collection
                posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "agent_type": "sms_agent"
                }).sort("created_at", -1).limit(1).to_list(length=1)
                
                if posts:
                    post = posts[0]
                    post_id = post.get('id')
                    
                    # Verify post has correct agent_type
                    if post.get('agent_type') == 'sms_agent':
                        self.log_test_result(
                            "SMS Agent Run and Post Generation", 
                            True, 
                            f"SMS post created with ID: {post_id}, Status: {post.get('status')}"
                        )
                        return post_id
                    else:
                        self.log_test_result(
                            "SMS Agent Run and Post Generation", 
                            False, 
                            f"Post created but wrong agent_type: {post.get('agent_type')}"
                        )
                else:
                    self.log_test_result(
                        "SMS Agent Run and Post Generation", 
                        False, 
                        "Agent ran successfully but no SMS post found in database"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Run and Post Generation", 
                    False, 
                    f"Agent run failed: HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Run and Post Generation", 
                False, 
                f"Exception: {str(e)}"
            )
        
        return None
    
    async def test_sms_agent_endpoints_get(self):
        """Test GET /api/ai-agents endpoint includes SMS agents"""
        print("\n=== TEST: SMS Agent Endpoints - GET /api/ai-agents ===")
        
        try:
            response = requests.get(f"{self.api_base}/ai-agents", headers=self.headers)
            
            if response.status_code == 200:
                agents = response.json()
                
                # Look for SMS agents in the response
                sms_agents = [agent for agent in agents if agent.get('agent_type') == 'sms_agent']
                
                if sms_agents:
                    self.log_test_result(
                        "SMS Agent Endpoints - GET", 
                        True, 
                        f"Found {len(sms_agents)} SMS agents in response"
                    )
                else:
                    self.log_test_result(
                        "SMS Agent Endpoints - GET", 
                        False, 
                        "No SMS agents found in GET response"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Endpoints - GET", 
                    False, 
                    f"GET request failed: HTTP {response.status_code}"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Endpoints - GET", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_sms_agent_endpoints_put(self, agent_id):
        """Test PUT /api/ai-agents/{id} endpoint for SMS agents"""
        print(f"\n=== TEST: SMS Agent Endpoints - PUT /api/ai-agents/{agent_id} ===")
        
        if not agent_id:
            self.log_test_result(
                "SMS Agent Endpoints - PUT", 
                False, 
                "No valid agent ID provided"
            )
            return
        
        try:
            # Update SMS agent data
            update_data = {
                "agent_name": "Updated SMS Agent Name",
                "sms_content": "Updated SMS content for testing purposes. This is a shorter message.",
                "sms_provider": "sendgrid"
            }
            
            response = requests.put(f"{self.api_base}/ai-agents/{agent_id}", json=update_data, headers=self.headers)
            
            if response.status_code == 200:
                updated_agent = response.json()
                
                # Verify updates were applied
                if (updated_agent.get('agent_name') == update_data['agent_name'] and
                    updated_agent.get('sms_provider') == update_data['sms_provider']):
                    
                    self.log_test_result(
                        "SMS Agent Endpoints - PUT", 
                        True, 
                        "SMS agent updated successfully"
                    )
                else:
                    self.log_test_result(
                        "SMS Agent Endpoints - PUT", 
                        False, 
                        f"Update failed - fields not updated correctly: {updated_agent}"
                    )
            else:
                self.log_test_result(
                    "SMS Agent Endpoints - PUT", 
                    False, 
                    f"PUT request failed: HTTP {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Endpoints - PUT", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_sms_posts_in_review_ready_endpoints(self):
        """Test SMS posts appear in review/ready-to-publish endpoints"""
        print("\n=== TEST: SMS Posts in Review/Ready Endpoints ===")
        
        try:
            # Test in-review endpoint
            review_response = requests.get(f"{self.api_base}/ai-posts/in-review", headers=self.headers)
            ready_response = requests.get(f"{self.api_base}/ai-posts/ready-to-publish", headers=self.headers)
            
            review_success = False
            ready_success = False
            
            if review_response.status_code == 200:
                review_posts = review_response.json()
                sms_review_posts = [post for post in review_posts if post.get('agent_type') == 'sms_agent']
                
                if sms_review_posts:
                    review_success = True
                    print(f"   Found {len(sms_review_posts)} SMS posts in review")
            
            if ready_response.status_code == 200:
                ready_posts = ready_response.json()
                sms_ready_posts = [post for post in ready_posts if post.get('agent_type') == 'sms_agent']
                
                if sms_ready_posts:
                    ready_success = True
                    print(f"   Found {len(sms_ready_posts)} SMS posts ready to publish")
            
            if review_success or ready_success:
                self.log_test_result(
                    "SMS Posts in Review/Ready Endpoints", 
                    True, 
                    f"SMS posts found in endpoints (Review: {review_success}, Ready: {ready_success})"
                )
            else:
                self.log_test_result(
                    "SMS Posts in Review/Ready Endpoints", 
                    False, 
                    "No SMS posts found in either review or ready endpoints"
                )
                
        except Exception as e:
            self.log_test_result(
                "SMS Posts in Review/Ready Endpoints", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_agent_type_filter_includes_sms(self):
        """Test agent_type filter includes SMS agents"""
        print("\n=== TEST: Agent Type Filter Includes SMS Agents ===")
        
        try:
            # Check if there's a filter endpoint or if SMS agents appear in general listings
            response = requests.get(f"{self.api_base}/ai-agents", headers=self.headers)
            
            if response.status_code == 200:
                agents = response.json()
                
                # Check for SMS agents and other agent types
                agent_types = set(agent.get('agent_type') for agent in agents)
                
                if 'sms_agent' in agent_types:
                    self.log_test_result(
                        "Agent Type Filter Includes SMS Agents", 
                        True, 
                        f"SMS agents included in agent types: {list(agent_types)}"
                    )
                else:
                    self.log_test_result(
                        "Agent Type Filter Includes SMS Agents", 
                        False, 
                        f"SMS agents not found in agent types: {list(agent_types)}"
                    )
            else:
                self.log_test_result(
                    "Agent Type Filter Includes SMS Agents", 
                    False, 
                    f"Failed to get agents list: HTTP {response.status_code}"
                )
                
        except Exception as e:
            self.log_test_result(
                "Agent Type Filter Includes SMS Agents", 
                False, 
                f"Exception: {str(e)}"
            )
    
    async def test_sms_content_character_count_validation(self):
        """Test AI-generated SMS content follows 160 character limit"""
        print("\n=== TEST: AI-Generated SMS Content Character Limit ===")
        
        try:
            # Create an adhoc SMS agent that will generate content
            sms_agent_data = {
                "agent_name": "AI SMS Character Limit Test Agent",
                "agent_type": "sms_agent",
                "mode": "adhoc",
                "topic": "Pet wellness checkup reminder for busy pet owners who need to schedule appointments",
                "sms_provider": "twilio",
                "sms_character_limit": 160
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=sms_agent_data, headers=self.headers)
            
            if response.status_code == 200:
                agent_data = response.json()
                agent_id = agent_data.get('id')
                
                # Run the agent to generate SMS content
                run_response = requests.post(f"{self.api_base}/ai-agents/{agent_id}/run", headers=self.headers)
                
                if run_response.status_code == 200:
                    # Wait for content generation
                    await asyncio.sleep(3)
                    
                    # Check the generated SMS post
                    posts = await self.db.ai_posts.find({
                        "agent_id": agent_id,
                        "agent_type": "sms_agent"
                    }).sort("created_at", -1).limit(1).to_list(length=1)
                    
                    if posts:
                        post = posts[0]
                        sms_content = post.get('content', '')
                        content_length = len(sms_content)
                        
                        if content_length <= 160:
                            self.log_test_result(
                                "AI-Generated SMS Content Character Limit", 
                                True, 
                                f"Generated SMS is {content_length} characters (within 160 limit)"
                            )
                        else:
                            self.log_test_result(
                                "AI-Generated SMS Content Character Limit", 
                                False, 
                                f"Generated SMS is {content_length} characters (exceeds 160 limit): {sms_content[:100]}..."
                            )
                    else:
                        self.log_test_result(
                            "AI-Generated SMS Content Character Limit", 
                            False, 
                            "No SMS post found after agent run"
                        )
                else:
                    self.log_test_result(
                        "AI-Generated SMS Content Character Limit", 
                        False, 
                        f"Agent run failed: {run_response.status_code}"
                    )
            else:
                self.log_test_result(
                    "AI-Generated SMS Content Character Limit", 
                    False, 
                    f"Agent creation failed: {response.status_code}"
                )
                
        except Exception as e:
            self.log_test_result(
                "AI-Generated SMS Content Character Limit", 
                False, 
                f"Exception: {str(e)}"
            )
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🧪 SMS AGENT COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}")
                    if result['details']:
                        print(f"     {result['details']}")
        
        print(f"\n✅ PASSED TESTS ({passed_tests}):")
        for result in self.test_results:
            if result['success']:
                print(f"   • {result['test']}")
    
    async def run_comprehensive_sms_agent_tests(self):
        """Run all SMS agent tests"""
        print("🧪 STARTING COMPREHENSIVE SMS AGENT TESTING")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Test 1: SMS Agent Creation Tests
            print("\n📝 TESTING SMS AGENT CREATION...")
            write_agent_id = await self.test_sms_agent_creation_write_mode()
            recurring_agent_id = await self.test_sms_agent_creation_recurring_mode()
            adhoc_agent_id = await self.test_sms_agent_creation_adhoc_mode()
            
            # Test 2: SMS Agent Validation Tests
            print("\n🔍 TESTING SMS AGENT VALIDATION...")
            await self.test_sms_agent_validation_missing_name()
            await self.test_sms_agent_validation_missing_content_write_mode()
            await self.test_sms_agent_validation_character_limit()
            await self.test_sms_agent_validation_invalid_provider()
            
            # Test 3: SMS Generation Tests
            print("\n⚡ TESTING SMS GENERATION...")
            if write_agent_id:
                await self.test_sms_agent_run_and_post_generation(write_agent_id)
            if adhoc_agent_id:
                await self.test_sms_agent_run_and_post_generation(adhoc_agent_id)
            
            await self.test_sms_content_character_count_validation()
            
            # Test 4: SMS Agent Endpoints Tests
            print("\n🌐 TESTING SMS AGENT ENDPOINTS...")
            await self.test_sms_agent_endpoints_get()
            if write_agent_id:
                await self.test_sms_agent_endpoints_put(write_agent_id)
            
            # Test 5: Integration Tests
            print("\n🔗 TESTING SMS AGENT INTEGRATION...")
            await self.test_sms_posts_in_review_ready_endpoints()
            await self.test_agent_type_filter_includes_sms()
            
            # Print comprehensive summary
            self.print_test_summary()
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR in test suite: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = SMSAgentTester()
    await tester.run_comprehensive_sms_agent_tests()

if __name__ == "__main__":
    asyncio.run(main())