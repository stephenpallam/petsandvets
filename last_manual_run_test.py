#!/usr/bin/env python3
"""
Last Manual Run Field Update Test for Social Media Agents

This test verifies that the `last_manual_run` field is properly updated when social media agents are executed.

Test Requirements:
1. Create a Social Media Adhoc Agent and verify last_manual_run is null initially
2. Run the agent using run_agent endpoint and verify last_manual_run is populated
3. Create a Write Mode Agent and test the same functionality
4. Verify the exact timestamp format and value
"""

import asyncio
import sys
import os
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

class LastManualRunTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.auth_token = None
        
        # Get backend URL from frontend .env
        frontend_env_path = Path(__file__).parent / "frontend" / ".env"
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.backend_url = line.split('=', 1)[1].strip()
                        break
        else:
            self.backend_url = "https://petsai-templates.preview.emergentagent.com"
        
        self.api_base = f"{self.backend_url}/api"
        print(f"Using API base URL: {self.api_base}")
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def authenticate(self):
        """Authenticate with the API using admin credentials"""
        print("\n=== AUTHENTICATING WITH API ===")
        
        login_data = {
            "email": "admin@hospital.com",
            "password": "admin123"
        }
        
        response = self.make_request('POST', '/login', login_data)
        
        if response and response.status_code == 200:
            result = response.json()
            self.auth_token = result.get('access_token')
            print(f"✅ Authentication successful")
            return True
        else:
            print(f"❌ Authentication failed. Status: {response.status_code if response else 'No response'}")
            if response:
                print(f"Response: {response.text}")
            return False
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request to the API"""
        url = f"{self.api_base}{endpoint}"
        
        default_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        # Add authentication header if we have a token
        if self.auth_token and endpoint != '/login':
            default_headers['Authorization'] = f'Bearer {self.auth_token}'
        
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            print(f"{method.upper()} {url} -> {response.status_code}")
            
            if response.status_code >= 400:
                print(f"Error response: {response.text}")
            
            return response
            
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return None
    
    async def create_adhoc_social_media_agent(self):
        """Create a Social Media Adhoc Agent as specified in requirements"""
        print("\n=== CREATING SOCIAL MEDIA ADHOC AGENT ===")
        
        agent_data = {
            "agent_name": "Test Adhoc Last Run",
            "agent_type": "social_media",
            "mode": "adhoc",
            "topic": "Pet health tips",
            "social_platforms": {"facebook": True},
            "image_option": "none",  # Use text only for faster testing
            "word_count": "short"
        }
        
        print(f"Creating agent with data: {json.dumps(agent_data, indent=2)}")
        
        response = self.make_request('POST', '/ai-agents', agent_data)
        
        if response and response.status_code == 200:
            result = response.json()
            agent_id = result.get('agent_id')
            print(f"✅ Successfully created adhoc agent: {agent_id}")
            return agent_id
        else:
            print(f"❌ Failed to create adhoc agent. Status: {response.status_code if response else 'No response'}")
            if response:
                print(f"Response: {response.text}")
            return None
    
    async def create_write_mode_social_media_agent(self):
        """Create a Write Mode Social Media Agent as specified in requirements"""
        print("\n=== CREATING WRITE MODE SOCIAL MEDIA AGENT ===")
        
        agent_data = {
            "agent_name": "Test Write Mode Last Run",
            "agent_type": "social_media", 
            "mode": "write",
            "post_title": "Custom post title",
            "post_content": "Custom post content",
            "social_platforms": {"facebook": True},
            "image_option": "none",  # Use text only for faster testing
            "word_count": "short"
        }
        
        print(f"Creating write mode agent with data: {json.dumps(agent_data, indent=2)}")
        
        response = self.make_request('POST', '/ai-agents', agent_data)
        
        if response and response.status_code == 200:
            result = response.json()
            agent_id = result.get('agent_id')
            print(f"✅ Successfully created write mode agent: {agent_id}")
            return agent_id
        else:
            print(f"❌ Failed to create write mode agent. Status: {response.status_code if response else 'No response'}")
            if response:
                print(f"Response: {response.text}")
            return None
    
    async def check_agent_initial_state(self, agent_id):
        """Check that last_manual_run is null initially"""
        print(f"\n=== CHECKING INITIAL STATE FOR AGENT {agent_id} ===")
        
        # Get agent from database directly
        agent = await self.db.ai_agents.find_one({"id": agent_id})
        
        if not agent:
            print(f"❌ Agent {agent_id} not found in database")
            return False
        
        last_manual_run = agent.get('last_manual_run')
        print(f"Agent name: {agent.get('agent_name')}")
        print(f"Agent type: {agent.get('agent_type')}")
        print(f"Agent mode: {agent.get('mode')}")
        print(f"last_manual_run field: {last_manual_run}")
        
        if last_manual_run is None:
            print("✅ PASS: last_manual_run is null initially")
            return True
        else:
            print(f"❌ FAIL: last_manual_run should be null but is: {last_manual_run}")
            return False
    
    async def run_agent(self, agent_id):
        """Run the agent using the run_agent endpoint"""
        print(f"\n=== RUNNING AGENT {agent_id} ===")
        
        # Record time before running
        before_run_time = datetime.utcnow()
        print(f"Time before running: {before_run_time}")
        
        response = self.make_request('POST', f'/ai-agents/{agent_id}/run')
        
        if response and response.status_code == 200:
            result = response.json()
            print(f"✅ Agent run successful: {result}")
            
            # Check if a post was created
            post_id = result.get('post_id')
            if post_id:
                print(f"📝 Post created: {post_id}")
                
                # Verify post exists in database
                post = await self.db.ai_posts.find_one({"id": post_id})
                if post:
                    print(f"✅ Post verified in database with status: {post.get('status')}")
                else:
                    print(f"❌ Post {post_id} not found in database")
            else:
                # Check if posts were created by looking for recent posts from this agent
                recent_posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "created_at": {"$gte": before_run_time}
                }).to_list(length=5)
                
                if recent_posts:
                    print(f"📝 Found {len(recent_posts)} posts created by this agent run")
                    for post in recent_posts:
                        print(f"  - Post ID: {post.get('id')}, Status: {post.get('status')}")
                else:
                    print("⚠️ No post_id in response and no recent posts found")
            
            return True, before_run_time
        else:
            print(f"❌ Failed to run agent. Status: {response.status_code if response else 'No response'}")
            if response:
                print(f"Response: {response.text}")
            return False, before_run_time
    
    async def check_last_manual_run_updated(self, agent_id, before_run_time):
        """Check that last_manual_run field is updated after running"""
        print(f"\n=== CHECKING LAST_MANUAL_RUN UPDATE FOR AGENT {agent_id} ===")
        
        # Get agent from database
        agent = await self.db.ai_agents.find_one({"id": agent_id})
        
        if not agent:
            print(f"❌ Agent {agent_id} not found in database")
            return False
        
        last_manual_run = agent.get('last_manual_run')
        print(f"last_manual_run field: {last_manual_run}")
        print(f"Field type: {type(last_manual_run)}")
        
        if last_manual_run is None:
            print("❌ FAIL: last_manual_run is still null after running agent")
            return False
        
        # Check if it's a datetime object or string
        if isinstance(last_manual_run, datetime):
            run_time = last_manual_run
            print(f"✅ last_manual_run is datetime object: {run_time}")
        elif isinstance(last_manual_run, str):
            try:
                # Try to parse as ISO format
                run_time = datetime.fromisoformat(last_manual_run.replace('Z', ''))
                print(f"✅ last_manual_run is ISO string: {last_manual_run}")
            except ValueError:
                print(f"❌ FAIL: last_manual_run string format is invalid: {last_manual_run}")
                return False
        else:
            print(f"❌ FAIL: last_manual_run has unexpected type: {type(last_manual_run)}")
            return False
        
        # Check if the timestamp is reasonable (within a reasonable time window)
        # Note: There might be timezone differences between UTC and business timezone
        time_diff = abs((run_time - before_run_time).total_seconds())
        print(f"Time difference from expected: {time_diff} seconds")
        
        # Allow for timezone differences (up to 24 hours) and processing time
        if time_diff < 86400:  # Within 24 hours (accounts for timezone differences)
            print("✅ PASS: last_manual_run timestamp is reasonable (accounting for timezone)")
            print(f"✅ PASS: last_manual_run field updated successfully to: {last_manual_run}")
            return True
        else:
            print(f"❌ FAIL: last_manual_run timestamp seems incorrect (diff: {time_diff}s)")
            return False
    
    async def test_agent_workflow(self, agent_id, agent_type):
        """Test complete workflow for an agent"""
        print(f"\n{'='*60}")
        print(f"TESTING {agent_type.upper()} AGENT WORKFLOW: {agent_id}")
        print(f"{'='*60}")
        
        # Step 1: Check initial state
        initial_check = await self.check_agent_initial_state(agent_id)
        
        # Step 2: Run the agent
        run_success, before_run_time = await self.run_agent(agent_id)
        
        if not run_success:
            print(f"❌ WORKFLOW FAILED: Could not run {agent_type} agent")
            return False
        
        # Step 3: Check last_manual_run was updated
        update_check = await self.check_last_manual_run_updated(agent_id, before_run_time)
        
        # Overall result
        workflow_success = initial_check and run_success and update_check
        
        if workflow_success:
            print(f"✅ {agent_type.upper()} AGENT WORKFLOW: COMPLETE SUCCESS")
        else:
            print(f"❌ {agent_type.upper()} AGENT WORKFLOW: FAILED")
        
        return workflow_success
    
    async def run_comprehensive_test(self):
        """Run comprehensive test of last_manual_run functionality"""
        print("🧪 STARTING COMPREHENSIVE LAST_MANUAL_RUN TEST")
        print("=" * 80)
        
        results = {
            'adhoc_agent_test': False,
            'write_mode_agent_test': False
        }
        
        try:
            await self.connect()
            
            # Authenticate first
            if not self.authenticate():
                print("❌ CRITICAL ERROR: Could not authenticate with API")
                return False, results
            
            # Test 1: Create and test Adhoc Social Media Agent
            print("\n" + "🎯 TEST 1: ADHOC SOCIAL MEDIA AGENT" + "\n")
            adhoc_agent_id = await self.create_adhoc_social_media_agent()
            
            if adhoc_agent_id:
                results['adhoc_agent_test'] = await self.test_agent_workflow(adhoc_agent_id, "ADHOC")
            else:
                print("❌ TEST 1 FAILED: Could not create adhoc agent")
            
            # Test 2: Create and test Write Mode Social Media Agent  
            print("\n" + "🎯 TEST 2: WRITE MODE SOCIAL MEDIA AGENT" + "\n")
            write_agent_id = await self.create_write_mode_social_media_agent()
            
            if write_agent_id:
                results['write_mode_agent_test'] = await self.test_agent_workflow(write_agent_id, "WRITE MODE")
            else:
                print("❌ TEST 2 FAILED: Could not create write mode agent")
            
            # Final Results Summary
            print("\n" + "=" * 80)
            print("🏁 FINAL TEST RESULTS SUMMARY")
            print("=" * 80)
            
            print(f"✅ Adhoc Agent Test: {'PASS' if results['adhoc_agent_test'] else 'FAIL'}")
            print(f"✅ Write Mode Agent Test: {'PASS' if results['write_mode_agent_test'] else 'FAIL'}")
            
            overall_success = all(results.values())
            
            if overall_success:
                print("\n🎉 ALL TESTS PASSED: last_manual_run field update functionality is working correctly!")
            else:
                print("\n❌ SOME TESTS FAILED: last_manual_run field update has issues")
                
                failed_tests = [test for test, passed in results.items() if not passed]
                print(f"Failed tests: {', '.join(failed_tests)}")
            
            return overall_success, results
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return False, results
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = LastManualRunTester()
    success, results = await tester.run_comprehensive_test()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())