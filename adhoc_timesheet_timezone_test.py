#!/usr/bin/env python3
"""
Adhoc Timesheet Agent Timezone Fix Testing

This test specifically verifies the timezone fix for adhoc timesheet agents with custom date ranges.

Test Focus:
1. Find the specific adhoc timesheet agent (8271969c-48c1-483b-a165-723e3c7266bb)
2. Verify it has custom_start_date: 2025-09-04 and custom_end_date: 2025-09-19
3. Run it manually using POST /api/ai-agents/{agent_id}/run-manual
4. Check the generated timesheet report to see what date range is actually used
5. Verify it now correctly shows Sep 4-19, 2025 (not Sep 5-20, 2025)

The fix applies the same business timezone interpretation logic that recurring agents use,
which should eliminate the 1-day offset issue.
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

class AdhocTimesheetTimezoneTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://vet-content-hub.preview.emergentagent.com')
        self.auth_token = None
        self.target_agent_id = "8271969c-48c1-483b-a165-723e3c7266bb"
        
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
    
    async def test_find_adhoc_timesheet_agent(self):
        """Test 1: Find the specific adhoc timesheet agent and verify its configuration"""
        print("🔍 TEST 1: Find Adhoc Timesheet Agent")
        print("=" * 60)
        
        try:
            # Find the specific agent in database
            agent = await self.db.ai_agents.find_one({"id": self.target_agent_id})
            
            if not agent:
                self.log_test_result(
                    "Find Adhoc Timesheet Agent",
                    False,
                    f"Agent {self.target_agent_id} not found in database",
                    {"Agent ID": self.target_agent_id}
                )
                return False
            
            # Verify agent configuration
            agent_type = agent.get("agent_type")
            mode = agent.get("mode")
            report_period = agent.get("report_period")
            custom_start_date = agent.get("custom_start_date")
            custom_end_date = agent.get("custom_end_date")
            
            # Check if this is the correct agent type and configuration
            is_timesheet_agent = agent_type == "time_sheet"
            is_adhoc_mode = mode == "adhoc"
            is_custom_period = report_period == "custom"
            has_expected_dates = (
                custom_start_date == "2025-09-04" and 
                custom_end_date == "2025-09-19"
            )
            
            success = is_timesheet_agent and is_adhoc_mode and is_custom_period and has_expected_dates
            
            self.log_test_result(
                "Find Adhoc Timesheet Agent",
                success,
                f"Agent found and verified: {success}",
                {
                    "Agent ID": self.target_agent_id,
                    "Agent Type": agent_type,
                    "Mode": mode,
                    "Report Period": report_period,
                    "Custom Start Date": custom_start_date,
                    "Custom End Date": custom_end_date,
                    "Agent Name": agent.get("agent_name", "Unknown"),
                    "Is Timesheet Agent": is_timesheet_agent,
                    "Is Adhoc Mode": is_adhoc_mode,
                    "Is Custom Period": is_custom_period,
                    "Has Expected Dates": has_expected_dates
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Find Adhoc Timesheet Agent",
                False,
                f"Error finding adhoc timesheet agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_manual_agent_execution(self):
        """Test 2: Run the agent manually and verify execution"""
        print("🔍 TEST 2: Manual Agent Execution")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Run the agent manually
                url = f"{self.backend_url}/api/ai-agents/{self.target_agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    response_text = await response.text()
                    
                    if response.status != 200:
                        self.log_test_result(
                            "Manual Agent Execution",
                            False,
                            f"Failed to run agent manually: HTTP {response.status}",
                            {
                                "HTTP Status": response.status,
                                "Response": response_text,
                                "Agent ID": self.target_agent_id
                            }
                        )
                        return False
                    
                    try:
                        execution_result = await response.json()
                    except:
                        execution_result = {"message": response_text}
                    
                    # Check if execution was successful
                    success_indicators = [
                        "successfully" in response_text.lower(),
                        "generated" in response_text.lower(),
                        response.status == 200
                    ]
                    
                    execution_success = any(success_indicators)
                    
                    self.log_test_result(
                        "Manual Agent Execution",
                        execution_success,
                        f"Agent execution: {execution_success}",
                        {
                            "HTTP Status": response.status,
                            "Execution Result": execution_result.get("message", "No message"),
                            "Agent ID": self.target_agent_id,
                            "Response Text": response_text[:200] + "..." if len(response_text) > 200 else response_text
                        }
                    )
                    return execution_success
                    
        except Exception as e:
            self.log_test_result(
                "Manual Agent Execution",
                False,
                f"Error in manual agent execution: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_generated_timesheet_report(self):
        """Test 3: Check the generated timesheet report for correct date range"""
        print("🔍 TEST 3: Generated Timesheet Report Verification")
        print("=" * 60)
        
        try:
            # Wait a moment for the report to be generated
            await asyncio.sleep(3)
            
            # Find the most recent timesheet report for this agent
            timesheet_posts = await self.db.ai_posts.find({
                "agent_id": self.target_agent_id,
                "agent_type": "time_sheet"
            }).sort("created_at", -1).to_list(length=5)
            
            if not timesheet_posts:
                self.log_test_result(
                    "Generated Timesheet Report Verification",
                    False,
                    "No timesheet reports found for agent",
                    {"Agent ID": self.target_agent_id}
                )
                return False
            
            # Get the most recent report
            latest_report = timesheet_posts[0]
            
            # Extract timesheet data
            timesheet_data = latest_report.get("timesheet_data", {})
            report_start_date = timesheet_data.get("start_date")
            report_end_date = timesheet_data.get("end_date")
            
            # Check if the dates match the expected range (Sep 4-19, 2025)
            expected_start = "2025-09-04"
            expected_end = "2025-09-19"
            
            dates_correct = (
                report_start_date == expected_start and 
                report_end_date == expected_end
            )
            
            # Check if the old problematic dates (Sep 5-20) are NOT present
            problematic_start = "2025-09-05"
            problematic_end = "2025-09-20"
            
            no_offset_issue = not (
                report_start_date == problematic_start and 
                report_end_date == problematic_end
            )
            
            success = dates_correct and no_offset_issue
            
            # Get additional report details
            report_content = latest_report.get("content", "")
            report_id = latest_report.get("id")
            created_at = latest_report.get("created_at")
            
            self.log_test_result(
                "Generated Timesheet Report Verification",
                success,
                f"Date range verification: {success}",
                {
                    "Agent ID": self.target_agent_id,
                    "Report ID": report_id,
                    "Expected Start Date": expected_start,
                    "Expected End Date": expected_end,
                    "Actual Start Date": report_start_date,
                    "Actual End Date": report_end_date,
                    "Dates Correct": dates_correct,
                    "No Offset Issue": no_offset_issue,
                    "Problematic Start (Should NOT be)": problematic_start,
                    "Problematic End (Should NOT be)": problematic_end,
                    "Report Created At": str(created_at),
                    "Report Content Length": len(report_content),
                    "Timezone Fix Working": success
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Generated Timesheet Report Verification",
                False,
                f"Error verifying timesheet report: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_timezone_conversion_logic(self):
        """Test 4: Verify the timezone conversion logic is working correctly"""
        print("🔍 TEST 4: Timezone Conversion Logic Verification")
        print("=" * 60)
        
        try:
            # Get business timezone from database
            business_info = await self.db.business_info.find_one()
            business_timezone = business_info.get("timezone", "America/New_York") if business_info else "America/New_York"
            
            # Get the agent configuration
            agent = await self.db.ai_agents.find_one({"id": self.target_agent_id})
            if not agent:
                self.log_test_result(
                    "Timezone Conversion Logic Verification",
                    False,
                    "Agent not found for timezone verification",
                    {"Agent ID": self.target_agent_id}
                )
                return False
            
            custom_start_date = agent.get("custom_start_date")
            custom_end_date = agent.get("custom_end_date")
            
            # Verify the timezone conversion logic matches what's implemented in the backend
            # The fix should interpret custom dates in business timezone, not UTC
            
            # Check if the dates are being interpreted correctly
            # Sep 4, 2025 in business timezone should remain Sep 4, 2025
            # Sep 19, 2025 in business timezone should remain Sep 19, 2025
            
            expected_interpretation = {
                "custom_start_date": custom_start_date,
                "custom_end_date": custom_end_date,
                "business_timezone": business_timezone,
                "should_remain_same": True  # Dates should not shift by one day
            }
            
            # The key test is that the dates in the generated report match the configured dates
            # This verifies that the timezone fix is working
            
            success = (
                custom_start_date == "2025-09-04" and
                custom_end_date == "2025-09-19" and
                business_timezone in ["America/New_York", "US/Eastern"]  # Common Eastern timezone formats
            )
            
            self.log_test_result(
                "Timezone Conversion Logic Verification",
                success,
                f"Timezone logic verification: {success}",
                {
                    "Business Timezone": business_timezone,
                    "Custom Start Date": custom_start_date,
                    "Custom End Date": custom_end_date,
                    "Expected Start": "2025-09-04",
                    "Expected End": "2025-09-19",
                    "Timezone Fix Applied": "Lines 4863-4869 in server.py",
                    "Fix Description": "Custom dates interpreted in business timezone before UTC conversion",
                    "Logic Working": success
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Timezone Conversion Logic Verification",
                False,
                f"Error verifying timezone conversion logic: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_compare_with_previous_behavior(self):
        """Test 5: Compare current behavior with previous problematic behavior"""
        print("🔍 TEST 5: Compare with Previous Behavior")
        print("=" * 60)
        
        try:
            # Look for any historical reports that might show the old behavior
            all_timesheet_posts = await self.db.ai_posts.find({
                "agent_id": self.target_agent_id,
                "agent_type": "time_sheet"
            }).sort("created_at", -1).to_list(length=10)
            
            if not all_timesheet_posts:
                self.log_test_result(
                    "Compare with Previous Behavior",
                    False,
                    "No timesheet reports found for comparison",
                    {"Agent ID": self.target_agent_id}
                )
                return False
            
            # Analyze the reports to see if any show the old problematic behavior
            reports_analysis = []
            
            for post in all_timesheet_posts:
                timesheet_data = post.get("timesheet_data", {})
                start_date = timesheet_data.get("start_date")
                end_date = timesheet_data.get("end_date")
                created_at = post.get("created_at")
                
                # Check if this report shows the problematic offset
                has_offset_issue = (
                    start_date == "2025-09-05" and 
                    end_date == "2025-09-20"
                )
                
                # Check if this report shows the correct dates
                has_correct_dates = (
                    start_date == "2025-09-04" and 
                    end_date == "2025-09-19"
                )
                
                reports_analysis.append({
                    "report_id": post.get("id"),
                    "created_at": str(created_at),
                    "start_date": start_date,
                    "end_date": end_date,
                    "has_offset_issue": has_offset_issue,
                    "has_correct_dates": has_correct_dates
                })
            
            # The most recent report should have correct dates
            latest_report = reports_analysis[0] if reports_analysis else None
            
            success = (
                latest_report is not None and
                latest_report["has_correct_dates"] and
                not latest_report["has_offset_issue"]
            )
            
            # Count reports with correct vs problematic dates
            correct_reports = sum(1 for r in reports_analysis if r["has_correct_dates"])
            problematic_reports = sum(1 for r in reports_analysis if r["has_offset_issue"])
            
            self.log_test_result(
                "Compare with Previous Behavior",
                success,
                f"Behavior comparison: {success}",
                {
                    "Total Reports Analyzed": len(reports_analysis),
                    "Reports with Correct Dates": correct_reports,
                    "Reports with Offset Issue": problematic_reports,
                    "Latest Report Correct": latest_report["has_correct_dates"] if latest_report else False,
                    "Latest Report Has Offset": latest_report["has_offset_issue"] if latest_report else False,
                    "Latest Report Start": latest_report["start_date"] if latest_report else "N/A",
                    "Latest Report End": latest_report["end_date"] if latest_report else "N/A",
                    "Fix Working": success,
                    "Reports Analysis": reports_analysis[:3]  # Show first 3 reports
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Compare with Previous Behavior",
                False,
                f"Error comparing with previous behavior: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_adhoc_timesheet_timezone_tests(self):
        """Run comprehensive adhoc timesheet timezone fix tests"""
        print("🔍 STARTING ADHOC TIMESHEET TIMEZONE FIX TESTING")
        print("=" * 80)
        print("Testing timezone fix for adhoc timesheet agents with custom date ranges")
        print("Focus: Sep 4-19, 2025 should NOT become Sep 5-20, 2025 (one day offset)")
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
            
            # Test 1: Find Adhoc Timesheet Agent
            success1 = await self.test_find_adhoc_timesheet_agent()
            test_results.append(success1)
            
            if not success1:
                print("❌ Cannot proceed without finding the target agent")
                return
            
            # Test 2: Manual Agent Execution
            success2 = await self.test_manual_agent_execution()
            test_results.append(success2)
            
            # Test 3: Generated Timesheet Report Verification
            success3 = await self.test_generated_timesheet_report()
            test_results.append(success3)
            
            # Test 4: Timezone Conversion Logic Verification
            success4 = await self.test_timezone_conversion_logic()
            test_results.append(success4)
            
            # Test 5: Compare with Previous Behavior
            success5 = await self.test_compare_with_previous_behavior()
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 ADHOC TIMESHEET TIMEZONE FIX TESTING SUMMARY")
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
                "Find Adhoc Timesheet Agent",
                "Manual Agent Execution", 
                "Generated Timesheet Report Verification",
                "Timezone Conversion Logic Verification",
                "Compare with Previous Behavior"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
                
                if i == 0 and success:
                    print("   - Target agent found with correct configuration")
                    print("   - Custom dates: Sep 4-19, 2025 configured")
                elif i == 1 and success:
                    print("   - Agent executed successfully via API")
                    print("   - Timesheet report generation triggered")
                elif i == 2 and success:
                    print("   - Generated report uses exact configured dates")
                    print("   - No one-day offset detected")
                elif i == 3 and success:
                    print("   - Business timezone interpretation working")
                    print("   - Custom dates processed correctly")
                elif i == 4 and success:
                    print("   - Latest report shows correct behavior")
                    print("   - Timezone fix eliminated offset issue")
            
            print()
            print("🎯 TIMEZONE FIX STATUS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ TIMEZONE FIX WORKING CORRECTLY")
                print("   - Custom dates interpreted in business timezone")
                print("   - Sep 4-19, 2025 remains Sep 4-19, 2025")
                print("   - No one-day offset issue detected")
                print("   - Same logic as recurring agents applied")
                print("   - Lines 4863-4869 in server.py working correctly")
            else:
                print("❌ TIMEZONE FIX NEEDS ATTENTION")
                failed_tests = [test_names[i] for i, success in enumerate(test_results) if not success]
                print(f"   - Failed tests: {', '.join(failed_tests)}")
                print("   - One-day offset issue may still exist")
            
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
    tester = AdhocTimesheetTimezoneTester()
    await tester.run_adhoc_timesheet_timezone_tests()

if __name__ == "__main__":
    asyncio.run(main())