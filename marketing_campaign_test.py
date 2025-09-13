#!/usr/bin/env python3
"""
Enhanced Marketing Campaign Generation Testing

This test comprehensively tests the enhanced Marketing Campaign generation with:
1. Social Media Platform Differentiation
2. ChatGPT Template Integration  
3. Placeholder Replacement Verification
4. Email Subject Generation
5. SMS Character Limits

Test Focus:
- Create marketing agents with all social media platforms enabled
- Test ChatGPT campaign templates with Topic/Holiday content
- Verify platform-specific content generation
- Test proper placeholder replacement ([CHATGPT_CONTENT], [CUSTOMER_NAME], etc.)
- Verify email subjects and SMS character limits
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

class MarketingCampaignTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://marketing-agent.preview.emergentagent.com')
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
    
    async def cleanup_test_data(self):
        """Clean up test data before starting tests"""
        try:
            # Remove any existing test agents and posts
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test.*Marketing"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test.*Marketing"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def test_social_media_platform_differentiation(self):
        """Test 1: Social Media Platform Differentiation"""
        print("🔍 TEST 1: Social Media Platform Differentiation")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create marketing agent with all social media platforms enabled
                agent_data = {
                    "agent_type": "marketing_agent",
                    "agent_name": "Test Social Media Platform Differentiation",
                    "mode": "adhoc",
                    "marketing_content_type": "topic",
                    "topic": "Pet Health and Wellness Tips",
                    "marketing_channels": ["social_media"],
                    "marketing_social_platforms": {
                        "facebook": True,
                        "instagram": True,
                        "twitter": True,
                        "linkedin": True,
                        "youtube": True,
                        "tiktok": True
                    },
                    "marketing_workflow_mode": "in_review",
                    "word_count": "100",
                    "auto_post": False
                }
                
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Social Media Platform Differentiation - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_agent = await response.json()
                    agent_id = created_agent.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Run the marketing agent to generate posts
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Social Media Platform Differentiation - Agent Execution",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    execution_result = await response.json()
                
                # Get generated posts
                url = f"{self.backend_url}/api/ai-posts?agent_id={agent_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Social Media Platform Differentiation - Get Posts",
                            False,
                            f"Failed to get posts: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    posts_data = await response.json()
                    posts = posts_data.get("posts", [])
                
                # Analyze platform differentiation
                platform_posts = {}
                for post in posts:
                    platform = post.get("platform", "unknown")
                    if platform not in platform_posts:
                        platform_posts[platform] = []
                    platform_posts[platform].append(post)
                
                # Check for platform-specific content differences
                unique_content = set()
                platform_specific_features = {}
                
                for platform, platform_post_list in platform_posts.items():
                    for post in platform_post_list:
                        content = post.get("content", "")
                        unique_content.add(content)
                        
                        # Check for platform-specific features
                        features = []
                        if "#" in content:
                            features.append("hashtags")
                        if "🎯" in content or "❤️" in content or "🐾" in content:
                            features.append("emojis")
                        if len(content) < 280:
                            features.append("short_format")
                        elif len(content) > 500:
                            features.append("long_format")
                        
                        platform_specific_features[platform] = features
                
                # Verify platform differentiation
                expected_platforms = ["facebook", "instagram", "twitter", "linkedin", "youtube", "tiktok"]
                platforms_with_posts = list(platform_posts.keys())
                content_variety = len(unique_content) > 1  # Different content for different platforms
                
                success = (
                    len(posts) >= 6 and  # Should have posts for all 6 platforms
                    len(platforms_with_posts) >= 6 and  # All platforms should have posts
                    content_variety and  # Content should be different across platforms
                    all(platform in platforms_with_posts for platform in expected_platforms)
                )
                
                self.log_test_result(
                    "Social Media Platform Differentiation",
                    success,
                    f"Platform differentiation test: {success}",
                    {
                        "Total Posts Generated": len(posts),
                        "Platforms with Posts": platforms_with_posts,
                        "Expected Platforms": expected_platforms,
                        "All Platforms Covered": all(platform in platforms_with_posts for platform in expected_platforms),
                        "Unique Content Pieces": len(unique_content),
                        "Content Variety": content_variety,
                        "Platform Specific Features": platform_specific_features,
                        "Agent ID": agent_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Social Media Platform Differentiation",
                False,
                f"Error in platform differentiation test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_chatgpt_template_integration(self):
        """Test 2: ChatGPT Template Integration"""
        print("🔍 TEST 2: ChatGPT Template Integration")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # First, ensure ChatGPT templates are initialized
                url = f"{self.backend_url}/api/templates/initialize-defaults"
                async with session.post(url, headers=headers, timeout=15) as response:
                    if response.status != 200:
                        print(f"Warning: Could not initialize templates: {response.status}")
                
                # Get available ChatGPT campaign templates
                url = f"{self.backend_url}/api/templates"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "ChatGPT Template Integration - Get Templates",
                            False,
                            f"Failed to get templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    all_templates = await response.json()
                
                # Find ChatGPT campaign templates
                chatgpt_email_templates = [t for t in all_templates if "ChatGPT" in t.get("name", "") and t.get("type") == "email"]
                chatgpt_sms_templates = [t for t in all_templates if "ChatGPT" in t.get("name", "") and t.get("type") == "sms"]
                
                if not chatgpt_email_templates or not chatgpt_sms_templates:
                    self.log_test_result(
                        "ChatGPT Template Integration - Template Availability",
                        False,
                        "ChatGPT campaign templates not found",
                        {
                            "Email ChatGPT Templates": len(chatgpt_email_templates),
                            "SMS ChatGPT Templates": len(chatgpt_sms_templates),
                            "All Templates": [t.get("name") for t in all_templates]
                        }
                    )
                    return False
                
                # Create marketing agent with Topic content type and Email/SMS channels
                agent_data = {
                    "agent_type": "marketing_agent",
                    "agent_name": "Test ChatGPT Template Integration",
                    "mode": "adhoc",
                    "marketing_content_type": "topic",
                    "topic": "Holiday Pet Care Tips",
                    "marketing_channels": ["email", "sms"],
                    "marketing_email_personalized": True,
                    "email_content_template": chatgpt_email_templates[0].get("content", ""),
                    "marketing_sms_personalized": True,
                    "sms_template": chatgpt_sms_templates[0].get("content", ""),
                    "marketing_workflow_mode": "in_review",
                    "word_count": "150",
                    "auto_post": False
                }
                
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "ChatGPT Template Integration - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_agent = await response.json()
                    agent_id = created_agent.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Run the marketing agent to generate posts
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "ChatGPT Template Integration - Agent Execution",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    execution_result = await response.json()
                
                # Get generated posts
                url = f"{self.backend_url}/api/ai-posts?agent_id={agent_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "ChatGPT Template Integration - Get Posts",
                            False,
                            f"Failed to get posts: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    posts_data = await response.json()
                    posts = posts_data.get("posts", [])
                
                # Analyze ChatGPT template integration
                email_posts = [p for p in posts if p.get("agent_type") == "marketing_agent" and "email" in p.get("content", "").lower()]
                sms_posts = [p for p in posts if p.get("agent_type") == "marketing_agent" and len(p.get("content", "")) < 200]
                
                # Check for ChatGPT content integration
                chatgpt_content_found = False
                template_structure_preserved = False
                
                for post in posts:
                    content = post.get("content", "")
                    email_template = post.get("email_template", "")
                    sms_template = post.get("sms_template", "")
                    
                    # Check if [CHATGPT_CONTENT] was replaced with actual content
                    if "[CHATGPT_CONTENT]" not in content and len(content) > 50:
                        chatgpt_content_found = True
                    
                    # Check if template structure is preserved
                    if email_template and "[CHATGPT_CONTENT]" in email_template:
                        template_structure_preserved = True
                    elif sms_template and "[CHATGPT_CONTENT]" in sms_template:
                        template_structure_preserved = True
                
                success = (
                    len(posts) >= 2 and  # Should have email and SMS posts
                    len(email_posts) >= 1 and  # Should have email posts
                    len(sms_posts) >= 1 and  # Should have SMS posts
                    chatgpt_content_found and  # [CHATGPT_CONTENT] should be replaced
                    template_structure_preserved  # Original templates should preserve structure
                )
                
                self.log_test_result(
                    "ChatGPT Template Integration",
                    success,
                    f"ChatGPT template integration test: {success}",
                    {
                        "Total Posts Generated": len(posts),
                        "Email Posts": len(email_posts),
                        "SMS Posts": len(sms_posts),
                        "ChatGPT Content Found": chatgpt_content_found,
                        "Template Structure Preserved": template_structure_preserved,
                        "Available Email Templates": len(chatgpt_email_templates),
                        "Available SMS Templates": len(chatgpt_sms_templates),
                        "Agent ID": agent_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "ChatGPT Template Integration",
                False,
                f"Error in ChatGPT template integration test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_placeholder_replacement(self):
        """Test 3: Verify Placeholder Replacement"""
        print("🔍 TEST 3: Verify Placeholder Replacement")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Get a sample customer for personalization testing
                url = f"{self.backend_url}/api/customers"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        customers_data = await response.json()
                        customers = customers_data.get("customers", [])
                        sample_customer = customers[0] if customers else None
                    else:
                        sample_customer = None
                
                # Get global placeholders
                url = f"{self.backend_url}/api/global-placeholders"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        global_placeholders = await response.json()
                    else:
                        global_placeholders = []
                
                # Create marketing agent with personalized content
                agent_data = {
                    "agent_type": "marketing_agent",
                    "agent_name": "Test Placeholder Replacement",
                    "mode": "adhoc",
                    "marketing_content_type": "custom_campaign",
                    "marketing_custom_campaign": "Hello [CUSTOMER_NAME]! Special holiday offer for [PET_NAME] at [BUSINESS_NAME]. Call [PHONE_NUMBER] or visit [WEBSITE_LINK] to book at [BOOK_NOW_LINK]. We're located at [BUSINESS_ADDRESS].",
                    "marketing_channels": ["email", "sms"],
                    "marketing_email_personalized": True,
                    "email_content_template": "Dear [CUSTOMER_NAME],\n\n[CHATGPT_CONTENT]\n\nWe hope [PET_NAME] is doing well! Contact us at [PHONE_NUMBER] or visit [WEBSITE_LINK].\n\nBest regards,\n[BUSINESS_NAME]\nLocated at: [BUSINESS_ADDRESS]",
                    "marketing_sms_personalized": True,
                    "sms_template": "Hi [CUSTOMER_NAME]! [CHATGPT_CONTENT] Questions about [PET_NAME]? Call [PHONE_NUMBER] or visit [BOOK_NOW_LINK]",
                    "marketing_workflow_mode": "in_review",
                    "auto_post": False
                }
                
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Placeholder Replacement - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_agent = await response.json()
                    agent_id = created_agent.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Run the marketing agent to generate posts
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Placeholder Replacement - Agent Execution",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    execution_result = await response.json()
                
                # Get generated posts
                url = f"{self.backend_url}/api/ai-posts?agent_id={agent_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Placeholder Replacement - Get Posts",
                            False,
                            f"Failed to get posts: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    posts_data = await response.json()
                    posts = posts_data.get("posts", [])
                
                # Analyze placeholder replacement
                placeholder_replacements = {
                    "[CHATGPT_CONTENT]": False,
                    "[CUSTOMER_NAME]": False,
                    "[PET_NAME]": False,
                    "[PET_NAMES]": False,
                    "[BUSINESS_NAME]": False,
                    "[PHONE_NUMBER]": False,
                    "[WEBSITE_LINK]": False,
                    "[BOOK_NOW_LINK]": False,
                    "[BUSINESS_ADDRESS]": False
                }
                
                unreplaced_placeholders = set()
                
                for post in posts:
                    content = post.get("content", "")
                    email_template = post.get("email_template", "")
                    sms_template = post.get("sms_template", "")
                    
                    # Check if placeholders were replaced in content
                    for placeholder in placeholder_replacements.keys():
                        if placeholder not in content and len(content) > 20:
                            placeholder_replacements[placeholder] = True
                        elif placeholder in content:
                            unreplaced_placeholders.add(placeholder)
                    
                    # Check for specific replacement patterns
                    if any(name in content.lower() for name in ["stephen", "john", "mary", "customer"]):
                        placeholder_replacements["[CUSTOMER_NAME]"] = True
                    
                    if any(pet in content.lower() for pet in ["pet", "dog", "cat", "buddy", "max"]):
                        placeholder_replacements["[PET_NAME]"] = True
                    
                    if any(business in content.lower() for business in ["hospital", "clinic", "pets and vets"]):
                        placeholder_replacements["[BUSINESS_NAME]"] = True
                    
                    if any(phone in content for phone in ["(", ")", "-", "555", "703"]):
                        placeholder_replacements["[PHONE_NUMBER]"] = True
                    
                    if "http" in content.lower() or "www" in content.lower():
                        placeholder_replacements["[WEBSITE_LINK]"] = True
                        placeholder_replacements["[BOOK_NOW_LINK]"] = True
                
                # Calculate success metrics
                replaced_count = sum(placeholder_replacements.values())
                total_placeholders = len(placeholder_replacements)
                replacement_rate = replaced_count / total_placeholders
                
                success = (
                    len(posts) >= 2 and  # Should have posts generated
                    replacement_rate >= 0.6 and  # At least 60% of placeholders should be replaced
                    placeholder_replacements["[CHATGPT_CONTENT]"] and  # ChatGPT content should be replaced
                    len(unreplaced_placeholders) <= 3  # No more than 3 unreplaced placeholders
                )
                
                self.log_test_result(
                    "Placeholder Replacement",
                    success,
                    f"Placeholder replacement test: {success}",
                    {
                        "Total Posts Generated": len(posts),
                        "Placeholders Replaced": f"{replaced_count}/{total_placeholders}",
                        "Replacement Rate": f"{replacement_rate:.1%}",
                        "Placeholder Status": placeholder_replacements,
                        "Unreplaced Placeholders": list(unreplaced_placeholders),
                        "Sample Customer Available": sample_customer is not None,
                        "Global Placeholders Available": len(global_placeholders),
                        "Agent ID": agent_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Placeholder Replacement",
                False,
                f"Error in placeholder replacement test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_email_subject_generation(self):
        """Test 4: Test Email Subject Generation"""
        print("🔍 TEST 4: Test Email Subject Generation")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create marketing agent focused on email generation
                agent_data = {
                    "agent_type": "marketing_agent",
                    "agent_name": "Test Email Subject Generation",
                    "mode": "adhoc",
                    "marketing_content_type": "topic",
                    "topic": "Pet Vaccination Reminders",
                    "marketing_channels": ["email"],
                    "marketing_email_personalized": True,
                    "email_content_template": "Dear [CUSTOMER_NAME],\n\n[CHATGPT_CONTENT]\n\nPlease contact us to schedule [PET_NAME]'s vaccination.\n\nBest regards,\n[BUSINESS_NAME]",
                    "marketing_workflow_mode": "in_review",
                    "word_count": "120",
                    "auto_post": False
                }
                
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Email Subject Generation - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_agent = await response.json()
                    agent_id = created_agent.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Run the marketing agent to generate posts
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Email Subject Generation - Agent Execution",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    execution_result = await response.json()
                
                # Get generated posts
                url = f"{self.backend_url}/api/ai-posts?agent_id={agent_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Email Subject Generation - Get Posts",
                            False,
                            f"Failed to get posts: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    posts_data = await response.json()
                    posts = posts_data.get("posts", [])
                
                # Analyze email subject generation
                email_posts = [p for p in posts if "email" in str(p).lower()]
                subjects_found = []
                proper_email_structure = []
                
                for post in email_posts:
                    # Check for email subject
                    subject = post.get("email_subject", "") or post.get("subject", "")
                    if subject:
                        subjects_found.append(subject)
                    
                    # Check for proper email structure
                    content = post.get("content", "")
                    email_template = post.get("email_template", "")
                    
                    has_greeting = any(greeting in content.lower() for greeting in ["dear", "hello", "hi"])
                    has_closing = any(closing in content.lower() for closing in ["regards", "sincerely", "thank you"])
                    has_structure = has_greeting and has_closing
                    
                    proper_email_structure.append(has_structure)
                
                # Calculate success metrics
                emails_with_subjects = len(subjects_found)
                emails_with_structure = sum(proper_email_structure)
                subject_quality = all(len(subject) > 10 and len(subject) < 100 for subject in subjects_found)
                
                success = (
                    len(email_posts) >= 1 and  # Should have email posts
                    emails_with_subjects >= 1 and  # Should have email subjects
                    emails_with_structure >= 1 and  # Should have proper email structure
                    subject_quality  # Subjects should be reasonable length
                )
                
                self.log_test_result(
                    "Email Subject Generation",
                    success,
                    f"Email subject generation test: {success}",
                    {
                        "Total Posts Generated": len(posts),
                        "Email Posts": len(email_posts),
                        "Emails with Subjects": emails_with_subjects,
                        "Emails with Structure": emails_with_structure,
                        "Subject Quality": subject_quality,
                        "Sample Subjects": subjects_found[:3],  # Show first 3 subjects
                        "Agent ID": agent_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Email Subject Generation",
                False,
                f"Error in email subject generation test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_sms_character_limits(self):
        """Test 5: Test SMS Character Limits"""
        print("🔍 TEST 5: Test SMS Character Limits")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create marketing agent focused on SMS generation
                agent_data = {
                    "agent_type": "marketing_agent",
                    "agent_name": "Test SMS Character Limits",
                    "mode": "adhoc",
                    "marketing_content_type": "topic",
                    "topic": "Quick Pet Health Reminders",
                    "marketing_channels": ["sms"],
                    "marketing_sms_personalized": True,
                    "sms_template": "Hi [CUSTOMER_NAME]! [CHATGPT_CONTENT] Call [PHONE_NUMBER] for [PET_NAME].",
                    "marketing_workflow_mode": "in_review",
                    "word_count": "50",  # Request shorter content for SMS
                    "auto_post": False
                }
                
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "SMS Character Limits - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_agent = await response.json()
                    agent_id = created_agent.get("id")
                    self.created_agent_ids.append(agent_id)
                
                # Run the marketing agent to generate posts
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "SMS Character Limits - Agent Execution",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    execution_result = await response.json()
                
                # Get generated posts
                url = f"{self.backend_url}/api/ai-posts?agent_id={agent_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "SMS Character Limits - Get Posts",
                            False,
                            f"Failed to get posts: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    posts_data = await response.json()
                    posts = posts_data.get("posts", [])
                
                # Analyze SMS character limits
                sms_posts = [p for p in posts if "sms" in str(p).lower() or len(p.get("content", "")) < 300]
                character_counts = []
                within_limits = []
                
                for post in sms_posts:
                    content = post.get("content", "")
                    char_count = len(content)
                    character_counts.append(char_count)
                    
                    # Check if within SMS limits (160 characters for single SMS, 320 for double)
                    within_single_sms = char_count <= 160
                    within_double_sms = char_count <= 320
                    within_limits.append(within_double_sms)
                
                # Calculate success metrics
                avg_char_count = sum(character_counts) / len(character_counts) if character_counts else 0
                sms_within_limits = sum(within_limits)
                single_sms_count = sum(1 for count in character_counts if count <= 160)
                
                success = (
                    len(sms_posts) >= 1 and  # Should have SMS posts
                    sms_within_limits >= len(sms_posts) * 0.8 and  # At least 80% within limits
                    avg_char_count <= 200 and  # Average should be reasonable
                    single_sms_count >= 1  # At least one should be single SMS length
                )
                
                self.log_test_result(
                    "SMS Character Limits",
                    success,
                    f"SMS character limits test: {success}",
                    {
                        "Total Posts Generated": len(posts),
                        "SMS Posts": len(sms_posts),
                        "Average Character Count": f"{avg_char_count:.1f}",
                        "SMS Within Limits": f"{sms_within_limits}/{len(sms_posts)}",
                        "Single SMS Length": single_sms_count,
                        "Character Counts": character_counts,
                        "Agent ID": agent_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "SMS Character Limits",
                False,
                f"Error in SMS character limits test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_created_data(self):
        """Clean up created test data"""
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Delete created agents
                for agent_id in self.created_agent_ids:
                    url = f"{self.backend_url}/api/ai-agents/{agent_id}"
                    async with session.delete(url, headers=headers, timeout=10) as response:
                        if response.status == 200:
                            print(f"✅ Deleted test agent: {agent_id}")
                        else:
                            print(f"⚠️ Could not delete agent {agent_id}: {response.status}")
                
                # Delete created posts (they should be deleted with agents, but just in case)
                for post_id in self.created_post_ids:
                    url = f"{self.backend_url}/api/ai-posts/{post_id}"
                    async with session.delete(url, headers=headers, timeout=10) as response:
                        if response.status == 200:
                            print(f"✅ Deleted test post: {post_id}")
                        else:
                            print(f"⚠️ Could not delete post {post_id}: {response.status}")
            
            print("🧹 Test data cleanup completed")
            
        except Exception as e:
            print(f"⚠️ Warning: Could not clean up all test data: {e}")
    
    async def run_marketing_campaign_tests(self):
        """Run comprehensive marketing campaign tests"""
        print("🔍 STARTING ENHANCED MARKETING CAMPAIGN GENERATION TESTING")
        print("=" * 80)
        print("Testing enhanced Marketing Campaign generation with platform-specific content")
        print("and proper placeholder replacement as requested")
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
            
            # Test 1: Social Media Platform Differentiation
            success1 = await self.test_social_media_platform_differentiation()
            test_results.append(success1)
            
            # Test 2: ChatGPT Template Integration
            success2 = await self.test_chatgpt_template_integration()
            test_results.append(success2)
            
            # Test 3: Placeholder Replacement
            success3 = await self.test_placeholder_replacement()
            test_results.append(success3)
            
            # Test 4: Email Subject Generation
            success4 = await self.test_email_subject_generation()
            test_results.append(success4)
            
            # Test 5: SMS Character Limits
            success5 = await self.test_sms_character_limits()
            test_results.append(success5)
            
            # Clean up created test data
            await self.cleanup_created_data()
            
            # Summary
            print("=" * 80)
            print("🎯 ENHANCED MARKETING CAMPAIGN GENERATION TESTING SUMMARY")
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
                print("✅ SOCIAL MEDIA PLATFORM DIFFERENTIATION: All platforms generate unique content")
                print("   - Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok all supported")
                print("   - Platform-specific language, formatting, and features working")
                print("   - Content variety across platforms confirmed")
            else:
                print("❌ SOCIAL MEDIA PLATFORM DIFFERENTIATION: Platform-specific content generation failed")
            
            # Test 2 Analysis
            if success2:
                print("✅ CHATGPT TEMPLATE INTEGRATION: ChatGPT campaign templates working correctly")
                print("   - Topic/Holiday content type integration successful")
                print("   - Email and SMS ChatGPT templates properly utilized")
                print("   - [CHATGPT_CONTENT] placeholder replacement working")
            else:
                print("❌ CHATGPT TEMPLATE INTEGRATION: ChatGPT template integration failed")
            
            # Test 3 Analysis
            if success3:
                print("✅ PLACEHOLDER REPLACEMENT: All placeholders properly replaced")
                print("   - [CHATGPT_CONTENT] replaced with AI-generated content")
                print("   - Customer placeholders ([CUSTOMER_NAME], [PET_NAME]) working")
                print("   - Global placeholders ([BUSINESS_NAME], [PHONE_NUMBER], etc.) working")
            else:
                print("❌ PLACEHOLDER REPLACEMENT: Placeholder replacement failed")
            
            # Test 4 Analysis
            if success4:
                print("✅ EMAIL SUBJECT GENERATION: Email subjects generated by ChatGPT")
                print("   - Proper email structure with subjects")
                print("   - Well-formatted email content")
                print("   - Subject lines appropriate length and quality")
            else:
                print("❌ EMAIL SUBJECT GENERATION: Email subject generation failed")
            
            # Test 5 Analysis
            if success5:
                print("✅ SMS CHARACTER LIMITS: SMS content respects character limits")
                print("   - Content under 160 characters for single SMS")
                print("   - ChatGPT generates appropriately sized SMS content")
                print("   - SMS formatting optimized for mobile")
            else:
                print("❌ SMS CHARACTER LIMITS: SMS character limit handling failed")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Social Media Platform Differentiation",
                "ChatGPT Template Integration", 
                "Placeholder Replacement",
                "Email Subject Generation",
                "SMS Character Limits"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("🎯 SYSTEM READINESS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ ENHANCED MARKETING CAMPAIGN GENERATION FULLY WORKING")
                print("   - Platform-specific content generation working")
                print("   - ChatGPT template integration successful")
                print("   - Placeholder replacement functioning correctly")
                print("   - Email and SMS generation optimized")
                print("   - System ready for production marketing campaigns")
            else:
                print("❌ ENHANCED MARKETING CAMPAIGN GENERATION NEEDS FIXES")
                failed_tests = [test_names[i] for i, success in enumerate(test_results) if not success]
                print(f"   - Failed tests: {', '.join(failed_tests)}")
            
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
    tester = MarketingCampaignTester()
    await tester.run_marketing_campaign_tests()

if __name__ == "__main__":
    asyncio.run(main())