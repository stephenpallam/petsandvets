#!/usr/bin/env python3
"""
Write Mode Email Agent Post Creation Test

This test focuses on the specific issue mentioned in the review request:
"Focus on determining why write mode email agents are not creating posts while social media agents are working."

Test Plan:
1. Create a Write Mode Email Agent with specific parameters
2. Verify Agent Creation - check all fields are saved correctly  
3. Execute the Agent using run_agent endpoint
4. Check Post Creation - verify posts are created in ai_posts collection
5. Compare with Social Media Agent behavior to identify differences
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

class WriteEmailAgentTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://aigentvets.preview.emergentagent.com')
        self.api_url = f"{self.backend_url}/api"
        self.client = None
        self.db = None
        self.test_results = []
        self.auth_token = None
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def authenticate(self):
        """Authenticate with the API"""
        try:
            login_data = {
                "email": "admin@hospital.com",
                "password": "admin123"
            }
            
            response = requests.post(f"{self.api_url}/login", json=login_data)
            
            if response.status_code == 200:
                token_data = response.json()
                self.auth_token = token_data.get('access_token')
                print(f"✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details
        })
    
    async def test_1_create_write_mode_email_agent(self):
        """Test 1: Create a Write Mode Email Agent with specific parameters"""
        print("\n=== TEST 1: CREATE WRITE MODE EMAIL AGENT ===")
        
        try:
            # Prepare agent data as specified in review request
            agent_data = {
                "agent_name": "Test Write Email Agent",
                "agent_type": "email",
                "mode": "write",
                "email_subject": "Test Email Subject", 
                "email_content": "This is test email content for write mode",
                "word_count": "150",
                "image_option": "none",
                "use_chatgpt_formatting": True,
                "email_type": "bulk",
                "use_customer_database": True
            }
            
            print(f"Creating email agent with data: {json.dumps(agent_data, indent=2)}")
            
            # Make API call to create agent
            response = requests.post(f"{self.api_url}/ai-agents", json=agent_data, headers=self.get_headers())
            
            if response.status_code == 200:
                created_agent = response.json()
                agent_id = created_agent.get('agent_id') or created_agent.get('id')
                
                self.log_result(
                    "Create Write Mode Email Agent",
                    True,
                    f"Agent created successfully with ID: {agent_id}",
                    created_agent
                )
                
                # Store for later tests
                self.email_agent_id = agent_id
                self.email_agent_data = created_agent
                return created_agent
                
            else:
                self.log_result(
                    "Create Write Mode Email Agent",
                    False,
                    f"API call failed with status {response.status_code}",
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_result(
                "Create Write Mode Email Agent",
                False,
                f"Exception occurred: {str(e)}",
                None
            )
            return None
    
    async def test_2_verify_agent_creation(self, agent_id):
        """Test 2: Verify Agent Creation - check all fields are saved correctly"""
        print("\n=== TEST 2: VERIFY AGENT CREATION ===")
        
        try:
            # Check in database directly
            agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
            
            if not agent_doc:
                self.log_result(
                    "Verify Agent in Database",
                    False,
                    "Agent not found in database",
                    None
                )
                return False
            
            # Verify all required fields
            required_fields = {
                "agent_name": "Test Write Email Agent",
                "agent_type": "email", 
                "mode": "write",
                "email_subject": "Test Email Subject",
                "email_content": "This is test email content for write mode",
                "image_option": "none",
                "use_chatgpt_formatting": True,
                "email_type": "bulk"
            }
            
            all_fields_correct = True
            field_issues = []
            
            for field, expected_value in required_fields.items():
                actual_value = agent_doc.get(field)
                if actual_value != expected_value:
                    all_fields_correct = False
                    field_issues.append(f"{field}: expected '{expected_value}', got '{actual_value}'")
            
            if all_fields_correct:
                self.log_result(
                    "Verify Agent Fields",
                    True,
                    "All fields saved correctly",
                    agent_doc
                )
            else:
                self.log_result(
                    "Verify Agent Fields", 
                    False,
                    "Field mismatches found",
                    field_issues
                )
            
            return all_fields_correct
            
        except Exception as e:
            self.log_result(
                "Verify Agent Creation",
                False,
                f"Exception occurred: {str(e)}",
                None
            )
            return False
    
    async def test_3_execute_agent(self, agent_id):
        """Test 3: Execute the Agent using run_agent endpoint"""
        print("\n=== TEST 3: EXECUTE EMAIL AGENT ===")
        
        try:
            # Make API call to run the agent
            response = requests.post(f"{self.api_url}/ai-agents/{agent_id}/run", headers=self.get_headers())
            
            if response.status_code == 200:
                run_result = response.json()
                
                self.log_result(
                    "Execute Email Agent",
                    True,
                    "Agent executed successfully",
                    run_result
                )
                
                # Store result for next test
                self.email_run_result = run_result
                return run_result
                
            else:
                self.log_result(
                    "Execute Email Agent",
                    False,
                    f"API call failed with status {response.status_code}",
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_result(
                "Execute Email Agent",
                False,
                f"Exception occurred: {str(e)}",
                None
            )
            return None
    
    async def test_4_check_post_creation(self, agent_id):
        """Test 4: Check Post Creation - verify posts are created in ai_posts collection"""
        print("\n=== TEST 4: CHECK POST CREATION ===")
        
        try:
            # Check for posts created by this agent
            posts = await self.db.ai_posts.find({
                "agent_id": agent_id,
                "agent_type": "email"
            }).sort("created_at", -1).to_list(length=10)
            
            if posts:
                latest_post = posts[0]
                
                # Verify post details
                expected_status = "in_review"
                actual_status = latest_post.get("status")
                
                post_details = {
                    "post_id": latest_post.get("id"),
                    "status": actual_status,
                    "content_preview": latest_post.get("content", "")[:200] + "...",
                    "agent_type": latest_post.get("agent_type"),
                    "created_at": latest_post.get("created_at")
                }
                
                if actual_status == expected_status:
                    self.log_result(
                        "Check Post Creation",
                        True,
                        f"Post created successfully with correct status '{expected_status}'",
                        post_details
                    )
                else:
                    self.log_result(
                        "Check Post Creation",
                        False,
                        f"Post created but wrong status: expected '{expected_status}', got '{actual_status}'",
                        post_details
                    )
                
                return posts
                
            else:
                self.log_result(
                    "Check Post Creation",
                    False,
                    "No posts found for this email agent",
                    {"agent_id": agent_id, "posts_count": 0}
                )
                return []
                
        except Exception as e:
            self.log_result(
                "Check Post Creation",
                False,
                f"Exception occurred: {str(e)}",
                None
            )
            return []
    
    async def test_5_create_social_media_agent_for_comparison(self):
        """Test 5: Create a write mode social media agent for comparison"""
        print("\n=== TEST 5: CREATE SOCIAL MEDIA AGENT FOR COMPARISON ===")
        
        try:
            # Create similar social media agent
            social_agent_data = {
                "agent_name": "Test Write Social Media Agent",
                "agent_type": "social_media",
                "mode": "write",
                "post_title": "Test Social Media Post",
                "post_content": "This is test social media content for write mode",
                "word_count": "150",
                "image_option": "none",
                "social_platforms": {"facebook": True, "instagram": True}
            }
            
            print(f"Creating social media agent with data: {json.dumps(social_agent_data, indent=2)}")
            
            # Make API call to create agent
            response = requests.post(f"{self.api_url}/ai-agents", json=social_agent_data, headers=self.get_headers())
            
            if response.status_code == 200:
                created_agent = response.json()
                agent_id = created_agent.get('id')
                
                self.log_result(
                    "Create Social Media Agent",
                    True,
                    f"Social media agent created successfully with ID: {agent_id}",
                    created_agent
                )
                
                # Store for comparison
                self.social_agent_id = agent_id
                self.social_agent_data = created_agent
                return created_agent
                
            else:
                self.log_result(
                    "Create Social Media Agent",
                    False,
                    f"API call failed with status {response.status_code}",
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_result(
                "Create Social Media Agent",
                False,
                f"Exception occurred: {str(e)}",
                None
            )
            return None
    
    async def test_6_execute_social_media_agent(self, agent_id):
        """Test 6: Execute social media agent and check post creation"""
        print("\n=== TEST 6: EXECUTE SOCIAL MEDIA AGENT ===")
        
        try:
            # Execute the social media agent
            response = requests.post(f"{self.api_url}/ai-agents/{agent_id}/run", headers=self.get_headers())
            
            if response.status_code == 200:
                run_result = response.json()
                
                self.log_result(
                    "Execute Social Media Agent",
                    True,
                    "Social media agent executed successfully",
                    run_result
                )
                
                # Check for posts created
                posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "agent_type": "social_media"
                }).sort("created_at", -1).to_list(length=10)
                
                if posts:
                    self.log_result(
                        "Social Media Post Creation",
                        True,
                        f"Social media agent created {len(posts)} posts successfully",
                        {"posts_count": len(posts), "latest_post_id": posts[0].get("id")}
                    )
                else:
                    self.log_result(
                        "Social Media Post Creation",
                        False,
                        "Social media agent did not create any posts",
                        {"agent_id": agent_id}
                    )
                
                return posts
                
            else:
                self.log_result(
                    "Execute Social Media Agent",
                    False,
                    f"API call failed with status {response.status_code}",
                    response.text
                )
                return []
                
        except Exception as e:
            self.log_result(
                "Execute Social Media Agent",
                False,
                f"Exception occurred: {str(e)}",
                None
            )
            return []
    
    async def test_7_compare_behaviors(self):
        """Test 7: Compare email vs social media agent behaviors"""
        print("\n=== TEST 7: COMPARE EMAIL VS SOCIAL MEDIA BEHAVIORS ===")
        
        try:
            # Get email agent posts
            email_posts = await self.db.ai_posts.find({
                "agent_id": getattr(self, 'email_agent_id', None),
                "agent_type": "email"
            }).to_list(length=10)
            
            # Get social media agent posts  
            social_posts = await self.db.ai_posts.find({
                "agent_id": getattr(self, 'social_agent_id', None),
                "agent_type": "social_media"
            }).to_list(length=10)
            
            comparison = {
                "email_agent": {
                    "posts_created": len(email_posts),
                    "agent_id": getattr(self, 'email_agent_id', None),
                    "latest_post": email_posts[0] if email_posts else None
                },
                "social_media_agent": {
                    "posts_created": len(social_posts),
                    "agent_id": getattr(self, 'social_agent_id', None),
                    "latest_post": social_posts[0] if social_posts else None
                }
            }
            
            # Determine if there's a discrepancy
            email_working = len(email_posts) > 0
            social_working = len(social_posts) > 0
            
            if email_working and social_working:
                self.log_result(
                    "Compare Agent Behaviors",
                    True,
                    "Both email and social media agents are creating posts correctly",
                    comparison
                )
            elif not email_working and social_working:
                self.log_result(
                    "Compare Agent Behaviors",
                    False,
                    "CRITICAL ISSUE: Social media agents work but email agents do not create posts",
                    comparison
                )
            elif email_working and not social_working:
                self.log_result(
                    "Compare Agent Behaviors",
                    False,
                    "Email agents work but social media agents do not create posts",
                    comparison
                )
            else:
                self.log_result(
                    "Compare Agent Behaviors",
                    False,
                    "Neither email nor social media agents are creating posts",
                    comparison
                )
            
            return comparison
            
        except Exception as e:
            self.log_result(
                "Compare Agent Behaviors",
                False,
                f"Exception occurred: {str(e)}",
                None
            )
            return None
    
    async def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🧪 STARTING WRITE MODE EMAIL AGENT POST CREATION TEST")
        print("=" * 70)
        
        try:
            await self.connect()
            
            # Authenticate first
            auth_success = await self.authenticate()
            if not auth_success:
                print("❌ Cannot proceed - authentication failed")
                return
            
            # Test 1: Create write mode email agent
            email_agent = await self.test_1_create_write_mode_email_agent()
            if not email_agent:
                print("❌ Cannot proceed - email agent creation failed")
                return
            
            # Test 2: Verify agent creation
            agent_verified = await self.test_2_verify_agent_creation(self.email_agent_id)
            
            # Test 3: Execute the email agent
            email_run_result = await self.test_3_execute_agent(self.email_agent_id)
            
            # Test 4: Check if posts were created
            email_posts = await self.test_4_check_post_creation(self.email_agent_id)
            
            # Test 5: Create social media agent for comparison
            social_agent = await self.test_5_create_social_media_agent_for_comparison()
            if social_agent:
                # Test 6: Execute social media agent
                social_posts = await self.test_6_execute_social_media_agent(self.social_agent_id)
                
                # Test 7: Compare behaviors
                comparison = await self.test_7_compare_behaviors()
            
            # Final analysis
            print("\n" + "=" * 70)
            print("📊 FINAL TEST ANALYSIS")
            print("=" * 70)
            
            passed_tests = sum(1 for result in self.test_results if result['success'])
            total_tests = len(self.test_results)
            
            print(f"Tests Passed: {passed_tests}/{total_tests}")
            print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
            
            # Key findings
            print("\n🔍 KEY FINDINGS:")
            
            email_posts_created = len(getattr(self, 'email_posts', []))
            social_posts_created = len(getattr(self, 'social_posts', []))
            
            if hasattr(self, 'email_agent_id'):
                email_posts = await self.db.ai_posts.find({"agent_id": self.email_agent_id}).to_list(length=10)
                email_posts_created = len(email_posts)
            
            if hasattr(self, 'social_agent_id'):
                social_posts = await self.db.ai_posts.find({"agent_id": self.social_agent_id}).to_list(length=10)
                social_posts_created = len(social_posts)
            
            if email_posts_created == 0 and social_posts_created > 0:
                print("❌ CONFIRMED ISSUE: Write mode email agents are NOT creating posts")
                print("✅ Social media agents ARE working correctly")
                print("🔧 RECOMMENDATION: Investigate email agent routing and post generation logic")
            elif email_posts_created > 0 and social_posts_created > 0:
                print("✅ Both email and social media agents are working correctly")
            elif email_posts_created == 0 and social_posts_created == 0:
                print("❌ Neither agent type is creating posts - broader issue")
            else:
                print("⚠️  Mixed results - needs further investigation")
            
            # Show failed tests
            failed_tests = [result for result in self.test_results if not result['success']]
            if failed_tests:
                print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
                for test in failed_tests:
                    print(f"  - {test['test']}: {test['message']}")
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = WriteEmailAgentTester()
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())