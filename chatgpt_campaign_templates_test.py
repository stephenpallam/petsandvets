#!/usr/bin/env python3
"""
ChatGPT Campaign Templates Testing

This test specifically focuses on the new ChatGPT Campaign Templates system as requested:

Test Focus:
1. Re-initialize Templates: Call POST /api/templates/initialize-defaults to create new ChatGPT campaign templates
2. Verify New Templates: Check that the new templates were created with proper filtering
3. Verify Template Content: Check that templates contain [CHATGPT_CONTENT] placeholder
4. Test Template Filtering Logic: Verify templates are properly categorized

Expected ChatGPT Campaign Templates:
- "Campaign Email - Personalized (ChatGPT)" with [CHATGPT_CONTENT] and [CUSTOMER_NAME], [PET_NAME]
- "Campaign Email - General (ChatGPT)" with [CHATGPT_CONTENT] and global placeholders only
- "Campaign SMS - Personalized (ChatGPT)" with [CHATGPT_CONTENT] and [CUSTOMER_NAME], [PET_NAME]
- "Campaign SMS - General (ChatGPT)" with [CHATGPT_CONTENT] and global placeholders only
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

class ChatGPTCampaignTemplatesTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://marketing-agent.preview.emergentagent.com')
        self.auth_token = None
        
        # Expected ChatGPT Campaign Templates
        self.expected_chatgpt_templates = {
            "email": [
                "Campaign Email - Personalized (ChatGPT)",
                "Campaign Email - General (ChatGPT)"
            ],
            "sms": [
                "Campaign SMS - Personalized (ChatGPT)",
                "Campaign SMS - General (ChatGPT)"
            ]
        }
        
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
    
    async def test_1_reinitialize_templates(self):
        """Test 1: Re-initialize Templates to create ChatGPT Campaign Templates"""
        print("🔍 TEST 1: Re-initialize Templates for ChatGPT Campaign Templates")
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
                url = f"{self.backend_url}/api/templates/initialize-defaults"
                async with session.post(url, headers=headers, timeout=15) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            
                            # Verify templates were created/updated
                            templates = await self.db.templates.find().to_list(length=None)
                            
                            # Check for ChatGPT Campaign Templates specifically
                            chatgpt_email_templates = [
                                t for t in templates 
                                if t.get("type") == "email" and "ChatGPT" in t.get("name", "")
                            ]
                            chatgpt_sms_templates = [
                                t for t in templates 
                                if t.get("type") == "sms" and "ChatGPT" in t.get("name", "")
                            ]
                            
                            chatgpt_email_names = [t.get("name") for t in chatgpt_email_templates]
                            chatgpt_sms_names = [t.get("name") for t in chatgpt_sms_templates]
                            
                            # Check if all expected ChatGPT templates exist
                            email_templates_found = all(
                                name in chatgpt_email_names 
                                for name in self.expected_chatgpt_templates["email"]
                            )
                            sms_templates_found = all(
                                name in chatgpt_sms_names 
                                for name in self.expected_chatgpt_templates["sms"]
                            )
                            
                            success = email_templates_found and sms_templates_found
                            
                            self.log_test_result(
                                "Re-initialize Templates for ChatGPT Campaign Templates",
                                success,
                                f"ChatGPT Campaign Templates initialization: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Response Message": result.get("message"),
                                    "Total Templates": len(templates),
                                    "ChatGPT Email Templates Found": len(chatgpt_email_templates),
                                    "ChatGPT SMS Templates Found": len(chatgpt_sms_templates),
                                    "Expected Email Templates Found": email_templates_found,
                                    "Expected SMS Templates Found": sms_templates_found,
                                    "ChatGPT Email Template Names": chatgpt_email_names,
                                    "ChatGPT SMS Template Names": chatgpt_sms_names,
                                    "Expected Email Templates": self.expected_chatgpt_templates["email"],
                                    "Expected SMS Templates": self.expected_chatgpt_templates["sms"]
                                }
                            )
                            return success
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Re-initialize Templates for ChatGPT Campaign Templates",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False
                    else:
                        self.log_test_result(
                            "Re-initialize Templates for ChatGPT Campaign Templates",
                            False,
                            f"Failed to initialize templates: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False
                        
        except Exception as e:
            self.log_test_result(
                "Re-initialize Templates for ChatGPT Campaign Templates",
                False,
                f"Error initializing templates: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_2_verify_new_templates(self):
        """Test 2: Verify New ChatGPT Campaign Templates were created"""
        print("🔍 TEST 2: Verify New ChatGPT Campaign Templates")
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
                # Test 2a: GET email templates and check for ChatGPT campaign templates
                url = f"{self.backend_url}/api/templates?template_type=email"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Verify New ChatGPT Email Templates",
                            False,
                            f"Failed to get email templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    email_templates = await response.json()
                
                # Test 2b: GET SMS templates and check for ChatGPT campaign templates
                url = f"{self.backend_url}/api/templates?template_type=sms"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Verify New ChatGPT SMS Templates",
                            False,
                            f"Failed to get SMS templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    sms_templates = await response.json()
                
                # Filter for ChatGPT campaign templates
                chatgpt_email_templates = [
                    t for t in email_templates 
                    if "ChatGPT" in t.get("name", "") and "Campaign" in t.get("name", "")
                ]
                chatgpt_sms_templates = [
                    t for t in sms_templates 
                    if "ChatGPT" in t.get("name", "") and "Campaign" in t.get("name", "")
                ]
                
                chatgpt_email_names = [t.get("name") for t in chatgpt_email_templates]
                chatgpt_sms_names = [t.get("name") for t in chatgpt_sms_templates]
                
                # Verify all expected templates are present
                email_templates_found = all(
                    name in chatgpt_email_names 
                    for name in self.expected_chatgpt_templates["email"]
                )
                sms_templates_found = all(
                    name in chatgpt_sms_names 
                    for name in self.expected_chatgpt_templates["sms"]
                )
                
                # Verify template types are correct
                email_types_correct = all(t.get("type") == "email" for t in chatgpt_email_templates)
                sms_types_correct = all(t.get("type") == "sms" for t in chatgpt_sms_templates)
                
                success = (
                    email_templates_found and 
                    sms_templates_found and 
                    email_types_correct and 
                    sms_types_correct and
                    len(chatgpt_email_templates) == 2 and
                    len(chatgpt_sms_templates) == 2
                )
                
                self.log_test_result(
                    "Verify New ChatGPT Campaign Templates",
                    success,
                    f"ChatGPT Campaign Templates verification: {success}",
                    {
                        "Total Email Templates": len(email_templates),
                        "Total SMS Templates": len(sms_templates),
                        "ChatGPT Email Templates Count": len(chatgpt_email_templates),
                        "ChatGPT SMS Templates Count": len(chatgpt_sms_templates),
                        "Expected Email Templates Found": email_templates_found,
                        "Expected SMS Templates Found": sms_templates_found,
                        "Email Types Correct": email_types_correct,
                        "SMS Types Correct": sms_types_correct,
                        "ChatGPT Email Template Names": chatgpt_email_names,
                        "ChatGPT SMS Template Names": chatgpt_sms_names
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Verify New ChatGPT Campaign Templates",
                False,
                f"Error verifying templates: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_3_verify_template_content(self):
        """Test 3: Verify Template Content contains [CHATGPT_CONTENT] placeholder"""
        print("🔍 TEST 3: Verify Template Content with [CHATGPT_CONTENT] Placeholder")
        print("=" * 70)
        
        try:
            # Get templates from database directly for content verification
            templates = await self.db.templates.find({
                "name": {"$regex": "Campaign.*ChatGPT"}
            }).to_list(length=None)
            
            content_verification = {}
            placeholder_verification = {}
            
            for template in templates:
                template_name = template.get("name")
                template_content = template.get("content", "")
                
                # Check for [CHATGPT_CONTENT] placeholder
                has_chatgpt_content = "[CHATGPT_CONTENT]" in template_content
                content_verification[template_name] = has_chatgpt_content
                
                # Check for appropriate placeholders based on template type
                if "Personalized" in template_name:
                    # Personalized templates should have customer and pet placeholders
                    has_customer_name = "[CUSTOMER_NAME]" in template_content
                    has_pet_name = "[PET_NAME]" in template_content
                    has_global_placeholders = any(
                        placeholder in template_content 
                        for placeholder in ["[BUSINESS_NAME]", "[PHONE_NUMBER]", "[WEBSITE_LINK]", "[BOOK_NOW_LINK]", "[BUSINESS_ADDRESS]"]
                    )
                    placeholder_verification[template_name] = {
                        "has_customer_name": has_customer_name,
                        "has_pet_name": has_pet_name,
                        "has_global_placeholders": has_global_placeholders,
                        "personalized_correct": has_customer_name and has_pet_name and has_global_placeholders
                    }
                elif "General" in template_name:
                    # General templates should only have global placeholders
                    has_customer_name = "[CUSTOMER_NAME]" in template_content
                    has_pet_name = "[PET_NAME]" in template_content
                    has_global_placeholders = any(
                        placeholder in template_content 
                        for placeholder in ["[BUSINESS_NAME]", "[PHONE_NUMBER]", "[WEBSITE_LINK]", "[BOOK_NOW_LINK]", "[BUSINESS_ADDRESS]"]
                    )
                    placeholder_verification[template_name] = {
                        "has_customer_name": has_customer_name,
                        "has_pet_name": has_pet_name,
                        "has_global_placeholders": has_global_placeholders,
                        "general_correct": not has_customer_name and not has_pet_name and has_global_placeholders
                    }
            
            # Verify all templates have [CHATGPT_CONTENT]
            all_have_chatgpt_content = all(content_verification.values())
            
            # Verify placeholder structure is correct
            personalized_templates_correct = all(
                v.get("personalized_correct", True) 
                for k, v in placeholder_verification.items() 
                if "Personalized" in k
            )
            general_templates_correct = all(
                v.get("general_correct", True) 
                for k, v in placeholder_verification.items() 
                if "General" in k
            )
            
            success = (
                all_have_chatgpt_content and 
                personalized_templates_correct and 
                general_templates_correct and
                len(templates) == 4  # Should have exactly 4 ChatGPT campaign templates
            )
            
            self.log_test_result(
                "Verify Template Content with [CHATGPT_CONTENT] Placeholder",
                success,
                f"Template content verification: {success}",
                {
                    "Templates Found": len(templates),
                    "All Have [CHATGPT_CONTENT]": all_have_chatgpt_content,
                    "Personalized Templates Correct": personalized_templates_correct,
                    "General Templates Correct": general_templates_correct,
                    "Content Verification": content_verification,
                    "Placeholder Verification": placeholder_verification,
                    "Template Names": [t.get("name") for t in templates]
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Template Content with [CHATGPT_CONTENT] Placeholder",
                False,
                f"Error verifying template content: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_4_template_filtering_logic(self):
        """Test 4: Test Template Filtering Logic for Campaign Templates"""
        print("🔍 TEST 4: Test Template Filtering Logic for Campaign Templates")
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
                # Test 4a: Get all templates
                url = f"{self.backend_url}/api/templates"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template Filtering Logic - Get All Templates",
                            False,
                            f"Failed to get all templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    all_templates = await response.json()
                
                # Test 4b: Get email templates only
                url = f"{self.backend_url}/api/templates?template_type=email"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template Filtering Logic - Get Email Templates",
                            False,
                            f"Failed to get email templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    email_templates = await response.json()
                
                # Test 4c: Get SMS templates only
                url = f"{self.backend_url}/api/templates?template_type=sms"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template Filtering Logic - Get SMS Templates",
                            False,
                            f"Failed to get SMS templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    sms_templates = await response.json()
                
                # Analyze filtering results
                total_templates = len(all_templates)
                total_email = len(email_templates)
                total_sms = len(sms_templates)
                
                # Check that filtering works correctly
                email_types_correct = all(t.get("type") == "email" for t in email_templates)
                sms_types_correct = all(t.get("type") == "sms" for t in sms_templates)
                
                # Check that email + sms = total (no templates lost in filtering)
                totals_match = (total_email + total_sms) == total_templates
                
                # Identify campaign templates specifically
                campaign_email_templates = [
                    t for t in email_templates 
                    if "Campaign" in t.get("name", "") and "ChatGPT" in t.get("name", "")
                ]
                campaign_sms_templates = [
                    t for t in sms_templates 
                    if "Campaign" in t.get("name", "") and "ChatGPT" in t.get("name", "")
                ]
                
                # Check campaign template categorization
                campaign_templates_identifiable = (
                    len(campaign_email_templates) == 2 and
                    len(campaign_sms_templates) == 2
                )
                
                # Verify campaign templates are distinct from regular templates
                regular_email_templates = [
                    t for t in email_templates 
                    if not ("Campaign" in t.get("name", "") and "ChatGPT" in t.get("name", ""))
                ]
                regular_sms_templates = [
                    t for t in sms_templates 
                    if not ("Campaign" in t.get("name", "") and "ChatGPT" in t.get("name", ""))
                ]
                
                templates_distinct = (
                    len(regular_email_templates) > 0 and
                    len(regular_sms_templates) > 0
                )
                
                success = (
                    email_types_correct and
                    sms_types_correct and
                    totals_match and
                    campaign_templates_identifiable and
                    templates_distinct
                )
                
                self.log_test_result(
                    "Test Template Filtering Logic for Campaign Templates",
                    success,
                    f"Template filtering logic: {success}",
                    {
                        "Total Templates": total_templates,
                        "Email Templates": total_email,
                        "SMS Templates": total_sms,
                        "Email Types Correct": email_types_correct,
                        "SMS Types Correct": sms_types_correct,
                        "Totals Match": totals_match,
                        "Campaign Email Templates": len(campaign_email_templates),
                        "Campaign SMS Templates": len(campaign_sms_templates),
                        "Campaign Templates Identifiable": campaign_templates_identifiable,
                        "Regular Email Templates": len(regular_email_templates),
                        "Regular SMS Templates": len(regular_sms_templates),
                        "Templates Distinct": templates_distinct,
                        "Campaign Email Names": [t.get("name") for t in campaign_email_templates],
                        "Campaign SMS Names": [t.get("name") for t in campaign_sms_templates]
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Test Template Filtering Logic for Campaign Templates",
                False,
                f"Error testing filtering logic: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_chatgpt_campaign_templates_tests(self):
        """Run comprehensive ChatGPT Campaign Templates tests"""
        print("🔍 STARTING CHATGPT CAMPAIGN TEMPLATES TESTING")
        print("=" * 80)
        print("Testing new ChatGPT Campaign Templates system as requested")
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
            
            # Test 1: Re-initialize Templates
            success1 = await self.test_1_reinitialize_templates()
            test_results.append(success1)
            
            # Test 2: Verify New Templates
            success2 = await self.test_2_verify_new_templates()
            test_results.append(success2)
            
            # Test 3: Verify Template Content
            success3 = await self.test_3_verify_template_content()
            test_results.append(success3)
            
            # Test 4: Test Template Filtering Logic
            success4 = await self.test_4_template_filtering_logic()
            test_results.append(success4)
            
            # Summary
            print("=" * 80)
            print("🎯 CHATGPT CAMPAIGN TEMPLATES TESTING SUMMARY")
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
                print("✅ TEMPLATE INITIALIZATION: ChatGPT Campaign Templates created successfully")
                print("   - Campaign Email - Personalized (ChatGPT)")
                print("   - Campaign Email - General (ChatGPT)")
                print("   - Campaign SMS - Personalized (ChatGPT)")
                print("   - Campaign SMS - General (ChatGPT)")
            else:
                print("❌ TEMPLATE INITIALIZATION: Failed to create ChatGPT Campaign Templates")
            
            # Test 2 Analysis
            if success2:
                print("✅ TEMPLATE VERIFICATION: All ChatGPT Campaign Templates found and properly categorized")
                print("   - Email templates filtered correctly")
                print("   - SMS templates filtered correctly")
                print("   - Template types verified")
            else:
                print("❌ TEMPLATE VERIFICATION: ChatGPT Campaign Templates not found or incorrectly categorized")
            
            # Test 3 Analysis
            if success3:
                print("✅ CONTENT VERIFICATION: All templates contain [CHATGPT_CONTENT] placeholder")
                print("   - Personalized templates have [CUSTOMER_NAME], [PET_NAME] placeholders")
                print("   - General templates have only global placeholders")
                print("   - Template content structure verified")
            else:
                print("❌ CONTENT VERIFICATION: Template content issues found")
            
            # Test 4 Analysis
            if success4:
                print("✅ FILTERING LOGIC: Template filtering and categorization working correctly")
                print("   - Campaign templates identifiable by 'Campaign' and 'ChatGPT' in name")
                print("   - Templates distinct from regular templates")
                print("   - API filtering by template_type working")
            else:
                print("❌ FILTERING LOGIC: Template filtering issues found")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Re-initialize Templates for ChatGPT Campaign Templates",
                "Verify New ChatGPT Campaign Templates",
                "Verify Template Content with [CHATGPT_CONTENT] Placeholder",
                "Test Template Filtering Logic for Campaign Templates"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("🎯 CHATGPT CAMPAIGN TEMPLATES READINESS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ CHATGPT CAMPAIGN TEMPLATES SYSTEM READY FOR USE")
                print("   - All 4 ChatGPT campaign templates created and verified")
                print("   - [CHATGPT_CONTENT] placeholder properly implemented")
                print("   - Template filtering and categorization working")
                print("   - Ready for Topic/Holiday marketing campaigns")
            else:
                print("❌ CHATGPT CAMPAIGN TEMPLATES SYSTEM NEEDS ATTENTION")
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
    tester = ChatGPTCampaignTemplatesTester()
    await tester.run_chatgpt_campaign_templates_tests()

if __name__ == "__main__":
    asyncio.run(main())