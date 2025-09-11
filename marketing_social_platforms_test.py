#!/usr/bin/env python3
"""
Marketing Agent Social Platforms Fix Testing

This test comprehensively tests the Marketing Agent social platforms fixes as requested:

Test Focus:
1. Create Marketing Agent with Social Platforms - Test marketing_social_platforms field mapping
2. Verify Field Mapping - Ensure marketing_social_platforms (not social_platforms) is saved
3. Retrieve Agent Data - Verify the field exists and contains correct data
4. Test Multi-Channel Agent - Test with multiple channels including social_media and email
5. Edit Agent Test - Update social platforms and verify changes

Expected Results:
- marketing_social_platforms field should be properly saved and retrievable
- Field should be a proper dictionary with boolean values
- Multi-channel agents should work correctly
- Edit operations should update social platforms correctly
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

class MarketingSocialPlatformsTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
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
    
    async def test_create_marketing_agent_with_social_platforms(self):
        """Test 1: Create Marketing Agent with Social Platforms - Test marketing_social_platforms field"""
        print("🔍 TEST 1: Create Marketing Agent with Social Platforms")
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
                "agent_name": "Test Social Platforms Display Fix",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media"],
                "marketing_social_platforms": {
                    "facebook": True,
                    "instagram": True,
                    "twitter": False,
                    "whatsapp": False
                },
                "post_date": "2025-01-20",
                "post_time": "10:00",
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
                            
                            success = agent_doc is not None
                            
                            # Check marketing_social_platforms field specifically
                            social_platforms = agent_doc.get("marketing_social_platforms") if agent_doc else None
                            expected_platforms = {
                                "facebook": True,
                                "instagram": True,
                                "twitter": False,
                                "whatsapp": False
                            }
                            
                            platforms_correct = social_platforms == expected_platforms
                            is_dict = isinstance(social_platforms, dict)
                            
                            self.log_test_result(
                                "Create Marketing Agent with Social Platforms",
                                success and platforms_correct,
                                f"Agent created with correct marketing_social_platforms: {platforms_correct}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "marketing_social_platforms exists": social_platforms is not None,
                                    "Is Dictionary": is_dict,
                                    "Expected Platforms": expected_platforms,
                                    "Actual Platforms": social_platforms,
                                    "Platforms Match": platforms_correct,
                                    "Response": result
                                }
                            )
                            return success and platforms_correct, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Marketing Agent with Social Platforms",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Create Marketing Agent with Social Platforms",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Create Marketing Agent with Social Platforms",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_verify_field_mapping(self, agent_id):
        """Test 2: Verify Field Mapping - Ensure marketing_social_platforms (not social_platforms) is saved"""
        print("🔍 TEST 2: Verify Field Mapping")
        print("=" * 60)
        
        if not agent_id:
            self.log_test_result(
                "Verify Field Mapping",
                False,
                "No agent ID available for field mapping verification",
                {"Agent ID": agent_id}
            )
            return False
        
        try:
            # Check database directly for field mapping
            agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
            
            if not agent_doc:
                self.log_test_result(
                    "Verify Field Mapping",
                    False,
                    "Agent not found in database",
                    {"Agent ID": agent_id}
                )
                return False
            
            # Check for correct field name
            has_marketing_social_platforms = "marketing_social_platforms" in agent_doc
            has_wrong_social_platforms = "social_platforms" in agent_doc
            
            marketing_platforms_value = agent_doc.get("marketing_social_platforms")
            wrong_platforms_value = agent_doc.get("social_platforms")
            
            # Field should be marketing_social_platforms, not social_platforms
            success = has_marketing_social_platforms and not has_wrong_social_platforms
            
            self.log_test_result(
                "Verify Field Mapping",
                success,
                f"Correct field mapping: marketing_social_platforms exists: {has_marketing_social_platforms}, social_platforms exists: {has_wrong_social_platforms}",
                {
                    "Agent ID": agent_id,
                    "Has marketing_social_platforms": has_marketing_social_platforms,
                    "Has social_platforms (wrong)": has_wrong_social_platforms,
                    "marketing_social_platforms value": marketing_platforms_value,
                    "social_platforms value": wrong_platforms_value,
                    "Field mapping correct": success,
                    "All agent fields": list(agent_doc.keys())
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Field Mapping",
                False,
                f"Error verifying field mapping: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_retrieve_agent_data(self, agent_id):
        """Test 3: Retrieve Agent Data - Verify the field exists and contains correct data"""
        print("🔍 TEST 3: Retrieve Agent Data")
        print("=" * 60)
        
        if not agent_id:
            self.log_test_result(
                "Retrieve Agent Data",
                False,
                "No agent ID available for data retrieval",
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
                                    "Retrieve Agent Data",
                                    False,
                                    "Agent not found in agents list",
                                    {"Agent ID": agent_id, "Total Agents": len(agents_list)}
                                )
                                return False, None
                            
                            # Verify marketing_social_platforms field
                            social_platforms = agent_data.get("marketing_social_platforms")
                            expected_platforms = {
                                "facebook": True,
                                "instagram": True,
                                "twitter": False,
                                "whatsapp": False
                            }
                            
                            field_exists = social_platforms is not None
                            is_dict = isinstance(social_platforms, dict)
                            has_boolean_values = all(isinstance(v, bool) for v in social_platforms.values()) if is_dict else False
                            platforms_match = social_platforms == expected_platforms
                            
                            success = field_exists and is_dict and has_boolean_values and platforms_match
                            
                            self.log_test_result(
                                "Retrieve Agent Data",
                                success,
                                f"Agent data retrieved with correct marketing_social_platforms: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID Match": agent_data.get("id") == agent_id,
                                    "Field Exists": field_exists,
                                    "Is Dictionary": is_dict,
                                    "Has Boolean Values": has_boolean_values,
                                    "Platforms Match Expected": platforms_match,
                                    "Expected Platforms": expected_platforms,
                                    "Actual Platforms": social_platforms,
                                    "Agent Data Keys": list(agent_data.keys())
                                }
                            )
                            return success, agent_data
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Retrieve Agent Data",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Retrieve Agent Data",
                            False,
                            f"Failed to retrieve agent data: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Retrieve Agent Data",
                False,
                f"Error retrieving agent data: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_multi_channel_agent(self):
        """Test 4: Test Multi-Channel Agent - Test with multiple channels including social_media and email"""
        print("🔍 TEST 4: Test Multi-Channel Agent")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Multi-channel marketing agent data as specified in the request
            multi_channel_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Multi-Channel Agent",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media", "email"],
                "marketing_social_platforms": {
                    "facebook": False,
                    "instagram": True,
                    "twitter": True,
                    "whatsapp": False
                },
                "marketing_email_personalization": True,
                "email_content_template": "Test email template",
                "post_date": "2025-01-20",
                "post_time": "10:00",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=multi_channel_agent_data, timeout=15) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            agent_id = result.get("agent_id")
                            self.created_agent_ids.append(agent_id)
                            
                            # Verify agent was created in database
                            agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
                            
                            success = agent_doc is not None
                            
                            # Check multi-channel configuration
                            channels = agent_doc.get("marketing_channels") if agent_doc else None
                            social_platforms = agent_doc.get("marketing_social_platforms") if agent_doc else None
                            email_personalization = agent_doc.get("marketing_email_personalization") if agent_doc else None
                            email_template = agent_doc.get("email_content_template") if agent_doc else None
                            
                            expected_channels = ["social_media", "email"]
                            expected_platforms = {
                                "facebook": False,
                                "instagram": True,
                                "twitter": True,
                                "whatsapp": False
                            }
                            
                            channels_correct = channels == expected_channels
                            platforms_correct = social_platforms == expected_platforms
                            email_config_correct = email_personalization == True and email_template == "Test email template"
                            
                            all_correct = channels_correct and platforms_correct and email_config_correct
                            
                            self.log_test_result(
                                "Test Multi-Channel Agent",
                                success and all_correct,
                                f"Multi-channel agent created with correct configuration: {all_correct}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Expected Channels": expected_channels,
                                    "Actual Channels": channels,
                                    "Channels Correct": channels_correct,
                                    "Expected Platforms": expected_platforms,
                                    "Actual Platforms": social_platforms,
                                    "Platforms Correct": platforms_correct,
                                    "Email Personalization": email_personalization,
                                    "Email Template": email_template,
                                    "Email Config Correct": email_config_correct,
                                    "Response": result
                                }
                            )
                            return success and all_correct, agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Test Multi-Channel Agent",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Test Multi-Channel Agent",
                            False,
                            f"Failed to create multi-channel agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Test Multi-Channel Agent",
                False,
                f"Error creating multi-channel agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_edit_agent(self, agent_id):
        """Test 5: Edit Agent Test - Update social platforms and verify changes"""
        print("🔍 TEST 5: Edit Agent Test")
        print("=" * 60)
        
        if not agent_id:
            self.log_test_result(
                "Edit Agent Test",
                False,
                "No agent ID available for edit test",
                {"Agent ID": agent_id}
            )
            return False
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Updated social platforms as specified in the request
            update_data = {
                "marketing_social_platforms": {
                    "facebook": False,
                    "instagram": False,
                    "twitter": True,
                    "whatsapp": True
                }
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
                            
                            if not agent_doc:
                                self.log_test_result(
                                    "Edit Agent Test",
                                    False,
                                    "Agent not found after update",
                                    {"Agent ID": agent_id}
                                )
                                return False
                            
                            # Check updated social platforms
                            social_platforms = agent_doc.get("marketing_social_platforms")
                            expected_platforms = {
                                "facebook": False,
                                "instagram": False,
                                "twitter": True,
                                "whatsapp": True
                            }
                            
                            platforms_updated = social_platforms == expected_platforms
                            
                            self.log_test_result(
                                "Edit Agent Test",
                                platforms_updated,
                                f"Agent social platforms updated correctly: {platforms_updated}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": agent_id,
                                    "Expected Platforms": expected_platforms,
                                    "Actual Platforms": social_platforms,
                                    "Platforms Updated": platforms_updated,
                                    "Response": result
                                }
                            )
                            return platforms_updated
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Edit Agent Test",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False
                    else:
                        self.log_test_result(
                            "Edit Agent Test",
                            False,
                            f"Failed to update agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False
                        
        except Exception as e:
            self.log_test_result(
                "Edit Agent Test",
                False,
                f"Error updating agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_social_platforms_tests(self):
        """Run comprehensive marketing agent social platforms tests"""
        print("🔍 STARTING MARKETING AGENT SOCIAL PLATFORMS TESTING")
        print("=" * 80)
        print("Testing Marketing Agent social platforms fixes comprehensively")
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
            
            # Test 1: Create Marketing Agent with Social Platforms
            success1, agent_id1 = await self.test_create_marketing_agent_with_social_platforms()
            test_results.append(success1)
            
            # Test 2: Verify Field Mapping (only if creation succeeded)
            if success1 and agent_id1:
                success2 = await self.test_verify_field_mapping(agent_id1)
                test_results.append(success2)
            else:
                print("⏭️  Skipping field mapping test - agent creation failed")
                test_results.append(False)
            
            # Test 3: Retrieve Agent Data (only if creation succeeded)
            if success1 and agent_id1:
                success3, agent_data = await self.test_retrieve_agent_data(agent_id1)
                test_results.append(success3)
            else:
                print("⏭️  Skipping data retrieval test - agent creation failed")
                test_results.append(False)
            
            # Test 4: Test Multi-Channel Agent
            success4, agent_id2 = await self.test_multi_channel_agent()
            test_results.append(success4)
            
            # Test 5: Edit Agent Test (only if first agent creation succeeded)
            if success1 and agent_id1:
                success5 = await self.test_edit_agent(agent_id1)
                test_results.append(success5)
            else:
                print("⏭️  Skipping edit test - agent creation failed")
                test_results.append(False)
            
            # Summary
            print("=" * 80)
            print("🎯 MARKETING AGENT SOCIAL PLATFORMS TESTING SUMMARY")
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
                "Create Marketing Agent with Social Platforms",
                "Verify Field Mapping", 
                "Retrieve Agent Data",
                "Test Multi-Channel Agent",
                "Edit Agent Test"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("📋 SOCIAL PLATFORMS FIX VERIFICATION:")
            print("=" * 40)
            
            if success1:
                print("✅ FIELD MAPPING: marketing_social_platforms field is properly saved and retrievable")
            else:
                print("❌ FIELD MAPPING: marketing_social_platforms field not working correctly")
            
            if len(test_results) > 1 and test_results[1]:
                print("✅ FIELD NAME: Correct field name 'marketing_social_platforms' (not 'social_platforms') is used")
            elif len(test_results) > 1:
                print("❌ FIELD NAME: Field name mapping issue detected")
            
            if len(test_results) > 2 and test_results[2]:
                print("✅ DATA STRUCTURE: Field is proper dictionary with boolean values")
            elif len(test_results) > 2:
                print("❌ DATA STRUCTURE: Field structure or data type issues")
            
            if success4:
                print("✅ MULTI-CHANNEL: Multi-channel agents with social_media and email work correctly")
            else:
                print("❌ MULTI-CHANNEL: Multi-channel agent creation issues")
            
            if len(test_results) > 4 and test_results[4]:
                print("✅ EDIT FUNCTIONALITY: Social platforms can be updated correctly")
            elif len(test_results) > 4:
                print("❌ EDIT FUNCTIONALITY: Issues with updating social platforms")
            
            print()
            print("=" * 80)
            
            # Clean up created agents
            if self.created_agent_ids:
                print(f"🧹 Cleaning up {len(self.created_agent_ids)} test agents...")
                for agent_id in self.created_agent_ids:
                    try:
                        await self.db.ai_agents.delete_one({"id": agent_id})
                        print(f"   Deleted agent: {agent_id}")
                    except Exception as e:
                        print(f"   Failed to delete agent {agent_id}: {e}")
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main testing function"""
    tester = MarketingSocialPlatformsTester()
    await tester.run_social_platforms_tests()

if __name__ == "__main__":
    asyncio.run(main())