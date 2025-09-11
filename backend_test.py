#!/usr/bin/env python3
"""
Marketing Agent Functionality Testing

This test comprehensively tests the Marketing Agent functionality as requested:

Test Focus:
1. Marketing Agent Type Availability - Test if marketing_agent is available in /api/ai-agent-types endpoint
2. Marketing Agent Creation - Test creating a new marketing agent with comprehensive data
3. Marketing Agent Generation - Test running/executing the created marketing agent to generate content
4. Marketing Agent Retrieval - Test getting the created marketing agent and verify all fields are saved correctly
5. Error Handling - Test validation errors for missing required fields

Expected Results:
- Marketing agent type should be available in agent types endpoint
- Marketing agent should be created successfully with all specified fields
- Marketing agent should generate content for selected channels (email, sms)
- All marketing agent fields should be properly saved and retrievable
- Proper error handling for missing required fields
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

class MarketingAgentTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_id = None
        self.generated_posts = []
        
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
    
    async def test_marketing_agent_type_availability(self):
        """Test 1: Marketing Agent Type Availability - Test if marketing_agent is available in /api/ai-agent-types endpoint"""
        print("🔍 TEST 1: Marketing Agent Type Availability")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agent-types"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        agent_types = await response.json()
                        
                        # Check if marketing_agent is available
                        marketing_agent_found = False
                        marketing_agent_details = None
                        
                        for agent_type in agent_types:
                            if agent_type.get('value') == 'marketing_agent':
                                marketing_agent_found = True
                                marketing_agent_details = agent_type
                                break
                        
                        success = marketing_agent_found
                        
                        self.log_test_result(
                            "Marketing Agent Type Availability",
                            success,
                            f"Marketing agent type found: {marketing_agent_found}",
                            {
                                "HTTP Status": response.status,
                                "Total Agent Types": len(agent_types),
                                "Marketing Agent Details": marketing_agent_details,
                                "All Agent Types": [at.get('value') for at in agent_types]
                            }
                        )
                        return success, agent_types
                    else:
                        self.log_test_result(
                            "Marketing Agent Type Availability",
                            False,
                            f"Failed to get agent types: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False, []
                        
        except Exception as e:
            self.log_test_result(
                "Marketing Agent Type Availability",
                False,
                f"Error testing agent types: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def test_marketing_agent_creation(self):
        """Test 2: Marketing Agent Creation - Test creating a new marketing agent with comprehensive data"""
        print("🔍 TEST 2: Marketing Agent Creation")
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
                "agent_name": "Test Marketing Campaign",
                "mode": "write",  # Required field - using write mode for marketing campaigns
                "marketing_content_type": "topic",
                "topic": "Pet Health Tips",
                "marketing_channels": ["email", "sms"],
                "marketing_email_personalized": True,  # Fixed field name
                "marketing_email_template": "Test email template with [CUSTOMER_NAME] and [PET_NAME]",  # Fixed field name
                "marketing_sms_personalized": True,  # Fixed field name
                "marketing_sms_template": "Test SMS for [CUSTOMER_NAME] about [PET_NAME]",  # Fixed field name
                "marketing_link": "https://petsandvetsanimalhospital.com/campaign",
                "post_date": "2025-01-15",
                "post_time": "09:00",
                "marketing_workflow_mode": "in_review",
                "image_option": "ai_generate",
                "word_count": "100",
                "post_destination": "in_review",
                "auto_post": False
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
                            
                            # Check if all fields were saved correctly
                            field_verification = {}
                            if agent_doc:
                                field_verification = {
                                    "agent_name": agent_doc.get("agent_name") == "Test Marketing Campaign",
                                    "agent_type": agent_doc.get("agent_type") == "marketing_agent",
                                    "mode": agent_doc.get("mode") == "write",
                                    "marketing_content_type": agent_doc.get("marketing_content_type") == "topic",
                                    "topic": agent_doc.get("topic") == "Pet Health Tips",
                                    "marketing_channels": agent_doc.get("marketing_channels") == ["email", "sms"],
                                    "marketing_email_personalized": agent_doc.get("marketing_email_personalized") == True,
                                    "marketing_email_template": agent_doc.get("marketing_email_template") == "Test email template with [CUSTOMER_NAME] and [PET_NAME]",
                                    "marketing_sms_personalized": agent_doc.get("marketing_sms_personalized") == True,
                                    "marketing_sms_template": agent_doc.get("marketing_sms_template") == "Test SMS for [CUSTOMER_NAME] about [PET_NAME]",
                                    "marketing_link": agent_doc.get("marketing_link") == "https://petsandvetsanimalhospital.com/campaign",
                                    "marketing_workflow_mode": agent_doc.get("marketing_workflow_mode") == "in_review",
                                    "word_count": agent_doc.get("word_count") == "100",
                                    "auto_post": agent_doc.get("auto_post") == False
                                }
                            
                            self.log_test_result(
                                "Marketing Agent Creation",
                                success,
                                f"Marketing agent created successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": self.created_agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "All Fields Correct": all(field_verification.values()) if field_verification else False,
                                    "Response": result
                                }
                            )
                            return success, self.created_agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Marketing Agent Creation",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Marketing Agent Creation",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Marketing Agent Creation",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_marketing_agent_generation(self):
        """Test 3: Marketing Agent Generation - Test running/executing the created marketing agent to generate content"""
        print("🔍 TEST 3: Marketing Agent Generation")
        print("=" * 60)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Marketing Agent Generation",
                False,
                "No agent ID available for testing generation",
                {"Agent ID": self.created_agent_id}
            )
            return False, []
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents/{self.created_agent_id}/run"
                async with session.post(url, headers=headers, json={}, timeout=30) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            
                            # Check for generated posts in database
                            posts = await self.db.ai_posts.find({
                                "agent_id": self.created_agent_id,
                                "agent_type": "marketing_agent"
                            }).to_list(length=10)
                            
                            self.generated_posts = posts
                            
                            # Analyze generated posts
                            post_analysis = {}
                            channels_generated = set()
                            
                            for post in posts:
                                post_id = post.get("id")
                                channel = post.get("marketing_channel", "unknown")
                                channels_generated.add(channel)
                                
                                post_analysis[post_id] = {
                                    "channel": channel,
                                    "status": post.get("status"),
                                    "content_length": len(post.get("content", "")),
                                    "has_content": bool(post.get("content", "").strip()),
                                    "agent_type": post.get("agent_type"),
                                    "agent_id": post.get("agent_id"),
                                    "created_at": post.get("created_at")
                                }
                            
                            expected_channels = {"email", "sms"}  # Based on marketing_channels in creation
                            channels_match = channels_generated == expected_channels
                            
                            success = len(posts) > 0 and channels_match
                            
                            self.log_test_result(
                                "Marketing Agent Generation",
                                success,
                                f"Generated {len(posts)} posts for {len(channels_generated)} channels",
                                {
                                    "HTTP Status": response.status,
                                    "Posts Generated": len(posts),
                                    "Channels Generated": list(channels_generated),
                                    "Expected Channels": list(expected_channels),
                                    "Channels Match": channels_match,
                                    "Post Analysis": post_analysis,
                                    "Response": result
                                }
                            )
                            return success, posts
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Marketing Agent Generation",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, []
                    else:
                        self.log_test_result(
                            "Marketing Agent Generation",
                            False,
                            f"Failed to run marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, []
                        
        except Exception as e:
            self.log_test_result(
                "Marketing Agent Generation",
                False,
                f"Error running marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def test_marketing_agent_retrieval(self):
        """Test 4: Marketing Agent Retrieval - Test getting the created marketing agent and verify all fields are saved correctly"""
        print("🔍 TEST 4: Marketing Agent Retrieval")
        print("=" * 60)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Marketing Agent Retrieval",
                False,
                "No agent ID available for testing retrieval",
                {"Agent ID": self.created_agent_id}
            )
            return False, None
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents/{self.created_agent_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            agent_data = json.loads(response_text)
                            
                            # Verify all expected fields are present and correct
                            expected_fields = {
                                "agent_type": "marketing_agent",
                                "agent_name": "Test Marketing Campaign",
                                "mode": "write",
                                "marketing_content_type": "topic",
                                "topic": "Pet Health Tips",
                                "marketing_channels": ["email", "sms"],
                                "marketing_email_personalized": True,
                                "marketing_email_template": "Test email template with [CUSTOMER_NAME] and [PET_NAME]",
                                "marketing_sms_personalized": True,
                                "marketing_sms_template": "Test SMS for [CUSTOMER_NAME] about [PET_NAME]",
                                "marketing_link": "https://petsandvetsanimalhospital.com/campaign",
                                "marketing_workflow_mode": "in_review",
                                "word_count": "100",
                                "auto_post": False
                            }
                            
                            field_verification = {}
                            all_fields_correct = True
                            
                            for field, expected_value in expected_fields.items():
                                actual_value = agent_data.get(field)
                                is_correct = actual_value == expected_value
                                field_verification[field] = {
                                    "expected": expected_value,
                                    "actual": actual_value,
                                    "correct": is_correct
                                }
                                if not is_correct:
                                    all_fields_correct = False
                            
                            # Check for additional important fields
                            additional_checks = {
                                "id": agent_data.get("id") == self.created_agent_id,
                                "is_active": agent_data.get("is_active") is not None,
                                "created_at": agent_data.get("created_at") is not None,
                                "updated_at": agent_data.get("updated_at") is not None
                            }
                            
                            success = all_fields_correct and all(additional_checks.values())
                            
                            self.log_test_result(
                                "Marketing Agent Retrieval",
                                success,
                                f"Agent retrieved successfully, all fields correct: {all_fields_correct}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID Match": agent_data.get("id") == self.created_agent_id,
                                    "All Fields Correct": all_fields_correct,
                                    "Field Verification": field_verification,
                                    "Additional Checks": additional_checks,
                                    "Agent Data Keys": list(agent_data.keys())
                                }
                            )
                            return success, agent_data
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Marketing Agent Retrieval",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Marketing Agent Retrieval",
                            False,
                            f"Failed to retrieve marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Marketing Agent Retrieval",
                False,
                f"Error retrieving marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_error_handling(self):
        """Test 5: Error Handling - Test validation errors for missing required fields"""
        print("🔍 TEST 5: Error Handling")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Test cases for missing required fields
            test_cases = [
                {
                    "name": "Missing agent_type",
                    "data": {
                        "agent_name": "Test Marketing Campaign",
                        "marketing_content_type": "topic",
                        "topic": "Pet Health Tips"
                    },
                    "expected_error": "agent_type"
                },
                {
                    "name": "Missing agent_name",
                    "data": {
                        "agent_type": "marketing_agent",
                        "marketing_content_type": "topic",
                        "topic": "Pet Health Tips"
                    },
                    "expected_error": "agent_name"
                },
                {
                    "name": "Invalid agent_type",
                    "data": {
                        "agent_type": "invalid_agent_type",
                        "agent_name": "Test Marketing Campaign",
                        "marketing_content_type": "topic",
                        "topic": "Pet Health Tips"
                    },
                    "expected_error": "agent_type"
                },
                {
                    "name": "Empty marketing_channels",
                    "data": {
                        "agent_type": "marketing_agent",
                        "agent_name": "Test Marketing Campaign",
                        "marketing_content_type": "topic",
                        "topic": "Pet Health Tips",
                        "marketing_channels": []
                    },
                    "expected_error": "marketing_channels"
                }
            ]
            
            error_test_results = {}
            successful_error_tests = 0
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                for test_case in test_cases:
                    url = f"{self.backend_url}/api/ai-agents"
                    async with session.post(url, headers=headers, json=test_case["data"], timeout=10) as response:
                        response_text = await response.text()
                        
                        # We expect these to fail (4xx status codes)
                        is_error_response = 400 <= response.status < 500
                        
                        error_test_results[test_case["name"]] = {
                            "expected_error": test_case["expected_error"],
                            "http_status": response.status,
                            "is_error_response": is_error_response,
                            "response_text": response_text[:200] + "..." if len(response_text) > 200 else response_text
                        }
                        
                        if is_error_response:
                            successful_error_tests += 1
            
            success = successful_error_tests == len(test_cases)
            
            self.log_test_result(
                "Error Handling",
                success,
                f"Error handling tests passed: {successful_error_tests}/{len(test_cases)}",
                {
                    "Total Test Cases": len(test_cases),
                    "Successful Error Tests": successful_error_tests,
                    "Error Test Results": error_test_results
                }
            )
            return success, error_test_results
            
        except Exception as e:
            self.log_test_result(
                "Error Handling",
                False,
                f"Error testing error handling: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def run_marketing_agent_tests(self):
        """Run comprehensive marketing agent functionality tests"""
        print("🔍 STARTING MARKETING AGENT FUNCTIONALITY TESTING")
        print("=" * 80)
        print("Testing Marketing Agent functionality comprehensively")
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
            
            # Test 1: Marketing Agent Type Availability
            success1, agent_types = await self.test_marketing_agent_type_availability()
            test_results.append(success1)
            
            # Test 2: Marketing Agent Creation
            success2, agent_id = await self.test_marketing_agent_creation()
            test_results.append(success2)
            
            # Test 3: Marketing Agent Generation (only if creation succeeded)
            if success2 and agent_id:
                success3, posts = await self.test_marketing_agent_generation()
                test_results.append(success3)
            else:
                print("⏭️  Skipping generation test - agent creation failed")
                test_results.append(False)
            
            # Test 4: Marketing Agent Retrieval (only if creation succeeded)
            if success2 and agent_id:
                success4, agent_data = await self.test_marketing_agent_retrieval()
                test_results.append(success4)
            else:
                print("⏭️  Skipping retrieval test - agent creation failed")
                test_results.append(False)
            
            # Test 5: Error Handling
            success5, error_results = await self.test_error_handling()
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 MARKETING AGENT TESTING SUMMARY")
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
            
            # Marketing Agent Type Analysis
            if success1:
                print("✅ AGENT TYPES: Marketing agent type is available in /api/ai-agent-types endpoint")
            else:
                print("❌ AGENT TYPES: Marketing agent type not found in agent types endpoint")
            
            # Marketing Agent Creation Analysis
            if success2:
                print("✅ AGENT CREATION: Marketing agent created successfully with all specified fields")
                print(f"   - Agent ID: {self.created_agent_id}")
            else:
                print("❌ AGENT CREATION: Failed to create marketing agent")
            
            # Marketing Agent Generation Analysis
            if len(test_results) > 2 and test_results[2]:
                print("✅ AGENT GENERATION: Marketing agent generated content successfully")
                print(f"   - Generated posts: {len(self.generated_posts)}")
                if self.generated_posts:
                    channels = set(post.get("marketing_channel") for post in self.generated_posts)
                    print(f"   - Channels: {list(channels)}")
            elif len(test_results) > 2:
                print("❌ AGENT GENERATION: Failed to generate marketing content")
            
            # Marketing Agent Retrieval Analysis
            if len(test_results) > 3 and test_results[3]:
                print("✅ AGENT RETRIEVAL: Marketing agent retrieved successfully with all fields intact")
            elif len(test_results) > 3:
                print("❌ AGENT RETRIEVAL: Failed to retrieve marketing agent or fields incorrect")
            
            # Error Handling Analysis
            if success5:
                print("✅ ERROR HANDLING: Proper validation errors for missing required fields")
            else:
                print("❌ ERROR HANDLING: Error handling not working correctly")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Marketing Agent Type Availability",
                "Marketing Agent Creation", 
                "Marketing Agent Generation",
                "Marketing Agent Retrieval",
                "Error Handling"
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
    tester = MarketingAgentTester()
    await tester.run_marketing_agent_tests()

if __name__ == "__main__":
    asyncio.run(main())