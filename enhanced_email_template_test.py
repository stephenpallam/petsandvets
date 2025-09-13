#!/usr/bin/env python3
"""
Enhanced Email Template Testing for Marketing Campaign Generation

This test comprehensively tests the ENHANCED Email Template functionality with critical fixes:

Test Focus:
1. Test Default Email Template Usage - When no template specified, uses proper email template structure
2. Test Clean Content Generation - Improved AI prompts to avoid markdown formatting
3. Test Markdown Cleanup - Post-processing to remove **title:** or **content:** formatting
4. Test Professional Email Structure - Ensures proper template format with signature, contact info
5. Test Placeholder Replacement - Verify all placeholders replaced correctly
6. Test Email Subject Generation - Clean subject without markdown artifacts
7. Test Both Personalized and Non-Personalized - Different greeting styles

Expected Results:
- Default ChatGPT email template used when no specific template selected
- Clean email content without markdown formatting artifacts
- Professional email structure with proper signature and contact info
- All placeholders properly replaced
- Clean email subjects without formatting artifacts
- Both personalized and non-personalized versions working correctly
"""

import asyncio
import sys
import os
import json
import aiohttp
import ssl
import time
import re
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

class EnhancedEmailTemplateTester:
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
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Enhanced Email Template"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Enhanced Email Template"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    def check_markdown_artifacts(self, content: str) -> dict:
        """Check for markdown formatting artifacts in content"""
        artifacts = {
            "has_title_prefix": bool(re.search(r'\*\*[Tt]itle:\*\*', content)),
            "has_content_prefix": bool(re.search(r'\*\*[Cc]ontent:\*\*', content)),
            "has_subject_prefix": bool(re.search(r'\*\*[Ss]ubject:\*\*', content)),
            "has_bold_markers": bool(re.search(r'\*\*[^*]+\*\*', content)),
            "has_header_markers": bool(re.search(r'#{1,6}\s', content)),
            "has_markdown_links": bool(re.search(r'\[([^\]]+)\]\(([^)]+)\)', content))
        }
        artifacts["has_any_artifacts"] = any(artifacts.values())
        return artifacts
    
    def check_professional_email_structure(self, content: str) -> dict:
        """Check if email follows professional structure"""
        structure = {
            "has_greeting": bool(re.search(r'(Dear|Hello|Hi)\s+', content, re.IGNORECASE)),
            "has_signature": bool(re.search(r'(Best regards|Sincerely|Thank you)', content, re.IGNORECASE)),
            "has_contact_info": bool(re.search(r'📞|🌐|📅|📍', content)),
            "has_business_name": "[BUSINESS_NAME]" not in content,  # Should be replaced
            "has_phone_number": "[PHONE_NUMBER]" not in content,   # Should be replaced
            "has_website_link": "[WEBSITE_LINK]" not in content,   # Should be replaced
            "proper_paragraph_structure": len(content.split('\n\n')) >= 2  # At least 2 paragraphs
        }
        structure["is_professional"] = all([
            structure["has_greeting"],
            structure["has_signature"], 
            structure["has_contact_info"],
            structure["has_business_name"],
            structure["has_phone_number"]
        ])
        return structure
    
    async def test_default_email_template_usage(self):
        """Test 1: Default Email Template Usage - No specific template selected"""
        print("🔍 TEST 1: Default Email Template Usage")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with email channel enabled, topic content, NO specific template
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Enhanced Email Template - Default Template",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Nutrition",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                # NOTE: NOT setting email_content_template - should use default ChatGPT template
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Default Email Template - Agent Creation",
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
                            "Default Email Template - Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    campaign_result = await response.json()
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to get email posts
                email_posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "marketing_channel": "email"
                }).to_list(length=None)
                
                if not email_posts:
                    self.log_test_result(
                        "Default Email Template Usage",
                        False,
                        "No email posts found",
                        {"Agent ID": agent_id, "Campaign Result": campaign_result}
                    )
                    return False
                
                # Analyze the email post
                email_post = email_posts[0]
                content = email_post.get("content", "")
                email_subject = email_post.get("email_subject", "")
                email_template = email_post.get("email_template", "")
                
                # Check for proper default template structure
                expected_structure_elements = [
                    "Dear [CUSTOMER_NAME]" in email_template or "Dear Valued Customer" in email_template,
                    "[CHATGPT_CONTENT]" in email_template or len(content) > 50,  # Should have AI content
                    "We hope" in email_template or "Best regards" in email_template,
                    "[BUSINESS_NAME]" in email_template,
                    "📞 [PHONE_NUMBER]" in email_template or "📞" in content,
                    "🌐 [WEBSITE_LINK]" in email_template or "🌐" in content,
                    "📅 [BOOK_NOW_LINK]" in email_template or "📅" in content,
                    "[BUSINESS_ADDRESS]" in email_template or "Visit us at" in content
                ]
                
                structure_score = sum(expected_structure_elements)
                has_proper_structure = structure_score >= 6  # At least 6 out of 8 elements
                
                # Check markdown cleanup
                markdown_check = self.check_markdown_artifacts(content)
                subject_markdown_check = self.check_markdown_artifacts(email_subject)
                
                # Check professional structure
                professional_check = self.check_professional_email_structure(content)
                
                success = (
                    has_proper_structure and
                    not markdown_check["has_any_artifacts"] and
                    not subject_markdown_check["has_any_artifacts"] and
                    professional_check["is_professional"] and
                    len(email_posts) == 1  # Should create exactly 1 email post
                )
                
                self.log_test_result(
                    "Default Email Template Usage",
                    success,
                    f"Default template usage verification: {success}",
                    {
                        "Email Posts Count": len(email_posts),
                        "Has Proper Template Structure": has_proper_structure,
                        "Structure Score": f"{structure_score}/8",
                        "Content Clean (No Markdown)": not markdown_check["has_any_artifacts"],
                        "Subject Clean (No Markdown)": not subject_markdown_check["has_any_artifacts"],
                        "Professional Structure": professional_check["is_professional"],
                        "Email Subject": email_subject[:100] + "..." if len(email_subject) > 100 else email_subject,
                        "Content Length": len(content),
                        "Template Length": len(email_template),
                        "Agent ID": agent_id,
                        "Markdown Artifacts in Content": markdown_check,
                        "Professional Structure Details": professional_check
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Default Email Template Usage",
                False,
                f"Error in default email template test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_clean_content_generation(self):
        """Test 2: Clean Content Generation - No markdown formatting artifacts"""
        print("🔍 TEST 2: Clean Content Generation")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with topic content to test AI generation
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Enhanced Email Template - Clean Content",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Dental Care",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Clean Content Generation - Agent Creation",
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
                            "Clean Content Generation - Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to get email posts
                email_posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "marketing_channel": "email"
                }).to_list(length=None)
                
                if not email_posts:
                    self.log_test_result(
                        "Clean Content Generation",
                        False,
                        "No email posts found",
                        {"Agent ID": agent_id}
                    )
                    return False
                
                # Analyze all email posts for clean content
                clean_content_results = {
                    "total_posts": len(email_posts),
                    "posts_without_markdown": 0,
                    "posts_with_clean_subjects": 0,
                    "posts_with_proper_paragraphs": 0,
                    "posts_with_readable_content": 0
                }
                
                for post in email_posts:
                    content = post.get("content", "")
                    email_subject = post.get("email_subject", "")
                    
                    # Check for markdown artifacts
                    content_markdown = self.check_markdown_artifacts(content)
                    subject_markdown = self.check_markdown_artifacts(email_subject)
                    
                    if not content_markdown["has_any_artifacts"]:
                        clean_content_results["posts_without_markdown"] += 1
                    
                    if not subject_markdown["has_any_artifacts"]:
                        clean_content_results["posts_with_clean_subjects"] += 1
                    
                    # Check for proper paragraph structure
                    paragraphs = content.split('\n\n')
                    if len(paragraphs) >= 2 and all(len(p.strip()) > 10 for p in paragraphs[:2]):
                        clean_content_results["posts_with_proper_paragraphs"] += 1
                    
                    # Check for readable content (no excessive formatting, reasonable length)
                    if (len(content) > 100 and 
                        len(content) < 2000 and 
                        content.count('\n') < 20 and  # Not too many line breaks
                        not re.search(r'[*#]{3,}', content)):  # No excessive markdown
                        clean_content_results["posts_with_readable_content"] += 1
                
                # Calculate success rates
                total = clean_content_results["total_posts"]
                success_rates = {
                    "clean_content_rate": clean_content_results["posts_without_markdown"] / total if total > 0 else 0,
                    "clean_subject_rate": clean_content_results["posts_with_clean_subjects"] / total if total > 0 else 0,
                    "proper_paragraph_rate": clean_content_results["posts_with_proper_paragraphs"] / total if total > 0 else 0,
                    "readable_content_rate": clean_content_results["posts_with_readable_content"] / total if total > 0 else 0
                }
                
                # Overall success criteria (all rates should be 100% for clean content)
                success = all(rate >= 1.0 for rate in success_rates.values()) and total > 0
                
                self.log_test_result(
                    "Clean Content Generation",
                    success,
                    f"Clean content generation verification: {success}",
                    {
                        "Total Email Posts": total,
                        "Posts Without Markdown": clean_content_results["posts_without_markdown"],
                        "Posts With Clean Subjects": clean_content_results["posts_with_clean_subjects"],
                        "Posts With Proper Paragraphs": clean_content_results["posts_with_proper_paragraphs"],
                        "Posts With Readable Content": clean_content_results["posts_with_readable_content"],
                        "Clean Content Rate": f"{success_rates['clean_content_rate']:.1%}",
                        "Clean Subject Rate": f"{success_rates['clean_subject_rate']:.1%}",
                        "Proper Paragraph Rate": f"{success_rates['proper_paragraph_rate']:.1%}",
                        "Readable Content Rate": f"{success_rates['readable_content_rate']:.1%}",
                        "Agent ID": agent_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Clean Content Generation",
                False,
                f"Error in clean content generation test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_placeholder_replacement(self):
        """Test 3: Placeholder Replacement - All placeholders properly replaced"""
        print("🔍 TEST 3: Placeholder Replacement")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with personalized email
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Enhanced Email Template - Placeholder Replacement",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Vaccination Reminders",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Placeholder Replacement - Agent Creation",
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
                            "Placeholder Replacement - Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to get email posts
                email_posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "marketing_channel": "email"
                }).to_list(length=None)
                
                if not email_posts:
                    self.log_test_result(
                        "Placeholder Replacement",
                        False,
                        "No email posts found",
                        {"Agent ID": agent_id}
                    )
                    return False
                
                # Check placeholder replacement in all email posts
                placeholder_results = {
                    "total_posts": len(email_posts),
                    "posts_with_customer_name": 0,
                    "posts_with_pet_name": 0,
                    "posts_with_business_name": 0,
                    "posts_with_phone_number": 0,
                    "posts_with_website_link": 0,
                    "posts_with_book_now_link": 0,
                    "posts_with_business_address": 0,
                    "posts_without_unreplaced_placeholders": 0
                }
                
                # Common placeholders that should be replaced
                unreplaced_placeholders = [
                    "[CUSTOMER_NAME]", "[PET_NAME]", "[PET_NAMES]", 
                    "[BUSINESS_NAME]", "[PHONE_NUMBER]", "[WEBSITE_LINK]", 
                    "[BOOK_NOW_LINK]", "[BUSINESS_ADDRESS]", "[CHATGPT_CONTENT]"
                ]
                
                for post in email_posts:
                    content = post.get("content", "")
                    email_template = post.get("email_template", "")
                    
                    # Check if customer data is present (indicates replacement worked)
                    sample_customer_name = post.get("sample_customer_name", "")
                    sample_pet_names = post.get("sample_pet_names", [])
                    
                    if sample_customer_name and sample_customer_name in content:
                        placeholder_results["posts_with_customer_name"] += 1
                    
                    if sample_pet_names and any(pet in content for pet in sample_pet_names):
                        placeholder_results["posts_with_pet_name"] += 1
                    
                    # Check for business placeholders (should be replaced with actual values)
                    if "Pets and Vets" in content or "Animal Hospital" in content:
                        placeholder_results["posts_with_business_name"] += 1
                    
                    if re.search(r'\(\d{3}\)\s?\d{3}-\d{4}', content) or "703" in content:
                        placeholder_results["posts_with_phone_number"] += 1
                    
                    if "petsandvetsanimalhospital.com" in content or "http" in content:
                        placeholder_results["posts_with_website_link"] += 1
                    
                    if "/book" in content or "book" in content.lower():
                        placeholder_results["posts_with_book_now_link"] += 1
                    
                    if "South Riding" in content or "VA" in content or "address" in content.lower():
                        placeholder_results["posts_with_business_address"] += 1
                    
                    # Check that no unreplaced placeholders remain
                    has_unreplaced = any(placeholder in content for placeholder in unreplaced_placeholders)
                    if not has_unreplaced:
                        placeholder_results["posts_without_unreplaced_placeholders"] += 1
                
                # Calculate success rates
                total = placeholder_results["total_posts"]
                success_rates = {
                    "customer_name_rate": placeholder_results["posts_with_customer_name"] / total if total > 0 else 0,
                    "pet_name_rate": placeholder_results["posts_with_pet_name"] / total if total > 0 else 0,
                    "business_name_rate": placeholder_results["posts_with_business_name"] / total if total > 0 else 0,
                    "phone_number_rate": placeholder_results["posts_with_phone_number"] / total if total > 0 else 0,
                    "website_link_rate": placeholder_results["posts_with_website_link"] / total if total > 0 else 0,
                    "no_unreplaced_rate": placeholder_results["posts_without_unreplaced_placeholders"] / total if total > 0 else 0
                }
                
                # Success criteria: Most placeholders should be replaced (at least 80% success rate)
                success = (
                    success_rates["no_unreplaced_rate"] >= 0.8 and  # No unreplaced placeholders
                    success_rates["business_name_rate"] >= 0.8 and  # Business info replaced
                    success_rates["phone_number_rate"] >= 0.8 and   # Contact info replaced
                    total > 0
                )
                
                self.log_test_result(
                    "Placeholder Replacement",
                    success,
                    f"Placeholder replacement verification: {success}",
                    {
                        "Total Email Posts": total,
                        "Posts With Customer Name": placeholder_results["posts_with_customer_name"],
                        "Posts With Pet Name": placeholder_results["posts_with_pet_name"],
                        "Posts With Business Name": placeholder_results["posts_with_business_name"],
                        "Posts With Phone Number": placeholder_results["posts_with_phone_number"],
                        "Posts With Website Link": placeholder_results["posts_with_website_link"],
                        "Posts With Book Now Link": placeholder_results["posts_with_book_now_link"],
                        "Posts With Business Address": placeholder_results["posts_with_business_address"],
                        "Posts Without Unreplaced Placeholders": placeholder_results["posts_without_unreplaced_placeholders"],
                        "Customer Name Rate": f"{success_rates['customer_name_rate']:.1%}",
                        "Pet Name Rate": f"{success_rates['pet_name_rate']:.1%}",
                        "Business Name Rate": f"{success_rates['business_name_rate']:.1%}",
                        "Phone Number Rate": f"{success_rates['phone_number_rate']:.1%}",
                        "Website Link Rate": f"{success_rates['website_link_rate']:.1%}",
                        "No Unreplaced Rate": f"{success_rates['no_unreplaced_rate']:.1%}",
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
        """Test 4: Email Subject Generation - Clean subjects without markdown artifacts"""
        print("🔍 TEST 4: Email Subject Generation")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent to test subject generation
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Enhanced Email Template - Subject Generation",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Grooming Services",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Email Subject Generation - Agent Creation",
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
                            "Email Subject Generation - Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to get email posts
                email_posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "marketing_channel": "email"
                }).to_list(length=None)
                
                if not email_posts:
                    self.log_test_result(
                        "Email Subject Generation",
                        False,
                        "No email posts found",
                        {"Agent ID": agent_id}
                    )
                    return False
                
                # Analyze email subjects
                subject_results = {
                    "total_posts": len(email_posts),
                    "posts_with_subjects": 0,
                    "subjects_without_markdown": 0,
                    "subjects_with_proper_length": 0,
                    "subjects_relevant_to_topic": 0,
                    "subjects_professional": 0
                }
                
                topic_keywords = ["grooming", "pet", "care", "service", "clean", "bath", "nail", "trim"]
                
                for post in email_posts:
                    email_subject = post.get("email_subject", "").strip()
                    
                    if email_subject:
                        subject_results["posts_with_subjects"] += 1
                        
                        # Check for markdown artifacts
                        markdown_check = self.check_markdown_artifacts(email_subject)
                        if not markdown_check["has_any_artifacts"]:
                            subject_results["subjects_without_markdown"] += 1
                        
                        # Check proper length (10-100 characters is reasonable for email subjects)
                        if 10 <= len(email_subject) <= 100:
                            subject_results["subjects_with_proper_length"] += 1
                        
                        # Check relevance to topic
                        subject_lower = email_subject.lower()
                        if any(keyword in subject_lower for keyword in topic_keywords):
                            subject_results["subjects_relevant_to_topic"] += 1
                        
                        # Check professional tone (no excessive punctuation, caps, etc.)
                        if (not re.search(r'[!]{2,}', email_subject) and  # No multiple exclamation marks
                            not email_subject.isupper() and  # Not all caps
                            not re.search(r'[?]{2,}', email_subject) and  # No multiple question marks
                            email_subject[0].isupper() if email_subject else False):  # Starts with capital
                            subject_results["subjects_professional"] += 1
                
                # Calculate success rates
                total = subject_results["total_posts"]
                success_rates = {
                    "has_subject_rate": subject_results["posts_with_subjects"] / total if total > 0 else 0,
                    "clean_subject_rate": subject_results["subjects_without_markdown"] / total if total > 0 else 0,
                    "proper_length_rate": subject_results["subjects_with_proper_length"] / total if total > 0 else 0,
                    "relevant_subject_rate": subject_results["subjects_relevant_to_topic"] / total if total > 0 else 0,
                    "professional_rate": subject_results["subjects_professional"] / total if total > 0 else 0
                }
                
                # Success criteria: All subjects should be clean, proper length, and professional
                success = (
                    success_rates["has_subject_rate"] >= 1.0 and  # All posts have subjects
                    success_rates["clean_subject_rate"] >= 1.0 and  # All subjects are clean
                    success_rates["proper_length_rate"] >= 0.8 and  # Most have proper length
                    success_rates["professional_rate"] >= 0.8 and  # Most are professional
                    total > 0
                )
                
                # Get sample subjects for review
                sample_subjects = [post.get("email_subject", "") for post in email_posts[:3]]
                
                self.log_test_result(
                    "Email Subject Generation",
                    success,
                    f"Email subject generation verification: {success}",
                    {
                        "Total Email Posts": total,
                        "Posts With Subjects": subject_results["posts_with_subjects"],
                        "Subjects Without Markdown": subject_results["subjects_without_markdown"],
                        "Subjects With Proper Length": subject_results["subjects_with_proper_length"],
                        "Subjects Relevant To Topic": subject_results["subjects_relevant_to_topic"],
                        "Subjects Professional": subject_results["subjects_professional"],
                        "Has Subject Rate": f"{success_rates['has_subject_rate']:.1%}",
                        "Clean Subject Rate": f"{success_rates['clean_subject_rate']:.1%}",
                        "Proper Length Rate": f"{success_rates['proper_length_rate']:.1%}",
                        "Relevant Subject Rate": f"{success_rates['relevant_subject_rate']:.1%}",
                        "Professional Rate": f"{success_rates['professional_rate']:.1%}",
                        "Sample Subjects": sample_subjects,
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
    
    async def test_personalized_vs_non_personalized(self):
        """Test 5: Both Personalized and Non-Personalized email templates"""
        print("🔍 TEST 5: Personalized vs Non-Personalized Templates")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Test personalized email
            personalized_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Enhanced Email Template - Personalized",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Checkups",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                "marketing_workflow_mode": "in_review"
            }
            
            # Test non-personalized email
            non_personalized_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Enhanced Email Template - Non-Personalized",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Checkups",
                "marketing_channels": ["email"],
                "marketing_email_personalized": False,
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create personalized agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=personalized_agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Personalized vs Non-Personalized - Personalized Agent Creation",
                            False,
                            f"Failed to create personalized agent: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    personalized_result = await response.json()
                    personalized_agent_id = personalized_result.get("agent_id")
                    self.created_agent_ids.append(personalized_agent_id)
                
                # Create non-personalized agent
                async with session.post(url, headers=headers, json=non_personalized_agent_data, timeout=30) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Personalized vs Non-Personalized - Non-Personalized Agent Creation",
                            False,
                            f"Failed to create non-personalized agent: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    non_personalized_result = await response.json()
                    non_personalized_agent_id = non_personalized_result.get("agent_id")
                    self.created_agent_ids.append(non_personalized_agent_id)
                
                # Wait for agent creation
                await asyncio.sleep(2)
                
                # Run personalized campaign
                url = f"{self.backend_url}/api/ai-agents/{personalized_agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Personalized vs Non-Personalized - Personalized Campaign",
                            False,
                            f"Failed to run personalized campaign: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                
                # Run non-personalized campaign
                url = f"{self.backend_url}/api/ai-agents/{non_personalized_agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Personalized vs Non-Personalized - Non-Personalized Campaign",
                            False,
                            f"Failed to run non-personalized campaign: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Get personalized email posts
                personalized_posts = await self.db.ai_posts.find({
                    "agent_id": personalized_agent_id,
                    "marketing_channel": "email"
                }).to_list(length=None)
                
                # Get non-personalized email posts
                non_personalized_posts = await self.db.ai_posts.find({
                    "agent_id": non_personalized_agent_id,
                    "marketing_channel": "email"
                }).to_list(length=None)
                
                if not personalized_posts or not non_personalized_posts:
                    self.log_test_result(
                        "Personalized vs Non-Personalized",
                        False,
                        "Missing email posts for comparison",
                        {
                            "Personalized Posts": len(personalized_posts),
                            "Non-Personalized Posts": len(non_personalized_posts)
                        }
                    )
                    return False
                
                # Analyze personalized posts
                personalized_analysis = {
                    "has_customer_greeting": False,
                    "has_customer_data": False,
                    "has_pet_data": False,
                    "greeting_type": "unknown"
                }
                
                personalized_post = personalized_posts[0]
                personalized_content = personalized_post.get("content", "")
                personalized_template = personalized_post.get("email_template", "")
                
                if "Dear [CUSTOMER_NAME]" in personalized_template or re.search(r'Dear \w+', personalized_content):
                    personalized_analysis["has_customer_greeting"] = True
                    personalized_analysis["greeting_type"] = "personalized"
                
                if personalized_post.get("sample_customer_name"):
                    personalized_analysis["has_customer_data"] = True
                
                if personalized_post.get("sample_pet_names"):
                    personalized_analysis["has_pet_data"] = True
                
                # Analyze non-personalized posts
                non_personalized_analysis = {
                    "has_generic_greeting": False,
                    "no_customer_data": False,
                    "greeting_type": "unknown"
                }
                
                non_personalized_post = non_personalized_posts[0]
                non_personalized_content = non_personalized_post.get("content", "")
                non_personalized_template = non_personalized_post.get("email_template", "")
                
                if ("Dear Valued Customer" in non_personalized_template or 
                    "Dear Valued Customer" in non_personalized_content or
                    "Dear Customer" in non_personalized_content):
                    non_personalized_analysis["has_generic_greeting"] = True
                    non_personalized_analysis["greeting_type"] = "generic"
                
                if not non_personalized_post.get("sample_customer_name"):
                    non_personalized_analysis["no_customer_data"] = True
                
                # Success criteria
                success = (
                    len(personalized_posts) == 1 and
                    len(non_personalized_posts) == 1 and
                    personalized_analysis["has_customer_greeting"] and
                    personalized_analysis["has_customer_data"] and
                    non_personalized_analysis["has_generic_greeting"] and
                    personalized_analysis["greeting_type"] != non_personalized_analysis["greeting_type"]
                )
                
                self.log_test_result(
                    "Personalized vs Non-Personalized",
                    success,
                    f"Personalized vs non-personalized verification: {success}",
                    {
                        "Personalized Posts Count": len(personalized_posts),
                        "Non-Personalized Posts Count": len(non_personalized_posts),
                        "Personalized Has Customer Greeting": personalized_analysis["has_customer_greeting"],
                        "Personalized Has Customer Data": personalized_analysis["has_customer_data"],
                        "Personalized Has Pet Data": personalized_analysis["has_pet_data"],
                        "Personalized Greeting Type": personalized_analysis["greeting_type"],
                        "Non-Personalized Has Generic Greeting": non_personalized_analysis["has_generic_greeting"],
                        "Non-Personalized No Customer Data": non_personalized_analysis["no_customer_data"],
                        "Non-Personalized Greeting Type": non_personalized_analysis["greeting_type"],
                        "Different Greeting Types": personalized_analysis["greeting_type"] != non_personalized_analysis["greeting_type"],
                        "Personalized Agent ID": personalized_agent_id,
                        "Non-Personalized Agent ID": non_personalized_agent_id,
                        "Sample Personalized Content": personalized_content[:200] + "..." if len(personalized_content) > 200 else personalized_content,
                        "Sample Non-Personalized Content": non_personalized_content[:200] + "..." if len(non_personalized_content) > 200 else non_personalized_content
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Personalized vs Non-Personalized",
                False,
                f"Error in personalized vs non-personalized test: {str(e)}",
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
    
    async def run_enhanced_email_template_tests(self):
        """Run comprehensive enhanced email template tests"""
        print("🔍 STARTING ENHANCED EMAIL TEMPLATE TESTING")
        print("=" * 80)
        print("Testing ENHANCED Email Template functionality for Marketing Campaign generation")
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
            
            # Test 1: Default Email Template Usage
            success1 = await self.test_default_email_template_usage()
            test_results.append(success1)
            
            # Test 2: Clean Content Generation
            success2 = await self.test_clean_content_generation()
            test_results.append(success2)
            
            # Test 3: Placeholder Replacement
            success3 = await self.test_placeholder_replacement()
            test_results.append(success3)
            
            # Test 4: Email Subject Generation
            success4 = await self.test_email_subject_generation()
            test_results.append(success4)
            
            # Test 5: Personalized vs Non-Personalized
            success5 = await self.test_personalized_vs_non_personalized()
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 ENHANCED EMAIL TEMPLATE TESTING SUMMARY")
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
                "Default Email Template Usage",
                "Clean Content Generation", 
                "Placeholder Replacement",
                "Email Subject Generation",
                "Personalized vs Non-Personalized"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
                
                if i == 0 and success:
                    print("   - Default ChatGPT campaign template used when no specific template selected")
                    print("   - Professional email structure with signature and contact info")
                elif i == 1 and success:
                    print("   - Clean content generation without markdown formatting artifacts")
                    print("   - Proper paragraph structure and readability")
                elif i == 2 and success:
                    print("   - All placeholders properly replaced with actual values")
                    print("   - No unreplaced placeholder text in final output")
                elif i == 3 and success:
                    print("   - Clean email subjects without markdown artifacts")
                    print("   - Professional, relevant subject lines")
                elif i == 4 and success:
                    print("   - Personalized emails use 'Dear [CUSTOMER_NAME]'")
                    print("   - Non-personalized emails use 'Dear Valued Customer'")
            
            print()
            print("🎯 ENHANCED EMAIL TEMPLATE FIX STATUS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ ENHANCED EMAIL TEMPLATE FUNCTIONALITY WORKING CORRECTLY")
                print("   - Default ChatGPT campaign template properly implemented")
                print("   - Clean content generation without markdown artifacts")
                print("   - Professional email structure maintained")
                print("   - All placeholders properly replaced")
                print("   - Clean email subjects generated")
                print("   - Both personalized and non-personalized versions working")
            else:
                print("❌ ENHANCED EMAIL TEMPLATE FUNCTIONALITY NEEDS ATTENTION")
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
    tester = EnhancedEmailTemplateTester()
    await tester.run_enhanced_email_template_tests()

if __name__ == "__main__":
    asyncio.run(main())