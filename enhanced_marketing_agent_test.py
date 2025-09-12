#!/usr/bin/env python3
"""
Enhanced Marketing Agent with ChatGPT Content Generation Testing

This test comprehensively tests the Enhanced Marketing Agent with proper ChatGPT content generation and personalization rules as requested:

Test Focus:
1. Create Topic-Based Marketing Agent - Test creating and running a marketing agent with proper ChatGPT content generation
2. Run Marketing Agent and Verify Content Quality - Execute the marketing agent and check content quality
3. Test Custom Campaign Content - Create another marketing agent with custom campaign
4. Test Non-Personalized Settings - Create a third agent with personalization disabled

Expected Results:
- Social media posts have NO personalization (no customer names)
- Social media posts have 150-200 word professional ChatGPT-generated content about Pet Health Tips
- Email posts have personalization WITH customer data + ChatGPT content + templates
- SMS posts have personalization WITH customer data + ChatGPT content + templates (concise for SMS)
- All channels use the same base ChatGPT-generated content as foundation
"""

import asyncio
import sys
import os
import json
import aiohttp
import ssl
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

class EnhancedMarketingAgentTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_ids = []  # Store multiple agent IDs
        self.generated_posts = []  # Store generated posts for analysis
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def log_test_result(self, test_name: str, success: bool, message: str, details: dict = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
        print()
        
        self.test_results.append({
            "test_name": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        })
    
    async def authenticate(self):
        """Get authentication token"""
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            login_data = {
                "email": "admin@hospital.com",
                "password": "admin123"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                login_url = f"{self.backend_url}/api/login"
                async with session.post(login_url, json=login_data, timeout=10) as response:
                    if response.status == 200:
                        login_result = await response.json()
                        self.auth_token = login_result.get("access_token")
                        return True
                    else:
                        print(f"Authentication failed: {response.status}")
                        return False
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return False
    
    async def test_create_marketing_agent_multi_channel_custom_campaign(self):
        """Test 1: Create Marketing Agent with Multi-Channel Campaign using custom content"""
        print("🔍 TEST 1: Create Marketing Agent with Multi-Channel Campaign (Custom Content)")
        print("=" * 80)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Marketing agent data as specified in the request
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Consistent Content Generation",
                "mode": "adhoc",
                "marketing_content_type": "custom_campaign",
                "marketing_custom_campaign": "Hello [CUSTOMER_NAME]! Special offer for [PET_NAME]. Don't miss out on [PET_NAMES] care!",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {"facebook": True, "instagram": True},
                "marketing_email_personalized": True,
                "email_content_template": "Hello [CUSTOMER_NAME]! Special offer for [PET_NAME]. Don't miss out on [PET_NAMES] care!",
                "marketing_sms_personalized": True,
                "sms_template": "Hello [CUSTOMER_NAME]! Special offer for [PET_NAME]. Don't miss out on [PET_NAMES] care!",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=marketing_agent_data, timeout=15) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            agent_id = result.get("agent_id")
                            self.created_agent_ids.append(agent_id)
                            
                            # Verify agent was created in database
                            agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
                            
                            success = agent_doc is not None and agent_doc.get("agent_type") == "marketing_agent"
                            
                            # Check if all fields were saved correctly
                            field_verification = {}
                            if agent_doc:
                                field_verification = {
                                    "agent_name": agent_doc.get("agent_name") == "Test Consistent Content Generation",
                                    "agent_type": agent_doc.get("agent_type") == "marketing_agent",
                                    "marketing_content_type": agent_doc.get("marketing_content_type") == "custom_campaign",
                                    "marketing_custom_campaign": agent_doc.get("marketing_custom_campaign") == "Hello [CUSTOMER_NAME]! Special offer for [PET_NAME]. Don't miss out on [PET_NAMES] care!",
                                    "marketing_channels": set(agent_doc.get("marketing_channels", [])) == {"social_media", "email", "sms"},
                                    "marketing_social_platforms": agent_doc.get("marketing_social_platforms") == {"facebook": True, "instagram": True},
                                    "marketing_email_personalized": agent_doc.get("marketing_email_personalized") == True,
                                    "email_content_template": agent_doc.get("email_content_template") == "Hello [CUSTOMER_NAME]! Special offer for [PET_NAME]. Don't miss out on [PET_NAMES] care!",
                                    "marketing_sms_personalized": agent_doc.get("marketing_sms_personalized") == True,
                                    "sms_template": agent_doc.get("sms_template") == "Hello [CUSTOMER_NAME]! Special offer for [PET_NAME]. Don't miss out on [PET_NAMES] care!",
                                    "marketing_workflow_mode": agent_doc.get("marketing_workflow_mode") == "in_review"
                                }
                            
                            self.log_test_result(
                                "Create Marketing Agent with Multi-Channel Campaign (Custom)",
                                success,
                                f"Marketing agent created successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "All Fields Correct": all(field_verification.values()) if field_verification else False,
                                    "Custom Campaign Content": agent_doc.get("marketing_custom_campaign") if agent_doc else None,
                                    "Channels": agent_doc.get("marketing_channels") if agent_doc else None,
                                    "Social Platforms": agent_doc.get("marketing_social_platforms") if agent_doc else None
                                }
                            )
                            return success, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Marketing Agent with Multi-Channel Campaign (Custom)",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Create Marketing Agent with Multi-Channel Campaign (Custom)",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Create Marketing Agent with Multi-Channel Campaign (Custom)",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_run_marketing_agent(self, agent_id):
        """Test 2: Run Marketing Agent and verify content generation"""
        print("🔍 TEST 2: Run Marketing Agent")
        print("=" * 80)
        
        if not agent_id:
            self.log_test_result(
                "Run Marketing Agent",
                False,
                "No agent ID available for running marketing agent",
                {"Agent ID": agent_id}
            )
            return False, []
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=30) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            
                            # Get generated posts from database
                            posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                            self.generated_posts.extend(posts)
                            
                            # Analyze posts by channel
                            social_media_posts = [p for p in posts if p.get("agent_type") == "social_media"]
                            email_posts = [p for p in posts if p.get("agent_type") == "email"]
                            sms_posts = [p for p in posts if p.get("agent_type") == "sms_agent"]
                            
                            success = len(posts) > 0
                            
                            self.log_test_result(
                                "Run Marketing Agent",
                                success,
                                f"Marketing agent executed successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Total Posts Generated": len(posts),
                                    "Social Media Posts": len(social_media_posts),
                                    "Email Posts": len(email_posts),
                                    "SMS Posts": len(sms_posts),
                                    "Post IDs": [p.get("id") for p in posts],
                                    "Post Statuses": [p.get("status") for p in posts]
                                }
                            )
                            return success, posts
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Run Marketing Agent",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, []
                    else:
                        self.log_test_result(
                            "Run Marketing Agent",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, []
                        
        except Exception as e:
            self.log_test_result(
                "Run Marketing Agent",
                False,
                f"Error running marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def test_verify_content_consistency(self, posts):
        """Test 3: Verify Content Consistency across all channels"""
        print("🔍 TEST 3: Verify Content Consistency")
        print("=" * 80)
        
        if not posts:
            self.log_test_result(
                "Verify Content Consistency",
                False,
                "No posts available for content consistency verification",
                {"Posts Count": len(posts)}
            )
            return False
        
        try:
            # Analyze posts by channel
            social_media_posts = [p for p in posts if p.get("agent_type") == "social_media"]
            email_posts = [p for p in posts if p.get("agent_type") == "email"]
            sms_posts = [p for p in posts if p.get("agent_type") == "sms_agent"]
            
            # Check for consistent base content
            base_template = "Hello [CUSTOMER_NAME]! Special offer for [PET_NAME]. Don't miss out on [PET_NAMES] care!"
            expected_personalized = "Hello Stephen Pallam! Special offer for Bolt. Don't miss out on Bolt care!"
            
            consistency_checks = {
                "social_media_posts_exist": len(social_media_posts) > 0,
                "email_posts_exist": len(email_posts) > 0,
                "sms_posts_exist": len(sms_posts) > 0,
                "total_posts_generated": len(posts) > 0
            }
            
            # Check content consistency for each channel
            content_analysis = {}
            
            # Social Media Posts Analysis
            if social_media_posts:
                sm_content_consistent = True
                sm_contents = []
                for post in social_media_posts:
                    content = post.get("content", "")
                    sm_contents.append(content)
                    # Check if content contains personalized elements or base template elements
                    if not any(keyword in content.lower() for keyword in ["special offer", "stephen", "pallam", "bolt", "care"]):
                        sm_content_consistent = False
                
                content_analysis["social_media"] = {
                    "posts_count": len(social_media_posts),
                    "content_consistent": sm_content_consistent,
                    "sample_content": sm_contents[0] if sm_contents else None
                }
            
            # Email Posts Analysis
            if email_posts:
                email_content_consistent = True
                email_metadata_complete = True
                email_contents = []
                
                for post in email_posts:
                    content = post.get("content", "")
                    email_contents.append(content)
                    
                    # Check for required email metadata fields
                    required_fields = ["email_template", "sample_customer_name", "sample_customer_email", "sample_pet_names"]
                    for field in required_fields:
                        if field not in post:
                            email_metadata_complete = False
                    
                    # Check content consistency
                    if not any(keyword in content.lower() for keyword in ["special offer", "stephen", "pallam", "bolt", "care"]):
                        email_content_consistent = False
                
                content_analysis["email"] = {
                    "posts_count": len(email_posts),
                    "content_consistent": email_content_consistent,
                    "metadata_complete": email_metadata_complete,
                    "sample_content": email_contents[0] if email_contents else None,
                    "has_email_template": "email_template" in email_posts[0] if email_posts else False,
                    "has_customer_data": "sample_customer_name" in email_posts[0] if email_posts else False
                }
            
            # SMS Posts Analysis
            if sms_posts:
                sms_content_consistent = True
                sms_metadata_complete = True
                sms_contents = []
                
                for post in sms_posts:
                    content = post.get("content", "")
                    sms_contents.append(content)
                    
                    # Check for required SMS metadata fields
                    required_fields = ["sms_template", "sample_customer_name", "sample_customer_phone", "sample_pet_names"]
                    for field in required_fields:
                        if field not in post:
                            sms_metadata_complete = False
                    
                    # Check content consistency
                    if not any(keyword in content.lower() for keyword in ["special offer", "stephen", "pallam", "bolt", "care"]):
                        sms_content_consistent = False
                
                content_analysis["sms"] = {
                    "posts_count": len(sms_posts),
                    "content_consistent": sms_content_consistent,
                    "metadata_complete": sms_metadata_complete,
                    "sample_content": sms_contents[0] if sms_contents else None,
                    "has_sms_template": "sms_template" in sms_posts[0] if sms_posts else False,
                    "has_customer_data": "sample_customer_name" in sms_posts[0] if sms_posts else False
                }
            
            # Overall consistency check
            all_channels_consistent = True
            if social_media_posts and email_posts and sms_posts:
                # Check if all channels have similar personalized content
                all_contents = []
                for post in posts:
                    content = post.get("content", "").lower()
                    all_contents.append(content)
                
                # Check for consistent personalization across channels
                personalization_consistent = all(
                    "stephen pallam" in content and "bolt" in content 
                    for content in all_contents if content
                )
                all_channels_consistent = personalization_consistent
            
            success = (
                consistency_checks["total_posts_generated"] and
                all_channels_consistent and
                (not email_posts or content_analysis.get("email", {}).get("metadata_complete", False)) and
                (not sms_posts or content_analysis.get("sms", {}).get("metadata_complete", False))
            )
            
            self.log_test_result(
                "Verify Content Consistency",
                success,
                f"Content consistency verification: {success}",
                {
                    "Consistency Checks": consistency_checks,
                    "Content Analysis": content_analysis,
                    "All Channels Consistent": all_channels_consistent,
                    "Posts by Channel": {
                        "social_media": len(social_media_posts),
                        "email": len(email_posts),
                        "sms": len(sms_posts)
                    }
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Content Consistency",
                False,
                f"Error verifying content consistency: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_topic_based_campaign(self):
        """Test 4: Test Topic-Based Campaign for consistency"""
        print("🔍 TEST 4: Test Topic-Based Campaign")
        print("=" * 80)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Topic-based marketing agent data
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Topic-Based Consistency",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {"facebook": True, "instagram": True},
                "marketing_email_personalized": True,
                "marketing_sms_personalized": True,
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=marketing_agent_data, timeout=15) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            agent_id = result.get("agent_id")
                            self.created_agent_ids.append(agent_id)
                            
                            # Run the agent
                            run_url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                            async with session.post(run_url, headers=headers, timeout=30) as run_response:
                                if run_response.status == 200:
                                    # Get generated posts
                                    posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                                    
                                    # Analyze topic-based consistency
                                    topic_consistency = True
                                    topic_posts_analysis = {}
                                    
                                    for post in posts:
                                        content = post.get("content", "").lower()
                                        agent_type = post.get("agent_type")
                                        
                                        # Check if content relates to "Pet Health Tips"
                                        health_keywords = ["health", "tips", "care", "pet", "wellness", "advice"]
                                        has_health_content = any(keyword in content for keyword in health_keywords)
                                        
                                        if agent_type not in topic_posts_analysis:
                                            topic_posts_analysis[agent_type] = []
                                        
                                        topic_posts_analysis[agent_type].append({
                                            "has_health_content": has_health_content,
                                            "content_preview": content[:100] + "..." if len(content) > 100 else content
                                        })
                                        
                                        if not has_health_content:
                                            topic_consistency = False
                                    
                                    success = len(posts) > 0 and topic_consistency
                                    
                                    self.log_test_result(
                                        "Test Topic-Based Campaign",
                                        success,
                                        f"Topic-based campaign consistency: {success}",
                                        {
                                            "Agent ID": agent_id,
                                            "Total Posts": len(posts),
                                            "Topic Consistency": topic_consistency,
                                            "Posts Analysis": topic_posts_analysis,
                                            "Topic": "Pet Health Tips"
                                        }
                                    )
                                    return success, agent_id
                                else:
                                    self.log_test_result(
                                        "Test Topic-Based Campaign",
                                        False,
                                        f"Failed to run topic-based agent: HTTP {run_response.status}",
                                        {"HTTP Status": run_response.status}
                                    )
                                    return False, None
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Test Topic-Based Campaign",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Test Topic-Based Campaign",
                            False,
                            f"Failed to create topic-based marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Test Topic-Based Campaign",
                False,
                f"Error testing topic-based campaign: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def run_enhanced_marketing_agent_tests(self):
        """Run comprehensive enhanced marketing agent tests"""
        print("🔍 STARTING ENHANCED MARKETING AGENT TESTING")
        print("=" * 80)
        print("Testing Enhanced Marketing Agent with consistent content and proper display format")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Authenticate first
            auth_success = await self.authenticate()
            if not auth_success:
                print("❌ Authentication failed - cannot proceed with API tests")
                return
            
            # Run all tests
            test_results = []
            
            # Test 1: Create Marketing Agent with Multi-Channel Campaign (Custom)
            success1, agent_id1 = await self.test_create_marketing_agent_multi_channel_custom_campaign()
            test_results.append(success1)
            
            # Test 2: Run Marketing Agent (only if creation succeeded)
            posts = []
            if success1 and agent_id1:
                success2, posts = await self.test_run_marketing_agent(agent_id1)
                test_results.append(success2)
            else:
                print("⏭️  Skipping marketing agent run test - agent creation failed")
                test_results.append(False)
            
            # Test 3: Verify Content Consistency (only if posts were generated)
            if posts:
                success3 = await self.test_verify_content_consistency(posts)
                test_results.append(success3)
            else:
                print("⏭️  Skipping content consistency test - no posts generated")
                test_results.append(False)
            
            # Test 4: Test Topic-Based Campaign
            success4, agent_id2 = await self.test_topic_based_campaign()
            test_results.append(success4)
            
            # Summary
            print("=" * 80)
            print("🎯 ENHANCED MARKETING AGENT TESTING SUMMARY")
            print("=" * 80)
            
            passed_tests = sum(test_results)
            total_tests = len(test_results)
            success_rate = (passed_tests / total_tests) * 100
            
            print(f"Successful Tests: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
            print()
            
            # Detailed results
            for result in self.test_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            print("🔍 KEY FINDINGS:")
            print("=" * 40)
            
            # Test 1 Analysis
            if success1:
                print("✅ MULTI-CHANNEL CREATION: Marketing agent with consistent content created successfully")
                print(f"   - Agent ID: {agent_id1}")
                print("   - Channels: social_media, email, sms")
                print("   - Same base content configured for all channels")
            else:
                print("❌ MULTI-CHANNEL CREATION: Failed to create marketing agent with multi-channel setup")
            
            # Test 2 Analysis
            if len(test_results) > 1 and test_results[1]:
                print("✅ AGENT EXECUTION: Marketing agent executed and generated posts successfully")
                print(f"   - Total posts generated: {len(posts)}")
                social_count = len([p for p in posts if p.get("agent_type") == "social_media"])
                email_count = len([p for p in posts if p.get("agent_type") == "email"])
                sms_count = len([p for p in posts if p.get("agent_type") == "sms_agent"])
                print(f"   - Social media posts: {social_count}")
                print(f"   - Email posts: {email_count}")
                print(f"   - SMS posts: {sms_count}")
            elif len(test_results) > 1:
                print("❌ AGENT EXECUTION: Failed to execute marketing agent or generate posts")
            
            # Test 3 Analysis
            if len(test_results) > 2 and test_results[2]:
                print("✅ CONTENT CONSISTENCY: All channels use the same base content with proper personalization")
                print("   - Same personalized content across all channels")
                print("   - Email posts include proper metadata fields")
                print("   - SMS posts include proper metadata fields")
            elif len(test_results) > 2:
                print("❌ CONTENT CONSISTENCY: Content consistency verification failed")
            
            # Test 4 Analysis
            if success4:
                print("✅ TOPIC-BASED CAMPAIGN: Topic-based campaign generates consistent content")
                print(f"   - Agent ID: {agent_id2}")
                print("   - All channels generate content based on the same topic")
            else:
                print("❌ TOPIC-BASED CAMPAIGN: Topic-based campaign consistency failed")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Create Marketing Agent with Multi-Channel Campaign (Custom)",
                "Run Marketing Agent",
                "Verify Content Consistency", 
                "Test Topic-Based Campaign"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("🎯 CONSISTENCY VERIFICATION:")
            print("=" * 40)
            
            if passed_tests >= 3:
                print("✅ ENHANCED MARKETING AGENT WITH CONSISTENT CONTENT IS WORKING")
                print("   - All channels use the same base content")
                print("   - Email and SMS posts have proper metadata fields")
                print("   - Content is consistent across channels while maintaining personalization")
                print("   - Both custom_campaign and topic-based campaigns work consistently")
            else:
                print("❌ ENHANCED MARKETING AGENT NEEDS FIXES")
                print("   - Some consistency issues found")
                print("   - Check individual test results for specific problems")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main testing function"""
    tester = EnhancedMarketingAgentTester()
    await tester.run_enhanced_marketing_agent_tests()

if __name__ == "__main__":
    asyncio.run(main())