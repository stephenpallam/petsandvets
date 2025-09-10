#!/usr/bin/env python3
"""
SMS Agent Dashboard Display Debug Test

This test investigates why the custom post SMS agent "My SMS" is still showing 
Social Media Platforms instead of SMS-specific fields in the dashboard.

Investigation Focus:
1. Check SMS Agent Data Structure - Find the "My SMS" agent in database and check its exact mode, agent_type, and other relevant fields
2. Verify Agent Display Conditions - Check what conditions the SMS agent is matching in dashboard display logic
3. Check All Social Media Platform Display Locations - Find all places in dashboard where "Social Media Platforms" text appears
4. Verify Field Names - Check if SMS agent has the expected field names: sms_link, recipient_type, customer_name

Expected Results:
- Should find exactly why SMS agent shows Social Media Platforms
- Should identify the correct mode and conditions for SMS agent
- Should find missing display sections that need SMS agent logic
- Should provide exact field names and values for SMS Recipients and Link fields
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

class SMSAgentDebugger:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://vetssms.preview.emergentagent.com')
        
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
    
    async def find_my_sms_agent(self):
        """Investigation 1: Find the "My SMS" agent in database"""
        print("🔍 INVESTIGATION 1: Find 'My SMS' Agent in Database")
        print("=" * 60)
        
        try:
            # Search for SMS agents with various name patterns
            search_patterns = [
                {"agent_name": {"$regex": "My SMS", "$options": "i"}},
                {"agent_name": {"$regex": "SMS", "$options": "i"}},
                {"agent_type": "sms_agent"},
                {"agent_type": {"$regex": "sms", "$options": "i"}}
            ]
            
            found_agents = []
            
            for pattern in search_patterns:
                try:
                    agents = await self.db.ai_agents.find(pattern).to_list(length=50)
                    for agent in agents:
                        if '_id' in agent:
                            del agent['_id']
                        found_agents.append(agent)
                except Exception as e:
                    continue
            
            # Remove duplicates based on agent id
            unique_agents = []
            seen_ids = set()
            for agent in found_agents:
                agent_id = agent.get('id')
                if agent_id and agent_id not in seen_ids:
                    unique_agents.append(agent)
                    seen_ids.add(agent_id)
            
            # Look specifically for "My SMS" agent
            my_sms_agent = None
            for agent in unique_agents:
                if "my sms" in agent.get('agent_name', '').lower():
                    my_sms_agent = agent
                    break
            
            success = len(unique_agents) > 0
            
            self.log_test_result(
                "Find 'My SMS' Agent in Database",
                success,
                f"Found {len(unique_agents)} SMS-related agents, {'Found' if my_sms_agent else 'Did not find'} 'My SMS' agent specifically",
                {
                    "Total SMS Agents Found": len(unique_agents),
                    "My SMS Agent Found": bool(my_sms_agent),
                    "My SMS Agent Data": my_sms_agent,
                    "All SMS Agents": unique_agents
                }
            )
            return success, unique_agents, my_sms_agent
            
        except Exception as e:
            self.log_test_result(
                "Find 'My SMS' Agent in Database",
                False,
                f"Error finding SMS agents: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, [], None
    
    async def analyze_sms_agent_structure(self, sms_agents, my_sms_agent):
        """Investigation 2: Analyze SMS Agent Data Structure"""
        print("🔍 INVESTIGATION 2: Analyze SMS Agent Data Structure")
        print("=" * 60)
        
        try:
            if not sms_agents:
                self.log_test_result(
                    "Analyze SMS Agent Data Structure",
                    False,
                    "No SMS agents found to analyze",
                    {}
                )
                return False, {}
            
            # Analyze the structure of SMS agents
            analysis = {
                "total_agents": len(sms_agents),
                "agent_types": {},
                "modes": {},
                "field_analysis": {},
                "my_sms_analysis": None
            }
            
            # Analyze all SMS agents
            for agent in sms_agents:
                # Count agent types
                agent_type = agent.get('agent_type', 'unknown')
                analysis["agent_types"][agent_type] = analysis["agent_types"].get(agent_type, 0) + 1
                
                # Count modes
                mode = agent.get('mode', 'unknown')
                analysis["modes"][mode] = analysis["modes"].get(mode, 0) + 1
                
                # Analyze fields
                for field_name, field_value in agent.items():
                    if field_name not in analysis["field_analysis"]:
                        analysis["field_analysis"][field_name] = {
                            "present_count": 0,
                            "sample_values": []
                        }
                    
                    analysis["field_analysis"][field_name]["present_count"] += 1
                    if len(analysis["field_analysis"][field_name]["sample_values"]) < 3:
                        analysis["field_analysis"][field_name]["sample_values"].append(str(field_value)[:100])
            
            # Special analysis for "My SMS" agent
            if my_sms_agent:
                analysis["my_sms_analysis"] = {
                    "agent_name": my_sms_agent.get('agent_name'),
                    "agent_type": my_sms_agent.get('agent_type'),
                    "mode": my_sms_agent.get('mode'),
                    "has_sms_link": 'sms_link' in my_sms_agent,
                    "sms_link_value": my_sms_agent.get('sms_link'),
                    "has_selected_holidays": 'selected_holidays' in my_sms_agent,
                    "selected_holidays": my_sms_agent.get('selected_holidays'),
                    "has_topic": 'topic' in my_sms_agent,
                    "topic": my_sms_agent.get('topic'),
                    "all_fields": list(my_sms_agent.keys()),
                    "full_data": my_sms_agent
                }
            
            success = True
            
            self.log_test_result(
                "Analyze SMS Agent Data Structure",
                success,
                f"Analyzed {len(sms_agents)} SMS agents - found agent types: {list(analysis['agent_types'].keys())}, modes: {list(analysis['modes'].keys())}",
                {
                    "Analysis Summary": analysis,
                    "Key Fields Present": [field for field, data in analysis["field_analysis"].items() if data["present_count"] > 0],
                    "My SMS Agent Details": analysis["my_sms_analysis"]
                }
            )
            return success, analysis
            
        except Exception as e:
            self.log_test_result(
                "Analyze SMS Agent Data Structure",
                False,
                f"Error analyzing SMS agent structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def check_dashboard_display_logic(self):
        """Investigation 3: Check Dashboard Display Logic in Frontend Code"""
        print("🔍 INVESTIGATION 3: Check Dashboard Display Logic in Frontend Code")
        print("=" * 60)
        
        try:
            # Check frontend dashboard files for display logic
            frontend_dir = Path(__file__).parent / "frontend" / "src"
            dashboard_files = []
            
            # Find dashboard-related files
            if frontend_dir.exists():
                for file_path in frontend_dir.rglob("*.js"):
                    if any(keyword in file_path.name.lower() for keyword in ['dashboard', 'agent', 'sms']):
                        dashboard_files.append(file_path)
                
                for file_path in frontend_dir.rglob("*.jsx"):
                    if any(keyword in file_path.name.lower() for keyword in ['dashboard', 'agent', 'sms']):
                        dashboard_files.append(file_path)
            
            # Analyze dashboard display logic
            display_logic_analysis = {
                "files_found": len(dashboard_files),
                "social_media_references": [],
                "sms_display_logic": [],
                "agent_type_conditions": [],
                "mode_conditions": []
            }
            
            for file_path in dashboard_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Look for "Social Media Platforms" text
                        if "Social Media Platforms" in content:
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if "Social Media Platforms" in line:
                                    display_logic_analysis["social_media_references"].append({
                                        "file": str(file_path),
                                        "line_number": i + 1,
                                        "line_content": line.strip(),
                                        "context": lines[max(0, i-2):i+3]  # 2 lines before and after
                                    })
                        
                        # Look for SMS display logic
                        sms_keywords = ["sms_agent", "SMS", "sms_link", "SMS Recipients"]
                        for keyword in sms_keywords:
                            if keyword in content:
                                lines = content.split('\n')
                                for i, line in enumerate(lines):
                                    if keyword in line and ("if" in line or "case" in line or "switch" in line):
                                        display_logic_analysis["sms_display_logic"].append({
                                            "file": str(file_path),
                                            "line_number": i + 1,
                                            "keyword": keyword,
                                            "line_content": line.strip(),
                                            "context": lines[max(0, i-2):i+3]
                                        })
                        
                        # Look for agent_type conditions
                        if "agent_type" in content:
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if "agent_type" in line and ("===" in line or "==" in line or "if" in line):
                                    display_logic_analysis["agent_type_conditions"].append({
                                        "file": str(file_path),
                                        "line_number": i + 1,
                                        "line_content": line.strip(),
                                        "context": lines[max(0, i-1):i+2]
                                    })
                        
                        # Look for mode conditions
                        if "mode" in content:
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if "mode" in line and ("===" in line or "==" in line or "if" in line):
                                    display_logic_analysis["mode_conditions"].append({
                                        "file": str(file_path),
                                        "line_number": i + 1,
                                        "line_content": line.strip(),
                                        "context": lines[max(0, i-1):i+2]
                                    })
                
                except Exception as e:
                    continue
            
            success = len(dashboard_files) > 0
            
            self.log_test_result(
                "Check Dashboard Display Logic in Frontend Code",
                success,
                f"Analyzed {len(dashboard_files)} dashboard files - found {len(display_logic_analysis['social_media_references'])} 'Social Media Platforms' references",
                {
                    "Dashboard Files": [str(f) for f in dashboard_files],
                    "Display Logic Analysis": display_logic_analysis
                }
            )
            return success, display_logic_analysis
            
        except Exception as e:
            self.log_test_result(
                "Check Dashboard Display Logic in Frontend Code",
                False,
                f"Error checking dashboard display logic: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def test_agent_api_response(self, my_sms_agent):
        """Investigation 4: Test Agent API Response"""
        print("🔍 INVESTIGATION 4: Test Agent API Response")
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
                        else:
                            print(f"Login failed with status {response.status}")
                            
                except Exception as e:
                    print(f"Login error: {str(e)}")
                
                # Test the agents API endpoint
                if auth_token:
                    headers = {"Authorization": f"Bearer {auth_token}"}
                    
                    try:
                        # Get all agents
                        url = f"{self.backend_url}/api/ai-agents"
                        print(f"Testing agents API: {url}")
                        
                        async with session.get(url, headers=headers, timeout=10) as response:
                            status = response.status
                            
                            if status == 200:
                                api_response = await response.json()
                                print(f"✅ Agents API returned {len(api_response)} agents")
                                
                                # Find the "My SMS" agent in API response
                                my_sms_in_api = None
                                sms_agents_in_api = []
                                
                                for agent in api_response:
                                    if agent.get('agent_type') == 'sms_agent':
                                        sms_agents_in_api.append(agent)
                                        if "my sms" in agent.get('agent_name', '').lower():
                                            my_sms_in_api = agent
                                
                                success = True
                                message = f"API returned {len(sms_agents_in_api)} SMS agents, {'Found' if my_sms_in_api else 'Did not find'} 'My SMS' agent"
                                
                                details = {
                                    "API Status": status,
                                    "Total Agents": len(api_response),
                                    "SMS Agents Count": len(sms_agents_in_api),
                                    "My SMS Agent in API": bool(my_sms_in_api),
                                    "My SMS Agent API Data": my_sms_in_api,
                                    "All SMS Agents in API": sms_agents_in_api
                                }
                                
                            else:
                                error_data = await response.text()
                                success = False
                                message = f"API returned status {status}: {error_data}"
                                details = {"API Status": status, "Error": error_data}
                                
                    except Exception as e:
                        success = False
                        message = f"API call error: {str(e)}"
                        details = {"Error": str(e)}
                else:
                    success = False
                    message = "Authentication failed - cannot test API"
                    details = {"Authentication": "Failed"}
            
            self.log_test_result(
                "Test Agent API Response",
                success,
                message,
                details
            )
            return success, api_response
            
        except Exception as e:
            self.log_test_result(
                "Test Agent API Response",
                False,
                f"Error testing agent API: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def verify_field_names_and_values(self, my_sms_agent, analysis):
        """Investigation 5: Verify Field Names and Values"""
        print("🔍 INVESTIGATION 5: Verify Field Names and Values")
        print("=" * 60)
        
        try:
            if not my_sms_agent:
                self.log_test_result(
                    "Verify Field Names and Values",
                    False,
                    "Cannot verify field names - 'My SMS' agent not found",
                    {}
                )
                return False, {}
            
            # Expected SMS agent fields
            expected_fields = {
                "sms_link": "SMS Link URL",
                "recipient_type": "Recipient Type (all customers, specific group, etc.)",
                "customer_name": "Customer Name field",
                "sms_template": "SMS Template content",
                "agent_type": "Should be 'sms_agent'",
                "mode": "Agent mode (adhoc, recurring, write, etc.)",
                "agent_name": "Agent display name"
            }
            
            field_verification = {}
            
            for field_name, description in expected_fields.items():
                field_verification[field_name] = {
                    "expected": description,
                    "present": field_name in my_sms_agent,
                    "value": my_sms_agent.get(field_name),
                    "value_type": type(my_sms_agent.get(field_name)).__name__ if field_name in my_sms_agent else None
                }
            
            # Check for any fields that might be causing the Social Media Platforms display
            problematic_fields = {}
            social_media_indicators = ["topic", "platforms", "social", "facebook", "instagram", "twitter"]
            
            for field_name, field_value in my_sms_agent.items():
                if any(indicator in field_name.lower() for indicator in social_media_indicators):
                    problematic_fields[field_name] = field_value
            
            # Determine what might be causing the display issue
            display_issue_analysis = {
                "agent_type_correct": my_sms_agent.get('agent_type') == 'sms_agent',
                "mode_value": my_sms_agent.get('mode'),
                "has_sms_specific_fields": any(field in my_sms_agent for field in ['sms_link', 'sms_template']),
                "has_social_media_fields": len(problematic_fields) > 0,
                "problematic_fields": problematic_fields
            }
            
            success = True
            
            self.log_test_result(
                "Verify Field Names and Values",
                success,
                f"Verified field structure for 'My SMS' agent - agent_type: {my_sms_agent.get('agent_type')}, mode: {my_sms_agent.get('mode')}",
                {
                    "Field Verification": field_verification,
                    "Display Issue Analysis": display_issue_analysis,
                    "All Agent Fields": list(my_sms_agent.keys()),
                    "Full Agent Data": my_sms_agent
                }
            )
            return success, field_verification
            
        except Exception as e:
            self.log_test_result(
                "Verify Field Names and Values",
                False,
                f"Error verifying field names and values: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def diagnose_display_issue(self, my_sms_agent, display_logic_analysis, field_verification):
        """Investigation 6: Diagnose Display Issue"""
        print("🔍 INVESTIGATION 6: Diagnose Display Issue")
        print("=" * 60)
        
        try:
            if not my_sms_agent:
                self.log_test_result(
                    "Diagnose Display Issue",
                    False,
                    "Cannot diagnose display issue - 'My SMS' agent not found",
                    {}
                )
                return False, {}
            
            diagnosis = {
                "agent_data": {
                    "agent_type": my_sms_agent.get('agent_type'),
                    "mode": my_sms_agent.get('mode'),
                    "agent_name": my_sms_agent.get('agent_name')
                },
                "potential_causes": [],
                "frontend_logic_issues": [],
                "recommended_fixes": []
            }
            
            # Check potential causes
            
            # 1. Check if agent_type is correct
            if my_sms_agent.get('agent_type') != 'sms_agent':
                diagnosis["potential_causes"].append({
                    "issue": "Incorrect agent_type",
                    "current_value": my_sms_agent.get('agent_type'),
                    "expected_value": "sms_agent",
                    "severity": "HIGH"
                })
                diagnosis["recommended_fixes"].append("Update agent_type to 'sms_agent' in database")
            
            # 2. Check mode value
            mode = my_sms_agent.get('mode')
            if mode not in ['adhoc', 'recurring', 'write']:
                diagnosis["potential_causes"].append({
                    "issue": "Unexpected mode value",
                    "current_value": mode,
                    "expected_values": ["adhoc", "recurring", "write"],
                    "severity": "MEDIUM"
                })
            
            # 3. Check for social media fields that might confuse the display logic
            social_media_fields = ["topic", "platforms", "social_media_platforms"]
            for field in social_media_fields:
                if field in my_sms_agent:
                    diagnosis["potential_causes"].append({
                        "issue": f"Has social media field: {field}",
                        "current_value": my_sms_agent.get(field),
                        "severity": "MEDIUM"
                    })
                    diagnosis["recommended_fixes"].append(f"Remove or rename field '{field}' to avoid confusion with social media agents")
            
            # 4. Check frontend display logic issues
            social_media_refs = display_logic_analysis.get("social_media_references", [])
            for ref in social_media_refs:
                # Analyze the context to see if it's missing SMS agent handling
                context_text = " ".join(ref.get("context", []))
                if "sms_agent" not in context_text.lower() and "sms" not in context_text.lower():
                    diagnosis["frontend_logic_issues"].append({
                        "file": ref["file"],
                        "line": ref["line_number"],
                        "issue": "Social Media Platforms display logic missing SMS agent handling",
                        "context": ref["context"]
                    })
                    diagnosis["recommended_fixes"].append(f"Add SMS agent handling in {ref['file']} around line {ref['line_number']}")
            
            # 5. Check if SMS-specific display sections exist
            sms_display_logic = display_logic_analysis.get("sms_display_logic", [])
            if len(sms_display_logic) == 0:
                diagnosis["potential_causes"].append({
                    "issue": "No SMS-specific display logic found in frontend",
                    "severity": "HIGH"
                })
                diagnosis["recommended_fixes"].append("Add SMS agent display logic to dashboard components")
            
            # 6. Check agent_type conditions in frontend
            agent_type_conditions = display_logic_analysis.get("agent_type_conditions", [])
            sms_agent_conditions = [cond for cond in agent_type_conditions if "sms" in cond["line_content"].lower()]
            if len(sms_agent_conditions) == 0:
                diagnosis["potential_causes"].append({
                    "issue": "No agent_type conditions for SMS agents found in frontend",
                    "severity": "HIGH"
                })
                diagnosis["recommended_fixes"].append("Add agent_type === 'sms_agent' conditions in dashboard display logic")
            
            success = True
            
            self.log_test_result(
                "Diagnose Display Issue",
                success,
                f"Identified {len(diagnosis['potential_causes'])} potential causes and {len(diagnosis['recommended_fixes'])} recommended fixes",
                {
                    "Diagnosis": diagnosis,
                    "Root Cause Summary": f"Agent type: {my_sms_agent.get('agent_type')}, Mode: {my_sms_agent.get('mode')}, Frontend SMS logic: {'Present' if len(sms_display_logic) > 0 else 'Missing'}"
                }
            )
            return success, diagnosis
            
        except Exception as e:
            self.log_test_result(
                "Diagnose Display Issue",
                False,
                f"Error diagnosing display issue: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def run_sms_agent_debug(self):
        """Run comprehensive SMS agent debug investigation"""
        print("🔍 STARTING SMS AGENT DASHBOARD DISPLAY DEBUG")
        print("=" * 80)
        print("Investigating why 'My SMS' agent shows Social Media Platforms instead of SMS-specific fields")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all investigations
            investigation_results = []
            
            # Investigation 1: Find "My SMS" agent
            success1, sms_agents, my_sms_agent = await self.find_my_sms_agent()
            investigation_results.append(success1)
            
            # Investigation 2: Analyze SMS agent structure
            success2, analysis = await self.analyze_sms_agent_structure(sms_agents, my_sms_agent)
            investigation_results.append(success2)
            
            # Investigation 3: Check dashboard display logic
            success3, display_logic_analysis = await self.check_dashboard_display_logic()
            investigation_results.append(success3)
            
            # Investigation 4: Test agent API response
            success4, api_response = await self.test_agent_api_response(my_sms_agent)
            investigation_results.append(success4)
            
            # Investigation 5: Verify field names and values
            success5, field_verification = await self.verify_field_names_and_values(my_sms_agent, analysis)
            investigation_results.append(success5)
            
            # Investigation 6: Diagnose display issue
            success6, diagnosis = await self.diagnose_display_issue(my_sms_agent, display_logic_analysis, field_verification)
            investigation_results.append(success6)
            
            # Summary
            print("=" * 80)
            print("🎯 SMS AGENT DEBUG SUMMARY")
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
            
            if my_sms_agent:
                print(f"✅ FOUND 'MY SMS' AGENT:")
                print(f"   Agent Name: {my_sms_agent.get('agent_name')}")
                print(f"   Agent Type: {my_sms_agent.get('agent_type')}")
                print(f"   Mode: {my_sms_agent.get('mode')}")
                print(f"   Has SMS Link: {'sms_link' in my_sms_agent}")
                print(f"   SMS Link Value: {my_sms_agent.get('sms_link')}")
                print(f"   All Fields: {list(my_sms_agent.keys())}")
            else:
                print("❌ 'MY SMS' AGENT NOT FOUND")
            
            if display_logic_analysis:
                social_media_refs = display_logic_analysis.get("social_media_references", [])
                sms_logic = display_logic_analysis.get("sms_display_logic", [])
                print(f"📱 FRONTEND DISPLAY LOGIC:")
                print(f"   Social Media Platform references: {len(social_media_refs)}")
                print(f"   SMS display logic found: {len(sms_logic)}")
                
                if social_media_refs:
                    print(f"   Files with 'Social Media Platforms': {[ref['file'].split('/')[-1] for ref in social_media_refs]}")
            
            print()
            print("🎯 ROOT CAUSE ANALYSIS:")
            print("=" * 40)
            
            if not my_sms_agent:
                print("❌ CRITICAL: 'My SMS' agent not found in database")
                print("   - Agent may have been deleted or renamed")
                print("   - Check if agent exists with different name")
            elif my_sms_agent.get('agent_type') != 'sms_agent':
                print(f"❌ CRITICAL: Agent type is '{my_sms_agent.get('agent_type')}' instead of 'sms_agent'")
                print("   - This would cause it to be treated as social media agent")
                print("   - Update agent_type to 'sms_agent' in database")
            elif diagnosis and len(diagnosis.get("frontend_logic_issues", [])) > 0:
                print("❌ FRONTEND ISSUE: Dashboard missing SMS agent display logic")
                print("   - Social Media Platforms section doesn't handle SMS agents")
                print("   - Need to add SMS agent conditions to frontend display logic")
                for issue in diagnosis["frontend_logic_issues"]:
                    print(f"   - File: {issue['file'].split('/')[-1]}, Line: {issue['line']}")
            else:
                print("✅ AGENT DATA LOOKS CORRECT - ISSUE LIKELY IN FRONTEND LOGIC")
                print("   - Agent type and mode are correct")
                print("   - SMS-specific fields are present")
                print("   - Frontend display logic needs investigation")
            
            print()
            print("🔧 RECOMMENDED FIXES:")
            print("=" * 40)
            
            if diagnosis and diagnosis.get("recommended_fixes"):
                for i, fix in enumerate(diagnosis["recommended_fixes"], 1):
                    print(f"{i}. {fix}")
            else:
                print("1. Verify 'My SMS' agent exists in database with agent_type='sms_agent'")
                print("2. Check frontend dashboard components for SMS agent display logic")
                print("3. Add SMS agent handling to Social Media Platforms display section")
                print("4. Ensure SMS agent shows SMS Recipients and Link fields instead of Social Media Platforms")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during SMS agent debug: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main debug function"""
    debugger = SMSAgentDebugger()
    await debugger.run_sms_agent_debug()

if __name__ == "__main__":
    asyncio.run(main())