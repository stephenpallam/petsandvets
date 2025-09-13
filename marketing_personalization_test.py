#!/usr/bin/env python3
"""
Enhanced Marketing Agent Generation with Customer Personalization Testing

This test comprehensively tests the enhanced Marketing Agent generation with customer personalization as requested:

Test Focus:
1. Create Marketing Agent with Multi-Channel Campaign (social_media, email, sms)
2. Run Marketing Agent and verify it creates personalized content
3. Verify personalized content includes customer data fields
4. Test custom campaign content with personalization

Expected Results:
- Creates social media posts (Facebook, Instagram)
- Creates 1 personalized email post with customer data
- Creates 1 personalized SMS post with customer data
- Email posts include sample_customer_name, sample_pet_names, sample_customer_email fields
- SMS posts include sample_customer_name, sample_pet_names, sample_customer_phone fields
- Actual personalized content with [CUSTOMER_NAME] and [PET_NAME] replaced with real data
- Original templates stored for mass sending
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

class MarketingPersonalizationTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petsai-templates.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_ids = []
        self.created_post_ids = []
        
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
    
    async def test_create_multi_channel_marketing_agent(self):
        """Test 1: Create Marketing Agent with Multi-Channel Campaign"""
        print("🔍 TEST 1: Create Marketing Agent with Multi-Channel Campaign")
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
                "agent_name": "Test Multi-Channel Personalization",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {"facebook": True, "instagram": True},
                "marketing_email_personalized": True,
                "email_content_template": "Hello [CUSTOMER_NAME]! We have important health tips for [PET_NAME]. Visit our clinic for [PET_NAMES] care.",
                "marketing_sms_personalized": True,
                "sms_template": "Hi [CUSTOMER_NAME]! [PET_NAME] needs attention. Call us about [PET_NAMES] health.",
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
                                    "agent_name": agent_doc.get("agent_name") == "Test Multi-Channel Personalization",
                                    "agent_type": agent_doc.get("agent_type") == "marketing_agent",
                                    "marketing_content_type": agent_doc.get("marketing_content_type") == "topic",
                                    "topic": agent_doc.get("topic") == "Pet Health Tips",
                                    "marketing_channels": set(agent_doc.get("marketing_channels", [])) == {"social_media", "email", "sms"},
                                    "marketing_social_platforms": agent_doc.get("marketing_social_platforms") == {"facebook": True, "instagram": True},
                                    "marketing_email_personalized": agent_doc.get("marketing_email_personalized") == True,
                                    "email_content_template": agent_doc.get("email_content_template") == "Hello [CUSTOMER_NAME]! We have important health tips for [PET_NAME]. Visit our clinic for [PET_NAMES] care.",
                                    "marketing_sms_personalized": agent_doc.get("marketing_sms_personalized") == True,
                                    "sms_template": agent_doc.get("sms_template") == "Hi [CUSTOMER_NAME]! [PET_NAME] needs attention. Call us about [PET_NAMES] health.",
                                    "marketing_workflow_mode": agent_doc.get("marketing_workflow_mode") == "in_review"
                                }
                            
                            self.log_test_result(
                                "Create Multi-Channel Marketing Agent",
                                success,
                                f"Multi-channel marketing agent created successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "All Fields Correct": all(field_verification.values()) if field_verification else False,
                                    "Channels": agent_doc.get("marketing_channels") if agent_doc else None,
                                    "Social Platforms": agent_doc.get("marketing_social_platforms") if agent_doc else None,
                                    "Email Template": agent_doc.get("email_content_template") if agent_doc else None,
                                    "SMS Template": agent_doc.get("sms_template") if agent_doc else None
                                }
                            )
                            return success, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Multi-Channel Marketing Agent",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Create Multi-Channel Marketing Agent",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Create Multi-Channel Marketing Agent",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_run_marketing_agent(self, agent_id):
        """Test 2: Run Marketing Agent and verify post generation"""
        print("🔍 TEST 2: Run Marketing Agent")
        print("=" * 60)
        
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
                            
                            # Check for posts created
                            posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                            
                            # Expected: social media posts (Facebook, Instagram) + 1 email + 1 SMS
                            expected_post_types = ["social_media", "email", "sms"]
                            post_types_found = [post.get("agent_type") for post in posts]
                            
                            # Count posts by type
                            social_media_posts = [p for p in posts if p.get("agent_type") == "social_media"]
                            email_posts = [p for p in posts if p.get("agent_type") == "email"]
                            sms_posts = [p for p in posts if p.get("agent_type") == "sms"]
                            
                            success = len(posts) >= 4  # At least 2 social + 1 email + 1 SMS
                            
                            # Store post IDs for cleanup
                            self.created_post_ids.extend([post.get("id") for post in posts])
                            
                            self.log_test_result(
                                "Run Marketing Agent",
                                success,
                                f"Marketing agent executed successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Total Posts Created": len(posts),
                                    "Social Media Posts": len(social_media_posts),
                                    "Email Posts": len(email_posts),
                                    "SMS Posts": len(sms_posts),
                                    "Post Types Found": post_types_found,
                                    "Expected Minimum Posts": 4,
                                    "Posts Meet Minimum": len(posts) >= 4
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
    
    async def test_verify_personalized_content(self, posts):
        """Test 3: Verify Personalized Content includes customer data fields"""
        print("🔍 TEST 3: Verify Personalized Content")
        print("=" * 60)
        
        if not posts:
            self.log_test_result(
                "Verify Personalized Content",
                False,
                "No posts available for verifying personalized content",
                {"Posts Count": len(posts)}
            )
            return False
        
        try:
            # Marketing agent posts use marketing_channel field to distinguish types
            email_posts = [p for p in posts if p.get("marketing_channel") == "email" or "email_subject" in p]
            sms_posts = [p for p in posts if p.get("marketing_channel") == "sms" or "sms_template" in p]
            social_posts = [p for p in posts if p.get("marketing_channel") == "social_media" or ("email_subject" not in p and "sms_template" not in p)]
            
            email_verification = {}
            sms_verification = {}
            
            # Check email posts for personalization fields
            if email_posts:
                email_post = email_posts[0]  # Check first email post
                email_verification = {
                    "has_sample_customer_name": "sample_customer_name" in email_post,
                    "has_sample_pet_names": "sample_pet_names" in email_post,
                    "has_sample_customer_email": "sample_customer_email" in email_post,
                    "content_personalized": "[CUSTOMER_NAME]" not in email_post.get("content", "") and "[PET_NAME]" not in email_post.get("content", ""),  # Placeholders should be replaced
                    "template_stored": "email_template" in email_post or "email_subject" in email_post,
                    "has_email_subject": "email_subject" in email_post
                }
            
            # Check SMS posts for personalization fields
            if sms_posts:
                sms_post = sms_posts[0]  # Check first SMS post
                sms_verification = {
                    "has_sample_customer_name": "sample_customer_name" in sms_post,
                    "has_sample_pet_names": "sample_pet_names" in sms_post,
                    "has_sample_customer_phone": "sample_customer_phone" in sms_post,
                    "content_personalized": "[CUSTOMER_NAME]" not in sms_post.get("content", "") and "[PET_NAME]" not in sms_post.get("content", ""),  # Placeholders should be replaced
                    "template_stored": "sms_template" in sms_post,
                    "has_sms_fields": "sms_personalized" in sms_post
                }
            
            # Overall success criteria
            email_success = all(email_verification.values()) if email_verification else False
            sms_success = all(sms_verification.values()) if sms_verification else False
            success = email_success and sms_success and len(email_posts) > 0 and len(sms_posts) > 0
            
            self.log_test_result(
                "Verify Personalized Content",
                success,
                f"Personalized content verification: {success}",
                {
                    "Total Posts": len(posts),
                    "Email Posts Count": len(email_posts),
                    "SMS Posts Count": len(sms_posts),
                    "Social Posts Count": len(social_posts),
                    "Email Verification": email_verification,
                    "SMS Verification": sms_verification,
                    "Email Success": email_success,
                    "SMS Success": sms_success,
                    "Sample Email Content": email_posts[0].get("content", "")[:200] + "..." if email_posts else "No email posts",
                    "Sample SMS Content": sms_posts[0].get("content", "")[:200] + "..." if sms_posts else "No SMS posts",
                    "Email Customer Data": {
                        "name": email_posts[0].get("sample_customer_name") if email_posts else None,
                        "email": email_posts[0].get("sample_customer_email") if email_posts else None,
                        "pets": email_posts[0].get("sample_pet_names") if email_posts else None
                    },
                    "SMS Customer Data": {
                        "name": sms_posts[0].get("sample_customer_name") if sms_posts else None,
                        "phone": sms_posts[0].get("sample_customer_phone") if sms_posts else None,
                        "pets": sms_posts[0].get("sample_pet_names") if sms_posts else None
                    }
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Personalized Content",
                False,
                f"Error verifying personalized content: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_custom_campaign_personalization(self):
        """Test 4: Test Custom Campaign with personalization"""
        print("🔍 TEST 4: Test Custom Campaign Personalization")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Custom campaign marketing agent
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Custom Campaign Personalization",
                "mode": "adhoc",
                "marketing_content_type": "custom_campaign",
                "marketing_custom_campaign": "Special offer for [CUSTOMER_NAME] and [PET_NAME]! 20% off all services for [PET_NAMES].",
                "marketing_channels": ["email", "sms"],
                "marketing_email_personalized": True,
                "marketing_sms_personalized": True,
                "marketing_workflow_mode": "in_review",
                "post_date": "2025-01-16",
                "post_time": "11:00"
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
                                    # Check posts created
                                    posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                                    
                                    # Store post IDs for cleanup
                                    self.created_post_ids.extend([post.get("id") for post in posts])
                                    
                                    # Verify custom campaign personalization
                                    email_posts = [p for p in posts if "email_subject" in p or p.get("marketing_channel") == "email"]
                                    sms_posts = [p for p in posts if "sms_template" in p or p.get("marketing_channel") == "sms"]
                                    
                                    custom_campaign_verification = {
                                        "agent_created": True,
                                        "posts_generated": len(posts) > 0,
                                        "email_posts_created": len(email_posts) > 0,
                                        "sms_posts_created": len(sms_posts) > 0,
                                        "custom_campaign_in_content": False,
                                        "personalization_applied": False
                                    }
                                    
                                    # Check if custom campaign content appears in posts
                                    if posts:
                                        for post in posts:
                                            content = post.get("content", "")
                                            if "Special offer" in content and "20% off" in content:
                                                custom_campaign_verification["custom_campaign_in_content"] = True
                                            if "[CUSTOMER_NAME]" not in content and "[PET_NAME]" not in content:
                                                # Personalization was applied (placeholders replaced)
                                                custom_campaign_verification["personalization_applied"] = True
                                    
                                    success = all(custom_campaign_verification.values())
                                    
                                    self.log_test_result(
                                        "Test Custom Campaign Personalization",
                                        success,
                                        f"Custom campaign personalization test: {success}",
                                        {
                                            "Agent ID": agent_id,
                                            "Posts Created": len(posts),
                                            "Email Posts": len(email_posts),
                                            "SMS Posts": len(sms_posts),
                                            "Verification": custom_campaign_verification,
                                            "Sample Content": posts[0].get("content", "")[:200] + "..." if posts else "No posts"
                                        }
                                    )
                                    return success
                                else:
                                    self.log_test_result(
                                        "Test Custom Campaign Personalization",
                                        False,
                                        f"Failed to run custom campaign agent: HTTP {run_response.status}",
                                        {"Run Status": run_response.status}
                                    )
                                    return False
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Test Custom Campaign Personalization",
                                False,
                                "Invalid JSON response during agent creation",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False
                    else:
                        self.log_test_result(
                            "Test Custom Campaign Personalization",
                            False,
                            f"Failed to create custom campaign agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False
                        
        except Exception as e:
            self.log_test_result(
                "Test Custom Campaign Personalization",
                False,
                f"Error testing custom campaign personalization: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_marketing_personalization_tests(self):
        """Run comprehensive marketing agent personalization tests"""
        print("🔍 STARTING ENHANCED MARKETING AGENT PERSONALIZATION TESTING")
        print("=" * 80)
        print("Testing enhanced Marketing Agent generation with customer personalization")
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
            
            # Test 1: Create Multi-Channel Marketing Agent
            success1, agent_id1 = await self.test_create_multi_channel_marketing_agent()
            test_results.append(success1)
            
            # Test 2: Run Marketing Agent (only if creation succeeded)
            posts = []
            if success1 and agent_id1:
                success2, posts = await self.test_run_marketing_agent(agent_id1)
                test_results.append(success2)
            else:
                print("⏭️  Skipping agent run test - agent creation failed")
                test_results.append(False)
            
            # Test 3: Verify Personalized Content (only if posts were created)
            if posts:
                success3 = await self.test_verify_personalized_content(posts)
                test_results.append(success3)
            else:
                print("⏭️  Skipping personalized content verification - no posts created")
                test_results.append(False)
            
            # Test 4: Test Custom Campaign Personalization
            success4 = await self.test_custom_campaign_personalization()
            test_results.append(success4)
            
            # Summary
            print("=" * 80)
            print("🎯 ENHANCED MARKETING AGENT PERSONALIZATION TESTING SUMMARY")
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
                print("✅ MULTI-CHANNEL CREATION: Marketing agent with multi-channel campaign created successfully")
                print(f"   - Channels: social_media, email, sms")
                print(f"   - Social Platforms: Facebook, Instagram")
                print(f"   - Email Personalization: Enabled")
                print(f"   - SMS Personalization: Enabled")
            else:
                print("❌ MULTI-CHANNEL CREATION: Failed to create multi-channel marketing agent")
            
            # Test 2 Analysis
            if len(test_results) > 1 and test_results[1]:
                print("✅ AGENT EXECUTION: Marketing agent executed and generated posts successfully")
                print(f"   - Posts created across multiple channels")
            elif len(test_results) > 1:
                print("❌ AGENT EXECUTION: Failed to execute marketing agent or generate posts")
            
            # Test 3 Analysis
            if len(test_results) > 2 and test_results[2]:
                print("✅ PERSONALIZED CONTENT: Posts include customer data fields and personalization")
                print(f"   - Email posts have sample_customer_name, sample_pet_names, sample_customer_email")
                print(f"   - SMS posts have sample_customer_name, sample_pet_names, sample_customer_phone")
                print(f"   - Placeholders replaced with real customer data")
            elif len(test_results) > 2:
                print("❌ PERSONALIZED CONTENT: Personalization verification failed")
            
            # Test 4 Analysis
            if success4:
                print("✅ CUSTOM CAMPAIGN: Custom campaign content with personalization working")
                print(f"   - Custom content used in post generation")
                print(f"   - Personalization applied to custom campaign")
            else:
                print("❌ CUSTOM CAMPAIGN: Custom campaign personalization failed")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Create Multi-Channel Marketing Agent",
                "Run Marketing Agent", 
                "Verify Personalized Content",
                "Test Custom Campaign Personalization"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
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
    tester = MarketingPersonalizationTester()
    await tester.run_marketing_personalization_tests()

if __name__ == "__main__":
    asyncio.run(main())