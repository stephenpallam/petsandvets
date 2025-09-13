#!/usr/bin/env python3
"""
Holiday Email Scheduled Agent Dashboard Debug Test

This test specifically debugs why Holiday Email Scheduled Agent is not showing in the agent dashboard.

Investigation Focus:
1. Check Email Agents in Database - find all email agents, especially ones with "Holiday" in the name
2. Check if they have selected_holidays field populated
3. Verify their agent_type and mode fields
4. Check if they are active (is_active field)
5. Check Agent Display Conditions - verify if email agents meet dashboard display conditions
6. Check API Response - test the GET /api/ai-agents endpoint
7. Create Test Holiday Email Agent if needed

Expected Results:
- Should find existing email agents or identify why they're not showing
- Should be able to create a test "Holiday Email Agent" with proper scheduled configuration
- Should verify the agent appears in the dashboard API response
"""

import asyncio
import sys
import os
import json
import requests
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

class HolidayEmailAgentDebugger:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        
        # Get backend URL from frontend .env
        frontend_env_path = Path(__file__).parent / "frontend" / ".env"
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.backend_url = line.split('=')[1].strip()
                        break
        else:
            self.backend_url = "https://petsai-templates.preview.emergentagent.com"
        
        self.api_base_url = f"{self.backend_url}/api"
        
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
    
    async def test_find_email_agents_in_database(self):
        """Test 1: Find all email agents in database, especially Holiday ones"""
        print("🧪 TEST 1: Find Email Agents in Database")
        print("=" * 60)
        
        try:
            # Find all email agents
            all_email_agents = await self.db.ai_agents.find({
                "agent_type": "email"
            }).to_list(length=100)
            
            # Find email agents with "Holiday" in name
            holiday_email_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "agent_name": {"$regex": "Holiday", "$options": "i"}
            }).to_list(length=100)
            
            # Find email agents with selected_holidays
            scheduled_email_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "selected_holidays": {"$exists": True, "$ne": []}
            }).to_list(length=100)
            
            # Analyze the agents
            agent_analysis = []
            for agent in all_email_agents:
                analysis = {
                    "id": agent.get("id"),
                    "name": agent.get("agent_name"),
                    "mode": agent.get("mode"),
                    "is_active": agent.get("is_active", True),
                    "has_selected_holidays": bool(agent.get("selected_holidays")),
                    "selected_holidays_count": len(agent.get("selected_holidays", [])),
                    "is_holiday_agent": "holiday" in agent.get("agent_name", "").lower()
                }
                agent_analysis.append(analysis)
            
            self.log_test_result(
                "Email Agents Database Search",
                True,
                f"Found {len(all_email_agents)} email agents total",
                {
                    "Total Email Agents": len(all_email_agents),
                    "Holiday Named Agents": len(holiday_email_agents),
                    "Scheduled Email Agents (with holidays)": len(scheduled_email_agents),
                    "Agent Details": agent_analysis[:5]  # Show first 5 for brevity
                }
            )
            
            return {
                "all_agents": all_email_agents,
                "holiday_agents": holiday_email_agents,
                "scheduled_agents": scheduled_email_agents
            }
            
        except Exception as e:
            self.log_test_result(
                "Email Agents Database Search",
                False,
                f"Error searching for email agents: {str(e)}",
                {"Error Details": str(e)}
            )
            return None
    
    async def test_check_holidays_in_database(self):
        """Test 2: Check available holidays in database"""
        print("🧪 TEST 2: Check Available Holidays in Database")
        print("=" * 60)
        
        try:
            # Get all holidays
            holidays = await self.db.holidays.find({}).to_list(length=100)
            
            # Analyze holidays
            holiday_analysis = []
            current_date = datetime.now().date()
            
            for holiday in holidays[:10]:  # Show first 10
                holiday_date = datetime.strptime(holiday["date"], "%Y-%m-%d").date()
                days_until = (holiday_date - current_date).days
                
                analysis = {
                    "id": holiday.get("id"),
                    "name": holiday.get("name"),
                    "date": holiday.get("date"),
                    "is_enabled": holiday.get("is_enabled", True),
                    "category": holiday.get("category", "general"),
                    "days_until": days_until,
                    "is_upcoming": days_until >= 0
                }
                holiday_analysis.append(analysis)
            
            upcoming_holidays = [h for h in holiday_analysis if h["is_upcoming"]]
            
            self.log_test_result(
                "Holidays Database Check",
                True,
                f"Found {len(holidays)} holidays in database",
                {
                    "Total Holidays": len(holidays),
                    "Upcoming Holidays": len(upcoming_holidays),
                    "Holiday Sample": holiday_analysis[:5]
                }
            )
            
            return holidays
            
        except Exception as e:
            self.log_test_result(
                "Holidays Database Check",
                False,
                f"Error checking holidays: {str(e)}",
                {"Error Details": str(e)}
            )
            return []
    
    async def test_api_agents_endpoint(self):
        """Test 3: Test GET /api/ai-agents endpoint"""
        print("🧪 TEST 3: Test API Agents Endpoint")
        print("=" * 60)
        
        try:
            # Test the API endpoint (without authentication for now)
            url = f"{self.api_base_url}/ai-agents"
            
            try:
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    agents_data = response.json()
                    
                    # Filter email agents from API response
                    email_agents_from_api = [
                        agent for agent in agents_data 
                        if agent.get("agent_type") == "email"
                    ]
                    
                    # Filter holiday email agents
                    holiday_email_from_api = [
                        agent for agent in email_agents_from_api
                        if "holiday" in agent.get("agent_name", "").lower() or 
                           (agent.get("selected_holidays") and len(agent.get("selected_holidays", [])) > 0)
                    ]
                    
                    self.log_test_result(
                        "API Agents Endpoint",
                        True,
                        f"API returned {len(agents_data)} agents successfully",
                        {
                            "Total Agents from API": len(agents_data),
                            "Email Agents from API": len(email_agents_from_api),
                            "Holiday Email Agents from API": len(holiday_email_from_api),
                            "API URL": url,
                            "Response Status": response.status_code
                        }
                    )
                    
                    return {
                        "all_agents": agents_data,
                        "email_agents": email_agents_from_api,
                        "holiday_email_agents": holiday_email_from_api
                    }
                    
                elif response.status_code == 401:
                    self.log_test_result(
                        "API Agents Endpoint",
                        False,
                        "API requires authentication - cannot test without token",
                        {
                            "Status Code": response.status_code,
                            "Response": response.text[:200],
                            "API URL": url
                        }
                    )
                    return None
                    
                else:
                    self.log_test_result(
                        "API Agents Endpoint",
                        False,
                        f"API returned error status: {response.status_code}",
                        {
                            "Status Code": response.status_code,
                            "Response": response.text[:200],
                            "API URL": url
                        }
                    )
                    return None
                    
            except requests.exceptions.RequestException as e:
                self.log_test_result(
                    "API Agents Endpoint",
                    False,
                    f"Network error accessing API: {str(e)}",
                    {
                        "Error Type": "Network Error",
                        "API URL": url,
                        "Error Details": str(e)
                    }
                )
                return None
                
        except Exception as e:
            self.log_test_result(
                "API Agents Endpoint",
                False,
                f"Unexpected error testing API: {str(e)}",
                {"Error Details": str(e)}
            )
            return None
    
    async def test_create_holiday_email_agent(self):
        """Test 4: Create a test Holiday Email Agent"""
        print("🧪 TEST 4: Create Test Holiday Email Agent")
        print("=" * 60)
        
        try:
            # Get some holidays to use
            holidays = await self.db.holidays.find({}).limit(3).to_list(length=3)
            
            if not holidays:
                self.log_test_result(
                    "Create Holiday Email Agent",
                    False,
                    "No holidays available to create holiday email agent",
                    {"Available Holidays": 0}
                )
                return None
            
            # Select first 2 holidays for the agent
            selected_holiday_ids = [h["id"] for h in holidays[:2]]
            holiday_names = [h["name"] for h in holidays[:2]]
            
            import uuid
            
            # Create test holiday email agent
            agent_data = {
                "id": str(uuid.uuid4()),
                "agent_name": "Holiday Email Scheduled Agent - Test",
                "agent_type": "email",
                "mode": "recurring",
                "selected_holidays": selected_holiday_ids,
                "email_content_template": "Dear [CUSTOMER_NAME],\n\nWishing you and [PET_NAME] a wonderful holiday season!\n\nBest regards,\nYour Veterinary Team",
                "use_chatgpt_formatting": True,
                "use_customer_database": True,
                "email_type": "bulk",
                "post_time": "09:00",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert the test agent
            await self.db.ai_agents.insert_one(agent_data)
            
            # Verify it was created
            created_agent = await self.db.ai_agents.find_one({"id": agent_data["id"]})
            
            if created_agent:
                self.log_test_result(
                    "Create Holiday Email Agent",
                    True,
                    "Test Holiday Email Agent created successfully",
                    {
                        "Agent ID": agent_data["id"],
                        "Agent Name": agent_data["agent_name"],
                        "Agent Type": agent_data["agent_type"],
                        "Mode": agent_data["mode"],
                        "Selected Holidays": holiday_names,
                        "Holiday Count": len(selected_holiday_ids),
                        "Is Active": agent_data["is_active"],
                        "Has ChatGPT": agent_data["use_chatgpt_formatting"]
                    }
                )
                return agent_data
            else:
                self.log_test_result(
                    "Create Holiday Email Agent",
                    False,
                    "Agent was not found after creation",
                    {"Agent ID": agent_data["id"]}
                )
                return None
                
        except Exception as e:
            self.log_test_result(
                "Create Holiday Email Agent",
                False,
                f"Error creating holiday email agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return None
    
    async def test_verify_agent_display_conditions(self):
        """Test 5: Verify agent meets dashboard display conditions"""
        print("🧪 TEST 5: Verify Agent Display Conditions")
        print("=" * 60)
        
        try:
            # Get all email agents with holidays
            email_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "selected_holidays": {"$exists": True, "$ne": []}
            }).to_list(length=100)
            
            if not email_agents:
                self.log_test_result(
                    "Agent Display Conditions",
                    False,
                    "No email agents with selected holidays found",
                    {"Email Agents with Holidays": 0}
                )
                return False
            
            # Check each agent against display conditions
            display_analysis = []
            
            for agent in email_agents:
                conditions = {
                    "has_agent_type": bool(agent.get("agent_type")),
                    "agent_type_is_email": agent.get("agent_type") == "email",
                    "has_mode": bool(agent.get("mode")),
                    "has_selected_holidays": bool(agent.get("selected_holidays")),
                    "selected_holidays_not_empty": len(agent.get("selected_holidays", [])) > 0,
                    "is_active": agent.get("is_active", True),
                    "has_agent_name": bool(agent.get("agent_name")),
                    "has_id": bool(agent.get("id"))
                }
                
                meets_all_conditions = all(conditions.values())
                
                analysis = {
                    "agent_id": agent.get("id"),
                    "agent_name": agent.get("agent_name"),
                    "meets_display_conditions": meets_all_conditions,
                    "conditions": conditions,
                    "selected_holidays_count": len(agent.get("selected_holidays", []))
                }
                
                display_analysis.append(analysis)
            
            # Count agents that meet all conditions
            agents_meeting_conditions = [a for a in display_analysis if a["meets_display_conditions"]]
            
            self.log_test_result(
                "Agent Display Conditions",
                len(agents_meeting_conditions) > 0,
                f"Found {len(agents_meeting_conditions)} email agents meeting display conditions",
                {
                    "Total Email Agents with Holidays": len(email_agents),
                    "Agents Meeting All Conditions": len(agents_meeting_conditions),
                    "Analysis Sample": display_analysis[:3]  # Show first 3
                }
            )
            
            return display_analysis
            
        except Exception as e:
            self.log_test_result(
                "Agent Display Conditions",
                False,
                f"Error verifying display conditions: {str(e)}",
                {"Error Details": str(e)}
            )
            return []
    
    async def test_api_response_with_created_agent(self):
        """Test 6: Test API response includes our created agent"""
        print("🧪 TEST 6: Test API Response Includes Created Agent")
        print("=" * 60)
        
        try:
            # Find our test agent
            test_agent = await self.db.ai_agents.find_one({
                "agent_name": "Holiday Email Scheduled Agent - Test"
            })
            
            if not test_agent:
                self.log_test_result(
                    "API Response with Created Agent",
                    False,
                    "Test agent not found in database",
                    {"Test Agent Name": "Holiday Email Scheduled Agent - Test"}
                )
                return False
            
            # Test API endpoint again
            url = f"{self.api_base_url}/ai-agents"
            
            try:
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    agents_data = response.json()
                    
                    # Look for our test agent in API response
                    test_agent_in_api = None
                    for agent in agents_data:
                        if agent.get("id") == test_agent["id"]:
                            test_agent_in_api = agent
                            break
                    
                    if test_agent_in_api:
                        self.log_test_result(
                            "API Response with Created Agent",
                            True,
                            "Test Holiday Email Agent found in API response",
                            {
                                "Agent ID": test_agent["id"],
                                "Agent Name": test_agent_in_api.get("agent_name"),
                                "Agent Type": test_agent_in_api.get("agent_type"),
                                "Mode": test_agent_in_api.get("mode"),
                                "Selected Holidays": len(test_agent_in_api.get("selected_holidays", [])),
                                "Is Active": test_agent_in_api.get("is_active")
                            }
                        )
                        return True
                    else:
                        self.log_test_result(
                            "API Response with Created Agent",
                            False,
                            "Test agent exists in database but not in API response",
                            {
                                "Agent ID": test_agent["id"],
                                "Total API Agents": len(agents_data),
                                "Email Agents in API": len([a for a in agents_data if a.get("agent_type") == "email"])
                            }
                        )
                        return False
                        
                elif response.status_code == 401:
                    self.log_test_result(
                        "API Response with Created Agent",
                        False,
                        "Cannot verify API response due to authentication requirement",
                        {
                            "Status Code": response.status_code,
                            "Agent Exists in DB": True,
                            "Agent ID": test_agent["id"]
                        }
                    )
                    return False
                    
                else:
                    self.log_test_result(
                        "API Response with Created Agent",
                        False,
                        f"API error: {response.status_code}",
                        {
                            "Status Code": response.status_code,
                            "Response": response.text[:200]
                        }
                    )
                    return False
                    
            except requests.exceptions.RequestException as e:
                self.log_test_result(
                    "API Response with Created Agent",
                    False,
                    f"Network error: {str(e)}",
                    {"Error Details": str(e)}
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "API Response with Created Agent",
                False,
                f"Error testing API response: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data created during testing"""
        try:
            # Delete test agents
            result = await self.db.ai_agents.delete_many({
                "agent_name": {"$regex": "Holiday Email Scheduled Agent - Test"}
            })
            
            print(f"🧹 Test data cleanup completed - removed {result.deleted_count} test agents")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up all test data: {str(e)}")
    
    async def run_comprehensive_debug_test(self):
        """Run comprehensive Holiday Email Agent debug test"""
        print("🚀 STARTING HOLIDAY EMAIL AGENT DASHBOARD DEBUG TEST")
        print("=" * 80)
        print("Debugging why Holiday Email Scheduled Agent is not showing in dashboard")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all debug tests
            test_results = []
            
            # Test 1: Find email agents in database
            agents_data = await self.test_find_email_agents_in_database()
            test_results.append(agents_data is not None)
            
            # Test 2: Check holidays in database
            holidays_data = await self.test_check_holidays_in_database()
            test_results.append(len(holidays_data) > 0)
            
            # Test 3: Test API endpoint
            api_data = await self.test_api_agents_endpoint()
            test_results.append(api_data is not None)
            
            # Test 4: Create test holiday email agent
            created_agent = await self.test_create_holiday_email_agent()
            test_results.append(created_agent is not None)
            
            # Test 5: Verify display conditions
            display_conditions = await self.test_verify_agent_display_conditions()
            test_results.append(len(display_conditions) > 0)
            
            # Test 6: Test API response with created agent
            api_includes_agent = await self.test_api_response_with_created_agent()
            test_results.append(api_includes_agent)
            
            # Summary
            print("=" * 80)
            print("🎯 HOLIDAY EMAIL AGENT DEBUG TEST SUMMARY")
            print("=" * 80)
            
            passed_tests = sum(test_results)
            total_tests = len(test_results)
            success_rate = (passed_tests / total_tests) * 100
            
            print(f"Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
            print()
            
            # Detailed results
            for result in self.test_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            
            # Diagnostic conclusions
            print("🔍 DIAGNOSTIC CONCLUSIONS:")
            print("=" * 40)
            
            if agents_data and len(agents_data.get("scheduled_agents", [])) > 0:
                print("✅ Holiday Email Agents exist in database")
            else:
                print("❌ No Holiday Email Agents found in database")
            
            if api_data is None:
                print("⚠️  Cannot test API endpoint (authentication required)")
            elif len(api_data.get("holiday_email_agents", [])) > 0:
                print("✅ Holiday Email Agents appear in API response")
            else:
                print("❌ Holiday Email Agents missing from API response")
            
            if created_agent:
                print("✅ Can create Holiday Email Agents successfully")
            else:
                print("❌ Cannot create Holiday Email Agents")
            
            print()
            print("🎯 RECOMMENDATIONS:")
            print("=" * 40)
            
            if passed_tests >= 4:
                print("✅ Holiday Email Agent functionality appears to be working")
                print("✅ Agents exist in database and meet display conditions")
                if api_data is None:
                    print("⚠️  Need to test with authentication to verify API response")
                else:
                    print("✅ API endpoint returning agents correctly")
            else:
                print("❌ Holiday Email Agent functionality has issues")
                print("❌ Check database connectivity and agent creation logic")
                print("❌ Verify API endpoint authentication and response format")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during debugging: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Clean up test data
            await self.cleanup_test_data()
            await self.disconnect()

async def main():
    """Main debug function"""
    debugger = HolidayEmailAgentDebugger()
    await debugger.run_comprehensive_debug_test()

if __name__ == "__main__":
    asyncio.run(main())