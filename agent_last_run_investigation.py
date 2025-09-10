#!/usr/bin/env python3
"""
Agent Last Run Data Investigation Test

This test investigates the last run data field names for email and SMS agents in the dashboard.
The user reports that "Last Manual Run" sections show "Never run manually" and wants to understand
why the last run details aren't showing.

Investigation Focus:
1. Check Agent Data Structure - Find email and SMS agents in database and check what fields store last run information
2. Verify Last Run Data Storage - Check if last run data is actually being stored when agents are executed
3. Check API Response Format - Test GET /api/ai-agents endpoint to see what last run fields are returned
4. Find Correct Field Names - Identify exact field names used for storing last run information
5. Test Agent Execution - Check if running an agent updates the last run fields

Expected Results:
- Should find the correct field names for last run data
- Should identify why "Last Manual Run" sections show "Never run manually"
- Should determine if data is missing or field names are wrong
- Should provide the correct field names to use in frontend
"""

import asyncio
import sys
import os
import json
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

class AgentLastRunInvestigator:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://smart-sms-1.preview.emergentagent.com')
        
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
    
    async def investigate_agent_data_structure(self):
        """Investigation 1: Check Agent Data Structure"""
        print("🔍 INVESTIGATION 1: Check Agent Data Structure")
        print("=" * 60)
        
        try:
            # Find email and SMS agents in database
            email_agents = await self.db.ai_agents.find({
                "agent_type": "email"
            }).to_list(length=10)
            
            sms_agents = await self.db.ai_agents.find({
                "agent_type": "sms_agent"
            }).to_list(length=10)
            
            # Analyze field structure for last run data
            last_run_fields = set()
            agent_samples = []
            
            all_agents = email_agents + sms_agents
            
            for agent in all_agents:
                # Remove MongoDB _id for cleaner display
                if '_id' in agent:
                    del agent['_id']
                
                # Look for potential last run fields
                for field_name in agent.keys():
                    if any(keyword in field_name.lower() for keyword in ['last', 'run', 'executed', 'manual', 'auto', 'date', 'time']):
                        last_run_fields.add(field_name)
                
                # Keep sample agents for analysis
                if len(agent_samples) < 3:
                    agent_samples.append({
                        "agent_type": agent.get("agent_type"),
                        "agent_name": agent.get("agent_name", "Unknown"),
                        "fields": list(agent.keys()),
                        "sample_data": agent
                    })
            
            success = len(all_agents) > 0
            
            self.log_test_result(
                "Agent Data Structure Investigation",
                success,
                f"Found {len(email_agents)} email agents and {len(sms_agents)} SMS agents with {len(last_run_fields)} potential last run fields",
                {
                    "Email Agents Count": len(email_agents),
                    "SMS Agents Count": len(sms_agents),
                    "Potential Last Run Fields": list(last_run_fields),
                    "Sample Agents": agent_samples
                }
            )
            return success, all_agents, last_run_fields
            
        except Exception as e:
            self.log_test_result(
                "Agent Data Structure Investigation",
                False,
                f"Error investigating agent data structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, [], set()
    
    async def verify_last_run_data_storage(self, agents):
        """Investigation 2: Verify Last Run Data Storage"""
        print("🔍 INVESTIGATION 2: Verify Last Run Data Storage")
        print("=" * 60)
        
        try:
            # Check if agents have any last run data stored
            agents_with_last_run = []
            agents_without_last_run = []
            
            last_run_field_analysis = {}
            
            for agent in agents:
                agent_id = agent.get("id")
                agent_name = agent.get("agent_name", "Unknown")
                agent_type = agent.get("agent_type")
                
                # Check for various possible last run field names
                possible_fields = [
                    'last_run_date', 'last_manual_run', 'last_executed', 'last_run_time',
                    'last_auto_run', 'last_scheduled_run', 'last_execution_date',
                    'last_run', 'manual_run_date', 'auto_run_date', 'execution_date',
                    'run_date', 'executed_at', 'last_triggered', 'last_processed'
                ]
                
                found_fields = {}
                has_last_run_data = False
                
                for field in possible_fields:
                    if field in agent:
                        found_fields[field] = agent[field]
                        if agent[field] is not None and agent[field] != "":
                            has_last_run_data = True
                
                agent_analysis = {
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "agent_type": agent_type,
                    "found_last_run_fields": found_fields,
                    "has_data": has_last_run_data
                }
                
                if has_last_run_data:
                    agents_with_last_run.append(agent_analysis)
                else:
                    agents_without_last_run.append(agent_analysis)
                
                # Track field usage across all agents
                for field, value in found_fields.items():
                    if field not in last_run_field_analysis:
                        last_run_field_analysis[field] = {"count": 0, "with_data": 0, "sample_values": []}
                    
                    last_run_field_analysis[field]["count"] += 1
                    if value is not None and value != "":
                        last_run_field_analysis[field]["with_data"] += 1
                        if len(last_run_field_analysis[field]["sample_values"]) < 3:
                            last_run_field_analysis[field]["sample_values"].append(value)
            
            success = len(agents_with_last_run) > 0
            
            self.log_test_result(
                "Last Run Data Storage Verification",
                success,
                f"Found {len(agents_with_last_run)} agents with last run data, {len(agents_without_last_run)} without",
                {
                    "Agents With Last Run Data": len(agents_with_last_run),
                    "Agents Without Last Run Data": len(agents_without_last_run),
                    "Field Analysis": last_run_field_analysis,
                    "Sample Agents With Data": agents_with_last_run[:3],
                    "Sample Agents Without Data": agents_without_last_run[:3]
                }
            )
            return success, agents_with_last_run, agents_without_last_run, last_run_field_analysis
            
        except Exception as e:
            self.log_test_result(
                "Last Run Data Storage Verification",
                False,
                f"Error verifying last run data storage: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, [], [], {}
    
    async def check_api_response_format(self):
        """Investigation 3: Check API Response Format"""
        print("🔍 INVESTIGATION 3: Check API Response Format")
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
                
                # Test GET /api/ai-agents endpoint
                if auth_token:
                    headers = {"Authorization": f"Bearer {auth_token}"}
                    
                    try:
                        url = f"{self.backend_url}/api/ai-agents"
                        print(f"Testing API endpoint: {url}")
                        
                        async with session.get(url, headers=headers, timeout=10) as response:
                            status = response.status
                            
                            if status == 200:
                                api_response = await response.json()
                                print(f"✅ API returned {len(api_response)} agents")
                                
                                # Analyze the response format for last run fields
                                last_run_fields_in_response = set()
                                sample_agents = []
                                
                                for agent in api_response[:3]:  # Check first 3 agents
                                    for field_name in agent.keys():
                                        if any(keyword in field_name.lower() for keyword in ['last', 'run', 'executed', 'manual', 'auto', 'date', 'time']):
                                            last_run_fields_in_response.add(field_name)
                                    
                                    sample_agents.append({
                                        "agent_type": agent.get("agent_type"),
                                        "agent_name": agent.get("agent_name", "Unknown"),
                                        "last_run_fields": {k: v for k, v in agent.items() if any(keyword in k.lower() for keyword in ['last', 'run', 'executed', 'manual', 'auto', 'date', 'time'])}
                                    })
                                
                                success = True
                                message = f"API returned {len(api_response)} agents with {len(last_run_fields_in_response)} last run fields"
                                
                            else:
                                error_data = await response.text()
                                success = False
                                message = f"API returned status {status}: {error_data}"
                                api_response = None
                                
                    except Exception as e:
                        success = False
                        message = f"API call error: {str(e)}"
                        api_response = None
                else:
                    success = False
                    message = "Cannot test API without authentication token"
                    api_response = None
            
            details = {
                "Authentication": "Success" if auth_token else "Failed",
                "API Response Count": len(api_response) if api_response else 0,
                "Backend URL": self.backend_url
            }
            
            if api_response:
                details.update({
                    "Last Run Fields in Response": list(last_run_fields_in_response),
                    "Sample Agents": sample_agents
                })
            
            self.log_test_result(
                "API Response Format Check",
                success,
                message,
                details
            )
            return success, api_response, last_run_fields_in_response if api_response else set()
            
        except Exception as e:
            self.log_test_result(
                "API Response Format Check",
                False,
                f"Error checking API response format: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None, set()
    
    async def find_correct_field_names(self, agents, api_response):
        """Investigation 4: Find Correct Field Names"""
        print("🔍 INVESTIGATION 4: Find Correct Field Names")
        print("=" * 60)
        
        try:
            # Compare database fields vs API response fields
            db_fields = set()
            api_fields = set()
            
            # Get all possible last run fields from database
            for agent in agents:
                for field_name in agent.keys():
                    if any(keyword in field_name.lower() for keyword in ['last', 'run', 'executed', 'manual', 'auto', 'date', 'time']):
                        db_fields.add(field_name)
            
            # Get all possible last run fields from API response
            if api_response:
                for agent in api_response:
                    for field_name in agent.keys():
                        if any(keyword in field_name.lower() for keyword in ['last', 'run', 'executed', 'manual', 'auto', 'date', 'time']):
                            api_fields.add(field_name)
            
            # Find discrepancies
            only_in_db = db_fields - api_fields
            only_in_api = api_fields - db_fields
            common_fields = db_fields & api_fields
            
            # Check server.py for field definitions
            server_file_path = Path(__file__).parent / "backend" / "server.py"
            model_fields = []
            
            if server_file_path.exists():
                with open(server_file_path, 'r') as f:
                    content = f.read()
                    
                # Look for AI agent model definitions
                import re
                
                # Find AIAgent or AIAgentCreate model definitions
                model_patterns = [
                    r'class\s+AIAgent[^:]*:.*?(?=class|\Z)',
                    r'class\s+AIAgentCreate[^:]*:.*?(?=class|\Z)'
                ]
                
                for pattern in model_patterns:
                    matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
                    for match in matches:
                        # Look for field definitions with last/run/date/time keywords
                        field_matches = re.findall(r'(\w*(?:last|run|executed|manual|auto|date|time)\w*)\s*:', match, re.IGNORECASE)
                        model_fields.extend(field_matches)
            
            # Analyze field usage patterns
            field_usage_analysis = {}
            
            for field in db_fields | api_fields:
                field_usage_analysis[field] = {
                    "in_database": field in db_fields,
                    "in_api_response": field in api_fields,
                    "in_model_definition": field in model_fields,
                    "usage_count": 0,
                    "sample_values": []
                }
                
                # Count usage and get sample values
                for agent in agents:
                    if field in agent and agent[field] is not None:
                        field_usage_analysis[field]["usage_count"] += 1
                        if len(field_usage_analysis[field]["sample_values"]) < 3:
                            field_usage_analysis[field]["sample_values"].append(agent[field])
            
            success = len(common_fields) > 0 or len(db_fields) > 0
            
            self.log_test_result(
                "Correct Field Names Investigation",
                success,
                f"Found {len(common_fields)} common fields, {len(only_in_db)} DB-only, {len(only_in_api)} API-only",
                {
                    "Database Fields": list(db_fields),
                    "API Response Fields": list(api_fields),
                    "Common Fields": list(common_fields),
                    "Only in Database": list(only_in_db),
                    "Only in API Response": list(only_in_api),
                    "Model Definition Fields": list(set(model_fields)),
                    "Field Usage Analysis": field_usage_analysis
                }
            )
            return success, field_usage_analysis, common_fields
            
        except Exception as e:
            self.log_test_result(
                "Correct Field Names Investigation",
                False,
                f"Error finding correct field names: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}, set()
    
    async def test_agent_execution(self):
        """Investigation 5: Test Agent Execution"""
        print("🔍 INVESTIGATION 5: Test Agent Execution")
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
            execution_results = []
            
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
                
                if auth_token:
                    headers = {"Authorization": f"Bearer {auth_token}"}
                    
                    # First, get list of agents to test
                    try:
                        agents_url = f"{self.backend_url}/api/ai-agents"
                        async with session.get(agents_url, headers=headers, timeout=10) as response:
                            if response.status == 200:
                                agents_list = await response.json()
                                
                                # Find a suitable agent to test (email or SMS)
                                test_agents = []
                                for agent in agents_list:
                                    if agent.get("agent_type") in ["email", "sms_agent"] and agent.get("is_active", True):
                                        test_agents.append(agent)
                                        if len(test_agents) >= 2:  # Test max 2 agents
                                            break
                                
                                print(f"Found {len(test_agents)} agents to test execution")
                                
                                # Test running each agent
                                for agent in test_agents:
                                    agent_id = agent.get("id")
                                    agent_name = agent.get("agent_name", "Unknown")
                                    agent_type = agent.get("agent_type")
                                    
                                    print(f"Testing execution of {agent_type} agent: {agent_name}")
                                    
                                    # Get agent data before execution
                                    before_data = None
                                    try:
                                        agent_url = f"{self.backend_url}/api/ai-agents/{agent_id}"
                                        async with session.get(agent_url, headers=headers, timeout=10) as response:
                                            if response.status == 200:
                                                before_data = await response.json()
                                    except Exception as e:
                                        print(f"Error getting agent data before execution: {e}")
                                    
                                    # Try to run the agent
                                    execution_result = {
                                        "agent_id": agent_id,
                                        "agent_name": agent_name,
                                        "agent_type": agent_type,
                                        "before_data": before_data,
                                        "execution_success": False,
                                        "execution_response": None,
                                        "after_data": None,
                                        "last_run_fields_changed": []
                                    }
                                    
                                    try:
                                        run_url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                                        print(f"Attempting to run agent at: {run_url}")
                                        
                                        async with session.post(run_url, headers=headers, timeout=30) as response:
                                            execution_result["execution_success"] = response.status == 200
                                            
                                            if response.status == 200:
                                                execution_result["execution_response"] = await response.json()
                                                print(f"✅ Agent execution successful")
                                            else:
                                                execution_result["execution_response"] = await response.text()
                                                print(f"❌ Agent execution failed with status {response.status}")
                                                
                                    except Exception as e:
                                        execution_result["execution_response"] = str(e)
                                        print(f"❌ Agent execution error: {e}")
                                    
                                    # Get agent data after execution
                                    try:
                                        agent_url = f"{self.backend_url}/api/ai-agents/{agent_id}"
                                        async with session.get(agent_url, headers=headers, timeout=10) as response:
                                            if response.status == 200:
                                                execution_result["after_data"] = await response.json()
                                                
                                                # Compare before and after data for last run fields
                                                if before_data and execution_result["after_data"]:
                                                    for field in execution_result["after_data"].keys():
                                                        if any(keyword in field.lower() for keyword in ['last', 'run', 'executed', 'manual', 'auto', 'date', 'time']):
                                                            before_value = before_data.get(field)
                                                            after_value = execution_result["after_data"].get(field)
                                                            if before_value != after_value:
                                                                execution_result["last_run_fields_changed"].append({
                                                                    "field": field,
                                                                    "before": before_value,
                                                                    "after": after_value
                                                                })
                                                
                                    except Exception as e:
                                        print(f"Error getting agent data after execution: {e}")
                                    
                                    execution_results.append(execution_result)
                                    
                                    # Wait a bit between agent executions
                                    await asyncio.sleep(2)
                                
                            else:
                                print(f"❌ Failed to get agents list: {response.status}")
                                
                    except Exception as e:
                        print(f"❌ Error getting agents list: {e}")
            
            successful_executions = [r for r in execution_results if r["execution_success"]]
            fields_updated = [r for r in execution_results if r["last_run_fields_changed"]]
            
            success = len(successful_executions) > 0
            
            self.log_test_result(
                "Agent Execution Testing",
                success,
                f"Executed {len(execution_results)} agents, {len(successful_executions)} successful, {len(fields_updated)} updated last run fields",
                {
                    "Total Executions": len(execution_results),
                    "Successful Executions": len(successful_executions),
                    "Agents with Updated Fields": len(fields_updated),
                    "Execution Results": execution_results
                }
            )
            return success, execution_results
            
        except Exception as e:
            self.log_test_result(
                "Agent Execution Testing",
                False,
                f"Error testing agent execution: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def check_agent_posts_for_execution_history(self):
        """Investigation 6: Check Agent Posts for Execution History"""
        print("🔍 INVESTIGATION 6: Check Agent Posts for Execution History")
        print("=" * 60)
        
        try:
            # Check ai_posts collection for agent execution history
            posts = await self.db.ai_posts.find({}).sort("created_at", -1).limit(20).to_list(length=20)
            
            agent_execution_history = {}
            execution_dates = []
            
            for post in posts:
                agent_id = post.get("agent_id")
                agent_name = post.get("agent_name", "Unknown")
                agent_type = post.get("agent_type")
                created_at = post.get("created_at")
                status = post.get("status")
                
                if agent_id:
                    if agent_id not in agent_execution_history:
                        agent_execution_history[agent_id] = {
                            "agent_name": agent_name,
                            "agent_type": agent_type,
                            "executions": []
                        }
                    
                    agent_execution_history[agent_id]["executions"].append({
                        "created_at": created_at,
                        "status": status,
                        "post_id": post.get("id")
                    })
                    
                    if created_at:
                        execution_dates.append(created_at)
            
            # Find most recent executions
            recent_executions = []
            for agent_id, data in agent_execution_history.items():
                if data["executions"]:
                    most_recent = max(data["executions"], key=lambda x: x["created_at"] if x["created_at"] else datetime.min)
                    recent_executions.append({
                        "agent_id": agent_id,
                        "agent_name": data["agent_name"],
                        "agent_type": data["agent_type"],
                        "last_execution": most_recent["created_at"],
                        "last_status": most_recent["status"],
                        "total_executions": len(data["executions"])
                    })
            
            # Sort by most recent execution
            recent_executions.sort(key=lambda x: x["last_execution"] if x["last_execution"] else datetime.min, reverse=True)
            
            success = len(posts) > 0
            
            self.log_test_result(
                "Agent Posts Execution History Check",
                success,
                f"Found {len(posts)} posts from {len(agent_execution_history)} agents with execution history",
                {
                    "Total Posts": len(posts),
                    "Agents with Execution History": len(agent_execution_history),
                    "Recent Executions": recent_executions[:5],  # Show top 5
                    "Execution History": agent_execution_history
                }
            )
            return success, agent_execution_history, recent_executions
            
        except Exception as e:
            self.log_test_result(
                "Agent Posts Execution History Check",
                False,
                f"Error checking agent posts for execution history: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}, []
    
    async def run_agent_last_run_investigation(self):
        """Run comprehensive agent last run investigation"""
        print("🔍 STARTING AGENT LAST RUN DATA INVESTIGATION")
        print("=" * 80)
        print("Investigating last run data field names for email and SMS agents")
        print("User reports: 'Last Manual Run' sections show 'Never run manually'")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all investigations
            investigation_results = []
            
            # Investigation 1: Check Agent Data Structure
            success1, agents, last_run_fields = await self.investigate_agent_data_structure()
            investigation_results.append(success1)
            
            # Investigation 2: Verify Last Run Data Storage
            success2, agents_with_data, agents_without_data, field_analysis = await self.verify_last_run_data_storage(agents)
            investigation_results.append(success2)
            
            # Investigation 3: Check API Response Format
            success3, api_response, api_fields = await self.check_api_response_format()
            investigation_results.append(success3)
            
            # Investigation 4: Find Correct Field Names
            success4, field_usage, common_fields = await self.find_correct_field_names(agents, api_response)
            investigation_results.append(success4)
            
            # Investigation 5: Test Agent Execution
            success5, execution_results = await self.test_agent_execution()
            investigation_results.append(success5)
            
            # Investigation 6: Check Agent Posts for Execution History
            success6, execution_history, recent_executions = await self.check_agent_posts_for_execution_history()
            investigation_results.append(success6)
            
            # Summary
            print("=" * 80)
            print("🎯 AGENT LAST RUN INVESTIGATION SUMMARY")
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
            
            # Analyze findings for root cause
            if field_analysis:
                print("📊 FIELD ANALYSIS:")
                for field, analysis in field_analysis.items():
                    if analysis["with_data"] > 0:
                        print(f"   ✅ {field}: {analysis['with_data']}/{analysis['count']} agents have data")
                        if analysis["sample_values"]:
                            print(f"      Sample values: {analysis['sample_values']}")
                    else:
                        print(f"   ❌ {field}: {analysis['count']} agents, but NO DATA stored")
            
            if execution_history:
                print(f"📈 EXECUTION HISTORY: Found {len(execution_history)} agents with post history")
                for execution in recent_executions[:3]:
                    print(f"   {execution['agent_type']} '{execution['agent_name']}': Last run {execution['last_execution']}")
            
            print()
            print("🎯 DIAGNOSIS & RECOMMENDATIONS:")
            print("=" * 40)
            
            # Determine root cause and provide recommendations
            if not agents:
                print("❌ ROOT CAUSE: No email or SMS agents found in database")
                print("   RECOMMENDATION: Create email and SMS agents first")
            elif not any(analysis.get("with_data", 0) > 0 for analysis in field_analysis.values()):
                print("❌ ROOT CAUSE: Agents exist but NO last run data is being stored")
                print("   ISSUE: Last run fields exist in database but are empty/null")
                print("   RECOMMENDATION: Check agent execution logic - it's not updating last run fields")
            elif execution_history and not any(analysis.get("with_data", 0) > 0 for analysis in field_analysis.values()):
                print("❌ ROOT CAUSE: Agents are executing (posts exist) but last run fields not updated")
                print("   ISSUE: Agent execution creates posts but doesn't update agent's last run fields")
                print("   RECOMMENDATION: Fix agent execution logic to update last run timestamps")
            elif common_fields:
                print("✅ PARTIAL SUCCESS: Last run fields exist and have data")
                print("   ISSUE: Frontend may be looking for wrong field names")
                print(f"   CORRECT FIELD NAMES TO USE: {list(common_fields)}")
                print("   RECOMMENDATION: Update frontend to use correct field names")
            else:
                print("⚠️  MIXED RESULTS: Some data exists but inconsistent")
                print("   RECOMMENDATION: Standardize last run field names and ensure consistent updates")
            
            # Provide specific field name recommendations
            if field_usage:
                print()
                print("📋 FIELD NAME RECOMMENDATIONS:")
                print("=" * 40)
                
                # Find the most commonly used and populated fields
                best_fields = []
                for field, usage in field_usage.items():
                    if usage["in_api_response"] and usage["usage_count"] > 0:
                        best_fields.append((field, usage["usage_count"]))
                
                best_fields.sort(key=lambda x: x[1], reverse=True)
                
                if best_fields:
                    print("✅ RECOMMENDED FIELDS FOR FRONTEND:")
                    for field, count in best_fields[:5]:
                        print(f"   - {field} (used by {count} agents)")
                else:
                    print("❌ NO POPULATED FIELDS FOUND IN API RESPONSE")
                    print("   Frontend should check these database fields:")
                    for field in last_run_fields:
                        print(f"   - {field}")
            
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
    investigator = AgentLastRunInvestigator()
    await investigator.run_agent_last_run_investigation()

if __name__ == "__main__":
    asyncio.run(main())