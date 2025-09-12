#!/usr/bin/env python3
"""
Marketing Agent Field Fixes Testing

This test comprehensively tests the Marketing Agent field fixes as requested:

Test Focus:
1. Create Marketing Agent with Custom Campaign Content - Test creating marketing agent with custom campaign content
2. Verify Field Storage - Test that marketing_custom_campaign, marketing_email_personalized, marketing_sms_personalized are properly saved
3. Create Second Agent with Different Settings - Test with different personalization settings
4. Test Edit Operation - Test updating marketing agent's custom content and personalization settings

Expected Results:
- Marketing agents should be created successfully with custom campaign content
- marketing_custom_campaign field should be properly saved and retrieved
- marketing_email_personalized and marketing_sms_personalized should work correctly
- Edit operations should update the fields correctly
- All corrected field names should work in both create and update operations
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

class MarketingAgentFieldTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_ids = []  # Store multiple agent IDs
        
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
    
    async def test_create_marketing_agent_with_custom_content(self):
        """Test 1: Create Marketing Agent with Custom Campaign Content"""
        print("🔍 TEST 1: Create Marketing Agent with Custom Campaign Content")
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
                "agent_name": "Test Custom Content Fix",
                "mode": "adhoc",
                "marketing_content_type": "custom_campaign",
                "marketing_custom_campaign": "This is my custom marketing campaign content that should be saved and displayed in the dashboard!",
                "marketing_channels": ["email", "sms"],
                "marketing_email_personalized": True,
                "marketing_sms_personalized": False,
                "post_date": "2025-01-25",
                "post_time": "14:00",
                "marketing_workflow_mode": "in_review"
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
                                    "agent_name": agent_doc.get("agent_name") == "Test Custom Content Fix",
                                    "agent_type": agent_doc.get("agent_type") == "marketing_agent",
                                    "marketing_content_type": agent_doc.get("marketing_content_type") == "custom_campaign",
                                    "marketing_custom_campaign": agent_doc.get("marketing_custom_campaign") == "This is my custom marketing campaign content that should be saved and displayed in the dashboard!",
                                    "marketing_channels": agent_doc.get("marketing_channels") == ["email", "sms"],
                                    "marketing_email_personalized": agent_doc.get("marketing_email_personalized") == True,
                                    "marketing_sms_personalized": agent_doc.get("marketing_sms_personalized") == False,
                                    "post_date": agent_doc.get("post_date") == "2025-01-25",
                                    "post_time": agent_doc.get("post_time") == "14:00"
                                }
                            
                            self.log_test_result(
                                "Create Marketing Agent with Custom Content",
                                success,
                                f"Marketing agent created successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "All Fields Correct": all(field_verification.values()) if field_verification else False,
                                    "Custom Campaign Content": agent_doc.get("marketing_custom_campaign") if agent_doc else None
                                }
                            )
                            return success, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Marketing Agent with Custom Content",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Create Marketing Agent with Custom Content",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Create Marketing Agent with Custom Content",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_verify_field_storage(self, agent_id):
        """Test 2: Verify Field Storage - Retrieve agent and confirm fields are properly saved"""
        print("🔍 TEST 2: Verify Field Storage")
        print("=" * 60)
        
        if not agent_id:
            self.log_test_result(
                "Verify Field Storage",
                False,
                "No agent ID available for testing field storage",
                {"Agent ID": agent_id}
            )
            return False, None
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents"
                async with session.get(url, headers=headers, timeout=10) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            agents_list = json.loads(response_text)
                            
                            # Find our specific agent
                            agent_data = None
                            for agent in agents_list:
                                if agent.get("id") == agent_id:
                                    agent_data = agent
                                    break
                            
                            if not agent_data:
                                self.log_test_result(
                                    "Verify Field Storage",
                                    False,
                                    "Agent not found in agents list",
                                    {"Agent ID": agent_id, "Total Agents": len(agents_list)}
                                )
                                return False, None
                            
                            # Verify specific fields are properly stored
                            field_checks = {
                                "marketing_custom_campaign_exists": "marketing_custom_campaign" in agent_data,
                                "marketing_custom_campaign_correct": agent_data.get("marketing_custom_campaign") == "This is my custom marketing campaign content that should be saved and displayed in the dashboard!",
                                "marketing_email_personalized_exists": "marketing_email_personalized" in agent_data,
                                "marketing_email_personalized_correct": agent_data.get("marketing_email_personalized") == True,
                                "marketing_sms_personalized_exists": "marketing_sms_personalized" in agent_data,
                                "marketing_sms_personalized_correct": agent_data.get("marketing_sms_personalized") == False
                            }
                            
                            success = all(field_checks.values())
                            
                            self.log_test_result(
                                "Verify Field Storage",
                                success,
                                f"Field storage verification: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID Match": agent_data.get("id") == agent_id,
                                    "Field Checks": field_checks,
                                    "marketing_custom_campaign": agent_data.get("marketing_custom_campaign"),
                                    "marketing_email_personalized": agent_data.get("marketing_email_personalized"),
                                    "marketing_sms_personalized": agent_data.get("marketing_sms_personalized")
                                }
                            )
                            return success, agent_data
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Verify Field Storage",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Verify Field Storage",
                            False,
                            f"Failed to retrieve marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Verify Field Storage",
                False,
                f"Error verifying field storage: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_create_second_agent_different_settings(self):
        """Test 3: Create Second Agent with Different Settings"""
        print("🔍 TEST 3: Create Second Agent with Different Settings")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Second marketing agent with different personalization settings
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Different Personalization Settings",
                "mode": "adhoc",
                "marketing_content_type": "custom_campaign",
                "marketing_custom_campaign": "Another test campaign with different personalization settings",
                "marketing_channels": ["email", "sms"],
                "marketing_email_personalized": False,  # Different from first agent
                "marketing_sms_personalized": True,     # Different from first agent
                "post_date": "2025-01-26",
                "post_time": "15:00",
                "marketing_workflow_mode": "in_review"
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
                            
                            # Check if all fields were saved correctly with different settings
                            field_verification = {}
                            if agent_doc:
                                field_verification = {
                                    "agent_name": agent_doc.get("agent_name") == "Test Different Personalization Settings",
                                    "marketing_custom_campaign": agent_doc.get("marketing_custom_campaign") == "Another test campaign with different personalization settings",
                                    "marketing_email_personalized": agent_doc.get("marketing_email_personalized") == False,  # Should be False
                                    "marketing_sms_personalized": agent_doc.get("marketing_sms_personalized") == True      # Should be True
                                }
                            
                            self.log_test_result(
                                "Create Second Agent with Different Settings",
                                success,
                                f"Second marketing agent created successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "All Fields Correct": all(field_verification.values()) if field_verification else False,
                                    "Email Personalized": agent_doc.get("marketing_email_personalized") if agent_doc else None,
                                    "SMS Personalized": agent_doc.get("marketing_sms_personalized") if agent_doc else None
                                }
                            )
                            return success, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Second Agent with Different Settings",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Create Second Agent with Different Settings",
                            False,
                            f"Failed to create second marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Create Second Agent with Different Settings",
                False,
                f"Error creating second marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_edit_operation(self, agent_id):
        """Test 4: Test Edit Operation - Update agent's custom content and personalization"""
        print("🔍 TEST 4: Test Edit Operation")
        print("=" * 60)
        
        if not agent_id:
            self.log_test_result(
                "Test Edit Operation",
                False,
                "No agent ID available for testing edit operation",
                {"Agent ID": agent_id}
            )
            return False, None
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Update data for the first agent
            update_data = {
                "marketing_custom_campaign": "Updated custom campaign content to test edit functionality",
                "marketing_email_personalized": False  # Change from True to False
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents/{agent_id}"
                async with session.put(url, headers=headers, json=update_data, timeout=15) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            
                            # Verify agent was updated in database
                            agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
                            
                            success = agent_doc is not None
                            
                            # Check if fields were updated correctly
                            field_verification = {}
                            if agent_doc:
                                field_verification = {
                                    "marketing_custom_campaign_updated": agent_doc.get("marketing_custom_campaign") == "Updated custom campaign content to test edit functionality",
                                    "marketing_email_personalized_updated": agent_doc.get("marketing_email_personalized") == False,
                                    "marketing_sms_personalized_unchanged": agent_doc.get("marketing_sms_personalized") == False  # Should remain unchanged
                                }
                            
                            success = success and all(field_verification.values())
                            
                            self.log_test_result(
                                "Test Edit Operation",
                                success,
                                f"Marketing agent updated successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "All Fields Correct": all(field_verification.values()) if field_verification else False,
                                    "Updated Custom Campaign": agent_doc.get("marketing_custom_campaign") if agent_doc else None,
                                    "Updated Email Personalized": agent_doc.get("marketing_email_personalized") if agent_doc else None
                                }
                            )
                            return success, agent_doc
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Test Edit Operation",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Test Edit Operation",
                            False,
                            f"Failed to update marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Test Edit Operation",
                False,
                f"Error updating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def run_marketing_agent_field_tests(self):
        """Run comprehensive marketing agent field fixes tests"""
        print("🔍 STARTING MARKETING AGENT FIELD FIXES TESTING")
        print("=" * 80)
        print("Testing Marketing Agent field fixes comprehensively")
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
            
            # Test 1: Create Marketing Agent with Custom Campaign Content
            success1, agent_id1 = await self.test_create_marketing_agent_with_custom_content()
            test_results.append(success1)
            
            # Test 2: Verify Field Storage (only if creation succeeded)
            if success1 and agent_id1:
                success2, agent_data = await self.test_verify_field_storage(agent_id1)
                test_results.append(success2)
            else:
                print("⏭️  Skipping field storage test - agent creation failed")
                test_results.append(False)
            
            # Test 3: Create Second Agent with Different Settings
            success3, agent_id2 = await self.test_create_second_agent_different_settings()
            test_results.append(success3)
            
            # Test 4: Test Edit Operation (only if first creation succeeded)
            if success1 and agent_id1:
                success4, updated_agent = await self.test_edit_operation(agent_id1)
                test_results.append(success4)
            else:
                print("⏭️  Skipping edit operation test - first agent creation failed")
                test_results.append(False)
            
            # Summary
            print("=" * 80)
            print("🎯 MARKETING AGENT FIELD FIXES TESTING SUMMARY")
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
                print("✅ CUSTOM CONTENT CREATION: Marketing agent with custom campaign content created successfully")
                print(f"   - Agent ID: {agent_id1}")
            else:
                print("❌ CUSTOM CONTENT CREATION: Failed to create marketing agent with custom content")
            
            # Test 2 Analysis
            if len(test_results) > 1 and test_results[1]:
                print("✅ FIELD STORAGE: marketing_custom_campaign, marketing_email_personalized, marketing_sms_personalized fields properly saved")
            elif len(test_results) > 1:
                print("❌ FIELD STORAGE: Field storage verification failed")
            
            # Test 3 Analysis
            if success3:
                print("✅ DIFFERENT SETTINGS: Second agent with different personalization settings created successfully")
                print(f"   - Agent ID: {agent_id2}")
            else:
                print("❌ DIFFERENT SETTINGS: Failed to create second agent with different settings")
            
            # Test 4 Analysis
            if len(test_results) > 3 and test_results[3]:
                print("✅ EDIT OPERATION: Marketing agent edit operation working correctly")
            elif len(test_results) > 3:
                print("❌ EDIT OPERATION: Edit operation failed")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Create Marketing Agent with Custom Content",
                "Verify Field Storage", 
                "Create Second Agent with Different Settings",
                "Test Edit Operation"
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
    tester = MarketingAgentFieldTester()
    await tester.run_marketing_agent_field_tests()

if __name__ == "__main__":
    asyncio.run(main())