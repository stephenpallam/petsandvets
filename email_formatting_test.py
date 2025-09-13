#!/usr/bin/env python3
"""
Marketing Agent Email Formatting Issue Testing

This test specifically investigates the issue with Marketing Agent email posts showing 
raw ChatGPT output with markdown formatting instead of using proper email template structure.

Test Focus:
1. Create Marketing Agent with email channel enabled
2. Generate email posts and examine the content format
3. Check if email posts are using ChatGPT Campaign Templates properly
4. Verify if [CHATGPT_CONTENT] placeholder replacement is working
5. Compare generated email content with expected template format

Expected Template Format:
"Dear Valued Customer,

[CHATGPT_CONTENT]

We appreciate your trust in our care for your beloved pets. For any questions or to schedule an appointment, please contact us.

Warm regards,
[BUSINESS_NAME]"

Current Issue:
"**Title: Fuel Your Pet's Health with Nutrition!**
**Content:** 🐾 Did you know that a balanced diet..."
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

class EmailFormattingTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petsai-templates.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_ids = []
        self.created_template_ids = []
        
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
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Email Formatting"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Email Formatting"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def check_chatgpt_templates_exist(self):
        """Test 1: Check if ChatGPT Campaign Templates exist"""
        print("🔍 TEST 1: Check ChatGPT Campaign Templates")
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
                # Get all email templates
                url = f"{self.backend_url}/api/templates?template_type=email"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "ChatGPT Templates Check",
                            False,
                            f"Failed to get email templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    templates = await response.json()
                    
                    # Look for ChatGPT campaign templates
                    chatgpt_templates = [t for t in templates if "ChatGPT" in t.get("name", "") and "Campaign" in t.get("name", "")]
                    
                    # Check for expected templates
                    expected_templates = [
                        "Campaign Email - Personalized (ChatGPT)",
                        "Campaign Email - General (ChatGPT)"
                    ]
                    
                    found_templates = [t["name"] for t in chatgpt_templates]
                    templates_exist = all(template in found_templates for template in expected_templates)
                    
                    # Check template content for [CHATGPT_CONTENT] placeholder
                    templates_have_placeholder = all(
                        "[CHATGPT_CONTENT]" in t.get("content", "") for t in chatgpt_templates
                    )
                    
                    success = templates_exist and templates_have_placeholder and len(chatgpt_templates) >= 2
                    
                    self.log_test_result(
                        "ChatGPT Templates Check",
                        success,
                        f"ChatGPT Campaign Templates verification: {success}",
                        {
                            "Total Email Templates": len(templates),
                            "ChatGPT Campaign Templates Found": len(chatgpt_templates),
                            "Expected Templates Present": templates_exist,
                            "Templates Have [CHATGPT_CONTENT] Placeholder": templates_have_placeholder,
                            "Found Template Names": found_templates,
                            "Expected Template Names": expected_templates,
                            "Sample Template Content": chatgpt_templates[0].get("content", "")[:200] + "..." if chatgpt_templates else "None"
                        }
                    )
                    return success
                    
        except Exception as e:
            self.log_test_result(
                "ChatGPT Templates Check",
                False,
                f"Error checking ChatGPT templates: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_marketing_agent_email_generation(self):
        """Test 2: Create Marketing Agent with email channel and generate posts"""
        print("🔍 TEST 2: Marketing Agent Email Generation")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with email channel enabled
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Email Formatting Agent",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Nutrition Tips",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                "email_content_template": "Dear [CUSTOMER_NAME], [CHATGPT_CONTENT] Best regards, [BUSINESS_NAME]",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Marketing Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("agent_id")
                    self.created_agent_ids.append(agent_id)
                
                # Wait a moment for agent creation to complete
                await asyncio.sleep(2)
                
                # Run the marketing campaign generation
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Marketing Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    campaign_result = await response.json()
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to get generated email posts
                posts = await self.db.ai_posts.find({"agent_id": agent_id, "marketing_channel": "email"}).to_list(length=None)
                
                if not posts:
                    self.log_test_result(
                        "Email Post Generation",
                        False,
                        "No email posts were generated",
                        {"Agent ID": agent_id, "Campaign Result": campaign_result}
                    )
                    return False
                
                # Analyze the generated email posts
                email_post = posts[0]  # Get the first email post
                content = email_post.get("content", "")
                email_subject = email_post.get("email_subject", "")
                email_template = email_post.get("email_template", "")
                
                success = len(posts) > 0 and content.strip() != ""
                
                self.log_test_result(
                    "Marketing Agent Email Generation",
                    success,
                    f"Email post generation: {success}",
                    {
                        "Agent ID": agent_id,
                        "Email Posts Generated": len(posts),
                        "Email Content Length": len(content),
                        "Email Subject": email_subject,
                        "Email Template Present": bool(email_template),
                        "Content Preview": content[:300] + "..." if len(content) > 300 else content,
                        "Campaign Result": campaign_result.get("message", "No message")
                    }
                )
                return success, posts
                
        except Exception as e:
            self.log_test_result(
                "Marketing Agent Email Generation",
                False,
                f"Error in email generation test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def analyze_email_content_format(self, email_posts):
        """Test 3: Analyze email content format for markdown issues"""
        print("🔍 TEST 3: Email Content Format Analysis")
        print("=" * 60)
        
        try:
            if not email_posts:
                self.log_test_result(
                    "Email Content Format Analysis",
                    False,
                    "No email posts to analyze",
                    {}
                )
                return False
            
            analysis_results = {
                "posts_analyzed": len(email_posts),
                "posts_with_markdown_issues": 0,
                "posts_with_proper_template_structure": 0,
                "posts_with_chatgpt_content_placeholder": 0,
                "posts_with_raw_chatgpt_output": 0,
                "markdown_indicators_found": [],
                "template_structure_issues": []
            }
            
            # Common markdown indicators that shouldn't be in final email content
            markdown_indicators = ["**", "##", "Title:", "Content:", "Subject:", "***", "---", "```"]
            
            # Expected template structure elements
            expected_structure_elements = ["Dear", "Best regards", "Warm regards", "Sincerely"]
            
            for post in email_posts:
                content = post.get("content", "")
                email_template = post.get("email_template", "")
                
                # Check for markdown formatting issues
                markdown_found = []
                for indicator in markdown_indicators:
                    if indicator in content:
                        markdown_found.append(indicator)
                        analysis_results["posts_with_markdown_issues"] += 1
                
                if markdown_found:
                    analysis_results["markdown_indicators_found"].extend(markdown_found)
                
                # Check for proper template structure
                has_proper_structure = any(element in content for element in expected_structure_elements)
                if has_proper_structure:
                    analysis_results["posts_with_proper_template_structure"] += 1
                else:
                    analysis_results["template_structure_issues"].append("Missing greeting/closing")
                
                # Check if [CHATGPT_CONTENT] placeholder is still present (should be replaced)
                if "[CHATGPT_CONTENT]" in content:
                    analysis_results["posts_with_chatgpt_content_placeholder"] += 1
                
                # Check for raw ChatGPT output patterns
                raw_patterns = ["**Title:", "**Content:", "🐾 Did you know", "Here's", "Let me"]
                if any(pattern in content for pattern in raw_patterns):
                    analysis_results["posts_with_raw_chatgpt_output"] += 1
            
            # Determine success criteria
            success = (
                analysis_results["posts_with_markdown_issues"] == 0 and  # No markdown issues
                analysis_results["posts_with_proper_template_structure"] > 0 and  # Has proper structure
                analysis_results["posts_with_chatgpt_content_placeholder"] == 0 and  # Placeholders replaced
                analysis_results["posts_with_raw_chatgpt_output"] == 0  # No raw ChatGPT output
            )
            
            # Get sample content for detailed analysis
            sample_content = email_posts[0].get("content", "") if email_posts else ""
            sample_template = email_posts[0].get("email_template", "") if email_posts else ""
            
            self.log_test_result(
                "Email Content Format Analysis",
                success,
                f"Email content format analysis: {success}",
                {
                    "Posts Analyzed": analysis_results["posts_analyzed"],
                    "Posts with Markdown Issues": analysis_results["posts_with_markdown_issues"],
                    "Posts with Proper Template Structure": analysis_results["posts_with_proper_template_structure"],
                    "Posts with Unreplaced [CHATGPT_CONTENT]": analysis_results["posts_with_chatgpt_content_placeholder"],
                    "Posts with Raw ChatGPT Output": analysis_results["posts_with_raw_chatgpt_output"],
                    "Markdown Indicators Found": list(set(analysis_results["markdown_indicators_found"])),
                    "Template Structure Issues": list(set(analysis_results["template_structure_issues"])),
                    "Sample Email Content": sample_content[:500] + "..." if len(sample_content) > 500 else sample_content,
                    "Sample Email Template": sample_template[:300] + "..." if len(sample_template) > 300 else sample_template
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Email Content Format Analysis",
                False,
                f"Error in email content format analysis: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_chatgpt_content_placeholder_replacement(self):
        """Test 4: Test [CHATGPT_CONTENT] placeholder replacement specifically"""
        print("🔍 TEST 4: ChatGPT Content Placeholder Replacement")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with explicit [CHATGPT_CONTENT] in template
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Email Formatting Agent - ChatGPT Placeholder",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health and Wellness",
                "marketing_channels": ["email"],
                "marketing_email_personalized": False,  # Use general template
                "email_content_template": "Dear Valued Customer,\n\n[CHATGPT_CONTENT]\n\nWe appreciate your trust in our care for your beloved pets. For any questions or to schedule an appointment, please contact us.\n\nWarm regards,\n[BUSINESS_NAME]",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "ChatGPT Placeholder Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("agent_id")
                    self.created_agent_ids.append(agent_id)
                
                # Wait a moment for agent creation to complete
                await asyncio.sleep(2)
                
                # Run the marketing campaign generation
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "ChatGPT Placeholder Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    campaign_result = await response.json()
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to get generated email posts
                posts = await self.db.ai_posts.find({"agent_id": agent_id, "marketing_channel": "email"}).to_list(length=None)
                
                if not posts:
                    self.log_test_result(
                        "ChatGPT Placeholder Test",
                        False,
                        "No email posts were generated",
                        {"Agent ID": agent_id}
                    )
                    return False
                
                # Analyze placeholder replacement
                email_post = posts[0]
                content = email_post.get("content", "")
                email_template = email_post.get("email_template", "")
                
                # Check if [CHATGPT_CONTENT] was replaced
                placeholder_replaced = "[CHATGPT_CONTENT]" not in content
                
                # Check if template structure is preserved
                has_greeting = "Dear Valued Customer" in content
                has_closing = "Warm regards" in content
                has_business_name_placeholder = "[BUSINESS_NAME]" in content or "[BUSINESS_NAME]" not in email_template
                
                # Check for expected template structure
                template_structure_preserved = has_greeting and has_closing
                
                # Check if content has reasonable length (indicating ChatGPT content was inserted)
                reasonable_content_length = len(content) > 100
                
                success = (
                    placeholder_replaced and
                    template_structure_preserved and
                    reasonable_content_length
                )
                
                self.log_test_result(
                    "ChatGPT Content Placeholder Replacement",
                    success,
                    f"ChatGPT placeholder replacement test: {success}",
                    {
                        "Agent ID": agent_id,
                        "[CHATGPT_CONTENT] Placeholder Replaced": placeholder_replaced,
                        "Template Structure Preserved": template_structure_preserved,
                        "Has Greeting": has_greeting,
                        "Has Closing": has_closing,
                        "Reasonable Content Length": reasonable_content_length,
                        "Content Length": len(content),
                        "Email Template": email_template[:200] + "..." if len(email_template) > 200 else email_template,
                        "Generated Content": content[:400] + "..." if len(content) > 400 else content
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "ChatGPT Content Placeholder Replacement",
                False,
                f"Error in ChatGPT placeholder replacement test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def compare_with_expected_template_format(self):
        """Test 5: Compare generated content with expected template format"""
        print("🔍 TEST 5: Expected Template Format Comparison")
        print("=" * 60)
        
        try:
            # Get all email posts from our test agents
            all_email_posts = await self.db.ai_posts.find({
                "agent_id": {"$in": self.created_agent_ids},
                "marketing_channel": "email"
            }).to_list(length=None)
            
            if not all_email_posts:
                self.log_test_result(
                    "Expected Template Format Comparison",
                    False,
                    "No email posts found for comparison",
                    {}
                )
                return False
            
            expected_format_elements = {
                "greeting": ["Dear", "Hello", "Hi"],
                "closing": ["Best regards", "Warm regards", "Sincerely", "Thank you"],
                "business_context": ["pets", "appointment", "care", "hospital", "clinic"],
                "call_to_action": ["contact", "call", "visit", "schedule", "book"]
            }
            
            comparison_results = {
                "posts_analyzed": len(all_email_posts),
                "posts_with_proper_greeting": 0,
                "posts_with_proper_closing": 0,
                "posts_with_business_context": 0,
                "posts_with_call_to_action": 0,
                "posts_with_markdown_formatting": 0,
                "posts_matching_expected_format": 0
            }
            
            for post in all_email_posts:
                content = post.get("content", "").lower()
                
                # Check for proper greeting
                if any(greeting.lower() in content for greeting in expected_format_elements["greeting"]):
                    comparison_results["posts_with_proper_greeting"] += 1
                
                # Check for proper closing
                if any(closing.lower() in content for closing in expected_format_elements["closing"]):
                    comparison_results["posts_with_proper_closing"] += 1
                
                # Check for business context
                if any(context in content for context in expected_format_elements["business_context"]):
                    comparison_results["posts_with_business_context"] += 1
                
                # Check for call to action
                if any(action in content for action in expected_format_elements["call_to_action"]):
                    comparison_results["posts_with_call_to_action"] += 1
                
                # Check for markdown formatting (should not be present)
                markdown_indicators = ["**", "##", "title:", "content:", "subject:"]
                if any(indicator in content for indicator in markdown_indicators):
                    comparison_results["posts_with_markdown_formatting"] += 1
                
                # Overall format check
                has_proper_format = (
                    any(greeting.lower() in content for greeting in expected_format_elements["greeting"]) and
                    any(closing.lower() in content for closing in expected_format_elements["closing"]) and
                    not any(indicator in content for indicator in markdown_indicators)
                )
                
                if has_proper_format:
                    comparison_results["posts_matching_expected_format"] += 1
            
            # Calculate success rates
            total_posts = comparison_results["posts_analyzed"]
            success_rate = comparison_results["posts_matching_expected_format"] / total_posts if total_posts > 0 else 0
            
            success = success_rate >= 0.8  # 80% of posts should match expected format
            
            # Get sample for detailed analysis
            sample_post = all_email_posts[0] if all_email_posts else {}
            sample_content = sample_post.get("content", "")
            
            self.log_test_result(
                "Expected Template Format Comparison",
                success,
                f"Template format comparison: {success} (Success rate: {success_rate:.1%})",
                {
                    "Posts Analyzed": comparison_results["posts_analyzed"],
                    "Posts with Proper Greeting": comparison_results["posts_with_proper_greeting"],
                    "Posts with Proper Closing": comparison_results["posts_with_proper_closing"],
                    "Posts with Business Context": comparison_results["posts_with_business_context"],
                    "Posts with Call to Action": comparison_results["posts_with_call_to_action"],
                    "Posts with Markdown Formatting": comparison_results["posts_with_markdown_formatting"],
                    "Posts Matching Expected Format": comparison_results["posts_matching_expected_format"],
                    "Success Rate": f"{success_rate:.1%}",
                    "Sample Content": sample_content[:400] + "..." if len(sample_content) > 400 else sample_content
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Expected Template Format Comparison",
                False,
                f"Error in template format comparison: {str(e)}",
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
    
    async def run_email_formatting_tests(self):
        """Run comprehensive email formatting tests"""
        print("🔍 STARTING MARKETING AGENT EMAIL FORMATTING TESTING")
        print("=" * 80)
        print("Testing email post formatting issues with ChatGPT content and templates")
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
            email_posts = []
            
            # Test 1: Check ChatGPT Templates
            success1 = await self.check_chatgpt_templates_exist()
            test_results.append(success1)
            
            # Test 2: Marketing Agent Email Generation
            success2, posts = await self.test_marketing_agent_email_generation()
            test_results.append(success2)
            email_posts.extend(posts)
            
            # Test 3: Email Content Format Analysis
            success3 = await self.analyze_email_content_format(email_posts)
            test_results.append(success3)
            
            # Test 4: ChatGPT Content Placeholder Replacement
            success4 = await self.test_chatgpt_content_placeholder_replacement()
            test_results.append(success4)
            
            # Test 5: Expected Template Format Comparison
            success5 = await self.compare_with_expected_template_format()
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 EMAIL FORMATTING TESTING SUMMARY")
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
                "ChatGPT Templates Check",
                "Marketing Agent Email Generation",
                "Email Content Format Analysis",
                "ChatGPT Content Placeholder Replacement",
                "Expected Template Format Comparison"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
                
                if not success:
                    # Print specific failure details
                    test_result = next((r for r in self.test_results if r["test_name"] == test_name), None)
                    if test_result and test_result.get("details"):
                        print(f"   Issue: {test_result['message']}")
                        for key, value in test_result["details"].items():
                            if "error" in key.lower() or "issue" in key.lower() or "fail" in key.lower():
                                print(f"   - {key}: {value}")
            
            print()
            print("🎯 EMAIL FORMATTING ISSUE DIAGNOSIS:")
            print("=" * 40)
            
            if not all(test_results):
                print("❌ EMAIL FORMATTING ISSUES IDENTIFIED")
                
                # Specific issue analysis
                if not test_results[0]:  # ChatGPT Templates Check
                    print("   - ChatGPT Campaign Templates may be missing or malformed")
                
                if not test_results[1]:  # Email Generation
                    print("   - Marketing Agent email generation is failing")
                
                if not test_results[2]:  # Content Format Analysis
                    print("   - Email content contains markdown formatting issues")
                    print("   - Raw ChatGPT output is being displayed instead of proper template structure")
                
                if not test_results[3]:  # Placeholder Replacement
                    print("   - [CHATGPT_CONTENT] placeholder is not being replaced properly")
                    print("   - Template structure is not being preserved")
                
                if not test_results[4]:  # Template Format Comparison
                    print("   - Generated emails do not match expected template format")
                    print("   - Missing proper greeting, closing, or business context")
                
                print()
                print("🔧 RECOMMENDED FIXES:")
                print("   1. Verify ChatGPT Campaign Templates are properly initialized")
                print("   2. Check [CHATGPT_CONTENT] placeholder replacement logic")
                print("   3. Ensure email template structure is preserved during content generation")
                print("   4. Remove markdown formatting from final email content")
                print("   5. Test with both personalized and general email templates")
                
            else:
                print("✅ EMAIL FORMATTING WORKING CORRECTLY")
                print("   - ChatGPT Campaign Templates are properly configured")
                print("   - [CHATGPT_CONTENT] placeholder replacement is working")
                print("   - Email template structure is preserved")
                print("   - No markdown formatting issues detected")
                print("   - Generated emails match expected format")
            
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
    tester = EmailFormattingTester()
    await tester.run_email_formatting_tests()

if __name__ == "__main__":
    asyncio.run(main())