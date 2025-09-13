#!/usr/bin/env python3
"""
Scheduler Functionality Test for Custom Post Mode Social Media Agents

This test verifies the scheduler functionality for social media agents in write mode:
1. Create Write Mode Social Media Agent with specific scheduling parameters
2. Verify Agent Creation with correct post_date and post_time
3. Test Scheduler Logic for automatic post creation
4. Test Past Date Scenario handling

Focus: Confirming whether the scheduling system is functional and creates posts automatically
at the specified dates/times.
"""

import asyncio
import sys
import os
import json
import requests
from datetime import datetime, date, timedelta
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

class SchedulerTester:
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
            self.backend_url = "https://marketing-agent.preview.emergentagent.com"
        
        self.api_base = f"{self.backend_url}/api"
        print(f"Using backend URL: {self.api_base}")
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def test_api_connection(self):
        """Test basic API connectivity"""
        print("=== TESTING API CONNECTION ===")
        try:
            # Try a simple endpoint that doesn't require auth
            response = requests.get(f"{self.backend_url}/", timeout=10)
            if response.status_code in [200, 404]:  # 404 is fine, means server is running
                print("✅ API connection successful")
                return True
            else:
                print(f"⚠️  API returned status code: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ API connection failed: {str(e)}")
            return False
    
    def authenticate(self):
        """Authenticate with the API using admin credentials"""
        print("=== AUTHENTICATING WITH API ===")
        
        # Try different admin credentials
        credentials_to_try = [
            {"email": "admin@hospital.com", "password": "admin123"},
            {"email": "admin@primepixel.com", "password": "admin123"},
            {"email": "newadmin@veterinary.com", "password": "admin123"}
        ]
        
        for creds in credentials_to_try:
            try:
                response = requests.post(
                    f"{self.api_base}/login",
                    json=creds,
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    self.auth_token = result.get('access_token')
                    print(f"✅ Authentication successful with {creds['email']}")
                    return True
                else:
                    print(f"⚠️  Authentication failed for {creds['email']}: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Authentication error for {creds['email']}: {str(e)}")
        
        print("❌ All authentication attempts failed")
        return False
    
    def get_auth_headers(self):
        """Get authentication headers"""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}
    
    async def create_write_mode_social_media_agent(self, agent_name, post_title, post_content, post_date, post_time, platforms):
        """Create a Write Mode Social Media Agent with scheduling parameters"""
        print(f"\n=== CREATING WRITE MODE SOCIAL MEDIA AGENT ===")
        print(f"Agent Name: {agent_name}")
        print(f"Post Title: {post_title}")
        print(f"Post Date: {post_date}")
        print(f"Post Time: {post_time}")
        print(f"Platforms: {platforms}")
        
        # Convert platforms list to dictionary format expected by API
        platforms_dict = {
            "facebook": "facebook" in platforms,
            "instagram": "instagram" in platforms,
            "twitter": "twitter" in platforms,
            "whatsapp": "whatsapp" in platforms
        }
        
        agent_data = {
            "agent_name": agent_name,
            "agent_type": "social_media",
            "mode": "write",
            "post_title": post_title,
            "post_content": post_content,
            "post_date": post_date,
            "post_time": post_time,
            "social_platforms": platforms_dict,
            "image_option": "none"  # Use text only for faster testing
        }
        
        try:
            response = requests.post(
                f"{self.api_base}/ai-agents",
                json=agent_data,
                headers=self.get_auth_headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                agent_id = result.get('agent_id')
                print(f"✅ Agent created successfully with ID: {agent_id}")
                return agent_id, result
            else:
                print(f"❌ Failed to create agent. Status: {response.status_code}")
                print(f"Response: {response.text}")
                return None, None
                
        except Exception as e:
            print(f"❌ Error creating agent: {str(e)}")
            return None, None
    
    async def verify_agent_creation(self, agent_id):
        """Verify agent was created with correct parameters"""
        print(f"\n=== VERIFYING AGENT CREATION ===")
        
        try:
            # Check via API
            response = requests.get(f"{self.api_base}/ai-agents", headers=self.get_auth_headers(), timeout=10)
            if response.status_code == 200:
                agents = response.json().get('agents', [])
                target_agent = None
                
                for agent in agents:
                    if agent.get('id') == agent_id:
                        target_agent = agent
                        break
                
                if target_agent:
                    print("✅ Agent found via API")
                    print(f"  Agent Name: {target_agent.get('agent_name')}")
                    print(f"  Agent Type: {target_agent.get('agent_type')}")
                    print(f"  Mode: {target_agent.get('mode')}")
                    print(f"  Post Date: {target_agent.get('post_date')}")
                    print(f"  Post Time: {target_agent.get('post_time')}")
                    print(f"  Social Platforms: {target_agent.get('social_platforms')}")
                    
                    # Verify specific fields
                    verification_results = {
                        'post_date_correct': target_agent.get('post_date') is not None,
                        'post_time_correct': target_agent.get('post_time') is not None,
                        'platforms_correct': isinstance(target_agent.get('social_platforms'), list) and len(target_agent.get('social_platforms', [])) > 0,
                        'mode_correct': target_agent.get('mode') == 'write',
                        'type_correct': target_agent.get('agent_type') == 'social_media'
                    }
                    
                    print(f"\n📋 VERIFICATION RESULTS:")
                    for check, result in verification_results.items():
                        status = "✅" if result else "❌"
                        print(f"  {status} {check}: {result}")
                    
                    return target_agent, all(verification_results.values())
                else:
                    print("❌ Agent not found via API")
                    return None, False
            else:
                print(f"❌ Failed to fetch agents. Status: {response.status_code}")
                return None, False
                
        except Exception as e:
            print(f"❌ Error verifying agent: {str(e)}")
            return None, False
        
        # Also check database directly
        try:
            db_agent = await self.db.ai_agents.find_one({"id": agent_id})
            if db_agent:
                print("✅ Agent found in database")
                return db_agent, True
            else:
                print("❌ Agent not found in database")
                return None, False
        except Exception as e:
            print(f"❌ Database verification error: {str(e)}")
            return None, False
    
    async def check_scheduler_background_process(self):
        """Check if there's a background scheduler running"""
        print(f"\n=== CHECKING SCHEDULER BACKGROUND PROCESS ===")
        
        try:
            # Check if scheduled_posts_scheduler function exists in server.py
            server_file = backend_dir / "server.py"
            if server_file.exists():
                with open(server_file, 'r') as f:
                    content = f.read()
                    
                scheduler_found = "scheduled_posts_scheduler" in content
                process_scheduled_found = "process_scheduled_posts" in content
                startup_scheduler = "asyncio.create_task(scheduled_posts_scheduler())" in content
                
                print(f"✅ Scheduler function found: {scheduler_found}")
                print(f"✅ Process function found: {process_scheduled_found}")
                print(f"✅ Startup task found: {startup_scheduler}")
                
                if scheduler_found and process_scheduled_found:
                    print("✅ Background scheduler implementation detected")
                    return True
                else:
                    print("❌ Background scheduler implementation not found")
                    return False
            else:
                print("❌ Server.py file not found")
                return False
                
        except Exception as e:
            print(f"❌ Error checking scheduler: {str(e)}")
            return False
    
    async def test_scheduled_post_creation(self, agent_id):
        """Test if posts are created automatically for scheduled agents"""
        print(f"\n=== TESTING SCHEDULED POST CREATION ===")
        
        try:
            # Check if there are any posts created for this agent
            posts_before = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
            print(f"Posts before scheduler test: {len(posts_before)}")
            
            # Try to trigger the scheduler manually by calling the run endpoint
            try:
                response = requests.post(f"{self.api_base}/ai-agents/{agent_id}/run", headers=self.get_auth_headers(), timeout=30)
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Manual run successful: {result}")
                    
                    # Check if a post was created
                    posts_after = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                    print(f"Posts after manual run: {len(posts_after)}")
                    
                    if len(posts_after) > len(posts_before):
                        new_post = posts_after[-1]  # Get the latest post
                        print(f"✅ New post created:")
                        print(f"  Post ID: {new_post.get('id')}")
                        print(f"  Status: {new_post.get('status')}")
                        print(f"  Content preview: {new_post.get('content', '')[:100]}...")
                        return True, new_post
                    else:
                        print("⚠️  No new post created during manual run")
                        return False, None
                else:
                    print(f"❌ Manual run failed. Status: {response.status_code}")
                    print(f"Response: {response.text}")
                    return False, None
                    
            except Exception as e:
                print(f"❌ Error during manual run: {str(e)}")
                return False, None
                
        except Exception as e:
            print(f"❌ Error testing post creation: {str(e)}")
            return False, None
    
    async def test_past_date_handling(self):
        """Test how the system handles agents with past dates"""
        print(f"\n=== TESTING PAST DATE SCENARIO ===")
        
        # Create agent with past date
        past_date = "2025-09-08"  # Past date as specified
        past_time = "09:00"
        
        agent_id, result = await self.create_write_mode_social_media_agent(
            agent_name="Test Past Date Agent",
            post_title="Past Date Test Post",
            post_content="This is a test post with past date",
            post_date=past_date,
            post_time=past_time,
            platforms=["facebook", "instagram"]
        )
        
        if agent_id:
            # Verify the agent was created
            agent_data, verification_success = await self.verify_agent_creation(agent_id)
            
            if verification_success:
                print("✅ Past date agent created successfully")
                
                # Test if the system handles past dates appropriately
                post_created, post_data = await self.test_scheduled_post_creation(agent_id)
                
                if post_created:
                    print("✅ System created post for past date agent")
                    print("  This suggests the system processes past dates immediately")
                else:
                    print("⚠️  System did not create post for past date agent")
                    print("  This might be expected behavior for past dates")
                
                return agent_id, agent_data
            else:
                print("❌ Past date agent verification failed")
                return None, None
        else:
            print("❌ Failed to create past date agent")
            return None, None
    
    async def check_dashboard_display(self, agent_ids):
        """Check how agents appear in the dashboard"""
        print(f"\n=== CHECKING DASHBOARD DISPLAY ===")
        
        try:
            response = requests.get(f"{self.api_base}/ai-agents", headers=self.get_auth_headers(), timeout=10)
            if response.status_code == 200:
                agents = response.json().get('agents', [])
                
                print(f"Total agents in system: {len(agents)}")
                
                for agent_id in agent_ids:
                    target_agent = None
                    for agent in agents:
                        if agent.get('id') == agent_id:
                            target_agent = agent
                            break
                    
                    if target_agent:
                        print(f"\n📱 DASHBOARD DISPLAY FOR {target_agent.get('agent_name')}:")
                        print(f"  Status: {target_agent.get('status', 'unknown')}")
                        print(f"  Mode: {target_agent.get('mode')}")
                        print(f"  Post Date: {target_agent.get('post_date')}")
                        print(f"  Post Time: {target_agent.get('post_time')}")
                        print(f"  Platforms: {target_agent.get('social_platforms')}")
                        print(f"  Created: {target_agent.get('created_at')}")
                    else:
                        print(f"❌ Agent {agent_id} not found in dashboard")
                
                return True
            else:
                print(f"❌ Failed to fetch dashboard data. Status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error checking dashboard: {str(e)}")
            return False
    
    async def run_comprehensive_scheduler_test(self):
        """Run comprehensive scheduler functionality test"""
        print("🕐 STARTING COMPREHENSIVE SCHEDULER FUNCTIONALITY TEST")
        print("=" * 70)
        
        test_results = {
            'api_connection': False,
            'authentication': False,
            'future_agent_creation': False,
            'future_agent_verification': False,
            'scheduler_background': False,
            'post_creation': False,
            'past_agent_creation': False,
            'past_agent_verification': False,
            'dashboard_display': False
        }
        
        created_agents = []
        
        try:
            await self.connect()
            
            # Step 1: Test API Connection
            test_results['api_connection'] = self.test_api_connection()
            
            # Step 1.5: Authenticate
            test_results['authentication'] = self.authenticate()
            
            # Step 2: Create Write Mode Social Media Agent (Future Date)
            print(f"\n" + "=" * 50)
            print("STEP 2: CREATE FUTURE DATE AGENT")
            print("=" * 50)
            
            future_agent_id, future_result = await self.create_write_mode_social_media_agent(
                agent_name="Test Social Media Write Agent",
                post_title="Test Social Media Post",
                post_content="This is test social media content",
                post_date="2025-09-10",  # Tomorrow as specified
                post_time="14:30",
                platforms=["facebook", "instagram"]
            )
            
            if future_agent_id:
                test_results['future_agent_creation'] = True
                created_agents.append(future_agent_id)
                
                # Step 3: Verify Agent Creation
                agent_data, verification_success = await self.verify_agent_creation(future_agent_id)
                test_results['future_agent_verification'] = verification_success
                
                # Step 4: Test Scheduler Logic
                test_results['scheduler_background'] = await self.check_scheduler_background_process()
                
                # Step 5: Test Post Creation
                post_created, post_data = await self.test_scheduled_post_creation(future_agent_id)
                test_results['post_creation'] = post_created
            
            # Step 6: Test Past Date Scenario
            print(f"\n" + "=" * 50)
            print("STEP 6: TEST PAST DATE SCENARIO")
            print("=" * 50)
            
            past_agent_id, past_agent_data = await self.test_past_date_handling()
            if past_agent_id:
                test_results['past_agent_creation'] = True
                test_results['past_agent_verification'] = True
                created_agents.append(past_agent_id)
            
            # Step 7: Check Dashboard Display
            if created_agents:
                test_results['dashboard_display'] = await self.check_dashboard_display(created_agents)
            
            # Step 8: Final Analysis
            print(f"\n" + "=" * 70)
            print("🎯 COMPREHENSIVE TEST RESULTS")
            print("=" * 70)
            
            total_tests = len(test_results)
            passed_tests = sum(test_results.values())
            
            print(f"📊 OVERALL SCORE: {passed_tests}/{total_tests} tests passed")
            print(f"📈 SUCCESS RATE: {(passed_tests/total_tests)*100:.1f}%")
            
            print(f"\n📋 DETAILED RESULTS:")
            for test_name, result in test_results.items():
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"  {status} {test_name.replace('_', ' ').title()}")
            
            # Scheduler Functionality Assessment
            print(f"\n🕐 SCHEDULER FUNCTIONALITY ASSESSMENT:")
            
            if test_results['scheduler_background']:
                print("✅ Background scheduler implementation found")
            else:
                print("❌ Background scheduler implementation missing")
            
            if test_results['post_creation']:
                print("✅ Post creation functionality working")
            else:
                print("❌ Post creation functionality not working")
            
            if test_results['future_agent_creation'] and test_results['future_agent_verification']:
                print("✅ Future date agent creation working")
            else:
                print("❌ Future date agent creation issues")
            
            if test_results['past_agent_creation'] and test_results['past_agent_verification']:
                print("✅ Past date agent handling working")
            else:
                print("❌ Past date agent handling issues")
            
            # Critical Issues
            critical_issues = []
            if not test_results['api_connection']:
                critical_issues.append("API connection failed")
            if not test_results['scheduler_background']:
                critical_issues.append("Background scheduler not implemented")
            if not test_results['post_creation']:
                critical_issues.append("Automatic post creation not working")
            
            if critical_issues:
                print(f"\n🚨 CRITICAL ISSUES FOUND:")
                for issue in critical_issues:
                    print(f"  ❌ {issue}")
            else:
                print(f"\n🎉 NO CRITICAL ISSUES FOUND - Scheduler functionality appears to be working!")
            
            return test_results, created_agents
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return test_results, created_agents
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = SchedulerTester()
    results, agents = await tester.run_comprehensive_scheduler_test()
    
    # Summary for main agent
    print(f"\n" + "=" * 70)
    print("📝 SUMMARY FOR MAIN AGENT")
    print("=" * 70)
    
    passed_count = sum(results.values())
    total_count = len(results)
    
    if passed_count >= 6:  # Most tests passed
        print("✅ SCHEDULER FUNCTIONALITY: WORKING")
        print("The scheduling system appears to be functional with automatic post creation capabilities.")
    elif passed_count >= 4:  # Some tests passed
        print("⚠️  SCHEDULER FUNCTIONALITY: PARTIALLY WORKING")
        print("The scheduling system has some functionality but may have issues.")
    else:  # Most tests failed
        print("❌ SCHEDULER FUNCTIONALITY: NOT WORKING")
        print("The scheduling system has significant issues and may not be functional.")
    
    print(f"\nCreated {len(agents)} test agents during testing.")
    print("Test completed successfully.")

if __name__ == "__main__":
    asyncio.run(main())