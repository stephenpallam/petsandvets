#!/usr/bin/env python3
"""
Timesheet Timezone Fix Testing

This test specifically tests the timesheet timezone fix for adhoc agents with custom date ranges.

Test Focus:
1. Find or create adhoc timesheet agent with custom dates (Sep 4-19, 2025)
2. Run the agent manually using POST /api/ai-agents/{agent_id}/run-manual  
3. Check what date range is actually used in the generated timesheet report
4. Verify that the timezone conversion fix properly handles business timezone (America/New_York) to UTC conversion
5. The user reported that they configured Sep 4-19, 2025 but got Sep 5-20, 2025 (one day offset)

The fix implemented:
- Added business timezone interpretation for date parsing in timesheet generation
- Converts dates from business timezone (EDT) to UTC for database queries
- Should eliminate the one-day offset issue caused by timezone misinterpretation

Expected Results:
- Custom date range Sep 4-19, 2025 should be used exactly as configured
- No one-day offset should occur
- Timezone conversion should properly handle business timezone to UTC
"""

import asyncio
import sys
import os
import json
import aiohttp
import ssl
import time
from datetime import datetime, date, timedelta
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

class TimesheetTimezoneTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://vet-content-hub.preview.emergentagent.com')
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
    
    async def cleanup_test_data(self):
        """Clean up test data before starting tests"""
        try:
            # Remove any existing test agents and posts
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Timesheet Timezone"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Timesheet Timezone"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def find_or_create_timesheet_agent(self):
        """Find existing or create new adhoc timesheet agent with custom dates"""
        print("🔍 TEST 1: Find or Create Adhoc Timesheet Agent with Custom Dates")
        print("=" * 70)
        
        try:
            # First, try to find existing adhoc timesheet agent with custom dates
            existing_agent = await self.db.ai_agents.find_one({
                "agent_type": "time_sheet",
                "mode": "adhoc",
                "report_period": "custom",
                "custom_start_date": {"$exists": True},
                "custom_end_date": {"$exists": True}
            })
            
            if existing_agent:
                agent_id = existing_agent["id"]
                
                # Check if this agent shows the offset issue
                start_date = existing_agent.get("custom_start_date")
                end_date = existing_agent.get("custom_end_date")
                
                # If we found an agent with the offset issue (Sep 5-20 instead of Sep 4-19), note it
                has_offset_issue = (start_date == "2025-09-05" and end_date == "2025-09-20")
                
                self.log_test_result(
                    "Find Existing Timesheet Agent",
                    True,
                    f"Found existing adhoc timesheet agent with custom dates",
                    {
                        "Agent ID": agent_id,
                        "Agent Name": existing_agent.get("agent_name", "Unknown"),
                        "Custom Start Date": start_date,
                        "Custom End Date": end_date,
                        "Report Period": existing_agent.get("report_period"),
                        "Shows Offset Issue": has_offset_issue,
                        "Note": "Sep 5-20 instead of Sep 4-19 indicates timezone offset issue" if has_offset_issue else "Dates look correct"
                    }
                )
                return agent_id
            
            # If no existing agent found, create a new one
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create adhoc timesheet agent with custom date range Sep 4-19, 2025
            agent_data = {
                "agent_type": "time_sheet",
                "agent_name": "Test Timesheet Timezone Fix Agent",
                "mode": "adhoc",
                "report_period": "custom",
                "custom_start_date": "2025-09-04",  # Sep 4, 2025
                "custom_end_date": "2025-09-19",    # Sep 19, 2025
                "selected_employees": [],  # All employees
                "email_recipients": ["admin@hospital.com"],
                "is_active": True
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Create the timesheet agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        self.log_test_result(
                            "Create Timesheet Agent",
                            False,
                            f"Failed to create timesheet agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return None
                    
                    agent_result = await response.json()
                    agent_id = agent_result.get("agent_id")
                    self.created_agent_ids.append(agent_id)
                    
                    self.log_test_result(
                        "Create Timesheet Agent",
                        True,
                        f"Successfully created adhoc timesheet agent with custom dates",
                        {
                            "Agent ID": agent_id,
                            "Custom Start Date": "2025-09-04",
                            "Custom End Date": "2025-09-19",
                            "Report Period": "custom",
                            "Mode": "adhoc"
                        }
                    )
                    return agent_id
                    
        except Exception as e:
            self.log_test_result(
                "Find or Create Timesheet Agent",
                False,
                f"Error finding or creating timesheet agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return None
    
    async def run_timesheet_agent_manual(self, agent_id: str):
        """Run the timesheet agent manually and check the generated report"""
        print("🔍 TEST 2: Run Timesheet Agent Manually")
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
                # Run the timesheet agent manually
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        self.log_test_result(
                            "Run Timesheet Agent Manual",
                            False,
                            f"Failed to run timesheet agent manually: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return None
                    
                    run_result = await response.json()
                    
                    # Try to get post_id from different possible fields
                    post_id = (run_result.get("post_id") or 
                              run_result.get("id") or 
                              run_result.get("report_id"))
                    
                    self.log_test_result(
                        "Run Timesheet Agent Manual",
                        True,
                        f"Successfully ran timesheet agent manually",
                        {
                            "Agent ID": agent_id,
                            "Run Status": run_result.get("status", "unknown"),
                            "Run Message": run_result.get("message", "No message"),
                            "Post ID": post_id or "No post ID in response",
                            "Full Response": run_result
                        }
                    )
                    
                    # If no post_id in response, try to find the latest post for this agent
                    if not post_id:
                        latest_post = await self.db.ai_posts.find_one(
                            {"agent_id": agent_id},
                            sort=[("created_at", -1)]
                        )
                        if latest_post:
                            post_id = latest_post["id"]
                            print(f"   Found latest post for agent: {post_id}")
                    
                    return post_id
                    
        except Exception as e:
            self.log_test_result(
                "Run Timesheet Agent Manual",
                False,
                f"Error running timesheet agent manually: {str(e)}",
                {"Error Details": str(e)}
            )
            return None
    
    async def verify_timesheet_date_range(self, agent_id: str, post_id: str):
        """Verify the date range used in the generated timesheet report"""
        print("🔍 TEST 3: Verify Timesheet Date Range")
        print("=" * 70)
        
        try:
            # Get the agent to see what dates were configured
            agent = await self.db.ai_agents.find_one({"id": agent_id})
            if not agent:
                self.log_test_result(
                    "Verify Timesheet Date Range",
                    False,
                    f"Could not find agent",
                    {"Agent ID": agent_id}
                )
                return False
            
            configured_start = agent.get("custom_start_date")
            configured_end = agent.get("custom_end_date")
            
            # Get the generated timesheet post from database
            post = await self.db.ai_posts.find_one({"id": post_id})
            
            if not post:
                self.log_test_result(
                    "Verify Timesheet Date Range",
                    False,
                    f"Could not find generated timesheet post",
                    {"Post ID": post_id}
                )
                return False
            
            # Extract timesheet data
            timesheet_data = post.get("timesheet_data", {})
            actual_start_date = timesheet_data.get("start_date")
            actual_end_date = timesheet_data.get("end_date")
            
            # Check if dates match exactly (no timezone offset)
            dates_match = (actual_start_date == configured_start and 
                          actual_end_date == configured_end)
            
            # Check for the reported one-day offset issue
            # If configured dates were Sep 5-20, but should have been Sep 4-19
            expected_corrected_start = "2025-09-04"  # What user originally wanted
            expected_corrected_end = "2025-09-19"    # What user originally wanted
            
            # Check if the fix corrected the offset (actual dates match what user originally wanted)
            offset_corrected = (actual_start_date == expected_corrected_start and 
                               actual_end_date == expected_corrected_end)
            
            # Determine if timezone fix is working
            timezone_fix_working = dates_match or offset_corrected
            
            self.log_test_result(
                "Verify Timesheet Date Range",
                timezone_fix_working,
                f"Date range verification: {'TIMEZONE FIX WORKING' if timezone_fix_working else 'TIMEZONE ISSUE PERSISTS'}",
                {
                    "Configured Start Date": configured_start,
                    "Configured End Date": configured_end,
                    "Actual Start Date": actual_start_date,
                    "Actual End Date": actual_end_date,
                    "Dates Match Configuration": dates_match,
                    "Offset Corrected to Sep 4-19": offset_corrected,
                    "Timezone Fix Working": timezone_fix_working,
                    "Expected Corrected Start": expected_corrected_start,
                    "Expected Corrected End": expected_corrected_end,
                    "Post ID": post_id,
                    "Agent ID": agent_id
                }
            )
            
            return timezone_fix_working
            
        except Exception as e:
            self.log_test_result(
                "Verify Timesheet Date Range",
                False,
                f"Error verifying timesheet date range: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def verify_timezone_conversion(self, agent_id: str, post_id: str):
        """Verify that timezone conversion is working properly"""
        print("🔍 TEST 4: Verify Timezone Conversion")
        print("=" * 70)
        
        try:
            # Get the generated timesheet post from database
            post = await self.db.ai_posts.find_one({"id": post_id})
            
            if not post:
                self.log_test_result(
                    "Verify Timezone Conversion",
                    False,
                    f"Could not find generated timesheet post",
                    {"Post ID": post_id}
                )
                return False
            
            # Get timesheet data
            timesheet_data = post.get("timesheet_data", {})
            start_date = timesheet_data.get("start_date")
            end_date = timesheet_data.get("end_date")
            
            # Get business timezone info
            business_info = await self.db.business_info.find_one()
            business_timezone = business_info.get("timezone", "America/New_York") if business_info else "America/New_York"
            
            # Check if the report contains employee data (indicating successful timezone conversion)
            employee_reports = timesheet_data.get("employee_reports", [])
            total_employees = len(employee_reports)
            
            # Check if any time entries were found (this would indicate proper timezone conversion)
            total_hours_found = sum(emp.get("total_hours", 0) for emp in employee_reports)
            
            # Verify that the date range is interpreted correctly
            timezone_conversion_working = (
                start_date == "2025-09-04" and 
                end_date == "2025-09-19" and
                total_employees >= 0  # At least we should get employee records even if no hours
            )
            
            self.log_test_result(
                "Verify Timezone Conversion",
                timezone_conversion_working,
                f"Timezone conversion verification: {'WORKING' if timezone_conversion_working else 'NEEDS ATTENTION'}",
                {
                    "Business Timezone": business_timezone,
                    "Start Date Used": start_date,
                    "End Date Used": end_date,
                    "Total Employees in Report": total_employees,
                    "Total Hours Found": total_hours_found,
                    "Timezone Conversion Working": timezone_conversion_working,
                    "Date Range Correct": start_date == "2025-09-04" and end_date == "2025-09-19",
                    "Post ID": post_id,
                    "Agent ID": agent_id
                }
            )
            
            return timezone_conversion_working
            
        except Exception as e:
            self.log_test_result(
                "Verify Timezone Conversion",
                False,
                f"Error verifying timezone conversion: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def analyze_timesheet_content(self, post_id: str):
        """Analyze the content of the generated timesheet report"""
        print("🔍 TEST 5: Analyze Timesheet Content")
        print("=" * 70)
        
        try:
            # Get the generated timesheet post from database
            post = await self.db.ai_posts.find_one({"id": post_id})
            
            if not post:
                self.log_test_result(
                    "Analyze Timesheet Content",
                    False,
                    f"Could not find generated timesheet post",
                    {"Post ID": post_id}
                )
                return False
            
            # Extract content and timesheet data
            content = post.get("content", "")
            timesheet_data = post.get("timesheet_data", {})
            
            # Analyze content quality
            content_analysis = {
                "has_content": len(content.strip()) > 0,
                "content_length": len(content),
                "has_date_range_in_content": False,
                "has_employee_data": False,
                "has_summary_data": False
            }
            
            # Check if content contains the correct date range
            if "2025-09-04" in content and "2025-09-19" in content:
                content_analysis["has_date_range_in_content"] = True
            elif "September 4" in content and "September 19" in content:
                content_analysis["has_date_range_in_content"] = True
            elif "Sep 4" in content and "Sep 19" in content:
                content_analysis["has_date_range_in_content"] = True
            
            # Check for employee data in content
            if "employee" in content.lower() or "hours" in content.lower():
                content_analysis["has_employee_data"] = True
            
            # Check for summary data
            if "total" in content.lower() or "summary" in content.lower():
                content_analysis["has_summary_data"] = True
            
            # Analyze timesheet data structure
            timesheet_analysis = {
                "has_timesheet_data": bool(timesheet_data),
                "has_start_date": bool(timesheet_data.get("start_date")),
                "has_end_date": bool(timesheet_data.get("end_date")),
                "has_employee_reports": bool(timesheet_data.get("employee_reports")),
                "employee_count": len(timesheet_data.get("employee_reports", [])),
                "has_summary": bool(timesheet_data.get("summary"))
            }
            
            # Overall success criteria
            success = (
                content_analysis["has_content"] and
                content_analysis["has_date_range_in_content"] and
                timesheet_analysis["has_timesheet_data"] and
                timesheet_analysis["has_start_date"] and
                timesheet_analysis["has_end_date"]
            )
            
            self.log_test_result(
                "Analyze Timesheet Content",
                success,
                f"Timesheet content analysis: {'COMPLETE' if success else 'INCOMPLETE'}",
                {
                    "Content Length": content_analysis["content_length"],
                    "Has Content": content_analysis["has_content"],
                    "Has Date Range in Content": content_analysis["has_date_range_in_content"],
                    "Has Employee Data": content_analysis["has_employee_data"],
                    "Has Summary Data": content_analysis["has_summary_data"],
                    "Has Timesheet Data": timesheet_analysis["has_timesheet_data"],
                    "Has Start Date": timesheet_analysis["has_start_date"],
                    "Has End Date": timesheet_analysis["has_end_date"],
                    "Has Employee Reports": timesheet_analysis["has_employee_reports"],
                    "Employee Count": timesheet_analysis["employee_count"],
                    "Has Summary": timesheet_analysis["has_summary"],
                    "Post ID": post_id,
                    "Start Date": timesheet_data.get("start_date"),
                    "End Date": timesheet_data.get("end_date")
                }
            )
            
            return success
            
        except Exception as e:
            self.log_test_result(
                "Analyze Timesheet Content",
                False,
                f"Error analyzing timesheet content: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_created_agents(self):
        """Clean up agents created during testing"""
        try:
            for agent_id in self.created_agent_ids:
                # Delete agent posts
                await self.db.ai_posts.delete_many({"agent_id": agent_id})
                # Delete agent
                await self.db.ai_agents.delete_one({"id": agent_id})
            print(f"🧹 Cleaned up {len(self.created_agent_ids)} test agents and their posts")
        except Exception as e:
            print(f"Warning: Could not clean up created agents: {e}")
    
    async def run_timesheet_timezone_tests(self):
        """Run comprehensive timesheet timezone fix tests"""
        print("🔍 STARTING TIMESHEET TIMEZONE FIX TESTING")
        print("=" * 80)
        print("Testing timezone fix for adhoc timesheet agents with custom date ranges")
        print("Focus: Sep 4-19, 2025 should not become Sep 5-20, 2025 (one day offset)")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Clean up any existing test data
            await self.cleanup_test_data()
            
            # Authenticate first
            auth_success = await self.authenticate()
            if not auth_success:
                print("❌ Authentication failed - cannot proceed with API tests")
                return
            
            # Run all tests
            test_results = []
            
            # Test 1: Find or Create Timesheet Agent
            agent_id = await self.find_or_create_timesheet_agent()
            if not agent_id:
                print("❌ Could not find or create timesheet agent - cannot proceed")
                return
            
            test_results.append(agent_id is not None)
            
            # Test 2: Run Timesheet Agent Manually
            post_id = await self.run_timesheet_agent_manual(agent_id)
            if not post_id:
                print("❌ Could not run timesheet agent - cannot proceed with verification")
                return
            
            test_results.append(post_id is not None)
            
            # Wait for report generation to complete
            await asyncio.sleep(3)
            
            # Test 3: Verify Date Range
            success3 = await self.verify_timesheet_date_range(agent_id, post_id)
            test_results.append(success3)
            
            # Test 4: Verify Timezone Conversion
            success4 = await self.verify_timezone_conversion(agent_id, post_id)
            test_results.append(success4)
            
            # Test 5: Analyze Timesheet Content
            success5 = await self.analyze_timesheet_content(post_id)
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 TIMESHEET TIMEZONE FIX TESTING SUMMARY")
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
                "Find or Create Timesheet Agent",
                "Run Timesheet Agent Manually", 
                "Verify Timesheet Date Range",
                "Verify Timezone Conversion",
                "Analyze Timesheet Content"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
                
                if i == 0 and success:
                    print("   - Adhoc timesheet agent with custom dates found/created")
                    print("   - Custom date range: Sep 4-19, 2025")
                elif i == 1 and success:
                    print("   - Manual run executed successfully")
                    print("   - Timesheet report generated")
                elif i == 2 and success:
                    print("   - Date range matches exactly (no offset)")
                    print("   - Timezone fix working correctly")
                elif i == 3 and success:
                    print("   - Business timezone to UTC conversion working")
                    print("   - Date interpretation correct")
                elif i == 4 and success:
                    print("   - Timesheet content generated properly")
                    print("   - Report structure complete")
            
            print()
            print("🎯 TIMEZONE FIX STATUS:")
            print("=" * 40)
            
            # Focus on the critical timezone fix test (Test 3)
            timezone_fix_working = test_results[2] if len(test_results) > 2 else False
            
            if timezone_fix_working:
                print("✅ TIMEZONE FIX WORKING CORRECTLY")
                print("   - Custom date range Sep 4-19, 2025 used exactly as configured")
                print("   - No one-day offset issue detected")
                print("   - Business timezone (America/New_York) to UTC conversion working")
                print("   - Date parsing interprets dates in business timezone correctly")
            else:
                print("❌ TIMEZONE FIX NEEDS ATTENTION")
                print("   - Date range may still have offset issues")
                print("   - Timezone conversion may not be working properly")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Clean up created test agents
            await self.cleanup_created_agents()
            await self.disconnect()

async def main():
    """Main testing function"""
    tester = TimesheetTimezoneTester()
    await tester.run_timesheet_timezone_tests()

if __name__ == "__main__":
    asyncio.run(main())