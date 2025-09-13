#!/usr/bin/env python3
"""
Marketing Agent Email Template Fix Testing

This test specifically tests the Marketing Agent email template fix for non-personalized emails.

Test Focus:
1. Create a BRAND NEW Marketing Agent with email channel, non-personalized (topic: "Pet Exercise")
2. Generate email post and examine the EXACT content stored
3. Verify the content now has the proper email template structure:
   - Starts with "Dear Valued Customer,"
   - Contains the generated content in the middle
   - Ends with "Warm regards," and business information
   - Has replaced global placeholders like [BUSINESS_NAME], [PHONE_NUMBER], [WEBSITE_LINK]
4. Print the exact content to show the full email template structure

The problem was:
- Agent had marketing_email_personalized: False
- Code was calling ChatGPT to "combine content with template" instead of directly using the template
- This caused raw content without the template structure (Dear Valued Customer, etc.)

The fix:
- For non-personalized emails, directly use the email_template_with_content (which has [CHATGPT_CONTENT] replaced)
- Replace customer placeholders with generic values ("Valued Customer", "your pet")
- Apply global placeholder replacement for business info
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

class MarketingEmailTemplateTester:
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
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Email Template Fix"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Email Template Fix"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def test_non_personalized_email_template_fix(self):
        """Test the non-personalized email template fix"""
        print("🔍 TEST: Non-Personalized Email Template Fix")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with NON-PERSONALIZED email channel and topic "Pet Exercise"
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Email Template Fix - Pet Exercise",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Exercise",
                "marketing_channels": ["email"],
                "marketing_email_personalized": False,  # CRITICAL: Non-personalized
                "email_content_template": "Dear Valued Customer,\n\n[CHATGPT_CONTENT]\n\nWarm regards,\n[BUSINESS_NAME]\n📞 [PHONE_NUMBER]\n🌐 [WEBSITE_LINK]\n📅 [BOOK_NOW_LINK]\n\nVisit us at: [BUSINESS_ADDRESS]",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        self.log_test_result(
                            "Non-Personalized Email Template Fix - Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("agent_id")
                    self.created_agent_ids.append(agent_id)
                    
                    print(f"✅ Created Marketing Agent: {agent_id}")
                    print(f"   Agent Name: {agent_data['agent_name']}")
                    print(f"   Topic: {agent_data['topic']}")
                    print(f"   Email Personalized: {agent_data['marketing_email_personalized']}")
                    print()
                
                # Wait a moment for agent creation to complete
                await asyncio.sleep(2)
                
                # Run the marketing campaign generation
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        self.log_test_result(
                            "Non-Personalized Email Template Fix - Campaign Generation",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False
                    
                    campaign_result = await response.json()
                    print(f"✅ Campaign Generation Result: {campaign_result.get('message', 'Success')}")
                    print()
                
                # Wait for posts to be generated
                await asyncio.sleep(5)
                
                # Query database to get the generated email post
                posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                
                if not posts:
                    self.log_test_result(
                        "Non-Personalized Email Template Fix - Post Generation",
                        False,
                        "No posts were generated",
                        {"Agent ID": agent_id, "Posts Found": 0}
                    )
                    return False
                
                # Find the email post
                email_posts = [p for p in posts if p.get("marketing_channel") == "email"]
                
                if not email_posts:
                    self.log_test_result(
                        "Non-Personalized Email Template Fix - Email Post Found",
                        False,
                        "No email posts were generated",
                        {"Total Posts": len(posts), "Email Posts": 0}
                    )
                    return False
                
                email_post = email_posts[0]
                content = email_post.get("content", "")
                
                print("📧 GENERATED EMAIL POST ANALYSIS:")
                print("=" * 50)
                print(f"Post ID: {email_post.get('id')}")
                print(f"Agent ID: {email_post.get('agent_id')}")
                print(f"Marketing Channel: {email_post.get('marketing_channel')}")
                print(f"Status: {email_post.get('status')}")
                print(f"Email Subject: {email_post.get('email_subject', 'N/A')}")
                print()
                
                print("📝 EXACT EMAIL CONTENT:")
                print("=" * 50)
                print(repr(content))  # Show exact content with escape characters
                print()
                print("📄 FORMATTED EMAIL CONTENT:")
                print("=" * 50)
                print(content)
                print()
                
                # Verify email template structure
                template_checks = {
                    "starts_with_dear_valued_customer": content.strip().startswith("Dear Valued Customer"),
                    "contains_warm_regards": "Warm regards" in content or "Best regards" in content,
                    "contains_business_name": "[BUSINESS_NAME]" not in content,  # Should be replaced
                    "contains_phone_number": "[PHONE_NUMBER]" not in content,   # Should be replaced
                    "contains_website_link": "[WEBSITE_LINK]" not in content,   # Should be replaced
                    "contains_book_now_link": "[BOOK_NOW_LINK]" not in content, # Should be replaced
                    "contains_business_address": "[BUSINESS_ADDRESS]" not in content, # Should be replaced
                    "no_chatgpt_content_placeholder": "[CHATGPT_CONTENT]" not in content,  # Should be replaced
                    "has_pet_exercise_content": any(word in content.lower() for word in ["exercise", "activity", "fitness", "walk", "play"]),
                    "proper_email_structure": content.count("\n") >= 2  # Should have line breaks for structure
                }
                
                # Check for specific business information (should be replaced)
                business_info_present = any(info in content for info in [
                    "Pets and Vets Animal Hospital",
                    "(703) 957-3297", 
                    "petsandvetsanimalhospital.com",
                    "South Riding"
                ])
                
                template_checks["business_info_replaced"] = business_info_present
                
                # Overall success criteria
                success = all([
                    template_checks["starts_with_dear_valued_customer"],
                    template_checks["contains_warm_regards"] or "Best regards" in content,
                    template_checks["contains_business_name"],
                    template_checks["contains_phone_number"],
                    template_checks["contains_website_link"],
                    template_checks["no_chatgpt_content_placeholder"],
                    template_checks["has_pet_exercise_content"],
                    template_checks["business_info_replaced"]
                ])
                
                print("🔍 EMAIL TEMPLATE STRUCTURE VERIFICATION:")
                print("=" * 50)
                for check_name, result in template_checks.items():
                    status = "✅" if result else "❌"
                    readable_name = check_name.replace("_", " ").title()
                    print(f"{status} {readable_name}: {result}")
                print()
                
                # Extract and display key parts of the email
                lines = content.split('\n')
                print("📋 EMAIL STRUCTURE BREAKDOWN:")
                print("=" * 50)
                for i, line in enumerate(lines, 1):
                    if line.strip():
                        print(f"Line {i}: {line.strip()}")
                    else:
                        print(f"Line {i}: [EMPTY LINE]")
                print()
                
                # Check for proper greeting
                first_line = lines[0].strip() if lines else ""
                print(f"🎯 GREETING CHECK: '{first_line}'")
                greeting_correct = first_line == "Dear Valued Customer," or first_line.startswith("Dear Valued Customer")
                print(f"   Greeting Correct: {'✅' if greeting_correct else '❌'}")
                print()
                
                # Check for proper closing
                closing_lines = [line.strip() for line in lines[-5:] if line.strip()]
                print(f"🎯 CLOSING CHECK: {closing_lines}")
                closing_correct = any("regards" in line.lower() for line in closing_lines)
                print(f"   Closing Correct: {'✅' if closing_correct else '❌'}")
                print()
                
                self.log_test_result(
                    "Non-Personalized Email Template Fix",
                    success,
                    f"Email template structure verification: {'PASSED' if success else 'FAILED'}",
                    {
                        "Agent ID": agent_id,
                        "Email Post ID": email_post.get('id'),
                        "Content Length": len(content),
                        "Starts With Dear Valued Customer": template_checks["starts_with_dear_valued_customer"],
                        "Contains Warm/Best Regards": template_checks["contains_warm_regards"],
                        "Business Name Replaced": template_checks["contains_business_name"],
                        "Phone Number Replaced": template_checks["contains_phone_number"],
                        "Website Link Replaced": template_checks["contains_website_link"],
                        "Book Now Link Replaced": template_checks["contains_book_now_link"],
                        "Business Address Replaced": template_checks["contains_business_address"],
                        "ChatGPT Content Placeholder Replaced": template_checks["no_chatgpt_content_placeholder"],
                        "Has Pet Exercise Content": template_checks["has_pet_exercise_content"],
                        "Business Info Present": template_checks["business_info_replaced"],
                        "Proper Email Structure": template_checks["proper_email_structure"],
                        "Email Subject": email_post.get('email_subject', 'N/A'),
                        "First Line": first_line,
                        "Greeting Correct": greeting_correct,
                        "Closing Correct": closing_correct
                    }
                )
                
                return success
                
        except Exception as e:
            self.log_test_result(
                "Non-Personalized Email Template Fix",
                False,
                f"Error in email template fix test: {str(e)}",
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
    
    async def run_email_template_tests(self):
        """Run email template fix tests"""
        print("🔍 STARTING MARKETING AGENT EMAIL TEMPLATE FIX TESTING")
        print("=" * 80)
        print("Testing Marketing Agent email template fix for non-personalized emails")
        print("Focus: Proper email template structure with 'Dear Valued Customer' greeting")
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
            
            # Run the main test
            success = await self.test_non_personalized_email_template_fix()
            
            # Summary
            print("=" * 80)
            print("🎯 EMAIL TEMPLATE FIX TESTING SUMMARY")
            print("=" * 80)
            
            if success:
                print("✅ EMAIL TEMPLATE FIX WORKING CORRECTLY")
                print("   - Non-personalized emails use proper template structure")
                print("   - Starts with 'Dear Valued Customer,'")
                print("   - Contains generated Pet Exercise content")
                print("   - Ends with 'Warm regards,' and business information")
                print("   - Global placeholders properly replaced")
                print("   - No raw [CHATGPT_CONTENT] placeholders remaining")
            else:
                print("❌ EMAIL TEMPLATE FIX NEEDS ATTENTION")
                print("   - Email template structure not working as expected")
                print("   - Check the detailed test results above")
            
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
    tester = MarketingEmailTemplateTester()
    await tester.run_email_template_tests()

if __name__ == "__main__":
    asyncio.run(main())