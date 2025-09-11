#!/usr/bin/env python3
"""
Holiday Email Agent Dashboard Investigation Test

This test investigates why scheduled holiday email agents are not showing in the agent dashboard.

Investigation Focus:
1. Check Email Agents in Database - Find all email agents with selected_holidays field
2. Verify Holiday Email Agent Configuration - Check structure, selected_holidays array, valid holiday IDs
3. Test Dashboard API Endpoint - Test GET /api/ai-agents endpoint 
4. Check Agent Display Conditions - Verify frontend display logic
5. Create Test Holiday Email Agent if Needed - If none exist, create one for testing

Expected Results:
- Should find existing holiday email agents or identify why they're missing
- Should determine if issue is data, API, or frontend display
- Should verify holiday email agents show up correctly in dashboard
- Should provide solution for missing scheduled holiday email agents
"""

import asyncio
import sys
import os
import json
from datetime import datetime, date
from pathlib import Path
import uuid

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

class HolidayEmailAgentInvestigator:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
        
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
    
    async def check_email_agents_in_database(self):
        """Investigation 1: Check Email Agents in Database"""
        print("🔍 INVESTIGATION 1: Check Email Agents in Database")
        print("=" * 60)
        
        try:
            # Find all email agents
            all_email_agents = await self.db.ai_agents.find({
                "agent_type": "email"
            }).to_list(length=None)
            
            # Find email agents with selected_holidays field
            holiday_email_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "selected_holidays": {"$exists": True, "$ne": []}
            }).to_list(length=None)
            
            # Find email agents with mode='recurring' and selected_holidays
            scheduled_email_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "mode": "recurring",
                "selected_holidays": {"$exists": True, "$ne": []}
            }).to_list(length=None)
            
            # Analyze agent structures
            agent_analysis = []
            for agent in all_email_agents:
                analysis = {
                    "id": agent.get("id"),
                    "agent_name": agent.get("agent_name"),
                    "mode": agent.get("mode"),
                    "has_selected_holidays": "selected_holidays" in agent and agent["selected_holidays"],
                    "selected_holidays_count": len(agent.get("selected_holidays", [])),
                    "is_active": agent.get("is_active", False),
                    "agent_structure": list(agent.keys())
                }
                agent_analysis.append(analysis)
            
            success = len(all_email_agents) > 0
            
            self.log_test_result(
                "Email Agents Database Check",
                success,
                f"Found {len(all_email_agents)} email agents total, {len(holiday_email_agents)} with holidays, {len(scheduled_email_agents)} scheduled holiday agents",
                {
                    "Total Email Agents": len(all_email_agents),
                    "Holiday Email Agents": len(holiday_email_agents),
                    "Scheduled Holiday Email Agents": len(scheduled_email_agents),
                    "Agent Analysis": agent_analysis,
                    "Holiday Email Agent Details": [
                        {
                            "id": agent.get("id"),
                            "name": agent.get("agent_name"),
                            "mode": agent.get("mode"),
                            "selected_holidays": agent.get("selected_holidays", []),
                            "is_active": agent.get("is_active")
                        } for agent in holiday_email_agents
                    ]
                }
            )
            return success, all_email_agents, holiday_email_agents, scheduled_email_agents
            
        except Exception as e:
            self.log_test_result(
                "Email Agents Database Check",
                False,
                f"Error checking email agents in database: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, [], [], []
    
    async def verify_holiday_email_agent_configuration(self, holiday_email_agents):
        """Investigation 2: Verify Holiday Email Agent Configuration"""
        print("🔍 INVESTIGATION 2: Verify Holiday Email Agent Configuration")
        print("=" * 60)
        
        try:
            # Get all holidays from database
            all_holidays = await self.db.holidays.find({}).to_list(length=None)
            holiday_map = {h["id"]: h for h in all_holidays}
            
            configuration_analysis = []
            valid_agents = 0
            
            for agent in holiday_email_agents:
                agent_id = agent.get("id")
                agent_name = agent.get("agent_name")
                selected_holidays = agent.get("selected_holidays", [])
                
                # Verify holiday IDs are valid
                valid_holiday_ids = []
                invalid_holiday_ids = []
                holiday_details = []
                
                for holiday_id in selected_holidays:
                    if holiday_id in holiday_map:
                        valid_holiday_ids.append(holiday_id)
                        holiday_details.append({
                            "id": holiday_id,
                            "name": holiday_map[holiday_id].get("name"),
                            "date": holiday_map[holiday_id].get("date"),
                            "is_enabled": holiday_map[holiday_id].get("is_enabled", True)
                        })
                    else:
                        invalid_holiday_ids.append(holiday_id)
                
                # Check agent structure
                required_fields = ["agent_type", "mode", "selected_holidays", "is_active"]
                missing_fields = [field for field in required_fields if field not in agent]
                
                is_valid = (
                    agent.get("agent_type") == "email" and
                    agent.get("mode") == "recurring" and
                    len(valid_holiday_ids) > 0 and
                    agent.get("is_active", False) and
                    len(missing_fields) == 0
                )
                
                if is_valid:
                    valid_agents += 1
                
                analysis = {
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "agent_type": agent.get("agent_type"),
                    "mode": agent.get("mode"),
                    "is_active": agent.get("is_active"),
                    "selected_holidays_count": len(selected_holidays),
                    "valid_holiday_ids": valid_holiday_ids,
                    "invalid_holiday_ids": invalid_holiday_ids,
                    "holiday_details": holiday_details,
                    "missing_fields": missing_fields,
                    "is_valid_configuration": is_valid
                }
                configuration_analysis.append(analysis)
            
            success = valid_agents > 0
            
            self.log_test_result(
                "Holiday Email Agent Configuration Verification",
                success,
                f"Found {valid_agents} valid holiday email agents out of {len(holiday_email_agents)} total",
                {
                    "Total Holidays in Database": len(all_holidays),
                    "Valid Holiday Email Agents": valid_agents,
                    "Configuration Analysis": configuration_analysis,
                    "Holiday Database Sample": [
                        {
                            "id": h.get("id"),
                            "name": h.get("name"),
                            "date": h.get("date"),
                            "is_enabled": h.get("is_enabled")
                        } for h in all_holidays[:5]  # Show first 5 holidays
                    ]
                }
            )
            return success, configuration_analysis, all_holidays
            
        except Exception as e:
            self.log_test_result(
                "Holiday Email Agent Configuration Verification",
                False,
                f"Error verifying holiday email agent configuration: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, [], []
    
    async def test_dashboard_api_endpoint(self):
        """Investigation 3: Test Dashboard API Endpoint"""
        print("🔍 INVESTIGATION 3: Test Dashboard API Endpoint")
        print("=" * 60)
        
        try:
            import aiohttp
            import ssl
            
            # Create SSL context that doesn't verify certificates (for testing)
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # Get authentication token
            login_data = {
                "email": "admin@hospital.com",
                "password": "admin123"
            }
            
            auth_token = None
            api_response = None
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Login to get token
                try:
                    login_url = f"{self.backend_url}/api/login"
                    async with session.post(login_url, json=login_data, timeout=10) as response:
                        if response.status == 200:
                            login_result = await response.json()
                            auth_token = login_result.get("access_token")
                            print(f"✅ Login successful")
                        else:
                            print(f"❌ Login failed with status {response.status}")
                            
                except Exception as e:
                    print(f"❌ Login error: {str(e)}")
                
                # Test the dashboard API endpoint
                if auth_token:
                    headers = {"Authorization": f"Bearer {auth_token}"}
                    
                    try:
                        # Test GET /api/ai-agents endpoint
                        url = f"{self.backend_url}/api/ai-agents"
                        print(f"Testing dashboard API: {url}")
                        
                        async with session.get(url, headers=headers, timeout=10) as response:
                            status = response.status
                            
                            if status == 200:
                                api_response = await response.json()
                                print(f"✅ Dashboard API returned {len(api_response)} agents")
                                
                                # Filter for email agents with holidays
                                email_agents = [agent for agent in api_response if agent.get("agent_type") == "email"]
                                holiday_email_agents = [
                                    agent for agent in email_agents 
                                    if agent.get("selected_holidays") and len(agent.get("selected_holidays", [])) > 0
                                ]
                                
                                success = True
                                message = f"Dashboard API working - returned {len(email_agents)} email agents, {len(holiday_email_agents)} with holidays"
                                
                            else:
                                error_data = await response.text()
                                success = False
                                message = f"Dashboard API failed with status {status}: {error_data}"
                                
                    except Exception as e:
                        success = False
                        message = f"Dashboard API call error: {str(e)}"
                        api_response = None
                else:
                    success = False
                    message = "Cannot test dashboard API - authentication failed"
                    api_response = None
            
            # Analyze API response for holiday email agents
            api_analysis = {}
            if api_response:
                all_agents = api_response
                email_agents = [agent for agent in all_agents if agent.get("agent_type") == "email"]
                holiday_email_agents = [
                    agent for agent in email_agents 
                    if agent.get("selected_holidays") and len(agent.get("selected_holidays", [])) > 0
                ]
                
                api_analysis = {
                    "total_agents": len(all_agents),
                    "email_agents": len(email_agents),
                    "holiday_email_agents": len(holiday_email_agents),
                    "holiday_email_agent_details": [
                        {
                            "id": agent.get("id"),
                            "agent_name": agent.get("agent_name"),
                            "mode": agent.get("mode"),
                            "selected_holidays": agent.get("selected_holidays", []),
                            "is_active": agent.get("is_active"),
                            "has_required_fields": all(
                                field in agent for field in ["agent_type", "mode", "selected_holidays", "is_active"]
                            )
                        } for agent in holiday_email_agents
                    ]
                }
            
            self.log_test_result(
                "Dashboard API Endpoint Testing",
                success,
                message,
                {
                    "Authentication": "Success" if auth_token else "Failed",
                    "API Analysis": api_analysis,
                    "Backend URL": self.backend_url
                }
            )
            return success, api_response, api_analysis
            
        except Exception as e:
            self.log_test_result(
                "Dashboard API Endpoint Testing",
                False,
                f"Error testing dashboard API endpoint: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None, {}
    
    async def check_agent_display_conditions(self, api_response):
        """Investigation 4: Check Agent Display Conditions"""
        print("🔍 INVESTIGATION 4: Check Agent Display Conditions")
        print("=" * 60)
        
        try:
            if not api_response:
                self.log_test_result(
                    "Agent Display Conditions Check",
                    False,
                    "Cannot check display conditions - no API response available",
                    {}
                )
                return False, {}
            
            # Simulate frontend display logic
            display_analysis = {
                "total_agents": len(api_response),
                "agents_by_type": {},
                "email_agents_analysis": [],
                "display_conditions_met": []
            }
            
            # Group agents by type
            for agent in api_response:
                agent_type = agent.get("agent_type", "unknown")
                if agent_type not in display_analysis["agents_by_type"]:
                    display_analysis["agents_by_type"][agent_type] = 0
                display_analysis["agents_by_type"][agent_type] += 1
            
            # Analyze email agents specifically
            email_agents = [agent for agent in api_response if agent.get("agent_type") == "email"]
            
            for agent in email_agents:
                agent_id = agent.get("id")
                agent_name = agent.get("agent_name")
                mode = agent.get("mode")
                selected_holidays = agent.get("selected_holidays", [])
                is_active = agent.get("is_active", False)
                
                # Check display conditions (based on typical dashboard logic)
                conditions = {
                    "has_agent_type_email": agent.get("agent_type") == "email",
                    "has_mode_recurring": mode == "recurring",
                    "has_selected_holidays": len(selected_holidays) > 0,
                    "is_active": is_active,
                    "has_agent_name": bool(agent_name),
                    "has_id": bool(agent_id)
                }
                
                # Determine if agent should be displayed as holiday email agent
                should_display_as_holiday = (
                    conditions["has_agent_type_email"] and
                    conditions["has_mode_recurring"] and
                    conditions["has_selected_holidays"] and
                    conditions["is_active"]
                )
                
                analysis = {
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "mode": mode,
                    "selected_holidays_count": len(selected_holidays),
                    "conditions": conditions,
                    "should_display_as_holiday": should_display_as_holiday,
                    "display_category": "Holiday Email Agent" if should_display_as_holiday else "Regular Email Agent"
                }
                
                display_analysis["email_agents_analysis"].append(analysis)
                
                if should_display_as_holiday:
                    display_analysis["display_conditions_met"].append(agent_id)
            
            holiday_agents_count = len(display_analysis["display_conditions_met"])
            success = holiday_agents_count > 0
            
            self.log_test_result(
                "Agent Display Conditions Check",
                success,
                f"Found {holiday_agents_count} email agents that meet holiday display conditions out of {len(email_agents)} email agents",
                {
                    "Display Analysis": display_analysis,
                    "Holiday Agents Meeting Conditions": holiday_agents_count,
                    "Total Email Agents": len(email_agents)
                }
            )
            return success, display_analysis
            
        except Exception as e:
            self.log_test_result(
                "Agent Display Conditions Check",
                False,
                f"Error checking agent display conditions: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def create_test_holiday_email_agent(self, all_holidays):
        """Investigation 5: Create Test Holiday Email Agent if Needed"""
        print("🔍 INVESTIGATION 5: Create Test Holiday Email Agent if Needed")
        print("=" * 60)
        
        try:
            # Check if we need to create a test agent
            existing_holiday_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "mode": "recurring",
                "selected_holidays": {"$exists": True, "$ne": []},
                "is_active": True
            }).to_list(length=None)
            
            if len(existing_holiday_agents) > 0:
                self.log_test_result(
                    "Test Holiday Email Agent Creation",
                    True,
                    f"No need to create test agent - {len(existing_holiday_agents)} valid holiday email agents already exist",
                    {
                        "Existing Holiday Agents": [
                            {
                                "id": agent.get("id"),
                                "name": agent.get("agent_name"),
                                "selected_holidays": agent.get("selected_holidays", [])
                            } for agent in existing_holiday_agents
                        ]
                    }
                )
                return True, existing_holiday_agents[0]
            
            # Create a test holiday email agent
            if not all_holidays:
                # Get holidays if not provided
                all_holidays = await self.db.holidays.find({}).to_list(length=None)
            
            if len(all_holidays) == 0:
                self.log_test_result(
                    "Test Holiday Email Agent Creation",
                    False,
                    "Cannot create test agent - no holidays found in database",
                    {}
                )
                return False, None
            
            # Select a few holidays for the test agent
            selected_holiday_ids = [h["id"] for h in all_holidays[:3]]  # Use first 3 holidays
            
            test_agent_id = str(uuid.uuid4())
            test_agent = {
                "id": test_agent_id,
                "agent_name": "Test Holiday Email Agent",
                "agent_type": "email",
                "mode": "recurring",
                "selected_holidays": selected_holiday_ids,
                "is_active": True,
                "email_content_template": "Happy [HOLIDAY_NAME], [CUSTOMER_NAME]! We hope you and [PET_NAME] have a wonderful holiday!",
                "use_chatgpt_formatting": True,
                "post_time": "09:00",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert the test agent
            await self.db.ai_agents.insert_one(test_agent)
            
            # Verify it was created
            created_agent = await self.db.ai_agents.find_one({"id": test_agent_id})
            
            success = created_agent is not None
            
            self.log_test_result(
                "Test Holiday Email Agent Creation",
                success,
                f"Created test holiday email agent with ID: {test_agent_id}",
                {
                    "Test Agent ID": test_agent_id,
                    "Test Agent Name": "Test Holiday Email Agent",
                    "Selected Holidays": selected_holiday_ids,
                    "Holiday Names": [h["name"] for h in all_holidays[:3]],
                    "Agent Created Successfully": success
                }
            )
            return success, created_agent
            
        except Exception as e:
            self.log_test_result(
                "Test Holiday Email Agent Creation",
                False,
                f"Error creating test holiday email agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def verify_agent_appears_in_dashboard(self, test_agent):
        """Investigation 6: Verify Agent Appears in Dashboard"""
        print("🔍 INVESTIGATION 6: Verify Agent Appears in Dashboard")
        print("=" * 60)
        
        try:
            if not test_agent:
                self.log_test_result(
                    "Dashboard Appearance Verification",
                    False,
                    "Cannot verify dashboard appearance - no test agent available",
                    {}
                )
                return False, {}
            
            import aiohttp
            import ssl
            
            # Create SSL context that doesn't verify certificates (for testing)
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # Get authentication token
            login_data = {
                "email": "admin@hospital.com",
                "password": "admin123"
            }
            
            auth_token = None
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Login to get token
                try:
                    login_url = f"{self.backend_url}/api/login"
                    async with session.post(login_url, json=login_data, timeout=10) as response:
                        if response.status == 200:
                            login_result = await response.json()
                            auth_token = login_result.get("access_token")
                        else:
                            print(f"❌ Login failed with status {response.status}")
                            
                except Exception as e:
                    print(f"❌ Login error: {str(e)}")
                
                # Test if the agent appears in dashboard API
                if auth_token:
                    headers = {"Authorization": f"Bearer {auth_token}"}
                    
                    try:
                        url = f"{self.backend_url}/api/ai-agents"
                        async with session.get(url, headers=headers, timeout=10) as response:
                            if response.status == 200:
                                api_response = await response.json()
                                
                                # Look for our test agent
                                test_agent_id = test_agent.get("id")
                                found_agent = None
                                
                                for agent in api_response:
                                    if agent.get("id") == test_agent_id:
                                        found_agent = agent
                                        break
                                
                                if found_agent:
                                    # Verify it has all required fields
                                    required_fields = ["agent_type", "mode", "selected_holidays", "is_active", "agent_name"]
                                    missing_fields = [field for field in required_fields if field not in found_agent]
                                    
                                    is_holiday_agent = (
                                        found_agent.get("agent_type") == "email" and
                                        found_agent.get("mode") == "recurring" and
                                        found_agent.get("selected_holidays") and
                                        len(found_agent.get("selected_holidays", [])) > 0 and
                                        found_agent.get("is_active")
                                    )
                                    
                                    success = is_holiday_agent and len(missing_fields) == 0
                                    message = f"Test agent found in dashboard API and {'meets' if is_holiday_agent else 'does not meet'} holiday display criteria"
                                    
                                    details = {
                                        "Agent Found": True,
                                        "Agent Data": found_agent,
                                        "Missing Fields": missing_fields,
                                        "Meets Holiday Criteria": is_holiday_agent,
                                        "Should Display as Holiday Agent": success
                                    }
                                else:
                                    success = False
                                    message = "Test agent not found in dashboard API response"
                                    details = {
                                        "Agent Found": False,
                                        "Test Agent ID": test_agent_id,
                                        "Total Agents in Response": len(api_response)
                                    }
                            else:
                                success = False
                                message = f"Dashboard API failed with status {response.status}"
                                details = {"API Status": response.status}
                                
                    except Exception as e:
                        success = False
                        message = f"Error calling dashboard API: {str(e)}"
                        details = {"Error": str(e)}
                else:
                    success = False
                    message = "Cannot verify dashboard appearance - authentication failed"
                    details = {}
            
            self.log_test_result(
                "Dashboard Appearance Verification",
                success,
                message,
                details
            )
            return success, details
            
        except Exception as e:
            self.log_test_result(
                "Dashboard Appearance Verification",
                False,
                f"Error verifying dashboard appearance: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def run_holiday_email_agent_investigation(self):
        """Run comprehensive holiday email agent investigation"""
        print("🔍 STARTING HOLIDAY EMAIL AGENT DASHBOARD INVESTIGATION")
        print("=" * 80)
        print("Investigating why scheduled holiday email agents are not showing in the agent dashboard")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all investigations
            investigation_results = []
            
            # Investigation 1: Check Email Agents in Database
            success1, all_email_agents, holiday_email_agents, scheduled_email_agents = await self.check_email_agents_in_database()
            investigation_results.append(success1)
            
            # Investigation 2: Verify Holiday Email Agent Configuration
            success2, configuration_analysis, all_holidays = await self.verify_holiday_email_agent_configuration(holiday_email_agents)
            investigation_results.append(success2)
            
            # Investigation 3: Test Dashboard API Endpoint
            success3, api_response, api_analysis = await self.test_dashboard_api_endpoint()
            investigation_results.append(success3)
            
            # Investigation 4: Check Agent Display Conditions
            success4, display_analysis = await self.check_agent_display_conditions(api_response)
            investigation_results.append(success4)
            
            # Investigation 5: Create Test Holiday Email Agent if Needed
            success5, test_agent = await self.create_test_holiday_email_agent(all_holidays)
            investigation_results.append(success5)
            
            # Investigation 6: Verify Agent Appears in Dashboard
            success6, dashboard_verification = await self.verify_agent_appears_in_dashboard(test_agent)
            investigation_results.append(success6)
            
            # Summary
            print("=" * 80)
            print("🎯 HOLIDAY EMAIL AGENT INVESTIGATION SUMMARY")
            print("=" * 80)
            
            passed_investigations = sum(investigation_results)
            total_investigations = len(investigation_results)
            success_rate = (passed_investigations / total_investigations) * 100
            
            print(f"Successful Investigations: {passed_investigations}/{total_investigations} ({success_rate:.1f}%)")
            print()
            
            # Detailed results
            for result in self.test_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            print("🔍 KEY FINDINGS:")
            print("=" * 40)
            
            # Analyze findings
            if len(holiday_email_agents) > 0:
                print(f"✅ HOLIDAY EMAIL AGENTS FOUND: {len(holiday_email_agents)} agents with selected holidays")
                for agent in holiday_email_agents:
                    print(f"   - {agent.get('agent_name')} (ID: {agent.get('id')})")
                    print(f"     Mode: {agent.get('mode')}, Active: {agent.get('is_active')}")
                    print(f"     Holidays: {len(agent.get('selected_holidays', []))} selected")
            else:
                print("❌ NO HOLIDAY EMAIL AGENTS FOUND: No email agents with selected_holidays field")
            
            if api_analysis.get("holiday_email_agents", 0) > 0:
                print(f"✅ DASHBOARD API RETURNS HOLIDAY AGENTS: {api_analysis['holiday_email_agents']} agents")
            else:
                print("❌ DASHBOARD API MISSING HOLIDAY AGENTS: API does not return holiday email agents")
            
            if display_analysis.get("display_conditions_met"):
                meeting_conditions = len(display_analysis["display_conditions_met"])
                print(f"✅ AGENTS MEET DISPLAY CONDITIONS: {meeting_conditions} agents should be visible")
            else:
                print("❌ NO AGENTS MEET DISPLAY CONDITIONS: Agents don't meet frontend display criteria")
            
            print()
            print("🎯 DIAGNOSIS:")
            print("=" * 40)
            
            if len(holiday_email_agents) == 0:
                print("❌ ROOT CAUSE: No Holiday Email Agents Exist")
                print("   - No email agents have selected_holidays field populated")
                print("   - Dashboard is correct - there are no holiday email agents to show")
                print("   - Solution: Create email agents with mode='recurring' and selected_holidays")
            elif api_analysis.get("holiday_email_agents", 0) == 0:
                print("❌ ROOT CAUSE: API Filtering Issue")
                print("   - Holiday email agents exist in database")
                print("   - But API endpoint is not returning them")
                print("   - Check API filtering logic or agent structure")
            elif not display_analysis.get("display_conditions_met"):
                print("❌ ROOT CAUSE: Frontend Display Logic Issue")
                print("   - Holiday email agents exist and API returns them")
                print("   - But frontend display conditions are not met")
                print("   - Check frontend filtering and display logic")
            else:
                print("✅ HOLIDAY EMAIL AGENTS SHOULD BE VISIBLE")
                print("   - Holiday email agents exist in database")
                print("   - API returns them correctly")
                print("   - They meet display conditions")
                print("   - Issue may be in frontend rendering or user interface")
            
            print()
            print("📋 RECOMMENDATIONS:")
            print("=" * 40)
            
            if len(holiday_email_agents) == 0:
                print("1. Create holiday email agents with proper structure:")
                print("   - agent_type: 'email'")
                print("   - mode: 'recurring'")
                print("   - selected_holidays: [array of holiday IDs]")
                print("   - is_active: true")
            
            if test_agent and success6:
                print("2. Test agent created successfully and appears in dashboard")
                print("   - Holiday email agents should now be visible")
            elif test_agent and not success6:
                print("2. Test agent created but not appearing in dashboard")
                print("   - Check API endpoint or frontend display logic")
            
            print("3. Verify frontend dashboard component:")
            print("   - Check if holiday email agents are filtered correctly")
            print("   - Ensure display conditions match agent structure")
            print("   - Test dashboard UI with created agents")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during investigation: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main investigation function"""
    investigator = HolidayEmailAgentInvestigator()
    await investigator.run_holiday_email_agent_investigation()

if __name__ == "__main__":
    asyncio.run(main())