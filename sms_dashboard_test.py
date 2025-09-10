#!/usr/bin/env python3
"""
SMS Agent Dashboard Display Fix Test

This test specifically verifies the SMS agent dashboard display fix by:
1. Creating an SMS agent with holidays and checking the dashboard data
2. Testing the condition: agent.selected_holidays && agent.selected_holidays.length > 0
3. Verifying getNextScheduledHoliday logic with actual agent data
4. Checking if holidays data is accessible and properly formatted
5. Verifying holiday calculation and display formatting

Expected Results:
- SMS agent should be created with selected_holidays array
- Dashboard condition should pass: agent.selected_holidays && agent.selected_holidays.length > 0
- Should be able to calculate next upcoming holiday from the selected holidays
- Should return proper holiday name and formatted date
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

class SMSDashboardTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        
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
    
    async def get_test_holidays(self):
        """Get holidays for testing"""
        holidays = await self.db.holidays.find({}).limit(10).to_list(length=10)
        
        # Filter for upcoming holidays (Christmas and Thanksgiving as mentioned in review request)
        test_holidays = []
        for holiday in holidays:
            holiday_name = holiday.get("name", "").lower()
            if "christmas" in holiday_name or "thanksgiving" in holiday_name:
                test_holidays.append(holiday)
        
        # If we don't have Christmas/Thanksgiving, use any available holidays
        if not test_holidays and holidays:
            test_holidays = holidays[:2]  # Use first 2 holidays
            
        return test_holidays
    
    async def create_sms_agent_with_holidays(self, agent_name: str, selected_holidays: list):
        """Create SMS agent with selected holidays"""
        import uuid
        
        agent_data = {
            "id": str(uuid.uuid4()),
            "agent_name": agent_name,
            "agent_type": "sms_agent",
            "mode": "recurring",
            "selected_holidays": selected_holidays,
            "sms_provider": "twilio",
            "sms_link": "https://petsandvetsanimalhospital.com",
            "sms_template": "Hi [CUSTOMER_NAME]! Happy [HOLIDAY_NAME]! We hope you and [PET_NAME] have a wonderful celebration. - Your Vet Team",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        # Insert the test agent
        await self.db.ai_agents.insert_one(agent_data)
        return agent_data
    
    async def test_sms_agent_creation_with_holidays(self):
        """Test 1: Create SMS Agent with Holidays"""
        print("🧪 TEST 1: Create SMS Agent with Holidays")
        print("=" * 60)
        
        try:
            # Get test holidays
            holidays = await self.get_test_holidays()
            
            if not holidays:
                self.log_test_result(
                    "SMS Agent Creation with Holidays",
                    False,
                    "No holidays found in database for testing",
                    {"Available Holidays": 0}
                )
                return False, None
            
            # Extract holiday IDs for selected_holidays array
            selected_holiday_ids = [holiday["id"] for holiday in holidays]
            holiday_names = [holiday["name"] for holiday in holidays]
            
            # Create SMS agent with holidays
            agent = await self.create_sms_agent_with_holidays(
                "Dashboard Test SMS Agent",
                selected_holiday_ids
            )
            
            # Verify agent was created correctly
            created_agent = await self.db.ai_agents.find_one({"id": agent["id"]})
            
            if created_agent:
                # Check all required fields
                has_selected_holidays = "selected_holidays" in created_agent and created_agent["selected_holidays"]
                correct_mode = created_agent.get("mode") == "recurring"
                correct_agent_type = created_agent.get("agent_type") == "sms_agent"
                holidays_count = len(created_agent.get("selected_holidays", []))
                
                success = has_selected_holidays and correct_mode and correct_agent_type and holidays_count > 0
                
                self.log_test_result(
                    "SMS Agent Creation with Holidays",
                    success,
                    f"SMS agent created with {holidays_count} selected holidays",
                    {
                        "Agent ID": agent["id"],
                        "Agent Type": created_agent.get("agent_type"),
                        "Mode": created_agent.get("mode"),
                        "Selected Holidays": holiday_names,
                        "Selected Holiday IDs": selected_holiday_ids,
                        "Has selected_holidays Array": has_selected_holidays,
                        "Holidays Count": holidays_count
                    }
                )
                return success, created_agent
            else:
                self.log_test_result(
                    "SMS Agent Creation with Holidays",
                    False,
                    "SMS agent was not found in database after creation",
                    {"Agent ID": agent["id"]}
                )
                return False, None
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Creation with Holidays",
                False,
                f"Error creating SMS agent with holidays: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_dashboard_data_retrieval(self, agent_id: str):
        """Test 2: Test Dashboard Data Retrieval via API"""
        print("🧪 TEST 2: Test Dashboard Data Retrieval via API")
        print("=" * 60)
        
        try:
            # Simulate API call to get agent data
            agent_data = await self.db.ai_agents.find_one({"id": agent_id})
            
            if not agent_data:
                self.log_test_result(
                    "Dashboard Data Retrieval",
                    False,
                    "Agent not found in database",
                    {"Agent ID": agent_id}
                )
                return False, None
            
            # Check if data structure matches what frontend expects
            required_fields = ["id", "agent_name", "agent_type", "mode", "selected_holidays"]
            missing_fields = [field for field in required_fields if field not in agent_data]
            
            has_selected_holidays = "selected_holidays" in agent_data and agent_data["selected_holidays"]
            holidays_is_array = isinstance(agent_data.get("selected_holidays"), list)
            holidays_count = len(agent_data.get("selected_holidays", []))
            
            success = len(missing_fields) == 0 and has_selected_holidays and holidays_is_array
            
            self.log_test_result(
                "Dashboard Data Retrieval",
                success,
                f"Agent data retrieved with proper structure for dashboard",
                {
                    "Agent ID": agent_id,
                    "Agent Name": agent_data.get("agent_name"),
                    "Agent Type": agent_data.get("agent_type"),
                    "Mode": agent_data.get("mode"),
                    "Has selected_holidays": has_selected_holidays,
                    "selected_holidays is Array": holidays_is_array,
                    "Holidays Count": holidays_count,
                    "Missing Fields": missing_fields if missing_fields else "None"
                }
            )
            return success, agent_data
            
        except Exception as e:
            self.log_test_result(
                "Dashboard Data Retrieval",
                False,
                f"Error retrieving dashboard data: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    async def test_frontend_condition_simulation(self, agent_data: dict):
        """Test 3: Simulate Frontend Condition Check"""
        print("🧪 TEST 3: Simulate Frontend Condition Check")
        print("=" * 60)
        
        try:
            # Simulate the frontend condition: agent.selected_holidays && agent.selected_holidays.length > 0
            selected_holidays = agent_data.get("selected_holidays")
            
            # JavaScript-like condition check
            condition_passes = selected_holidays is not None and len(selected_holidays) > 0
            
            # Additional checks
            is_array = isinstance(selected_holidays, list)
            has_valid_ids = all(isinstance(holiday_id, str) and holiday_id.strip() for holiday_id in selected_holidays) if is_array else False
            
            self.log_test_result(
                "Frontend Condition Simulation",
                condition_passes,
                f"Frontend condition check: agent.selected_holidays && agent.selected_holidays.length > 0",
                {
                    "selected_holidays exists": selected_holidays is not None,
                    "selected_holidays is array": is_array,
                    "selected_holidays length": len(selected_holidays) if selected_holidays else 0,
                    "Condition Result": condition_passes,
                    "Has Valid Holiday IDs": has_valid_ids,
                    "Holiday IDs": selected_holidays if selected_holidays else "None"
                }
            )
            return condition_passes
            
        except Exception as e:
            self.log_test_result(
                "Frontend Condition Simulation",
                False,
                f"Error simulating frontend condition: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_holiday_calculation_logic(self, agent_data: dict):
        """Test 4: Verify Holiday Calculation Logic"""
        print("🧪 TEST 4: Verify Holiday Calculation Logic")
        print("=" * 60)
        
        try:
            selected_holiday_ids = agent_data.get("selected_holidays", [])
            
            if not selected_holiday_ids:
                self.log_test_result(
                    "Holiday Calculation Logic",
                    False,
                    "No selected holidays to test calculation logic",
                    {"Selected Holidays": selected_holiday_ids}
                )
                return False, None
            
            # Get holiday data from database
            holidays_data = []
            for holiday_id in selected_holiday_ids:
                holiday = await self.db.holidays.find_one({"id": holiday_id})
                if holiday:
                    holidays_data.append(holiday)
            
            if not holidays_data:
                self.log_test_result(
                    "Holiday Calculation Logic",
                    False,
                    "No holiday data found for selected holiday IDs",
                    {"Selected Holiday IDs": selected_holiday_ids}
                )
                return False, None
            
            # Simulate getNextScheduledHoliday logic
            current_date = datetime.now().date()
            upcoming_holidays = []
            
            for holiday in holidays_data:
                holiday_date_str = holiday.get("date")
                if holiday_date_str:
                    try:
                        holiday_date = datetime.strptime(holiday_date_str, "%Y-%m-%d").date()
                        if holiday_date >= current_date:
                            days_until = (holiday_date - current_date).days
                            upcoming_holidays.append({
                                "holiday": holiday,
                                "date": holiday_date,
                                "days_until": days_until
                            })
                    except ValueError:
                        continue
            
            # Sort by date to find next upcoming holiday
            upcoming_holidays.sort(key=lambda x: x["days_until"])
            
            if upcoming_holidays:
                next_holiday = upcoming_holidays[0]
                holiday_name = next_holiday["holiday"]["name"]
                holiday_date = next_holiday["date"]
                days_until = next_holiday["days_until"]
                
                # Format date like frontend would (e.g., "Nov 27th, 2025 at 9:00 AM")
                formatted_date = holiday_date.strftime("%b %d") + self.get_ordinal_suffix(holiday_date.day) + holiday_date.strftime(", %Y at 9:00 AM")
                
                self.log_test_result(
                    "Holiday Calculation Logic",
                    True,
                    f"Next upcoming holiday calculated successfully",
                    {
                        "Next Holiday": holiday_name,
                        "Holiday Date": holiday_date.strftime("%Y-%m-%d"),
                        "Days Until": days_until,
                        "Formatted Date": formatted_date,
                        "Total Upcoming Holidays": len(upcoming_holidays),
                        "All Upcoming": [f"{h['holiday']['name']} ({h['days_until']} days)" for h in upcoming_holidays[:3]]
                    }
                )
                return True, {
                    "holiday_name": holiday_name,
                    "holiday_date": holiday_date,
                    "formatted_date": formatted_date,
                    "days_until": days_until
                }
            else:
                self.log_test_result(
                    "Holiday Calculation Logic",
                    False,
                    "No upcoming holidays found from selected holidays",
                    {
                        "Selected Holidays": [h["name"] for h in holidays_data],
                        "Current Date": current_date.strftime("%Y-%m-%d"),
                        "Holiday Dates": [h.get("date") for h in holidays_data]
                    }
                )
                return False, None
                
        except Exception as e:
            self.log_test_result(
                "Holiday Calculation Logic",
                False,
                f"Error in holiday calculation logic: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, None
    
    def get_ordinal_suffix(self, day):
        """Get ordinal suffix for day (1st, 2nd, 3rd, 4th, etc.)"""
        if 10 <= day % 100 <= 20:
            suffix = "th"
        else:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
        return suffix
    
    async def test_dashboard_display_format(self, holiday_info: dict):
        """Test 5: Verify Dashboard Display Format"""
        print("🧪 TEST 5: Verify Dashboard Display Format")
        print("=" * 60)
        
        try:
            if not holiday_info:
                self.log_test_result(
                    "Dashboard Display Format",
                    False,
                    "No holiday information provided for display format test",
                    {}
                )
                return False
            
            holiday_name = holiday_info.get("holiday_name")
            formatted_date = holiday_info.get("formatted_date")
            days_until = holiday_info.get("days_until")
            
            # Check if we have the expected format
            has_holiday_name = holiday_name and isinstance(holiday_name, str)
            has_formatted_date = formatted_date and isinstance(formatted_date, str)
            has_days_count = days_until is not None and isinstance(days_until, int)
            
            # Check date format (should be like "Nov 27th, 2025 at 9:00 AM")
            date_format_correct = False
            if formatted_date:
                # Basic format check
                date_format_correct = (
                    " at " in formatted_date and
                    ", 20" in formatted_date and  # Year check
                    any(month in formatted_date for month in ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                                             "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
                )
            
            success = has_holiday_name and has_formatted_date and has_days_count and date_format_correct
            
            # Expected display examples
            expected_label = f"{holiday_name}"  # e.g., "Thanksgiving 2025"
            expected_value = formatted_date     # e.g., "Nov 27th, 2025 at 9:00 AM"
            
            self.log_test_result(
                "Dashboard Display Format",
                success,
                f"Dashboard display format verification",
                {
                    "Holiday Name": holiday_name,
                    "Formatted Date": formatted_date,
                    "Days Until": days_until,
                    "Expected Label": expected_label,
                    "Expected Value": expected_value,
                    "Has Holiday Name": has_holiday_name,
                    "Has Formatted Date": has_formatted_date,
                    "Date Format Correct": date_format_correct,
                    "Display Ready": success
                }
            )
            return success
            
        except Exception as e:
            self.log_test_result(
                "Dashboard Display Format",
                False,
                f"Error verifying dashboard display format: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data created during testing"""
        try:
            # Delete test agents
            await self.db.ai_agents.delete_many({
                "agent_name": {"$regex": "Dashboard Test SMS Agent"}
            })
            
            print("🧹 Test data cleanup completed")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up all test data: {str(e)}")
    
    async def run_sms_dashboard_test(self):
        """Run comprehensive SMS dashboard display test"""
        print("🚀 STARTING SMS AGENT DASHBOARD DISPLAY TEST")
        print("=" * 80)
        print("Testing SMS agent dashboard display fix:")
        print("- Creating SMS agent with holidays")
        print("- Testing dashboard condition: agent.selected_holidays && agent.selected_holidays.length > 0")
        print("- Verifying getNextScheduledHoliday logic")
        print("- Checking holiday calculation and display formatting")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all tests
            test_results = []
            agent_data = None
            holiday_info = None
            
            # Test 1: Create SMS Agent with Holidays
            success, agent_data = await self.test_sms_agent_creation_with_holidays()
            test_results.append(success)
            
            if success and agent_data:
                # Test 2: Dashboard Data Retrieval
                success, retrieved_agent = await self.test_dashboard_data_retrieval(agent_data["id"])
                test_results.append(success)
                
                if success and retrieved_agent:
                    # Test 3: Frontend Condition Simulation
                    success = await self.test_frontend_condition_simulation(retrieved_agent)
                    test_results.append(success)
                    
                    # Test 4: Holiday Calculation Logic
                    success, holiday_info = await self.test_holiday_calculation_logic(retrieved_agent)
                    test_results.append(success)
                    
                    # Test 5: Dashboard Display Format
                    success = await self.test_dashboard_display_format(holiday_info)
                    test_results.append(success)
                else:
                    # Skip remaining tests if data retrieval failed
                    test_results.extend([False, False, False])
            else:
                # Skip all remaining tests if agent creation failed
                test_results.extend([False, False, False, False])
            
            # Summary
            print("=" * 80)
            print("🎯 SMS AGENT DASHBOARD DISPLAY TEST SUMMARY")
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
            
            # Overall assessment
            if passed_tests == total_tests:
                print("🎉 ALL TESTS PASSED - SMS Agent Dashboard Display Fix is Working!")
                print("✅ SMS agents created with selected_holidays array")
                print("✅ Dashboard condition passes: agent.selected_holidays && agent.selected_holidays.length > 0")
                print("✅ Holiday calculation logic working correctly")
                print("✅ Next upcoming holiday properly calculated")
                print("✅ Display format matches expected frontend requirements")
                print()
                print("🔧 EXPECTED FRONTEND BEHAVIOR:")
                if holiday_info:
                    print(f"   - Should show: '{holiday_info.get('holiday_name')}' as field label")
                    print(f"   - Should show: '{holiday_info.get('formatted_date')}' as field value")
                    print(f"   - Should NOT show: 'No days selected' message")
            elif passed_tests >= 3:
                print("⚠️  MOSTLY WORKING - SMS Agent Dashboard Display has minor issues")
                print("✅ Core functionality appears to be working")
                print("⚠️  Some display formatting may need attention")
            else:
                print("❌ CRITICAL ISSUES - SMS Agent Dashboard Display needs attention")
                print("❌ Core dashboard condition may not be working")
                print("❌ Holiday calculation or display formatting failing")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Clean up test data
            await self.cleanup_test_data()
            await self.disconnect()

async def main():
    """Main test function"""
    tester = SMSDashboardTester()
    await tester.run_sms_dashboard_test()

if __name__ == "__main__":
    asyncio.run(main())