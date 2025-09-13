#!/usr/bin/env python3
"""
Marketing Campaign Duplicate Prevention Testing

This test comprehensively tests the DUPLICATE PREVENTION fix for Marketing Campaign generation:

Test Focus:
1. Test Duplicate Prevention - Only 4 posts created (1 Facebook + 1 Instagram + 1 Email + 1 SMS)
2. Test Rapid Fire Prevention - Second run within 30 seconds should be skipped
3. Verify Post Quality - Check proper channel labels and fields
4. Database Verification - Count posts by agent_id and verify channel breakdown
5. Content Quality Check - Verify ChatGPT content and proper formatting

Expected Results:
- Only 4 posts created per agent (no duplicates)
- Rapid fire attempts are blocked with appropriate message
- All posts have proper channel labels and platform fields
- Content quality is maintained with proper personalization
"""

import asyncio
import sys
import os
import json
import aiohttp
import ssl
import time
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

class MarketingCampaignDuplicatePreventionTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://marketing-agent.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_ids = []
        
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
    
    async def cleanup_test_data(self):
        """Clean up test data before starting tests"""
        try:
            # Remove any existing test agents and posts
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Duplicate Prevention"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Duplicate Prevention"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def test_duplicate_prevention_basic(self):
        """Test 1: Basic Duplicate Prevention - Only 4 posts created"""
        print("🔍 TEST 1: Basic Duplicate Prevention")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with 2 social platforms + email + SMS
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Duplicate Prevention Agent 1",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {
                    "facebook": True,
                    "instagram": True,
                    "twitter": False,
                    "whatsapp": False
                },
                "marketing_email_personalized": True,
                "email_content_template": "Hello [CUSTOMER_NAME]! Important health tips for [PET_NAME]. Visit [WEBSITE_LINK] for more info.",
                "marketing_sms_personalized": True,
                "sms_template": "Hi [CUSTOMER_NAME]! [PET_NAME] health tips available. Call [PHONE_NUMBER].",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Basic Duplicate Prevention - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Wait a moment for agent creation to complete
                await asyncio.sleep(2)
                
                # Run the marketing campaign generation
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Basic Duplicate Prevention - Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    campaign_result = await response.json()
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to verify post count and structure
                posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                
                # Analyze posts
                total_posts = len(posts)
                social_media_posts = [p for p in posts if p.get("marketing_channel") == "social_media"]
                email_posts = [p for p in posts if p.get("marketing_channel") == "email"]
                sms_posts = [p for p in posts if p.get("marketing_channel") == "sms"]
                
                facebook_posts = [p for p in social_media_posts if p.get("platform") == "facebook"]
                instagram_posts = [p for p in social_media_posts if p.get("platform") == "instagram"]
                
                # Verify expected counts
                expected_total = 4  # 1 Facebook + 1 Instagram + 1 Email + 1 SMS
                success = (
                    total_posts == expected_total and
                    len(social_media_posts) == 2 and
                    len(email_posts) == 1 and
                    len(sms_posts) == 1 and
                    len(facebook_posts) == 1 and
                    len(instagram_posts) == 1
                )
                
                self.log_test_result(
                    "Basic Duplicate Prevention",
                    success,
                    f"Post count verification: {success}",
                    {
                        "Expected Total Posts": expected_total,
                        "Actual Total Posts": total_posts,
                        "Social Media Posts": len(social_media_posts),
                        "Email Posts": len(email_posts),
                        "SMS Posts": len(sms_posts),
                        "Facebook Posts": len(facebook_posts),
                        "Instagram Posts": len(instagram_posts),
                        "Agent ID": agent_id,
                        "Campaign Result": campaign_result.get("message", "No message"),
                        "All Posts Have Proper Channels": all(p.get("marketing_channel") in ["social_media", "email", "sms"] for p in posts),
                        "Social Media Posts Have Platforms": all(p.get("platform") in ["facebook", "instagram"] for p in social_media_posts)
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Basic Duplicate Prevention",
                False,
                f"Error in basic duplicate prevention test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_rapid_fire_prevention(self):
        """Test 2: Rapid Fire Prevention - Second run within 30 seconds should be skipped"""
        print("🔍 TEST 2: Rapid Fire Prevention")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent for rapid fire test
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Duplicate Prevention Agent 2 - Rapid Fire",
                "marketing_content_type": "topic",
                "topic": "Pet Nutrition",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {
                    "facebook": True,
                    "instagram": True,
                    "twitter": False,
                    "whatsapp": False
                },
                "marketing_email_personalized": True,
                "email_content_template": "Hello [CUSTOMER_NAME]! Nutrition tips for [PET_NAME]. Visit [WEBSITE_LINK].",
                "marketing_sms_personalized": True,
                "sms_template": "Hi [CUSTOMER_NAME]! [PET_NAME] nutrition info. Call [PHONE_NUMBER].",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Rapid Fire Prevention - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Wait a moment for agent creation to complete
                await asyncio.sleep(2)
                
                # First run - should succeed
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Rapid Fire Prevention - First Run",
                            False,
                            f"Failed first campaign run: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    first_result = await response.json()
                
                # Wait for first run to complete
                await asyncio.sleep(3)
                
                # Count posts after first run
                posts_after_first = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                first_run_count = len(posts_after_first)
                
                # Second run immediately (within 30 seconds) - should be skipped
                async with session.post(url, headers=headers, timeout=60) as response:
                    second_result = await response.json()
                    second_status = response.status
                
                # Wait a moment
                await asyncio.sleep(2)
                
                # Count posts after second run
                posts_after_second = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                second_run_count = len(posts_after_second)
                
                # Verify rapid fire prevention
                success = (
                    first_run_count == 4 and  # First run should create 4 posts
                    second_run_count == 4 and  # Second run should not create additional posts
                    first_run_count == second_run_count and  # Post count should remain the same
                    (second_result.get("status") == "skipped" or 
                     "skipped" in second_result.get("message", "").lower() or
                     "recent execution" in second_result.get("message", "").lower())
                )
                
                self.log_test_result(
                    "Rapid Fire Prevention",
                    success,
                    f"Rapid fire prevention: {success}",
                    {
                        "First Run Posts": first_run_count,
                        "Second Run Posts": second_run_count,
                        "Posts Count Unchanged": first_run_count == second_run_count,
                        "Second Run Status": second_result.get("status", "unknown"),
                        "Second Run Message": second_result.get("message", "No message"),
                        "Second Run HTTP Status": second_status,
                        "Agent ID": agent_id,
                        "Duplicate Prevention Working": success
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Rapid Fire Prevention",
                False,
                f"Error in rapid fire prevention test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_post_quality_verification(self):
        """Test 3: Verify Post Quality - Check proper channel labels and fields"""
        print("🔍 TEST 3: Post Quality Verification")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent for quality verification
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Duplicate Prevention Agent 3 - Quality Check",
                "marketing_content_type": "custom_campaign",
                "marketing_custom_campaign": "Special offer for [CUSTOMER_NAME] and [PET_NAME]! 20% off all services for [PET_NAMES].",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {
                    "facebook": True,
                    "instagram": True,
                    "twitter": False,
                    "whatsapp": False
                },
                "marketing_email_personalized": True,
                "email_content_template": "Dear [CUSTOMER_NAME], [CHATGPT_CONTENT] Best regards, [BUSINESS_NAME]",
                "marketing_sms_personalized": True,
                "sms_template": "Hi [CUSTOMER_NAME]! [CHATGPT_CONTENT] Call [PHONE_NUMBER]",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Post Quality Verification - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Wait a moment for agent creation to complete
                await asyncio.sleep(2)
                
                # Run the marketing campaign generation
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Post Quality Verification - Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to verify post quality
                posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                
                # Analyze post quality
                quality_checks = {
                    "all_posts_have_content": all(p.get("content", "").strip() != "" for p in posts),
                    "all_posts_have_marketing_channel": all(p.get("marketing_channel") in ["social_media", "email", "sms"] for p in posts),
                    "all_posts_have_status": all(p.get("status") in ["in_review", "ready_to_publish", "generating"] for p in posts),
                    "social_posts_have_platform": all(p.get("platform") in ["facebook", "instagram"] for p in posts if p.get("marketing_channel") == "social_media"),
                    "email_posts_have_subject": all(p.get("email_subject", "").strip() != "" for p in posts if p.get("marketing_channel") == "email"),
                    "email_posts_have_template": all(p.get("email_template", "").strip() != "" for p in posts if p.get("marketing_channel") == "email"),
                    "sms_posts_have_template": all(p.get("sms_template", "").strip() != "" for p in posts if p.get("marketing_channel") == "sms"),
                    "personalized_posts_have_customer_data": True  # Will check below
                }
                
                # Check personalization data
                email_posts = [p for p in posts if p.get("marketing_channel") == "email"]
                sms_posts = [p for p in posts if p.get("marketing_channel") == "sms"]
                
                email_personalization_ok = all(
                    p.get("sample_customer_name", "").strip() != "" and
                    p.get("sample_customer_email", "").strip() != ""
                    for p in email_posts
                )
                
                sms_personalization_ok = all(
                    p.get("sample_customer_name", "").strip() != "" and
                    p.get("sample_customer_phone", "").strip() != ""
                    for p in sms_posts
                )
                
                quality_checks["personalized_posts_have_customer_data"] = email_personalization_ok and sms_personalization_ok
                
                # Check content quality (no empty content, reasonable length)
                content_quality_ok = all(
                    len(p.get("content", "")) > 20  # At least 20 characters
                    for p in posts
                )
                quality_checks["content_has_reasonable_length"] = content_quality_ok
                
                success = all(quality_checks.values()) and len(posts) == 4
                
                self.log_test_result(
                    "Post Quality Verification",
                    success,
                    f"Post quality verification: {success}",
                    {
                        "Total Posts": len(posts),
                        "All Posts Have Content": quality_checks["all_posts_have_content"],
                        "All Posts Have Marketing Channel": quality_checks["all_posts_have_marketing_channel"],
                        "All Posts Have Status": quality_checks["all_posts_have_status"],
                        "Social Posts Have Platform": quality_checks["social_posts_have_platform"],
                        "Email Posts Have Subject": quality_checks["email_posts_have_subject"],
                        "Email Posts Have Template": quality_checks["email_posts_have_template"],
                        "SMS Posts Have Template": quality_checks["sms_posts_have_template"],
                        "Personalized Posts Have Customer Data": quality_checks["personalized_posts_have_customer_data"],
                        "Content Has Reasonable Length": quality_checks["content_has_reasonable_length"],
                        "Agent ID": agent_id,
                        "Email Posts Count": len(email_posts),
                        "SMS Posts Count": len(sms_posts),
                        "Social Media Posts Count": len([p for p in posts if p.get("marketing_channel") == "social_media"])
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Post Quality Verification",
                False,
                f"Error in post quality verification test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_database_verification(self):
        """Test 4: Database Verification - Count posts by agent_id and verify channel breakdown"""
        print("🔍 TEST 4: Database Verification")
        print("=" * 60)
        
        try:
            # Verify all created agents have correct post counts
            verification_results = {}
            
            for agent_id in self.created_agent_ids:
                posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                
                # Count by channel
                channel_counts = {}
                platform_counts = {}
                
                for post in posts:
                    channel = post.get("marketing_channel", "unknown")
                    platform = post.get("platform", "unknown")
                    
                    channel_counts[channel] = channel_counts.get(channel, 0) + 1
                    if platform != "unknown":
                        platform_counts[platform] = platform_counts.get(platform, 0) + 1
                
                verification_results[agent_id] = {
                    "total_posts": len(posts),
                    "channel_counts": channel_counts,
                    "platform_counts": platform_counts,
                    "expected_total": 4,
                    "expected_channels": {"social_media": 2, "email": 1, "sms": 1},
                    "expected_platforms": {"facebook": 1, "instagram": 1}
                }
            
            # Verify all agents have correct counts
            all_correct = True
            for agent_id, results in verification_results.items():
                if (results["total_posts"] != results["expected_total"] or
                    results["channel_counts"] != results["expected_channels"] or
                    results["platform_counts"] != results["expected_platforms"]):
                    all_correct = False
                    break
            
            # Additional database integrity checks
            all_posts = await self.db.ai_posts.find({"agent_id": {"$in": self.created_agent_ids}}).to_list(length=None)
            
            integrity_checks = {
                "no_posts_without_agent_id": all(p.get("agent_id") for p in all_posts),
                "no_posts_without_marketing_channel": all(p.get("marketing_channel") for p in all_posts),
                "all_posts_have_created_at": all(p.get("created_at") for p in all_posts),
                "all_posts_have_updated_at": all(p.get("updated_at") for p in all_posts),
                "no_duplicate_post_ids": len(set(p.get("id") for p in all_posts)) == len(all_posts)
            }
            
            success = all_correct and all(integrity_checks.values())
            
            self.log_test_result(
                "Database Verification",
                success,
                f"Database verification: {success}",
                {
                    "Total Agents Tested": len(self.created_agent_ids),
                    "All Agents Have Correct Post Counts": all_correct,
                    "Total Posts in Database": len(all_posts),
                    "No Posts Without Agent ID": integrity_checks["no_posts_without_agent_id"],
                    "No Posts Without Marketing Channel": integrity_checks["no_posts_without_marketing_channel"],
                    "All Posts Have Created At": integrity_checks["all_posts_have_created_at"],
                    "All Posts Have Updated At": integrity_checks["all_posts_have_updated_at"],
                    "No Duplicate Post IDs": integrity_checks["no_duplicate_post_ids"],
                    "Verification Results": verification_results
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Database Verification",
                False,
                f"Error in database verification test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_content_quality_check(self):
        """Test 5: Content Quality Check - Verify ChatGPT content and proper formatting"""
        print("🔍 TEST 5: Content Quality Check")
        print("=" * 60)
        
        try:
            # Get all posts from our test agents
            all_posts = await self.db.ai_posts.find({"agent_id": {"$in": self.created_agent_ids}}).to_list(length=None)
            
            content_quality_results = {
                "posts_analyzed": len(all_posts),
                "email_posts_analyzed": 0,
                "sms_posts_analyzed": 0,
                "social_posts_analyzed": 0,
                "email_subjects_clean": 0,
                "sms_within_limits": 0,
                "social_platform_specific": 0,
                "placeholder_replacement_working": 0,
                "chatgpt_content_present": 0
            }
            
            for post in all_posts:
                channel = post.get("marketing_channel", "")
                content = post.get("content", "")
                
                if channel == "email":
                    content_quality_results["email_posts_analyzed"] += 1
                    
                    # Check email subject cleanliness (no markdown formatting)
                    email_subject = post.get("email_subject", "")
                    if email_subject and not any(marker in email_subject for marker in ["**", "##", "Title:", "Subject:"]):
                        content_quality_results["email_subjects_clean"] += 1
                    
                elif channel == "sms":
                    content_quality_results["sms_posts_analyzed"] += 1
                    
                    # Check SMS character limits (should be under 160 chars)
                    if len(content) <= 160:
                        content_quality_results["sms_within_limits"] += 1
                    
                elif channel == "social_media":
                    content_quality_results["social_posts_analyzed"] += 1
                    
                    # Check platform-specific content (different content per platform)
                    platform = post.get("platform", "")
                    if platform in ["facebook", "instagram"] and content:
                        content_quality_results["social_platform_specific"] += 1
                
                # Check placeholder replacement (should not contain unreplaced placeholders)
                unreplaced_placeholders = ["[CUSTOMER_NAME]", "[PET_NAME]", "[PET_NAMES]", "[CHATGPT_CONTENT]"]
                if not any(placeholder in content for placeholder in unreplaced_placeholders):
                    content_quality_results["placeholder_replacement_working"] += 1
                
                # Check for ChatGPT-generated content (should have reasonable length and quality)
                if len(content) > 50 and content.strip():  # At least 50 characters of meaningful content
                    content_quality_results["chatgpt_content_present"] += 1
            
            # Calculate success rates
            email_success_rate = (content_quality_results["email_subjects_clean"] / 
                                content_quality_results["email_posts_analyzed"]) if content_quality_results["email_posts_analyzed"] > 0 else 1
            
            sms_success_rate = (content_quality_results["sms_within_limits"] / 
                              content_quality_results["sms_posts_analyzed"]) if content_quality_results["sms_posts_analyzed"] > 0 else 1
            
            social_success_rate = (content_quality_results["social_platform_specific"] / 
                                 content_quality_results["social_posts_analyzed"]) if content_quality_results["social_posts_analyzed"] > 0 else 1
            
            placeholder_success_rate = (content_quality_results["placeholder_replacement_working"] / 
                                      content_quality_results["posts_analyzed"]) if content_quality_results["posts_analyzed"] > 0 else 1
            
            content_success_rate = (content_quality_results["chatgpt_content_present"] / 
                                  content_quality_results["posts_analyzed"]) if content_quality_results["posts_analyzed"] > 0 else 1
            
            # Overall success criteria
            success = (
                email_success_rate >= 0.8 and  # 80% of email subjects should be clean
                sms_success_rate >= 0.8 and    # 80% of SMS should be within limits
                social_success_rate >= 0.8 and # 80% of social posts should be platform-specific
                placeholder_success_rate >= 0.9 and # 90% should have proper placeholder replacement
                content_success_rate >= 0.9    # 90% should have quality content
            )
            
            self.log_test_result(
                "Content Quality Check",
                success,
                f"Content quality check: {success}",
                {
                    "Posts Analyzed": content_quality_results["posts_analyzed"],
                    "Email Posts": content_quality_results["email_posts_analyzed"],
                    "SMS Posts": content_quality_results["sms_posts_analyzed"],
                    "Social Posts": content_quality_results["social_posts_analyzed"],
                    "Email Subject Success Rate": f"{email_success_rate:.2%}",
                    "SMS Character Limit Success Rate": f"{sms_success_rate:.2%}",
                    "Social Platform Specific Success Rate": f"{social_success_rate:.2%}",
                    "Placeholder Replacement Success Rate": f"{placeholder_success_rate:.2%}",
                    "Content Quality Success Rate": f"{content_success_rate:.2%}",
                    "Overall Success": success
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Content Quality Check",
                False,
                f"Error in content quality check test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_created_agents(self):
        """Clean up agents created during testing"""
        try:
            for agent_id in self.created_agent_ids:
                # Delete agent posts
                await self.db.ai_posts.delete_many({"agent_id": agent_id})
                # Delete agent
                await self.db.ai_agents.delete_one({"id": agent_id})
            print(f"🧹 Cleaned up {len(self.created_agent_ids)} test agents and their posts")
        except Exception as e:
            print(f"Warning: Could not clean up created agents: {e}")
    
    async def run_duplicate_prevention_tests(self):
        """Run comprehensive duplicate prevention tests"""
        print("🔍 STARTING MARKETING CAMPAIGN DUPLICATE PREVENTION TESTING")
        print("=" * 80)
        print("Testing DUPLICATE PREVENTION fix for Marketing Campaign generation")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Clean up any existing test data
            await self.cleanup_test_data()
            
            # Authenticate first
            auth_success = await self.authenticate()
            if not auth_success:
                print("❌ Authentication failed - cannot proceed with API tests")
                return
            
            # Run all tests
            test_results = []
            
            # Test 1: Basic Duplicate Prevention
            success1 = await self.test_duplicate_prevention_basic()
            test_results.append(success1)
            
            # Test 2: Rapid Fire Prevention
            success2 = await self.test_rapid_fire_prevention()
            test_results.append(success2)
            
            # Test 3: Post Quality Verification
            success3 = await self.test_post_quality_verification()
            test_results.append(success3)
            
            # Test 4: Database Verification
            success4 = await self.test_database_verification()
            test_results.append(success4)
            
            # Test 5: Content Quality Check
            success5 = await self.test_content_quality_check()
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 DUPLICATE PREVENTION TESTING SUMMARY")
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
            
            # Test Analysis
            test_names = [
                "Basic Duplicate Prevention",
                "Rapid Fire Prevention", 
                "Post Quality Verification",
                "Database Verification",
                "Content Quality Check"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
                
                if i == 0 and success:
                    print("   - Only 4 posts created per agent (1 Facebook + 1 Instagram + 1 Email + 1 SMS)")
                    print("   - No duplicate posts detected")
                elif i == 1 and success:
                    print("   - Second run within 30 seconds properly skipped")
                    print("   - Appropriate skip message returned")
                elif i == 2 and success:
                    print("   - All posts have proper channel labels and fields")
                    print("   - Email posts have subjects and templates")
                    print("   - SMS posts have templates and personalization")
                elif i == 3 and success:
                    print("   - Database integrity maintained")
                    print("   - Correct post counts per agent")
                elif i == 4 and success:
                    print("   - ChatGPT content properly generated")
                    print("   - Placeholder replacement working")
                    print("   - Content quality meets standards")
            
            print()
            print("🎯 DUPLICATE PREVENTION FIX STATUS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ DUPLICATE PREVENTION FIX WORKING CORRECTLY")
                print("   - Marketing campaign generation creates exactly 4 posts")
                print("   - Rapid fire attempts are properly blocked")
                print("   - All posts have proper structure and content")
                print("   - Database integrity is maintained")
                print("   - Content quality is high")
            else:
                print("❌ DUPLICATE PREVENTION FIX NEEDS ATTENTION")
                failed_tests = [test_names[i] for i, success in enumerate(test_results) if not success]
                print(f"   - Failed tests: {', '.join(failed_tests)}")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Clean up created test agents
            await self.cleanup_created_agents()
            await self.disconnect()

async def main():
    """Main testing function"""
    tester = MarketingCampaignDuplicatePreventionTester()
    await tester.run_duplicate_prevention_tests()

if __name__ == "__main__":
    asyncio.run(main())