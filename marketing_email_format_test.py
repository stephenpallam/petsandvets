#!/usr/bin/env python3
"""
Marketing Agent Email Formatting Issue Testing

This test specifically addresses the user's concern about raw markdown output in Marketing Agent email posts.

Test Focus:
1. Create a BRAND NEW Marketing Agent with email channel (topic: "Pet Dental Care")
2. Generate fresh email posts and examine the EXACT content stored in database
3. Print both the 'content' field and 'email_template' field to see what's actually stored
4. Check if the new posts still contain markdown like **Title:** or **Content:**
5. Verify the email subject length (should be under 75 characters)
6. If still broken, identify exactly where the issue is occurring

Expected Results:
- NEW posts should NOT contain raw markdown formatting
- Email content should be clean and professional
- Email subjects should be under 75 characters
- Database should store clean content, not raw ChatGPT output
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

class MarketingEmailFormatTester:
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
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Pet Dental Care"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Pet Dental Care"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    def check_markdown_formatting(self, content: str) -> dict:
        """Check for various markdown formatting patterns"""
        markdown_patterns = {
            "title_markdown": bool(re.search(r'\*\*Title:.*?\*\*', content, re.IGNORECASE)),
            "content_markdown": bool(re.search(r'\*\*Content:\*\*', content, re.IGNORECASE)),
            "title_plain": bool(re.search(r'Title:.*?\n', content, re.IGNORECASE)),
            "content_plain": bool(re.search(r'Content:\s*', content, re.IGNORECASE)),
            "bold_text": bool(re.search(r'\*\*[^*]+\*\*', content)),
            "italic_text": bool(re.search(r'\*[^*]+\*', content)),
            "subject_markdown": bool(re.search(r'\*\*Subject:.*?\*\*', content, re.IGNORECASE)),
            "subject_plain": bool(re.search(r'Subject:.*?\n', content, re.IGNORECASE))
        }
        
        has_any_markdown = any(markdown_patterns.values())
        
        return {
            "has_markdown": has_any_markdown,
            "patterns_found": {k: v for k, v in markdown_patterns.items() if v},
            "all_patterns": markdown_patterns
        }
    
    async def test_create_new_marketing_agent(self):
        """Test 1: Create a BRAND NEW Marketing Agent with email channel (topic: Pet Dental Care)"""
        print("🔍 TEST 1: Create Brand New Marketing Agent - Pet Dental Care")
        print("=" * 70)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with email channel and Pet Dental Care topic
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Pet Dental Care Email Agent",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Dental Care",
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
                        response_text = await response.text()
                        self.log_test_result(
                            "Create New Marketing Agent",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False, None
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("agent_id")
                    self.created_agent_ids.append(agent_id)
                    
                    self.log_test_result(
                        "Create New Marketing Agent",
                        True,
                        f"Successfully created marketing agent with ID: {agent_id}",
                        {
                            "Agent ID": agent_id,
                            "Agent Name": "Test Pet Dental Care Email Agent",
                            "Topic": "Pet Dental Care",
                            "Channels": ["email"],
                            "Template": "Dear [CUSTOMER_NAME], [CHATGPT_CONTENT] Best regards, [BUSINESS_NAME]"
                        }
                    )
                    return True, agent_id
                    
        except Exception as e:
            self.log_test_result(
                "Create New Marketing Agent",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_generate_fresh_email_posts(self, agent_id: str):
        """Test 2: Generate fresh email posts and examine database content"""
        print("🔍 TEST 2: Generate Fresh Email Posts")
        print("=" * 70)
        
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
                        response_text = await response.text()
                        self.log_test_result(
                            "Generate Fresh Email Posts",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False, []
                    
                    campaign_result = await response.json()
                
                # Wait for posts to be generated
                await asyncio.sleep(8)  # Give more time for AI generation
                
                # Query database to get the EXACT content stored
                posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                
                if not posts:
                    self.log_test_result(
                        "Generate Fresh Email Posts",
                        False,
                        "No posts were generated",
                        {"Campaign Result": campaign_result}
                    )
                    return False, []
                
                self.log_test_result(
                    "Generate Fresh Email Posts",
                    True,
                    f"Successfully generated {len(posts)} email posts",
                    {
                        "Posts Generated": len(posts),
                        "Campaign Result": campaign_result.get("message", "No message"),
                        "Agent ID": agent_id
                    }
                )
                return True, posts
                
        except Exception as e:
            self.log_test_result(
                "Generate Fresh Email Posts",
                False,
                f"Error generating email posts: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def test_examine_database_content(self, posts: list):
        """Test 3: Examine EXACT content stored in database"""
        print("🔍 TEST 3: Examine Database Content - Print EXACT Fields")
        print("=" * 70)
        
        try:
            if not posts:
                self.log_test_result(
                    "Examine Database Content",
                    False,
                    "No posts to examine",
                    {}
                )
                return False
            
            markdown_issues_found = []
            content_analysis = []
            
            for i, post in enumerate(posts, 1):
                print(f"\n📧 EMAIL POST #{i}")
                print("=" * 50)
                
                # Extract key fields
                content = post.get("content", "")
                email_template = post.get("email_template", "")
                email_subject = post.get("email_subject", "")
                status = post.get("status", "")
                
                print(f"🔍 POST ID: {post.get('id', 'N/A')}")
                print(f"🔍 STATUS: {status}")
                print(f"🔍 EMAIL SUBJECT: '{email_subject}'")
                print(f"🔍 EMAIL SUBJECT LENGTH: {len(email_subject)} characters")
                print()
                
                print("🔍 CONTENT FIELD (what users see):")
                print("-" * 40)
                print(f"'{content}'")
                print()
                
                print("🔍 EMAIL_TEMPLATE FIELD (template used):")
                print("-" * 40)
                print(f"'{email_template}'")
                print()
                
                # Check for markdown formatting in content
                content_markdown = self.check_markdown_formatting(content)
                template_markdown = self.check_markdown_formatting(email_template)
                subject_markdown = self.check_markdown_formatting(email_subject)
                
                print("🔍 MARKDOWN ANALYSIS:")
                print("-" * 40)
                print(f"Content has markdown: {content_markdown['has_markdown']}")
                if content_markdown['patterns_found']:
                    print(f"Content markdown patterns: {list(content_markdown['patterns_found'].keys())}")
                
                print(f"Template has markdown: {template_markdown['has_markdown']}")
                if template_markdown['patterns_found']:
                    print(f"Template markdown patterns: {list(template_markdown['patterns_found'].keys())}")
                
                print(f"Subject has markdown: {subject_markdown['has_markdown']}")
                if subject_markdown['patterns_found']:
                    print(f"Subject markdown patterns: {list(subject_markdown['patterns_found'].keys())}")
                
                print()
                
                # Record issues
                if content_markdown['has_markdown']:
                    markdown_issues_found.append(f"Post #{i} content has markdown: {list(content_markdown['patterns_found'].keys())}")
                
                if template_markdown['has_markdown']:
                    markdown_issues_found.append(f"Post #{i} template has markdown: {list(template_markdown['patterns_found'].keys())}")
                
                if subject_markdown['has_markdown']:
                    markdown_issues_found.append(f"Post #{i} subject has markdown: {list(subject_markdown['patterns_found'].keys())}")
                
                # Check subject length
                subject_too_long = len(email_subject) > 75
                if subject_too_long:
                    markdown_issues_found.append(f"Post #{i} subject too long: {len(email_subject)} characters")
                
                content_analysis.append({
                    "post_id": post.get('id'),
                    "content_has_markdown": content_markdown['has_markdown'],
                    "template_has_markdown": template_markdown['has_markdown'],
                    "subject_has_markdown": subject_markdown['has_markdown'],
                    "subject_length": len(email_subject),
                    "subject_too_long": subject_too_long,
                    "content_patterns": content_markdown['patterns_found'],
                    "template_patterns": template_markdown['patterns_found'],
                    "subject_patterns": subject_markdown['patterns_found']
                })
            
            # Overall assessment
            has_any_issues = len(markdown_issues_found) > 0
            success = not has_any_issues
            
            print("\n🎯 OVERALL ASSESSMENT:")
            print("=" * 50)
            if success:
                print("✅ NO MARKDOWN FORMATTING ISSUES FOUND")
                print("✅ All email content is clean and professional")
                print("✅ All email subjects are appropriate length")
            else:
                print("❌ MARKDOWN FORMATTING ISSUES DETECTED:")
                for issue in markdown_issues_found:
                    print(f"   - {issue}")
            
            self.log_test_result(
                "Examine Database Content",
                success,
                f"Content examination: {'Clean' if success else 'Issues found'}",
                {
                    "Posts Examined": len(posts),
                    "Issues Found": len(markdown_issues_found),
                    "Issues List": markdown_issues_found,
                    "Content Analysis": content_analysis
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Examine Database Content",
                False,
                f"Error examining database content: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_verify_email_subjects(self, posts: list):
        """Test 4: Verify email subject length (should be under 75 characters)"""
        print("🔍 TEST 4: Verify Email Subject Length")
        print("=" * 70)
        
        try:
            if not posts:
                self.log_test_result(
                    "Verify Email Subject Length",
                    False,
                    "No posts to verify",
                    {}
                )
                return False
            
            subject_analysis = []
            long_subjects = []
            
            for i, post in enumerate(posts, 1):
                email_subject = post.get("email_subject", "")
                subject_length = len(email_subject)
                
                subject_analysis.append({
                    "post_number": i,
                    "subject": email_subject,
                    "length": subject_length,
                    "within_limit": subject_length <= 75
                })
                
                if subject_length > 75:
                    long_subjects.append(f"Post #{i}: {subject_length} chars - '{email_subject[:50]}...'")
            
            success = len(long_subjects) == 0
            
            self.log_test_result(
                "Verify Email Subject Length",
                success,
                f"Subject length verification: {'All within 75 chars' if success else f'{len(long_subjects)} subjects too long'}",
                {
                    "Posts Checked": len(posts),
                    "Subjects Within Limit": len([s for s in subject_analysis if s["within_limit"]]),
                    "Subjects Too Long": len(long_subjects),
                    "Long Subjects": long_subjects,
                    "Subject Analysis": subject_analysis
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Email Subject Length",
                False,
                f"Error verifying email subjects: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_identify_issue_location(self, posts: list):
        """Test 5: If issues found, identify exactly where the problem is occurring"""
        print("🔍 TEST 5: Identify Issue Location")
        print("=" * 70)
        
        try:
            if not posts:
                self.log_test_result(
                    "Identify Issue Location",
                    False,
                    "No posts to analyze",
                    {}
                )
                return False
            
            issue_locations = []
            
            for i, post in enumerate(posts, 1):
                content = post.get("content", "")
                email_template = post.get("email_template", "")
                email_subject = post.get("email_subject", "")
                
                # Check where markdown appears
                content_markdown = self.check_markdown_formatting(content)
                template_markdown = self.check_markdown_formatting(email_template)
                subject_markdown = self.check_markdown_formatting(email_subject)
                
                if content_markdown['has_markdown']:
                    issue_locations.append({
                        "post": i,
                        "location": "content field",
                        "patterns": list(content_markdown['patterns_found'].keys()),
                        "sample": content[:200] + "..." if len(content) > 200 else content
                    })
                
                if template_markdown['has_markdown']:
                    issue_locations.append({
                        "post": i,
                        "location": "email_template field",
                        "patterns": list(template_markdown['patterns_found'].keys()),
                        "sample": email_template[:200] + "..." if len(email_template) > 200 else email_template
                    })
                
                if subject_markdown['has_markdown']:
                    issue_locations.append({
                        "post": i,
                        "location": "email_subject field",
                        "patterns": list(subject_markdown['patterns_found'].keys()),
                        "sample": email_subject
                    })
            
            # Analyze the root cause
            root_cause_analysis = {
                "content_field_issues": len([loc for loc in issue_locations if loc["location"] == "content field"]),
                "template_field_issues": len([loc for loc in issue_locations if loc["location"] == "email_template field"]),
                "subject_field_issues": len([loc for loc in issue_locations if loc["location"] == "email_subject field"]),
                "total_issues": len(issue_locations)
            }
            
            success = len(issue_locations) == 0
            
            if not success:
                print("\n🚨 ISSUE LOCATIONS IDENTIFIED:")
                print("=" * 50)
                for issue in issue_locations:
                    print(f"📍 Post #{issue['post']} - {issue['location']}")
                    print(f"   Patterns: {', '.join(issue['patterns'])}")
                    print(f"   Sample: {issue['sample']}")
                    print()
                
                print("🔍 ROOT CAUSE ANALYSIS:")
                print("=" * 30)
                if root_cause_analysis["content_field_issues"] > 0:
                    print(f"❌ Content field has markdown issues ({root_cause_analysis['content_field_issues']} posts)")
                    print("   → This suggests the content cleaning logic is not working properly")
                
                if root_cause_analysis["template_field_issues"] > 0:
                    print(f"❌ Template field has markdown issues ({root_cause_analysis['template_field_issues']} posts)")
                    print("   → This suggests templates are being contaminated with raw ChatGPT output")
                
                if root_cause_analysis["subject_field_issues"] > 0:
                    print(f"❌ Subject field has markdown issues ({root_cause_analysis['subject_field_issues']} posts)")
                    print("   → This suggests subject generation is not cleaning markdown")
            
            self.log_test_result(
                "Identify Issue Location",
                success,
                f"Issue location analysis: {'No issues found' if success else f'{len(issue_locations)} issues identified'}",
                {
                    "Issues Found": len(issue_locations),
                    "Issue Locations": issue_locations,
                    "Root Cause Analysis": root_cause_analysis
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Identify Issue Location",
                False,
                f"Error identifying issue location: {str(e)}",
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
    
    async def run_email_format_tests(self):
        """Run comprehensive email format tests"""
        print("🔍 STARTING MARKETING AGENT EMAIL FORMATTING TESTING")
        print("=" * 80)
        print("Testing for raw markdown output in Marketing Agent email posts")
        print("Focus: Pet Dental Care topic with fresh email generation")
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
            agent_id = None
            posts = []
            
            # Test 1: Create Brand New Marketing Agent
            success1, agent_id = await self.test_create_new_marketing_agent()
            test_results.append(success1)
            
            if success1 and agent_id:
                # Test 2: Generate Fresh Email Posts
                success2, posts = await self.test_generate_fresh_email_posts(agent_id)
                test_results.append(success2)
                
                if success2 and posts:
                    # Test 3: Examine Database Content
                    success3 = await self.test_examine_database_content(posts)
                    test_results.append(success3)
                    
                    # Test 4: Verify Email Subject Length
                    success4 = await self.test_verify_email_subjects(posts)
                    test_results.append(success4)
                    
                    # Test 5: Identify Issue Location
                    success5 = await self.test_identify_issue_location(posts)
                    test_results.append(success5)
                else:
                    # If no posts generated, mark remaining tests as failed
                    test_results.extend([False, False, False])
            else:
                # If agent creation failed, mark all remaining tests as failed
                test_results.extend([False, False, False, False])
            
            # Summary
            print("\n" + "=" * 80)
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
                "Create New Marketing Agent",
                "Generate Fresh Email Posts", 
                "Examine Database Content",
                "Verify Email Subject Length",
                "Identify Issue Location"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("🎯 EMAIL FORMATTING ISSUE STATUS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ EMAIL FORMATTING ISSUE RESOLVED")
                print("   - NEW posts do not contain raw markdown formatting")
                print("   - Email content is clean and professional")
                print("   - Email subjects are appropriate length")
                print("   - Database stores clean content properly")
            else:
                print("❌ EMAIL FORMATTING ISSUE STILL EXISTS")
                failed_tests = [test_names[i] for i, success in enumerate(test_results) if not success]
                print(f"   - Failed tests: {', '.join(failed_tests)}")
                
                # Specific findings
                if len(test_results) >= 3 and not test_results[2]:
                    print("   - NEW posts still contain raw markdown formatting")
                    print("   - The fix is NOT working for new posts")
                elif len(test_results) >= 2 and not test_results[1]:
                    print("   - Unable to generate new posts for testing")
                elif not test_results[0]:
                    print("   - Unable to create new marketing agent")
            
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
    tester = MarketingEmailFormatTester()
    await tester.run_email_format_tests()

if __name__ == "__main__":
    asyncio.run(main())