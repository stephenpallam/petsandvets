#!/usr/bin/env python3
"""
Marketing Agent SMS Template Fix Testing

This test comprehensively tests the SMS template fix for Marketing Agent:

Test Focus:
1. Create BRAND NEW Marketing Agent with SMS channel, non-personalized (topic: "Pet Grooming")
2. Generate SMS post and examine the EXACT content stored
3. Verify the content now has the proper SMS template structure:
   - Contains the condensed ChatGPT content
   - Has business information (phone number, business name, booking link)
   - Stays within SMS character limits (under 160 chars)
   - Uses proper SMS template format instead of raw content
4. Print the exact content to show the full SMS template structure

Expected Results:
- SMS posts use proper template structure with ChatGPT content integrated
- No raw ChatGPT content without template structure
- Business information properly included
- Character limits respected
- Proper placeholder replacement
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

class SMSTemplateFixTester:
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
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test SMS Template Fix"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test SMS Template Fix"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def test_create_sms_marketing_agent(self):
        """Test 1: Create BRAND NEW Marketing Agent with SMS channel, non-personalized (topic: Pet Grooming)"""
        print("🔍 TEST 1: Create Marketing Agent with SMS Channel")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with SMS channel, non-personalized, topic: Pet Grooming
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test SMS Template Fix - Pet Grooming",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Grooming",
                "marketing_channels": ["sms"],
                "marketing_sms_personalized": False,  # Non-personalized as requested
                "sms_template": "Hi! [CHATGPT_CONTENT] Contact [BUSINESS_NAME]: [PHONE_NUMBER] or book online: [BOOK_NOW_LINK]",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        self.log_test_result(
                            "Create SMS Marketing Agent",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False, None
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("agent_id")
                    self.created_agent_ids.append(agent_id)
                
                # Verify agent was created correctly
                agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
                if not agent_doc:
                    self.log_test_result(
                        "Create SMS Marketing Agent",
                        False,
                        "Agent not found in database after creation",
                        {"Agent ID": agent_id}
                    )
                    return False, None
                
                success = (
                    agent_doc.get("agent_type") == "marketing_agent" and
                    agent_doc.get("topic") == "Pet Grooming" and
                    "sms" in agent_doc.get("marketing_channels", []) and
                    agent_doc.get("marketing_sms_personalized") == False
                )
                
                self.log_test_result(
                    "Create SMS Marketing Agent",
                    success,
                    f"Marketing agent creation: {success}",
                    {
                        "Agent ID": agent_id,
                        "Agent Type": agent_doc.get("agent_type"),
                        "Topic": agent_doc.get("topic"),
                        "Marketing Channels": agent_doc.get("marketing_channels"),
                        "SMS Personalized": agent_doc.get("marketing_sms_personalized"),
                        "SMS Template": agent_doc.get("sms_template"),
                        "Workflow Mode": agent_doc.get("marketing_workflow_mode")
                    }
                )
                return success, agent_id
                
        except Exception as e:
            self.log_test_result(
                "Create SMS Marketing Agent",
                False,
                f"Error creating SMS marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_generate_sms_post(self, agent_id: str):
        """Test 2: Generate SMS post and examine the EXACT content stored"""
        print("🔍 TEST 2: Generate SMS Post and Examine Content")
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
                        response_text = await response.text()
                        self.log_test_result(
                            "Generate SMS Post",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False, None
                    
                    campaign_result = await response.json()
                
                # Wait for posts to be generated
                await asyncio.sleep(8)
                
                # Query database to get the generated SMS post
                posts = await self.db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
                sms_posts = [p for p in posts if p.get("marketing_channel") == "sms"]
                
                if not sms_posts:
                    self.log_test_result(
                        "Generate SMS Post",
                        False,
                        "No SMS posts found after campaign generation",
                        {"Total Posts": len(posts), "Campaign Result": campaign_result}
                    )
                    return False, None
                
                sms_post = sms_posts[0]  # Get the first SMS post
                content = sms_post.get("content", "")
                
                success = (
                    len(sms_posts) == 1 and  # Should have exactly 1 SMS post
                    content.strip() != "" and  # Should have content
                    len(content) > 20  # Should have meaningful content
                )
                
                self.log_test_result(
                    "Generate SMS Post",
                    success,
                    f"SMS post generation: {success}",
                    {
                        "SMS Posts Count": len(sms_posts),
                        "Total Posts": len(posts),
                        "Content Length": len(content),
                        "Content Preview": content[:100] + "..." if len(content) > 100 else content,
                        "Campaign Status": campaign_result.get("status", "unknown"),
                        "Campaign Message": campaign_result.get("message", "No message")
                    }
                )
                return success, sms_post
                
        except Exception as e:
            self.log_test_result(
                "Generate SMS Post",
                False,
                f"Error generating SMS post: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_verify_sms_template_structure(self, sms_post: dict):
        """Test 3: Verify the content has proper SMS template structure"""
        print("🔍 TEST 3: Verify SMS Template Structure")
        print("=" * 60)
        
        try:
            content = sms_post.get("content", "")
            
            # Check for proper SMS template structure elements
            structure_checks = {
                "has_content": len(content.strip()) > 0,
                "within_character_limit": len(content) <= 160,
                "has_business_info": False,
                "has_phone_number": False,
                "has_booking_link": False,
                "no_raw_chatgpt_markers": True,
                "no_unresolved_placeholders": True,
                "has_meaningful_content": len(content) > 30
            }
            
            # Check for business information
            business_indicators = ["Pets and Vets", "Animal Hospital", "(703)", "petsandvets"]
            structure_checks["has_business_info"] = any(indicator.lower() in content.lower() for indicator in business_indicators)
            
            # Check for phone number
            phone_patterns = ["(703)", "703", "phone", "call"]
            structure_checks["has_phone_number"] = any(pattern in content.lower() for pattern in phone_patterns)
            
            # Check for booking link
            booking_indicators = ["book", "petsandvets", "http", "www", ".com"]
            structure_checks["has_booking_link"] = any(indicator.lower() in content.lower() for indicator in booking_indicators)
            
            # Check for raw ChatGPT markers (should NOT be present)
            raw_markers = ["**Title:", "**Content:", "Title:", "Content:", "**", "##"]
            structure_checks["no_raw_chatgpt_markers"] = not any(marker in content for marker in raw_markers)
            
            # Check for unresolved placeholders (should NOT be present)
            unresolved_placeholders = ["[CHATGPT_CONTENT]", "[CUSTOMER_NAME]", "[PET_NAME]", "[BUSINESS_NAME]", "[PHONE_NUMBER]", "[BOOK_NOW_LINK]"]
            structure_checks["no_unresolved_placeholders"] = not any(placeholder in content for placeholder in unresolved_placeholders)
            
            # Overall success criteria
            success = all(structure_checks.values())
            
            # Print the exact content for verification
            print("📱 EXACT SMS CONTENT:")
            print("=" * 40)
            print(f"Content: {repr(content)}")
            print(f"Length: {len(content)} characters")
            print("=" * 40)
            print("Content (formatted):")
            print(content)
            print("=" * 40)
            
            self.log_test_result(
                "Verify SMS Template Structure",
                success,
                f"SMS template structure verification: {success}",
                {
                    "Content Length": len(content),
                    "Within 160 Char Limit": structure_checks["within_character_limit"],
                    "Has Business Info": structure_checks["has_business_info"],
                    "Has Phone Number": structure_checks["has_phone_number"],
                    "Has Booking Link": structure_checks["has_booking_link"],
                    "No Raw ChatGPT Markers": structure_checks["no_raw_chatgpt_markers"],
                    "No Unresolved Placeholders": structure_checks["no_unresolved_placeholders"],
                    "Has Meaningful Content": structure_checks["has_meaningful_content"],
                    "Exact Content": content,
                    "Content Repr": repr(content)
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify SMS Template Structure",
                False,
                f"Error verifying SMS template structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_verify_chatgpt_content_integration(self, sms_post: dict):
        """Test 4: Verify ChatGPT content is properly integrated into SMS template"""
        print("🔍 TEST 4: Verify ChatGPT Content Integration")
        print("=" * 60)
        
        try:
            content = sms_post.get("content", "")
            sms_template = sms_post.get("sms_template", "")
            
            # Check integration quality
            integration_checks = {
                "content_not_empty": len(content.strip()) > 0,
                "template_structure_preserved": False,
                "chatgpt_content_integrated": False,
                "business_placeholders_replaced": False,
                "content_coherent": False,
                "pet_grooming_topic_present": False
            }
            
            # Check if template structure is preserved (should have greeting + content + business info)
            template_elements = ["hi", "contact", "book", "call"]
            integration_checks["template_structure_preserved"] = any(element.lower() in content.lower() for element in template_elements)
            
            # Check if ChatGPT content is integrated (should have pet grooming related content)
            pet_grooming_keywords = ["groom", "grooming", "pet", "fur", "nail", "bath", "clean", "hygiene", "health", "care"]
            integration_checks["pet_grooming_topic_present"] = any(keyword.lower() in content.lower() for keyword in pet_grooming_keywords)
            
            # Check if business placeholders are replaced
            business_info_present = any(info in content for info in ["Pets and Vets", "(703)", "petsandvets"])
            integration_checks["business_placeholders_replaced"] = business_info_present
            
            # Check if content is coherent (no template artifacts)
            template_artifacts = ["[CHATGPT_CONTENT]", "[BUSINESS_NAME]", "[PHONE_NUMBER]", "[BOOK_NOW_LINK]"]
            integration_checks["chatgpt_content_integrated"] = not any(artifact in content for artifact in template_artifacts)
            
            # Check content coherence (should read naturally)
            integration_checks["content_coherent"] = (
                len(content.split()) > 5 and  # At least 5 words
                not content.startswith("[") and  # Doesn't start with placeholder
                not content.endswith("]")  # Doesn't end with placeholder
            )
            
            success = all(integration_checks.values())
            
            self.log_test_result(
                "Verify ChatGPT Content Integration",
                success,
                f"ChatGPT content integration verification: {success}",
                {
                    "Content Not Empty": integration_checks["content_not_empty"],
                    "Template Structure Preserved": integration_checks["template_structure_preserved"],
                    "ChatGPT Content Integrated": integration_checks["chatgpt_content_integrated"],
                    "Business Placeholders Replaced": integration_checks["business_placeholders_replaced"],
                    "Content Coherent": integration_checks["content_coherent"],
                    "Pet Grooming Topic Present": integration_checks["pet_grooming_topic_present"],
                    "SMS Template": sms_template,
                    "Final Content": content
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify ChatGPT Content Integration",
                False,
                f"Error verifying ChatGPT content integration: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_compare_before_after_fix(self, sms_post: dict):
        """Test 5: Compare content format to ensure it's not raw ChatGPT output"""
        print("🔍 TEST 5: Compare Before/After Fix - No Raw ChatGPT Output")
        print("=" * 60)
        
        try:
            content = sms_post.get("content", "")
            
            # Check for indicators of the OLD broken format (raw ChatGPT output)
            broken_format_indicators = {
                "has_title_markers": "**Title:" in content or "Title:" in content,
                "has_content_markers": "**Content:" in content or "Content:" in content,
                "has_markdown_bold": "**" in content and content.count("**") >= 2,
                "has_markdown_headers": "##" in content or "###" in content,
                "starts_with_title": content.strip().startswith("**Title:") or content.strip().startswith("Title:"),
                "has_unstructured_format": content.count("\n\n") > 2  # Too many paragraph breaks for SMS
            }
            
            # Check for indicators of the NEW fixed format (proper SMS template)
            fixed_format_indicators = {
                "has_greeting": content.lower().startswith("hi") or "hello" in content.lower()[:20],
                "has_business_contact": any(contact in content for contact in ["(703)", "Pets and Vets", "petsandvets"]),
                "has_call_to_action": any(cta in content.lower() for cta in ["call", "book", "contact", "visit"]),
                "proper_sms_length": 50 <= len(content) <= 160,
                "single_paragraph_format": content.count("\n") <= 1,  # SMS should be concise
                "no_formatting_artifacts": not any(artifact in content for artifact in ["**", "##", "Title:", "Content:"])
            }
            
            # Success means NO broken format indicators and ALL fixed format indicators
            no_broken_format = not any(broken_format_indicators.values())
            has_fixed_format = all(fixed_format_indicators.values())
            success = no_broken_format and has_fixed_format
            
            # Determine the format type
            if any(broken_format_indicators.values()):
                format_type = "❌ BROKEN - Raw ChatGPT Output"
            elif has_fixed_format:
                format_type = "✅ FIXED - Proper SMS Template"
            else:
                format_type = "⚠️ PARTIAL - Some Issues Remain"
            
            print("📊 FORMAT ANALYSIS:")
            print("=" * 40)
            print(f"Format Type: {format_type}")
            print(f"Content: {content}")
            print("=" * 40)
            
            self.log_test_result(
                "Compare Before/After Fix",
                success,
                f"Format comparison: {format_type}",
                {
                    "Format Type": format_type,
                    "No Broken Format": no_broken_format,
                    "Has Fixed Format": has_fixed_format,
                    "Broken Format Indicators": broken_format_indicators,
                    "Fixed Format Indicators": fixed_format_indicators,
                    "Content Analysis": {
                        "Length": len(content),
                        "Word Count": len(content.split()),
                        "Line Breaks": content.count("\n"),
                        "Has Markdown": "**" in content or "##" in content,
                        "Has Business Info": any(info in content for info in ["Pets and Vets", "(703)", "petsandvets"])
                    }
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Compare Before/After Fix",
                False,
                f"Error comparing before/after fix: {str(e)}",
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
    
    async def run_sms_template_fix_tests(self):
        """Run comprehensive SMS template fix tests"""
        print("🔍 STARTING MARKETING AGENT SMS TEMPLATE FIX TESTING")
        print("=" * 80)
        print("Testing SMS template fix - proper template structure vs raw ChatGPT content")
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
            
            # Run all tests sequentially
            test_results = []
            
            # Test 1: Create SMS Marketing Agent
            success1, agent_id = await self.test_create_sms_marketing_agent()
            test_results.append(success1)
            
            if not success1 or not agent_id:
                print("❌ Cannot proceed without successful agent creation")
                return
            
            # Test 2: Generate SMS Post
            success2, sms_post = await self.test_generate_sms_post(agent_id)
            test_results.append(success2)
            
            if not success2 or not sms_post:
                print("❌ Cannot proceed without successful SMS post generation")
                return
            
            # Test 3: Verify SMS Template Structure
            success3 = await self.test_verify_sms_template_structure(sms_post)
            test_results.append(success3)
            
            # Test 4: Verify ChatGPT Content Integration
            success4 = await self.test_verify_chatgpt_content_integration(sms_post)
            test_results.append(success4)
            
            # Test 5: Compare Before/After Fix
            success5 = await self.test_compare_before_after_fix(sms_post)
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 SMS TEMPLATE FIX TESTING SUMMARY")
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
                "Create SMS Marketing Agent",
                "Generate SMS Post",
                "Verify SMS Template Structure",
                "Verify ChatGPT Content Integration",
                "Compare Before/After Fix"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
                
                if i == 0 and success:
                    print("   - Marketing Agent created with SMS channel and Pet Grooming topic")
                    print("   - Non-personalized configuration as requested")
                elif i == 1 and success:
                    print("   - SMS post generated successfully")
                    print("   - Content stored in database")
                elif i == 2 and success:
                    print("   - SMS has proper template structure")
                    print("   - Business information included")
                    print("   - Character limits respected")
                elif i == 3 and success:
                    print("   - ChatGPT content properly integrated")
                    print("   - Pet Grooming topic content present")
                    print("   - No unresolved placeholders")
                elif i == 4 and success:
                    print("   - No raw ChatGPT output format")
                    print("   - Proper SMS template format confirmed")
            
            print()
            print("🎯 SMS TEMPLATE FIX STATUS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ SMS TEMPLATE FIX WORKING CORRECTLY")
                print("   - SMS posts use proper template structure")
                print("   - ChatGPT content integrated into template")
                print("   - Business information properly included")
                print("   - Character limits respected")
                print("   - No raw ChatGPT output detected")
            else:
                print("❌ SMS TEMPLATE FIX NEEDS ATTENTION")
                failed_tests = [test_names[i] for i, success in enumerate(test_results) if not success]
                print(f"   - Failed tests: {', '.join(failed_tests)}")
                
                # Provide specific guidance based on failures
                if not test_results[2]:  # Template structure failed
                    print("   - SMS template structure issues detected")
                if not test_results[3]:  # Content integration failed
                    print("   - ChatGPT content integration problems")
                if not test_results[4]:  # Before/after comparison failed
                    print("   - Still showing raw ChatGPT output format")
            
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
    tester = SMSTemplateFixTester()
    await tester.run_sms_template_fix_tests()

if __name__ == "__main__":
    asyncio.run(main())