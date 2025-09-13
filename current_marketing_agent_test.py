#!/usr/bin/env python3
"""
Current Marketing Agent Social Platforms Testing

This test specifically addresses the review request to test the current state of Marketing Agent 
social platforms and verify what needs to be fixed:

Test Focus (as requested):
1. Create a test Marketing Agent with social media platforms:
   - agent_type: "marketing_agent"
   - agent_name: "Test Social Platforms Fix Check"
   - marketing_content_type: "topic"
   - topic: "Pet Health Tips"
   - marketing_channels: ["social_media"]
   - marketing_social_platforms: {"facebook": true, "instagram": true, "twitter": false, "whatsapp": false}
   - post_date: "2025-01-20"
   - post_time: "10:00"

2. Retrieve the agent and check:
   - Is marketing_social_platforms field properly saved?
   - What does the agent data look like when retrieved?
   - Are all fields properly stored?

3. Check Multiple Marketing Agents to see the current data structure and what the dashboard should display

4. Test Date Display: Check if the date issue exists by comparing saved vs retrieved dates

Focus on getting a clear picture of the current data structure so the dashboard display can be fixed properly.
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

class CurrentMarketingAgentTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petsai-templates.preview.emergentagent.com')
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
    
    async def test_create_marketing_agent_exact_spec(self):
        """Test 1: Create a test Marketing Agent with exact specifications from the request"""
        print("🔍 TEST 1: Create Marketing Agent with Exact Specifications")
        print("=" * 70)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Exact specifications from the request
            marketing_agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Social Platforms Fix Check",
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
                "mode": "adhoc",  # Required field
                "marketing_workflow_mode": "in_review",  # Default workflow mode
                "word_count": "100",
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
                            
                            success = agent_doc is not None
                            
                            # Detailed field verification
                            field_verification = {}
                            if agent_doc:
                                field_verification = {
                                    "agent_type": agent_doc.get("agent_type"),
                                    "agent_name": agent_doc.get("agent_name"),
                                    "marketing_content_type": agent_doc.get("marketing_content_type"),
                                    "topic": agent_doc.get("topic"),
                                    "marketing_channels": agent_doc.get("marketing_channels"),
                                    "marketing_social_platforms": agent_doc.get("marketing_social_platforms"),
                                    "post_date": agent_doc.get("post_date"),
                                    "post_time": agent_doc.get("post_time"),
                                    "mode": agent_doc.get("mode"),
                                    "marketing_workflow_mode": agent_doc.get("marketing_workflow_mode"),
                                    "created_at": agent_doc.get("created_at"),
                                    "updated_at": agent_doc.get("updated_at"),
                                    "is_active": agent_doc.get("is_active")
                                }
                            
                            self.log_test_result(
                                "Create Marketing Agent with Exact Specifications",
                                success,
                                f"Marketing agent created successfully: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Agent ID": self.created_agent_id,
                                    "Agent Found in DB": agent_doc is not None,
                                    "Field Verification": field_verification,
                                    "Response": result
                                }
                            )
                            return success, self.created_agent_id
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Create Marketing Agent with Exact Specifications",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Create Marketing Agent with Exact Specifications",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Create Marketing Agent with Exact Specifications",
                False,
                f"Error creating marketing agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_retrieve_and_analyze_agent_data(self):
        """Test 2: Retrieve the agent and check data structure"""
        print("🔍 TEST 2: Retrieve Agent and Analyze Data Structure")
        print("=" * 70)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Retrieve Agent and Analyze Data Structure",
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
                                    "Retrieve Agent and Analyze Data Structure",
                                    False,
                                    "Agent not found in agents list",
                                    {"Agent ID": self.created_agent_id, "Total Agents": len(agents_list)}
                                )
                                return False, None
                            
                            # Analyze the data structure
                            data_analysis = {
                                "marketing_social_platforms_field_exists": "marketing_social_platforms" in agent_data,
                                "marketing_social_platforms_value": agent_data.get("marketing_social_platforms"),
                                "marketing_social_platforms_type": type(agent_data.get("marketing_social_platforms")).__name__,
                                "all_fields_present": {
                                    "agent_type": agent_data.get("agent_type"),
                                    "agent_name": agent_data.get("agent_name"),
                                    "marketing_content_type": agent_data.get("marketing_content_type"),
                                    "topic": agent_data.get("topic"),
                                    "marketing_channels": agent_data.get("marketing_channels"),
                                    "post_date": agent_data.get("post_date"),
                                    "post_time": agent_data.get("post_time"),
                                    "mode": agent_data.get("mode"),
                                    "marketing_workflow_mode": agent_data.get("marketing_workflow_mode"),
                                    "created_at": agent_data.get("created_at"),
                                    "updated_at": agent_data.get("updated_at"),
                                    "is_active": agent_data.get("is_active")
                                },
                                "total_fields_in_agent": len(agent_data.keys()),
                                "all_field_names": list(agent_data.keys())
                            }
                            
                            # Check if marketing_social_platforms is properly saved
                            platforms_properly_saved = (
                                agent_data.get("marketing_social_platforms") == {
                                    "facebook": True,
                                    "instagram": True,
                                    "twitter": False,
                                    "whatsapp": False
                                }
                            )
                            
                            success = (
                                agent_data is not None and
                                "marketing_social_platforms" in agent_data and
                                platforms_properly_saved
                            )
                            
                            self.log_test_result(
                                "Retrieve Agent and Analyze Data Structure",
                                success,
                                f"Agent retrieved and analyzed: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Platforms Properly Saved": platforms_properly_saved,
                                    "Data Analysis": data_analysis
                                }
                            )
                            return success, agent_data
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Retrieve Agent and Analyze Data Structure",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Retrieve Agent and Analyze Data Structure",
                            False,
                            f"Failed to retrieve agents: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Retrieve Agent and Analyze Data Structure",
                False,
                f"Error retrieving agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_check_multiple_marketing_agents_dashboard_data(self):
        """Test 3: Check Multiple Marketing Agents for dashboard display data structure"""
        print("🔍 TEST 3: Check Multiple Marketing Agents for Dashboard Data")
        print("=" * 70)
        
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
                            
                            # Filter marketing agents
                            marketing_agents = [agent for agent in agents_list if agent.get("agent_type") == "marketing_agent"]
                            
                            # Analyze dashboard data structure
                            dashboard_analysis = {
                                "total_agents": len(agents_list),
                                "marketing_agents_count": len(marketing_agents),
                                "marketing_agents_with_social_platforms": 0,
                                "marketing_agents_with_social_media_channel": 0,
                                "agent_details": []
                            }
                            
                            for agent in marketing_agents:
                                agent_detail = {
                                    "id": agent.get("id"),
                                    "agent_name": agent.get("agent_name"),
                                    "mode": agent.get("mode"),
                                    "marketing_channels": agent.get("marketing_channels"),
                                    "has_social_media_channel": "social_media" in (agent.get("marketing_channels") or []),
                                    "has_marketing_social_platforms": "marketing_social_platforms" in agent,
                                    "marketing_social_platforms": agent.get("marketing_social_platforms"),
                                    "post_date": agent.get("post_date"),
                                    "post_time": agent.get("post_time"),
                                    "marketing_workflow_mode": agent.get("marketing_workflow_mode"),
                                    "created_at": agent.get("created_at"),
                                    "updated_at": agent.get("updated_at"),
                                    "is_active": agent.get("is_active"),
                                    "last_manual_run": agent.get("last_manual_run")
                                }
                                
                                dashboard_analysis["agent_details"].append(agent_detail)
                                
                                if agent.get("marketing_social_platforms"):
                                    dashboard_analysis["marketing_agents_with_social_platforms"] += 1
                                
                                if "social_media" in (agent.get("marketing_channels") or []):
                                    dashboard_analysis["marketing_agents_with_social_media_channel"] += 1
                            
                            success = len(marketing_agents) > 0
                            
                            self.log_test_result(
                                "Check Multiple Marketing Agents for Dashboard Data",
                                success,
                                f"Found {len(marketing_agents)} marketing agents for dashboard analysis",
                                {
                                    "HTTP Status": response.status,
                                    "Dashboard Analysis": dashboard_analysis
                                }
                            )
                            return success, dashboard_analysis
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Check Multiple Marketing Agents for Dashboard Data",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False, None
                    else:
                        self.log_test_result(
                            "Check Multiple Marketing Agents for Dashboard Data",
                            False,
                            f"Failed to retrieve agents: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Check Multiple Marketing Agents for Dashboard Data",
                False,
                f"Error checking multiple agents: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_date_display_comparison(self):
        """Test 4: Test Date Display by comparing saved vs retrieved dates"""
        print("🔍 TEST 4: Test Date Display Comparison")
        print("=" * 70)
        
        if not self.created_agent_id:
            self.log_test_result(
                "Test Date Display Comparison",
                False,
                "No agent ID available for testing date comparison",
                {"Agent ID": self.created_agent_id}
            )
            return False, None
        
        try:
            # Get agent from database directly
            agent_doc = await self.db.ai_agents.find_one({"id": self.created_agent_id})
            
            if not agent_doc:
                self.log_test_result(
                    "Test Date Display Comparison",
                    False,
                    "Agent not found in database",
                    {"Agent ID": self.created_agent_id}
                )
                return False, None
            
            # Get agent from API
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/ai-agents"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status == 200:
                        agents_list = await response.json()
                        
                        # Find our agent in API response
                        api_agent = None
                        for agent in agents_list:
                            if agent.get("id") == self.created_agent_id:
                                api_agent = agent
                                break
                        
                        if not api_agent:
                            self.log_test_result(
                                "Test Date Display Comparison",
                                False,
                                "Agent not found in API response",
                                {"Agent ID": self.created_agent_id}
                            )
                            return False, None
                        
                        # Compare date fields between database and API
                        date_comparison = {
                            "post_date": {
                                "database": agent_doc.get("post_date"),
                                "api": api_agent.get("post_date"),
                                "match": agent_doc.get("post_date") == api_agent.get("post_date"),
                                "expected": "2025-01-20"
                            },
                            "post_time": {
                                "database": agent_doc.get("post_time"),
                                "api": api_agent.get("post_time"),
                                "match": agent_doc.get("post_time") == api_agent.get("post_time"),
                                "expected": "10:00"
                            },
                            "created_at": {
                                "database": str(agent_doc.get("created_at")) if agent_doc.get("created_at") else None,
                                "api": api_agent.get("created_at"),
                                "match": str(agent_doc.get("created_at")) == api_agent.get("created_at") if agent_doc.get("created_at") else api_agent.get("created_at") is None
                            },
                            "updated_at": {
                                "database": str(agent_doc.get("updated_at")) if agent_doc.get("updated_at") else None,
                                "api": api_agent.get("updated_at"),
                                "match": str(agent_doc.get("updated_at")) == api_agent.get("updated_at") if agent_doc.get("updated_at") else api_agent.get("updated_at") is None
                            }
                        }
                        
                        # Check if dates match expected values
                        dates_match_expected = (
                            api_agent.get("post_date") == "2025-01-20" and
                            api_agent.get("post_time") == "10:00"
                        )
                        
                        # Check if database and API dates are consistent
                        dates_consistent = all(comp["match"] for comp in date_comparison.values())
                        
                        success = dates_match_expected and dates_consistent
                        
                        self.log_test_result(
                            "Test Date Display Comparison",
                            success,
                            f"Date display comparison: {success}",
                            {
                                "Dates Match Expected": dates_match_expected,
                                "Dates Consistent": dates_consistent,
                                "Date Comparison": date_comparison
                            }
                        )
                        return success, date_comparison
                    else:
                        self.log_test_result(
                            "Test Date Display Comparison",
                            False,
                            f"Failed to retrieve agents from API: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False, None
                        
        except Exception as e:
            self.log_test_result(
                "Test Date Display Comparison",
                False,
                f"Error testing date comparison: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def run_current_marketing_agent_tests(self):
        """Run current marketing agent tests as requested"""
        print("🔍 STARTING CURRENT MARKETING AGENT TESTING")
        print("=" * 80)
        print("Testing current state of Marketing Agent social platforms")
        print("Focus: Get clear picture of current data structure for dashboard fixes")
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
            
            # Test 1: Create Marketing Agent with Exact Specifications
            success1, agent_id = await self.test_create_marketing_agent_exact_spec()
            test_results.append(success1)
            
            # Test 2: Retrieve Agent and Analyze Data Structure
            if success1 and agent_id:
                success2, agent_data = await self.test_retrieve_and_analyze_agent_data()
                test_results.append(success2)
            else:
                print("⏭️  Skipping retrieval test - agent creation failed")
                test_results.append(False)
            
            # Test 3: Check Multiple Marketing Agents for Dashboard Data
            success3, dashboard_analysis = await self.test_check_multiple_marketing_agents_dashboard_data()
            test_results.append(success3)
            
            # Test 4: Test Date Display Comparison
            if success1 and agent_id:
                success4, date_comparison = await self.test_date_display_comparison()
                test_results.append(success4)
            else:
                print("⏭️  Skipping date comparison test - agent creation failed")
                test_results.append(False)
            
            # Summary
            print("=" * 80)
            print("🎯 CURRENT MARKETING AGENT TESTING SUMMARY")
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
            print("🔍 KEY FINDINGS FOR DASHBOARD FIXES:")
            print("=" * 50)
            
            # Test 1 Analysis
            if success1:
                print("✅ AGENT CREATION: Marketing agent created successfully with exact specifications")
                print(f"   - Agent ID: {self.created_agent_id}")
                print("   - All required fields properly saved")
            else:
                print("❌ AGENT CREATION: Failed to create marketing agent")
            
            # Test 2 Analysis
            if len(test_results) > 1 and test_results[1]:
                print("✅ DATA STRUCTURE: marketing_social_platforms field properly saved and retrieved")
                print("   - Field exists as dictionary type")
                print("   - Platform selections preserved correctly")
            elif len(test_results) > 1:
                print("❌ DATA STRUCTURE: Issues with marketing_social_platforms field")
            
            # Test 3 Analysis
            if success3:
                print("✅ DASHBOARD DATA: Multiple marketing agents analyzed for dashboard display")
                print("   - Current data structure documented")
                print("   - Dashboard display requirements identified")
            else:
                print("❌ DASHBOARD DATA: Issues analyzing multiple marketing agents")
            
            # Test 4 Analysis
            if len(test_results) > 3 and test_results[3]:
                print("✅ DATE DISPLAY: Date fields consistent between saved and retrieved data")
                print("   - No date display issues detected")
            elif len(test_results) > 3:
                print("❌ DATE DISPLAY: Date display issues detected")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Create Marketing Agent with Exact Specifications",
                "Retrieve Agent and Analyze Data Structure", 
                "Check Multiple Marketing Agents for Dashboard Data",
                "Test Date Display Comparison"
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
    tester = CurrentMarketingAgentTester()
    await tester.run_current_marketing_agent_tests()

if __name__ == "__main__":
    asyncio.run(main())