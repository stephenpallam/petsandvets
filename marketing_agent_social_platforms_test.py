#!/usr/bin/env python3
"""
Marketing Agent Social Platforms Fix Testing

This test specifically focuses on testing the Marketing Agent social_platforms fix:

Test Focus:
1. Create Marketing Agent with Social Platforms - Test creating a marketing agent with social media channel selected and specific platforms enabled
2. Verify Agent Creation - Ensure the agent is created successfully without any "social_platforms: Input should be a valid dictionary" errors
3. Retrieve Agent - Test getting the created agent back and verify social_platforms field is properly stored and returned
4. Edit Agent - Test updating the agent with different social platform selections
5. Verify Edit Success - Ensure the edit operation completes without validation errors and the social platforms are updated correctly

Expected Results:
- Marketing agent should be created successfully with marketing_social_platforms field as dictionary
- No "marketing_social_platforms: Input should be a valid dictionary" validation errors
- marketing_social_platforms field should be properly stored and retrieved
- Agent editing should work correctly with different social platform selections
- All CRUD operations should handle marketing_social_platforms field correctly
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

class MarketingAgentSocialPlatformsTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_id = None
        
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
        """Test 1: Create Marketing Agent with Social Platforms - Test creating a marketing agent with social media channel selected and specific platforms enabled"""
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
            
            # Marketing agent data with social platforms as specified in the request
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Social Platforms Fix",
                "mode": "adhoc",  # Required field
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media"],
                "marketing_social_platforms": {  # Correct field name for marketing agents
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
                            self.created_agent_id = result.get("agent_id")
                            
                            # Verify agent was created in database
                            agent_doc = await self.db.ai_agents.find_one({"id": self.created_agent_id})
                            
                            success = agent_doc is not None and agent_doc.get("agent_type") == "marketing_agent"
                            
                            # Check if marketing_social_platforms field was saved correctly
                            social_platforms_check = {}
                            if agent_doc:
                                stored_social_platforms = agent_doc.get("marketing_social_platforms")
                                expected_social_platforms = {
                                    "facebook": True,
                                    "instagram": True,
                                    "twitter": False,
                                    "whatsapp": False
                                }
                                
                                social_platforms_check = {
                                    "field_exists": stored_social_platforms is not None,
                                    "is_dict": isinstance(stored_social_platforms, dict),
                                    "expected_platforms": expected_social_platforms,
                                    "stored_platforms": stored_social_platforms,
                                    "platforms_match": stored_social_platforms == expected_social_platforms
                                }
                                
                                success = success and social_platforms_check["platforms_match"]
                            
                            self.log_test_result(
                                "Create Marketing Agent with Social Platforms",
                                success,
                                f"Marketing agent created successfully with social platforms: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": self.created_agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Social Platforms Check": social_platforms_check,
                                    "Response": result
                                }
                            )
                            return success, self.created_agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Marketing Agent with Social Platforms",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        # Check if the error is related to marketing_social_platforms validation
                        is_social_platforms_error = "marketing_social_platforms" in response_text and "Input should be a valid dictionary" in response_text
                        
                        self.log_test_result(
                            "Create Marketing Agent with Social Platforms",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {
                                "HTTP Status": response.status, 
                                "Response Text": response_text,
                                "Is Social Platforms Error": is_social_platforms_error
                            }
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
    
    async def test_verify_agent_creation(self):
        """Test 2: Verify Agent Creation - Ensure the agent is created successfully without any validation errors"""
        print("🔍 TEST 2: Verify Agent Creation")
        print("=" * 60)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Verify Agent Creation",
                False,
                "No agent ID available - agent creation failed",
                {"Agent ID": self.created_agent_id}
            )
            return False
        
        try:
            # Verify agent exists in database with correct structure
            agent_doc = await self.db.ai_agents.find_one({"id": self.created_agent_id})
            
            if not agent_doc:
                self.log_test_result(
                    "Verify Agent Creation",
                    False,
                    "Agent not found in database",
                    {"Agent ID": self.created_agent_id}
                )
                return False
            
            # Verify all required fields are present and correct
            verification_checks = {
                "agent_type": agent_doc.get("agent_type") == "marketing_agent",
                "agent_name": agent_doc.get("agent_name") == "Test Social Platforms Fix",
                "mode": agent_doc.get("mode") == "adhoc",
                "marketing_content_type": agent_doc.get("marketing_content_type") == "topic",
                "topic": agent_doc.get("topic") == "Pet Health Tips",
                "marketing_channels": agent_doc.get("marketing_channels") == ["social_media"],
                "marketing_social_platforms_exists": "marketing_social_platforms" in agent_doc,
                "marketing_social_platforms_is_dict": isinstance(agent_doc.get("marketing_social_platforms"), dict),
                "post_date": agent_doc.get("post_date") == "2025-01-20",
                "post_time": agent_doc.get("post_time") == "10:00",
                "marketing_workflow_mode": agent_doc.get("marketing_workflow_mode") == "in_review"
            }
            
            # Check marketing social platforms structure
            marketing_social_platforms = agent_doc.get("marketing_social_platforms", {})
            social_platforms_checks = {
                "facebook": marketing_social_platforms.get("facebook") == True,
                "instagram": marketing_social_platforms.get("instagram") == True,
                "twitter": marketing_social_platforms.get("twitter") == False,
                "whatsapp": marketing_social_platforms.get("whatsapp") == False
            }
            
            all_checks_passed = all(verification_checks.values()) and all(social_platforms_checks.values())
            
            self.log_test_result(
                "Verify Agent Creation",
                all_checks_passed,
                f"Agent creation verification: {all_checks_passed}",
                {
                    "Verification Checks": verification_checks,
                    "Social Platforms Checks": social_platforms_checks,
                    "All Checks Passed": all_checks_passed,
                    "Stored Social Platforms": marketing_social_platforms
                }
            )
            return all_checks_passed
            
        except Exception as e:
            self.log_test_result(
                "Verify Agent Creation",
                False,
                f"Error verifying agent creation: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_retrieve_agent(self):
        """Test 3: Retrieve Agent - Test getting the created agent back and verify marketing_social_platforms field is properly stored and returned"""
        print("🔍 TEST 3: Retrieve Agent")
        print("=" * 60)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Retrieve Agent",
                False,
                "No agent ID available for retrieval test",
                {"Agent ID": self.created_agent_id}
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
                                if agent.get("id") == self.created_agent_id:
                                    agent_data = agent
                                    break
                            
                            if not agent_data:
                                self.log_test_result(
                                    "Retrieve Agent",
                                    False,
                                    "Agent not found in agents list",
                                    {"Agent ID": self.created_agent_id, "Total Agents": len(agents_list)}
                                )
                                return False, None
                            
                            # Verify marketing_social_platforms field is properly returned
                            marketing_social_platforms = agent_data.get("marketing_social_platforms")
                            expected_social_platforms = {
                                "facebook": True,
                                "instagram": True,
                                "twitter": False,
                                "whatsapp": False
                            }
                            
                            retrieval_checks = {
                                "agent_found": True,
                                "marketing_social_platforms_exists": marketing_social_platforms is not None,
                                "marketing_social_platforms_is_dict": isinstance(marketing_social_platforms, dict),
                                "marketing_social_platforms_correct": marketing_social_platforms == expected_social_platforms,
                                "marketing_channels": agent_data.get("marketing_channels") == ["social_media"],
                                "agent_name": agent_data.get("agent_name") == "Test Social Platforms Fix"
                            }
                            
                            success = all(retrieval_checks.values())
                            
                            self.log_test_result(
                                "Retrieve Agent",
                                success,
                                f"Agent retrieved successfully with correct social platforms: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Retrieval Checks": retrieval_checks,
                                    "Expected Social Platforms": expected_social_platforms,
                                    "Retrieved Social Platforms": marketing_social_platforms,
                                    "Agent Data Keys": list(agent_data.keys())
                                }
                            )
                            return success, agent_data
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Retrieve Agent",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Retrieve Agent",
                            False,
                            f"Failed to retrieve agents: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Retrieve Agent",
                False,
                f"Error retrieving agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_edit_agent(self):
        """Test 4: Edit Agent - Test updating the agent with different social platform selections"""
        print("🔍 TEST 4: Edit Agent")
        print("=" * 60)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Edit Agent",
                False,
                "No agent ID available for edit test",
                {"Agent ID": self.created_agent_id}
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
            
            # Updated agent data with different social platform selections
            updated_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Social Platforms Fix",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["social_media"],
                "marketing_social_platforms": {  # Using correct field name
                    "facebook": False,
                    "instagram": True,
                    "twitter": True,
                    "whatsapp": False
                },
                "post_date": "2025-01-20",
                "post_time": "10:00",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents/{self.created_agent_id}"
                async with session.put(url, headers=headers, json=updated_agent_data, timeout=15) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            
                            # Verify agent was updated in database
                            agent_doc = await self.db.ai_agents.find_one({"id": self.created_agent_id})
                            
                            if not agent_doc:
                                self.log_test_result(
                                    "Edit Agent",
                                    False,
                                    "Agent not found in database after update",
                                    {"Agent ID": self.created_agent_id}
                                )
                                return False
                            
                            # Check if marketing_social_platforms field was updated correctly
                            stored_social_platforms = agent_doc.get("marketing_social_platforms")
                            expected_social_platforms = {
                                "facebook": False,
                                "instagram": True,
                                "twitter": True,
                                "whatsapp": False
                            }
                            
                            edit_checks = {
                                "marketing_social_platforms_updated": stored_social_platforms == expected_social_platforms,
                                "facebook_changed": stored_social_platforms.get("facebook") == False,
                                "twitter_enabled": stored_social_platforms.get("twitter") == True,
                                "instagram_still_enabled": stored_social_platforms.get("instagram") == True,
                                "whatsapp_still_disabled": stored_social_platforms.get("whatsapp") == False
                            }
                            
                            success = all(edit_checks.values())
                            
                            self.log_test_result(
                                "Edit Agent",
                                success,
                                f"Agent updated successfully with new social platforms: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Edit Checks": edit_checks,
                                    "Expected Social Platforms": expected_social_platforms,
                                    "Stored Social Platforms": stored_social_platforms,
                                    "Response": result
                                }
                            )
                            return success
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Edit Agent",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False
                    else:
                        # Check if the error is related to marketing_social_platforms validation
                        is_social_platforms_error = "marketing_social_platforms" in response_text and "Input should be a valid dictionary" in response_text
                        
                        self.log_test_result(
                            "Edit Agent",
                            False,
                            f"Failed to update marketing agent: HTTP {response.status}",
                            {
                                "HTTP Status": response.status, 
                                "Response Text": response_text,
                                "Is Social Platforms Error": is_social_platforms_error
                            }
                        )
                        return False
                        
        except Exception as e:
            self.log_test_result(
                "Edit Agent",
                False,
                f"Error updating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_verify_edit_success(self):
        """Test 5: Verify Edit Success - Ensure the edit operation completes without validation errors and the social platforms are updated correctly"""
        print("🔍 TEST 5: Verify Edit Success")
        print("=" * 60)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Verify Edit Success",
                False,
                "No agent ID available for edit verification",
                {"Agent ID": self.created_agent_id}
            )
            return False
        
        try:
            # Verify the agent has the updated social platforms
            agent_doc = await self.db.ai_agents.find_one({"id": self.created_agent_id})
            
            if not agent_doc:
                self.log_test_result(
                    "Verify Edit Success",
                    False,
                    "Agent not found in database",
                    {"Agent ID": self.created_agent_id}
                )
                return False
            
            # Check the final state of marketing social platforms
            stored_social_platforms = agent_doc.get("marketing_social_platforms")
            expected_final_platforms = {
                "facebook": False,
                "instagram": True,
                "twitter": True,
                "whatsapp": False
            }
            
            verification_checks = {
                "marketing_social_platforms_exists": stored_social_platforms is not None,
                "marketing_social_platforms_is_dict": isinstance(stored_social_platforms, dict),
                "platforms_match_expected": stored_social_platforms == expected_final_platforms,
                "facebook_disabled": stored_social_platforms.get("facebook") == False,
                "instagram_enabled": stored_social_platforms.get("instagram") == True,
                "twitter_enabled": stored_social_platforms.get("twitter") == True,
                "whatsapp_disabled": stored_social_platforms.get("whatsapp") == False
            }
            
            success = all(verification_checks.values())
            
            self.log_test_result(
                "Verify Edit Success",
                success,
                f"Edit verification successful: {success}",
                {
                    "Verification Checks": verification_checks,
                    "Expected Final Platforms": expected_final_platforms,
                    "Stored Final Platforms": stored_social_platforms,
                    "All Checks Passed": success
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Verify Edit Success",
                False,
                f"Error verifying edit success: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_social_platforms_tests(self):
        """Run comprehensive social platforms fix tests"""
        print("🔍 STARTING MARKETING AGENT SOCIAL PLATFORMS FIX TESTING")
        print("=" * 80)
        print("Testing Marketing Agent marketing_social_platforms field functionality")
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
            success1, agent_id = await self.test_create_marketing_agent_with_social_platforms()
            test_results.append(success1)
            
            # Test 2: Verify Agent Creation (only if creation succeeded)
            if success1 and agent_id:
                success2 = await self.test_verify_agent_creation()
                test_results.append(success2)
            else:
                print("⏭️  Skipping verification test - agent creation failed")
                test_results.append(False)
            
            # Test 3: Retrieve Agent (only if creation succeeded)
            if success1 and agent_id:
                success3, agent_data = await self.test_retrieve_agent()
                test_results.append(success3)
            else:
                print("⏭️  Skipping retrieval test - agent creation failed")
                test_results.append(False)
            
            # Test 4: Edit Agent (only if creation succeeded)
            if success1 and agent_id:
                success4 = await self.test_edit_agent()
                test_results.append(success4)
            else:
                print("⏭️  Skipping edit test - agent creation failed")
                test_results.append(False)
            
            # Test 5: Verify Edit Success (only if edit succeeded)
            if len(test_results) > 3 and test_results[3]:
                success5 = await self.test_verify_edit_success()
                test_results.append(success5)
            else:
                print("⏭️  Skipping edit verification test - agent edit failed")
                test_results.append(False)
            
            # Summary
            print("=" * 80)
            print("🎯 SOCIAL PLATFORMS FIX TESTING SUMMARY")
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
                "Verify Agent Creation", 
                "Retrieve Agent",
                "Edit Agent",
                "Verify Edit Success"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                if success:
                    if i == 0:
                        print(f"✅ CREATION: Marketing agent created successfully with marketing_social_platforms dictionary")
                    elif i == 1:
                        print(f"✅ VERIFICATION: Agent creation verified - no validation errors")
                    elif i == 2:
                        print(f"✅ RETRIEVAL: Agent retrieved successfully with marketing_social_platforms field intact")
                    elif i == 3:
                        print(f"✅ EDITING: Agent updated successfully with different social platform selections")
                    elif i == 4:
                        print(f"✅ EDIT VERIFICATION: Edit operation completed successfully")
                else:
                    if i == 0:
                        print(f"❌ CREATION: Failed to create marketing agent with marketing_social_platforms")
                    elif i == 1:
                        print(f"❌ VERIFICATION: Agent creation verification failed")
                    elif i == 2:
                        print(f"❌ RETRIEVAL: Failed to retrieve agent or marketing_social_platforms field incorrect")
                    elif i == 3:
                        print(f"❌ EDITING: Failed to update agent with new social platform selections")
                    elif i == 4:
                        print(f"❌ EDIT VERIFICATION: Edit verification failed")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            
            # Final Assessment
            if all(test_results):
                print("🎉 SOCIAL PLATFORMS FIX IS WORKING CORRECTLY!")
                print("   - Marketing agents can be created with marketing_social_platforms dictionary")
                print("   - No 'Input should be a valid dictionary' validation errors")
                print("   - marketing_social_platforms field is properly stored and retrieved")
                print("   - Agent editing works correctly with different platform selections")
            else:
                print("⚠️  SOCIAL PLATFORMS FIX NEEDS ATTENTION")
                failed_tests = [name for name, success in zip(test_names, test_results) if not success]
                print(f"   - Failed tests: {', '.join(failed_tests)}")
            
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main testing function"""
    tester = MarketingAgentSocialPlatformsTester()
    await tester.run_social_platforms_tests()

if __name__ == "__main__":
    asyncio.run(main())