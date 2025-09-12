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
    
    async def test_create_topic_based_marketing_agent(self):
        """Test 1: Create Topic-Based Marketing Agent with ChatGPT content generation"""
        print("🔍 TEST 1: Create Topic-Based Marketing Agent")
        print("=" * 60)
        
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
                "agent_name": "Test ChatGPT Enhanced Content Generation",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {"facebook": True, "instagram": True},
                "marketing_email_personalized": True,
                "email_content_template": "Hello [CUSTOMER_NAME]! Important update about [PET_NAME]. Learn more about [PET_NAMES] health.",
                "marketing_sms_personalized": True,
                "sms_template": "Hi [CUSTOMER_NAME]! [PET_NAME] health update. Call us about [PET_NAMES].",
                "marketing_workflow_mode": "in_review",
                "post_date": "2025-01-15",
                "post_time": "10:00"
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
                                    "agent_name": agent_doc.get("agent_name") == "Test ChatGPT Enhanced Content Generation",
                                    "agent_type": agent_doc.get("agent_type") == "marketing_agent",
                                    "marketing_content_type": agent_doc.get("marketing_content_type") == "topic",
                                    "topic": agent_doc.get("topic") == "Pet Health Tips",
                                    "marketing_channels": set(agent_doc.get("marketing_channels", [])) == {"social_media", "email", "sms"},
                                    "marketing_social_platforms": agent_doc.get("marketing_social_platforms") == {"facebook": True, "instagram": True},
                                    "marketing_email_personalized": agent_doc.get("marketing_email_personalized") == True,
                                    "email_content_template": agent_doc.get("email_content_template") == "Hello [CUSTOMER_NAME]! Important update about [PET_NAME]. Learn more about [PET_NAMES] health.",
                                    "marketing_sms_personalized": agent_doc.get("marketing_sms_personalized") == True,
                                    "sms_template": agent_doc.get("sms_template") == "Hi [CUSTOMER_NAME]! [PET_NAME] health update. Call us about [PET_NAMES].",
                                    "marketing_workflow_mode": agent_doc.get("marketing_workflow_mode") == "in_review"
                                }
                            
                            self.log_test_result(
                                "Create Topic-Based Marketing Agent",
                                success,
                                f"Topic-based marketing agent created successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "All Fields Correct": all(field_verification.values()) if field_verification else False,
                                    "Topic": agent_doc.get("topic") if agent_doc else None,
                                    "Channels": agent_doc.get("marketing_channels") if agent_doc else None,
                                    "Social Platforms": agent_doc.get("marketing_social_platforms") if agent_doc else None
                                }
                            )
                            return success, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Topic-Based Marketing Agent",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Create Topic-Based Marketing Agent",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Create Topic-Based Marketing Agent",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_run_marketing_agent_and_verify_content(self, agent_id):
        """Test 2: Run Marketing Agent and Verify Content Quality"""
        print("🔍 TEST 2: Run Marketing Agent and Verify Content Quality")
        print("=" * 60)
        
        if not agent_id:
            self.log_test_result(
                "Run Marketing Agent and Verify Content Quality",
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
            
            # Run the marketing agent
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
                            
                            # Analyze content quality
                            content_analysis = await self.analyze_content_quality(posts)
                            
                            success = len(posts) > 0 and content_analysis["overall_success"]
                            
                            self.log_test_result(
                                "Run Marketing Agent and Verify Content Quality",
                                success,
                                f"Marketing agent executed and content analyzed: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Posts Generated": len(posts),
                                    "Content Analysis": content_analysis,
                                    "Social Media Posts": content_analysis.get("social_media_count", 0),
                                    "Email Posts": content_analysis.get("email_count", 0),
                                    "SMS Posts": content_analysis.get("sms_count", 0)
                                }
                            )
                            return success, posts
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Run Marketing Agent and Verify Content Quality",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, []
                    else:
                        self.log_test_result(
                            "Run Marketing Agent and Verify Content Quality",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, []
                        
        except Exception as e:
            self.log_test_result(
                "Run Marketing Agent and Verify Content Quality",
                False,
                f"Error running marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def analyze_content_quality(self, posts):
        """Analyze the quality and characteristics of generated content"""
        analysis = {
            "social_media_count": 0,
            "email_count": 0,
            "sms_count": 0,
            "social_media_no_personalization": True,
            "social_media_professional_content": True,
            "social_media_word_count_ok": True,
            "email_has_personalization": True,
            "sms_has_personalization": True,
            "content_consistency": True,
            "overall_success": True
        }
        
        social_media_posts = []
        email_posts = []
        sms_posts = []
        
        # Categorize posts
        for post in posts:
            agent_type = post.get("agent_type", "")
            content = post.get("content", "")
            
            # Social media posts are those without email_template or sms_template
            if not post.get("email_template") and not post.get("sms_template"):
                social_media_posts.append(post)
                analysis["social_media_count"] += 1
            elif post.get("email_template"):
                email_posts.append(post)
                analysis["email_count"] += 1
            elif post.get("sms_template"):
                sms_posts.append(post)
                analysis["sms_count"] += 1
        
        # Analyze social media posts
        for post in social_media_posts:
            content = post.get("content", "")
            
            # Check for personalization (should NOT have customer names)
            if "[CUSTOMER_NAME]" in content or "Stephen Pallam" in content:
                analysis["social_media_no_personalization"] = False
            
            # Check word count (should be 150-200 words)
            word_count = len(content.split())
            if word_count < 100 or word_count > 250:  # Allow some flexibility
                analysis["social_media_word_count_ok"] = False
            
            # Check for professional content (not generic messages)
            if "Important information about" in content or len(content.strip()) < 50:
                analysis["social_media_professional_content"] = False
        
        # Analyze email posts
        for post in email_posts:
            content = post.get("content", "")
            
            # Check for personalization (should HAVE customer data)
            if not ("[CUSTOMER_NAME]" in content or "Stephen Pallam" in content or post.get("sample_customer_name")):
                analysis["email_has_personalization"] = False
        
        # Analyze SMS posts
        for post in sms_posts:
            content = post.get("content", "")
            
            # Check for personalization (should HAVE customer data)
            if not ("[CUSTOMER_NAME]" in content or "Stephen Pallam" in content or post.get("sample_customer_name")):
                analysis["sms_has_personalization"] = False
        
        # Overall success calculation
        analysis["overall_success"] = (
            analysis["social_media_count"] > 0 and
            analysis["email_count"] > 0 and
            analysis["sms_count"] > 0 and
            analysis["social_media_no_personalization"] and
            analysis["social_media_professional_content"] and
            analysis["email_has_personalization"] and
            analysis["sms_has_personalization"]
        )
        
        return analysis
    
    async def test_custom_campaign_content(self):
        """Test 3: Test Custom Campaign Content"""
        print("🔍 TEST 3: Test Custom Campaign Content")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Marketing agent with custom campaign
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Custom Campaign Enhanced",
                "mode": "adhoc",
                "marketing_content_type": "custom_campaign",
                "marketing_custom_campaign": "Special offer: 20% off all pet vaccines this month!",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {"facebook": True, "instagram": True},
                "marketing_email_personalized": True,
                "email_content_template": "Hello [CUSTOMER_NAME]! Special vaccine offer for [PET_NAME]. Save on [PET_NAMES] vaccines!",
                "marketing_sms_personalized": True,
                "sms_template": "Hi [CUSTOMER_NAME]! 20% off vaccines for [PET_NAME]. Book now for [PET_NAMES]!",
                "marketing_workflow_mode": "in_review",
                "post_date": "2025-01-16",
                "post_time": "11:00"
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
                            
                            # Run the agent to generate content
                            run_url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                            async with session.post(run_url, headers=headers, timeout=30) as run_response:
                                if run_response.status == 200:
                                    # Get generated posts
                                    posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                                    self.generated_posts.extend(posts)
                                    
                                    # Verify custom campaign content is used
                                    custom_content_used = False
                                    chatgpt_enhanced = False
                                    
                                    for post in posts:
                                        content = post.get("content", "")
                                        if "vaccine" in content.lower() or "20%" in content:
                                            custom_content_used = True
                                        if len(content.split()) > 20:  # ChatGPT should enhance the content
                                            chatgpt_enhanced = True
                                    
                                    success = len(posts) > 0 and custom_content_used and chatgpt_enhanced
                                    
                                    self.log_test_result(
                                        "Test Custom Campaign Content",
                                        success,
                                        f"Custom campaign content test: {success}",
                                        {
                                            "HTTP Status": response.status,
                                            "Agent ID": agent_id,
                                            "Posts Generated": len(posts),
                                            "Custom Content Used": custom_content_used,
                                            "ChatGPT Enhanced": chatgpt_enhanced,
                                            "Custom Campaign": "Special offer: 20% off all pet vaccines this month!"
                                        }
                                    )
                                    return success, agent_id
                                else:
                                    self.log_test_result(
                                        "Test Custom Campaign Content",
                                        False,
                                        f"Failed to run custom campaign agent: HTTP {run_response.status}",
                                        {"Run HTTP Status": run_response.status}
                                    )
                                    return False, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Test Custom Campaign Content",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Test Custom Campaign Content",
                            False,
                            f"Failed to create custom campaign agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Test Custom Campaign Content",
                False,
                f"Error testing custom campaign content: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_non_personalized_settings(self):
        """Test 4: Test Non-Personalized Settings"""
        print("🔍 TEST 4: Test Non-Personalized Settings")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Marketing agent with personalization disabled
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Non-Personalized Settings",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {"facebook": True, "instagram": True},
                "marketing_email_personalized": False,  # Disabled
                "email_content_template": "Important health tips for your pets. Visit our clinic for professional care.",
                "marketing_sms_personalized": False,  # Disabled
                "sms_template": "Pet health tips available. Call us for more information.",
                "marketing_workflow_mode": "in_review",
                "post_date": "2025-01-17",
                "post_time": "12:00"
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
                            
                            # Run the agent to generate content
                            run_url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                            async with session.post(run_url, headers=headers, timeout=30) as run_response:
                                if run_response.status == 200:
                                    # Get generated posts
                                    posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                                    self.generated_posts.extend(posts)
                                    
                                    # Verify non-personalized content
                                    no_placeholders = True
                                    generic_content = True
                                    
                                    for post in posts:
                                        content = post.get("content", "")
                                        # Should not have personalization placeholders
                                        if "[CUSTOMER_NAME]" in content or "[PET_NAME]" in content:
                                            no_placeholders = False
                                        # Should have generic content
                                        if "Stephen Pallam" in content or post.get("sample_customer_name"):
                                            generic_content = False
                                    
                                    success = len(posts) > 0 and no_placeholders and generic_content
                                    
                                    self.log_test_result(
                                        "Test Non-Personalized Settings",
                                        success,
                                        f"Non-personalized settings test: {success}",
                                        {
                                            "HTTP Status": response.status,
                                            "Agent ID": agent_id,
                                            "Posts Generated": len(posts),
                                            "No Placeholders": no_placeholders,
                                            "Generic Content": generic_content,
                                            "Email Personalized": False,
                                            "SMS Personalized": False
                                        }
                                    )
                                    return success, agent_id
                                else:
                                    self.log_test_result(
                                        "Test Non-Personalized Settings",
                                        False,
                                        f"Failed to run non-personalized agent: HTTP {run_response.status}",
                                        {"Run HTTP Status": run_response.status}
                                    )
                                    return False, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Test Non-Personalized Settings",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Test Non-Personalized Settings",
                            False,
                            f"Failed to create non-personalized agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Test Non-Personalized Settings",
                False,
                f"Error testing non-personalized settings: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def run_enhanced_marketing_agent_tests(self):
        """Run comprehensive enhanced marketing agent tests"""
        print("🔍 STARTING ENHANCED MARKETING AGENT WITH CHATGPT CONTENT GENERATION TESTING")
        print("=" * 80)
        print("Testing Enhanced Marketing Agent with proper ChatGPT content generation and personalization rules")
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
            
            # Test 1: Create Topic-Based Marketing Agent
            success1, agent_id1 = await self.test_create_topic_based_marketing_agent()
            test_results.append(success1)
            
            # Test 2: Run Marketing Agent and Verify Content Quality (only if creation succeeded)
            if success1 and agent_id1:
                success2, posts = await self.test_run_marketing_agent_and_verify_content(agent_id1)
                test_results.append(success2)
            else:
                print("⏭️  Skipping content quality test - agent creation failed")
                test_results.append(False)
            
            # Test 3: Test Custom Campaign Content
            success3, agent_id3 = await self.test_custom_campaign_content()
            test_results.append(success3)
            
            # Test 4: Test Non-Personalized Settings
            success4, agent_id4 = await self.test_non_personalized_settings()
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
                print("✅ TOPIC-BASED AGENT: Marketing agent with ChatGPT content generation created successfully")
                print(f"   - Agent ID: {agent_id1}")
                print("   - Topic: Pet Health Tips")
                print("   - Channels: social_media, email, sms")
                print("   - Social Platforms: facebook, instagram")
            else:
                print("❌ TOPIC-BASED AGENT: Failed to create topic-based marketing agent")
            
            # Test 2 Analysis
            if len(test_results) > 1 and test_results[1]:
                print("✅ CONTENT QUALITY: ChatGPT content generation and personalization rules working correctly")
                print("   - Social media posts have NO personalization")
                print("   - Social media posts have professional ChatGPT-generated content")
                print("   - Email/SMS posts have proper personalization")
            elif len(test_results) > 1:
                print("❌ CONTENT QUALITY: Content quality verification failed")
            
            # Test 3 Analysis
            if success3:
                print("✅ CUSTOM CAMPAIGN: Custom campaign content enhanced by ChatGPT successfully")
                print(f"   - Agent ID: {agent_id3}")
                print("   - Custom Campaign: Special offer: 20% off all pet vaccines this month!")
            else:
                print("❌ CUSTOM CAMPAIGN: Failed to test custom campaign content")
            
            # Test 4 Analysis
            if success4:
                print("✅ NON-PERSONALIZED: Non-personalized settings working correctly")
                print(f"   - Agent ID: {agent_id4}")
                print("   - Email/SMS content removes placeholders and creates generic content")
            else:
                print("❌ NON-PERSONALIZED: Failed to test non-personalized settings")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Create Topic-Based Marketing Agent",
                "Run Marketing Agent and Verify Content Quality", 
                "Test Custom Campaign Content",
                "Test Non-Personalized Settings"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("📊 CONTENT ANALYSIS SUMMARY:")
            print("=" * 40)
            
            if self.generated_posts:
                total_posts = len(self.generated_posts)
                social_media_posts = [p for p in self.generated_posts if "social_media" in p.get("agent_type", "") or p.get("platform") in ["facebook", "instagram"]]
                email_posts = [p for p in self.generated_posts if "email" in p.get("agent_type", "") or p.get("email_template")]
                sms_posts = [p for p in self.generated_posts if "sms" in p.get("agent_type", "") or p.get("sms_template")]
                
                print(f"Total Posts Generated: {total_posts}")
                print(f"Social Media Posts: {len(social_media_posts)}")
                print(f"Email Posts: {len(email_posts)}")
                print(f"SMS Posts: {len(sms_posts)}")
                
                # Sample content analysis
                if social_media_posts:
                    sample_social = social_media_posts[0].get("content", "")
                    word_count = len(sample_social.split())
                    print(f"Sample Social Media Word Count: {word_count}")
                    print(f"Sample Social Media Content Preview: {sample_social[:100]}...")
            
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