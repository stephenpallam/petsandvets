#!/usr/bin/env python3
"""
Marketing Agent Email Formatting Improvements Testing

This test comprehensively tests the Marketing Agent email formatting improvements:

Test Focus:
1. Create a BRAND NEW Marketing Agent with email channel (topic: "Pet Vaccination")
2. Generate fresh email posts and examine the content structure
3. Verify the content has proper paragraphs with line breaks (should contain \n characters)
4. Check that the email template structure is applied (Dear X, content, Best regards, etc.)
5. Verify email subject is under 75 characters
6. Print the exact content with line breaks visible (use repr() to show \n characters)

Expected Results:
- Email content has proper paragraph formatting with line breaks (\n characters)
- Email template structure is properly applied (Dear X, content, Best regards, etc.)
- Email subject is under 75 characters
- Content is properly formatted for better readability in frontend display
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

class MarketingEmailFormattingTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petsai-templates.preview.emergentagent.com')
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
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Email Formatting"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Email Formatting"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def test_create_marketing_agent_with_email_channel(self):
        """Test 1: Create a BRAND NEW Marketing Agent with email channel (topic: Pet Vaccination)"""
        print("🔍 TEST 1: Create Marketing Agent with Email Channel")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with email channel and Pet Vaccination topic
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Email Formatting - Pet Vaccination Agent",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Vaccination",
                "marketing_channels": ["email"],  # Only email channel
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
                            "Create Marketing Agent with Email Channel",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False, None
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("agent_id")
                    self.created_agent_ids.append(agent_id)
                
                self.log_test_result(
                    "Create Marketing Agent with Email Channel",
                    True,
                    "Successfully created Marketing Agent with email channel and Pet Vaccination topic",
                    {
                        "Agent ID": agent_id,
                        "Agent Name": agent_data["agent_name"],
                        "Topic": agent_data["topic"],
                        "Channels": agent_data["marketing_channels"],
                        "Email Personalized": agent_data["marketing_email_personalized"]
                    }
                )
                return True, agent_id
                
        except Exception as e:
            self.log_test_result(
                "Create Marketing Agent with Email Channel",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_generate_fresh_email_posts(self, agent_id):
        """Test 2: Generate fresh email posts and examine the content structure"""
        print("🔍 TEST 2: Generate Fresh Email Posts")
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
                # Run the marketing campaign generation
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Generate Fresh Email Posts",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False, []
                    
                    campaign_result = await response.json()
                
                # Wait for posts to be generated
                await asyncio.sleep(8)
                
                # Query database to get generated email posts
                posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                email_posts = [p for p in posts if p.get("marketing_channel") == "email"]
                
                if not email_posts:
                    self.log_test_result(
                        "Generate Fresh Email Posts",
                        False,
                        "No email posts were generated",
                        {"Total Posts": len(posts), "Email Posts": len(email_posts)}
                    )
                    return False, []
                
                self.log_test_result(
                    "Generate Fresh Email Posts",
                    True,
                    f"Successfully generated {len(email_posts)} email posts",
                    {
                        "Total Posts": len(posts),
                        "Email Posts": len(email_posts),
                        "Campaign Result": campaign_result.get("message", "No message"),
                        "Agent ID": agent_id
                    }
                )
                return True, email_posts
                
        except Exception as e:
            self.log_test_result(
                "Generate Fresh Email Posts",
                False,
                f"Error generating email posts: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def test_verify_paragraph_structure_with_line_breaks(self, email_posts):
        """Test 3: Verify the content has proper paragraphs with line breaks (should contain \\n characters)"""
        print("🔍 TEST 3: Verify Paragraph Structure with Line Breaks")
        print("=" * 60)
        
        try:
            line_break_results = []
            
            for i, post in enumerate(email_posts):
                content = post.get("content", "")
                post_id = post.get("id", f"post_{i}")
                
                # Check for line breaks in content
                has_line_breaks = "\n" in content
                line_break_count = content.count("\n")
                
                # Check for proper paragraph structure (multiple sentences with breaks)
                sentences = content.split(".")
                has_multiple_sentences = len([s for s in sentences if s.strip()]) > 1
                
                # Print exact content with line breaks visible
                print(f"📧 EMAIL POST {i+1} CONTENT ANALYSIS:")
                print(f"   Post ID: {post_id}")
                print(f"   Content Length: {len(content)} characters")
                print(f"   Has Line Breaks: {has_line_breaks}")
                print(f"   Line Break Count: {line_break_count}")
                print(f"   Has Multiple Sentences: {has_multiple_sentences}")
                print("   Raw Content (with \\n visible): " + repr(content))
                print(f"   Formatted Content:")
                print("   " + content.replace("\n", "\n   "))
                print()
                
                line_break_results.append({
                    "post_id": post_id,
                    "has_line_breaks": has_line_breaks,
                    "line_break_count": line_break_count,
                    "has_multiple_sentences": has_multiple_sentences,
                    "content_length": len(content)
                })
            
            # Determine success criteria
            posts_with_line_breaks = sum(1 for r in line_break_results if r["has_line_breaks"])
            posts_with_multiple_sentences = sum(1 for r in line_break_results if r["has_multiple_sentences"])
            
            success = (
                posts_with_line_breaks > 0 and  # At least some posts should have line breaks
                posts_with_multiple_sentences > 0  # At least some posts should have multiple sentences
            )
            
            self.log_test_result(
                "Verify Paragraph Structure with Line Breaks",
                success,
                f"Paragraph structure verification: {success}",
                {
                    "Total Email Posts": len(email_posts),
                    "Posts with Line Breaks": posts_with_line_breaks,
                    "Posts with Multiple Sentences": posts_with_multiple_sentences,
                    "Line Break Analysis": line_break_results
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Paragraph Structure with Line Breaks",
                False,
                f"Error verifying paragraph structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_verify_email_template_structure(self, email_posts):
        """Test 4: Check that the email template structure is applied (Dear X, content, Best regards, etc.)"""
        print("🔍 TEST 4: Verify Email Template Structure")
        print("=" * 60)
        
        try:
            template_structure_results = []
            
            for i, post in enumerate(email_posts):
                content = post.get("content", "")
                post_id = post.get("id", f"post_{i}")
                
                # Check for email template structure elements
                has_greeting = any(greeting in content.lower() for greeting in ["dear", "hello", "hi"])
                has_closing = any(closing in content.lower() for closing in ["best regards", "warm regards", "sincerely", "thank you"])
                has_business_name = "[BUSINESS_NAME]" not in content  # Should be replaced
                has_customer_name = "[CUSTOMER_NAME]" not in content  # Should be replaced
                
                # Check for proper email structure
                lines = content.split("\n")
                has_multiple_paragraphs = len([line for line in lines if line.strip()]) > 1
                
                print(f"📧 EMAIL POST {i+1} TEMPLATE STRUCTURE ANALYSIS:")
                print(f"   Post ID: {post_id}")
                print(f"   Has Greeting: {has_greeting}")
                print(f"   Has Closing: {has_closing}")
                print(f"   Business Name Replaced: {has_business_name}")
                print(f"   Customer Name Replaced: {has_customer_name}")
                print(f"   Has Multiple Paragraphs: {has_multiple_paragraphs}")
                print(f"   Email Content Structure:")
                for j, line in enumerate(lines):
                    if line.strip():
                        print(f"     Line {j+1}: {line.strip()}")
                print()
                
                template_structure_results.append({
                    "post_id": post_id,
                    "has_greeting": has_greeting,
                    "has_closing": has_closing,
                    "has_business_name": has_business_name,
                    "has_customer_name": has_customer_name,
                    "has_multiple_paragraphs": has_multiple_paragraphs
                })
            
            # Determine success criteria
            posts_with_greeting = sum(1 for r in template_structure_results if r["has_greeting"])
            posts_with_closing = sum(1 for r in template_structure_results if r["has_closing"])
            posts_with_proper_structure = sum(1 for r in template_structure_results if r["has_multiple_paragraphs"])
            
            success = (
                posts_with_greeting > 0 and  # At least some posts should have greetings
                posts_with_closing > 0 and   # At least some posts should have closings
                posts_with_proper_structure > 0  # At least some posts should have proper structure
            )
            
            self.log_test_result(
                "Verify Email Template Structure",
                success,
                f"Email template structure verification: {success}",
                {
                    "Total Email Posts": len(email_posts),
                    "Posts with Greeting": posts_with_greeting,
                    "Posts with Closing": posts_with_closing,
                    "Posts with Proper Structure": posts_with_proper_structure,
                    "Template Structure Analysis": template_structure_results
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Email Template Structure",
                False,
                f"Error verifying email template structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_verify_email_subject_length(self, email_posts):
        """Test 5: Verify email subject is under 75 characters"""
        print("🔍 TEST 5: Verify Email Subject Length")
        print("=" * 60)
        
        try:
            subject_length_results = []
            
            for i, post in enumerate(email_posts):
                email_subject = post.get("email_subject", "")
                post_id = post.get("id", f"post_{i}")
                
                subject_length = len(email_subject)
                is_under_75_chars = subject_length <= 75
                
                print(f"📧 EMAIL POST {i+1} SUBJECT ANALYSIS:")
                print(f"   Post ID: {post_id}")
                print(f"   Email Subject: '{email_subject}'")
                print(f"   Subject Length: {subject_length} characters")
                print(f"   Under 75 Characters: {is_under_75_chars}")
                print()
                
                subject_length_results.append({
                    "post_id": post_id,
                    "email_subject": email_subject,
                    "subject_length": subject_length,
                    "is_under_75_chars": is_under_75_chars
                })
            
            # Determine success criteria
            subjects_under_75 = sum(1 for r in subject_length_results if r["is_under_75_chars"])
            
            success = subjects_under_75 == len(email_posts)  # All subjects should be under 75 characters
            
            self.log_test_result(
                "Verify Email Subject Length",
                success,
                f"Email subject length verification: {success}",
                {
                    "Total Email Posts": len(email_posts),
                    "Subjects Under 75 Characters": subjects_under_75,
                    "All Subjects Under Limit": success,
                    "Subject Length Analysis": subject_length_results
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Email Subject Length",
                False,
                f"Error verifying email subject length: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_print_exact_content_with_line_breaks(self, email_posts):
        """Test 6: Print the exact content with line breaks visible (use repr() to show \\n characters)"""
        print("🔍 TEST 6: Print Exact Content with Line Breaks Visible")
        print("=" * 60)
        
        try:
            print("📧 DETAILED EMAIL CONTENT ANALYSIS WITH LINE BREAKS:")
            print("=" * 80)
            
            for i, post in enumerate(email_posts):
                content = post.get("content", "")
                email_subject = post.get("email_subject", "")
                post_id = post.get("id", f"post_{i}")
                
                print(f"EMAIL POST {i+1}:")
                print(f"Post ID: {post_id}")
                print(f"Subject: {email_subject}")
                print(f"Subject Length: {len(email_subject)} characters")
                print()
                print("EXACT CONTENT (with \\n characters visible):")
                print("repr(content) = " + repr(content))
                print()
                print("FORMATTED CONTENT (as it would appear):")
                print(content)
                print()
                print("LINE-BY-LINE BREAKDOWN:")
                lines = content.split("\n")
                for j, line in enumerate(lines):
                    print(f"  Line {j+1}: '{line}'")
                print()
                print("CONTENT STATISTICS:")
                print(f"  Total Characters: {len(content)}")
                newline_count = content.count('\n')
                print(f"  Line Breaks (\\n): {newline_count}")
                print(f"  Total Lines: {len(lines)}")
                print(f"  Non-empty Lines: {len([line for line in lines if line.strip()])}")
                print("=" * 80)
                print()
            
            # This test always succeeds as it's just for display
            self.log_test_result(
                "Print Exact Content with Line Breaks",
                True,
                f"Successfully displayed exact content for {len(email_posts)} email posts",
                {
                    "Total Email Posts": len(email_posts),
                    "Content Display": "Complete"
                }
            )
            return True
            
        except Exception as e:
            self.log_test_result(
                "Print Exact Content with Line Breaks",
                False,
                f"Error printing exact content: {str(e)}",
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
        print("🔍 STARTING MARKETING AGENT EMAIL FORMATTING IMPROVEMENTS TESTING")
        print("=" * 80)
        print("Testing Marketing Agent email formatting improvements:")
        print("- Proper paragraph structure with line breaks")
        print("- Email template structure (Dear X, content, Best regards, etc.)")
        print("- Email subject length under 75 characters")
        print("- Content formatting for better frontend display")
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
            
            # Test 1: Create Marketing Agent with Email Channel
            success1, agent_id = await self.test_create_marketing_agent_with_email_channel()
            test_results.append(success1)
            
            if not success1 or not agent_id:
                print("❌ Cannot proceed without successful agent creation")
                return
            
            # Test 2: Generate Fresh Email Posts
            success2, email_posts = await self.test_generate_fresh_email_posts(agent_id)
            test_results.append(success2)
            
            if not success2 or not email_posts:
                print("❌ Cannot proceed without generated email posts")
                return
            
            # Test 3: Verify Paragraph Structure with Line Breaks
            success3 = await self.test_verify_paragraph_structure_with_line_breaks(email_posts)
            test_results.append(success3)
            
            # Test 4: Verify Email Template Structure
            success4 = await self.test_verify_email_template_structure(email_posts)
            test_results.append(success4)
            
            # Test 5: Verify Email Subject Length
            success5 = await self.test_verify_email_subject_length(email_posts)
            test_results.append(success5)
            
            # Test 6: Print Exact Content with Line Breaks
            success6 = await self.test_print_exact_content_with_line_breaks(email_posts)
            test_results.append(success6)
            
            # Summary
            print("=" * 80)
            print("🎯 EMAIL FORMATTING IMPROVEMENTS TESTING SUMMARY")
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
                "Create Marketing Agent with Email Channel",
                "Generate Fresh Email Posts",
                "Verify Paragraph Structure with Line Breaks",
                "Verify Email Template Structure",
                "Verify Email Subject Length",
                "Print Exact Content with Line Breaks"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
                
                if i == 0 and success:
                    print("   - Marketing Agent created with Pet Vaccination topic")
                    print("   - Email channel configured with personalization")
                elif i == 1 and success:
                    print("   - Fresh email posts generated successfully")
                    print("   - Content structure ready for analysis")
                elif i == 2 and success:
                    print("   - Content has proper paragraph structure")
                    print("   - Line breaks (\\n characters) present in content")
                elif i == 3 and success:
                    print("   - Email template structure properly applied")
                    print("   - Greeting, content, and closing format verified")
                elif i == 4 and success:
                    print("   - Email subjects are under 75 characters")
                    print("   - Subject length optimization working")
                elif i == 5 and success:
                    print("   - Exact content displayed with line breaks visible")
                    print("   - Content formatting analysis completed")
            
            print()
            print("🎯 EMAIL FORMATTING IMPROVEMENTS STATUS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ EMAIL FORMATTING IMPROVEMENTS WORKING CORRECTLY")
                print("   - Content has proper paragraph structure with line breaks")
                print("   - Email template structure is properly applied")
                print("   - Email subjects are under 75 characters")
                print("   - Content is properly formatted for frontend display")
            else:
                print("❌ EMAIL FORMATTING IMPROVEMENTS NEED ATTENTION")
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
    tester = MarketingEmailFormattingTester()
    await tester.run_email_formatting_tests()

if __name__ == "__main__":
    asyncio.run(main())