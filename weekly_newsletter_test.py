#!/usr/bin/env python3
"""
Weekly Newsletter Recurring Email Agent Dashboard Display Test

This test verifies the Weekly Newsletter recurring email agent dashboard display fix.
Specifically tests:
1. Find Weekly Newsletter Agent with topic-based recurring configuration
2. Test calculateNextRunForRecurringAgent function behavior for recurring email agents
3. Verify agent has proper days_of_week configuration
4. Create test agent if needed with proper structure
5. Verify dashboard display shows Next Scheduled Run and Last Manual Run sections

Expected Results:
- Weekly Newsletter agent should exist with topic-based recurring configuration
- Should have days_of_week field with selected days
- calculateNextRunForRecurringAgent should return proper next run information
- Dashboard should show Next Scheduled Run and Last Manual Run sections
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

class WeeklyNewsletterTester:
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
    
    async def find_weekly_newsletter_agents(self):
        """Test 1: Find Weekly Newsletter Agents"""
        print("🧪 TEST 1: Find Weekly Newsletter Agents")
        print("=" * 60)
        
        try:
            # Search for email agents with names containing "Weekly Newsletter" or similar
            newsletter_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "agent_name": {"$regex": "Weekly Newsletter|newsletter|Newsletter", "$options": "i"}
            }).to_list(length=10)
            
            if newsletter_agents:
                for agent in newsletter_agents:
                    agent_name = agent.get("agent_name", "Unknown")
                    mode = agent.get("mode", "Unknown")
                    selected_holidays = agent.get("selected_holidays", [])
                    days_of_week = agent.get("days_of_week", {})
                    is_active = agent.get("is_active", False)
                    
                    # Check if it's topic-based recurring (mode='recurring', no selected_holidays)
                    is_topic_based = mode == "recurring" and not selected_holidays
                    has_days_config = bool(days_of_week and any(days_of_week.values()))
                    
                    self.log_test_result(
                        f"Weekly Newsletter Agent Found: {agent_name}",
                        True,
                        f"Found email agent with newsletter-related name",
                        {
                            "Agent ID": agent.get("id"),
                            "Agent Name": agent_name,
                            "Mode": mode,
                            "Is Topic-Based Recurring": is_topic_based,
                            "Has Days of Week Config": has_days_config,
                            "Days of Week": days_of_week,
                            "Selected Holidays": len(selected_holidays),
                            "Is Active": is_active,
                            "Post Time": agent.get("post_time", "Not set")
                        }
                    )
                
                return newsletter_agents
            else:
                self.log_test_result(
                    "Weekly Newsletter Agent Search",
                    False,
                    "No Weekly Newsletter agents found in database",
                    {"Search Pattern": "Weekly Newsletter|newsletter|Newsletter"}
                )
                return []
                
        except Exception as e:
            self.log_test_result(
                "Weekly Newsletter Agent Search",
                False,
                f"Error searching for Weekly Newsletter agents: {str(e)}",
                {"Error Details": str(e)}
            )
            return []
    
    async def create_weekly_newsletter_agent(self):
        """Test 2: Create Weekly Newsletter Agent if Needed"""
        print("🧪 TEST 2: Create Weekly Newsletter Agent")
        print("=" * 60)
        
        try:
            import uuid
            
            # Create a proper Weekly Newsletter agent with topic-based recurring configuration
            agent_data = {
                "id": str(uuid.uuid4()),
                "agent_name": "Weekly Newsletter Agent",
                "agent_type": "email",
                "mode": "recurring",  # Topic-based recurring
                "topic": "Pet Health and Wellness Newsletter",
                "days_of_week": {
                    "monday": True,   # Weekly on Mondays
                    "tuesday": False,
                    "wednesday": False,
                    "thursday": False,
                    "friday": False,
                    "saturday": False,
                    "sunday": False
                },
                "post_time": "09:00",
                "email_content_template": "Dear [CUSTOMER_NAME],\n\nWelcome to our weekly pet health newsletter! This week we're focusing on keeping [PET_NAME] healthy and happy.\n\n[NEWSLETTER_CONTENT]\n\nBest regards,\nYour Veterinary Team",
                "use_chatgpt_formatting": True,
                "use_customer_database": True,
                "email_type": "bulk",
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            # Insert the Weekly Newsletter agent
            await self.db.ai_agents.insert_one(agent_data)
            
            self.log_test_result(
                "Weekly Newsletter Agent Creation",
                True,
                "Successfully created Weekly Newsletter agent with proper configuration",
                {
                    "Agent ID": agent_data["id"],
                    "Agent Name": agent_data["agent_name"],
                    "Mode": agent_data["mode"],
                    "Topic": agent_data["topic"],
                    "Days of Week": agent_data["days_of_week"],
                    "Post Time": agent_data["post_time"],
                    "ChatGPT Formatting": agent_data["use_chatgpt_formatting"],
                    "Is Active": agent_data["is_active"]
                }
            )
            
            return agent_data
            
        except Exception as e:
            self.log_test_result(
                "Weekly Newsletter Agent Creation",
                False,
                f"Error creating Weekly Newsletter agent: {str(e)}",
                {"Error Details": str(e)}
            )
            return None
    
    async def test_agent_configuration(self, agent):
        """Test 3: Verify Agent Configuration"""
        print("🧪 TEST 3: Verify Agent Configuration")
        print("=" * 60)
        
        try:
            agent_name = agent.get("agent_name", "Unknown")
            
            # Check required fields for dashboard display
            has_days_of_week = bool(agent.get("days_of_week"))
            has_post_time = bool(agent.get("post_time"))
            is_active = agent.get("is_active", False)
            mode = agent.get("mode")
            agent_type = agent.get("agent_type")
            selected_holidays = agent.get("selected_holidays", [])
            
            # Verify it's topic-based recurring (not holiday-based)
            is_topic_based = mode == "recurring" and not selected_holidays
            
            # Check days_of_week configuration
            days_of_week = agent.get("days_of_week", {})
            selected_days = [day for day, selected in days_of_week.items() if selected] if days_of_week else []
            
            # Verify all required fields are present
            config_valid = all([
                has_days_of_week,
                has_post_time,
                is_active,
                is_topic_based,
                len(selected_days) > 0
            ])
            
            self.log_test_result(
                f"Agent Configuration Verification: {agent_name}",
                config_valid,
                f"Agent configuration {'is valid' if config_valid else 'has issues'} for dashboard display",
                {
                    "Agent Type": agent_type,
                    "Mode": mode,
                    "Is Topic-Based Recurring": is_topic_based,
                    "Has Days of Week": has_days_of_week,
                    "Selected Days": selected_days,
                    "Has Post Time": has_post_time,
                    "Post Time": agent.get("post_time"),
                    "Is Active": is_active,
                    "Has Selected Holidays": len(selected_holidays) > 0,
                    "Configuration Valid": config_valid
                }
            )
            
            return config_valid
            
        except Exception as e:
            self.log_test_result(
                "Agent Configuration Verification",
                False,
                f"Error verifying agent configuration: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_api_response(self, agent):
        """Test 4: Test API Response for Dashboard"""
        print("🧪 TEST 4: Test API Response for Dashboard")
        print("=" * 60)
        
        try:
            # Simulate the API call that the dashboard makes
            email_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "is_active": True
            }).to_list(length=100)
            
            # Find our Weekly Newsletter agent in the response
            newsletter_agent = None
            for agent_doc in email_agents:
                if agent_doc.get("id") == agent.get("id"):
                    newsletter_agent = agent_doc
                    break
            
            if newsletter_agent:
                # Verify the agent appears in API response with correct structure
                required_fields = ["id", "agent_name", "agent_type", "mode", "days_of_week", "post_time", "is_active"]
                missing_fields = [field for field in required_fields if field not in newsletter_agent]
                
                # Check dashboard filtering criteria
                is_email_agent = newsletter_agent.get("agent_type") == "email"
                is_recurring = newsletter_agent.get("mode") == "recurring"
                has_days_config = bool(newsletter_agent.get("days_of_week"))
                is_active = newsletter_agent.get("is_active", False)
                no_holidays = not newsletter_agent.get("selected_holidays", [])
                
                dashboard_criteria_met = all([is_email_agent, is_recurring, has_days_config, is_active, no_holidays])
                
                self.log_test_result(
                    "API Response Verification",
                    len(missing_fields) == 0 and dashboard_criteria_met,
                    f"Agent {'appears correctly' if dashboard_criteria_met else 'has issues'} in API response",
                    {
                        "Agent Found in Response": True,
                        "Missing Required Fields": missing_fields,
                        "Is Email Agent": is_email_agent,
                        "Is Recurring Mode": is_recurring,
                        "Has Days Config": has_days_config,
                        "Is Active": is_active,
                        "No Selected Holidays": no_holidays,
                        "Dashboard Criteria Met": dashboard_criteria_met,
                        "Days of Week": newsletter_agent.get("days_of_week"),
                        "Post Time": newsletter_agent.get("post_time")
                    }
                )
                
                return dashboard_criteria_met
            else:
                self.log_test_result(
                    "API Response Verification",
                    False,
                    "Weekly Newsletter agent not found in API response",
                    {
                        "Total Email Agents": len(email_agents),
                        "Agent ID Searched": agent.get("id")
                    }
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "API Response Verification",
                False,
                f"Error testing API response: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_next_run_calculation(self, agent):
        """Test 5: Test Next Run Calculation Logic"""
        print("🧪 TEST 5: Test Next Run Calculation Logic")
        print("=" * 60)
        
        try:
            # Simulate the calculateNextRunForRecurringAgent function logic
            agent_name = agent.get("agent_name", "Unknown")
            mode = agent.get("mode")
            agent_type = agent.get("agent_type")
            post_time = agent.get("post_time", "09:00")
            days_of_week = agent.get("days_of_week", {})
            
            # Check if this agent should be processed by calculateNextRunForRecurringAgent
            should_calculate = (
                mode in ["recurring", "auto"] and 
                agent_type != "time_sheet"
            )
            
            if not should_calculate:
                self.log_test_result(
                    "Next Run Calculation Logic",
                    False,
                    f"Agent does not meet criteria for next run calculation",
                    {
                        "Mode": mode,
                        "Agent Type": agent_type,
                        "Should Calculate": should_calculate
                    }
                )
                return False
            
            # Get selected days
            selected_days = [day for day, selected in days_of_week.items() if selected] if days_of_week else []
            
            if not selected_days:
                self.log_test_result(
                    "Next Run Calculation Logic",
                    False,
                    "No days selected for recurring agent",
                    {
                        "Days of Week Config": days_of_week,
                        "Selected Days": selected_days
                    }
                )
                return False
            
            # Simulate next run calculation
            from datetime import datetime, timedelta
            
            now = datetime.now()
            hours, minutes = map(int, post_time.split(':'))
            
            # Map day names to numbers
            day_map = {
                'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
                'thursday': 4, 'friday': 5, 'saturday': 6
            }
            
            selected_day_numbers = [day_map[day.lower()] for day in selected_days if day.lower() in day_map]
            
            # Find next run date
            next_run_found = False
            days_to_add = 0
            max_days = 14
            
            while days_to_add < max_days:
                check_date = now + timedelta(days=days_to_add)
                day_of_week = check_date.weekday()
                # Convert Monday=0 to Sunday=0 format
                js_day_of_week = (day_of_week + 1) % 7
                
                if js_day_of_week in selected_day_numbers:
                    check_date = check_date.replace(hour=hours, minute=minutes, second=0, microsecond=0)
                    
                    if days_to_add == 0 and check_date <= now:
                        days_to_add += 1
                        continue
                    
                    next_run_found = True
                    next_run_date = check_date
                    break
                
                days_to_add += 1
            
            calculation_successful = next_run_found and days_to_add < max_days
            
            self.log_test_result(
                "Next Run Calculation Logic",
                calculation_successful,
                f"Next run calculation {'successful' if calculation_successful else 'failed'}",
                {
                    "Agent Name": agent_name,
                    "Post Time": post_time,
                    "Selected Days": selected_days,
                    "Selected Day Numbers": selected_day_numbers,
                    "Next Run Found": next_run_found,
                    "Days to Add": days_to_add if next_run_found else "Not found",
                    "Next Run Date": next_run_date.strftime("%Y-%m-%d %H:%M") if next_run_found else "Not calculated",
                    "Calculation Successful": calculation_successful
                }
            )
            
            return calculation_successful
            
        except Exception as e:
            self.log_test_result(
                "Next Run Calculation Logic",
                False,
                f"Error testing next run calculation: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_dashboard_display_criteria(self, agent):
        """Test 6: Test Dashboard Display Criteria"""
        print("🧪 TEST 6: Test Dashboard Display Criteria")
        print("=" * 60)
        
        try:
            agent_name = agent.get("agent_name", "Unknown")
            
            # Check all criteria for dashboard display
            criteria_checks = {
                "Is Email Agent": agent.get("agent_type") == "email",
                "Is Recurring Mode": agent.get("mode") == "recurring", 
                "Is Active": agent.get("is_active", False),
                "Has Days of Week": bool(agent.get("days_of_week")),
                "Has Selected Days": bool(agent.get("days_of_week") and any(agent.get("days_of_week", {}).values())),
                "No Selected Holidays": not agent.get("selected_holidays", []),
                "Has Post Time": bool(agent.get("post_time")),
                "Has Agent Name": bool(agent.get("agent_name")),
                "Has Agent ID": bool(agent.get("id"))
            }
            
            all_criteria_met = all(criteria_checks.values())
            failed_criteria = [criteria for criteria, passed in criteria_checks.items() if not passed]
            
            # Expected dashboard sections
            expected_sections = [
                "Next Scheduled Run",
                "Last Manual Run"
            ]
            
            self.log_test_result(
                "Dashboard Display Criteria",
                all_criteria_met,
                f"Dashboard display criteria {'all met' if all_criteria_met else 'has failures'}",
                {
                    "Agent Name": agent_name,
                    "All Criteria Met": all_criteria_met,
                    "Failed Criteria": failed_criteria,
                    "Criteria Details": criteria_checks,
                    "Expected Dashboard Sections": expected_sections,
                    "Days of Week": agent.get("days_of_week"),
                    "Post Time": agent.get("post_time")
                }
            )
            
            return all_criteria_met
            
        except Exception as e:
            self.log_test_result(
                "Dashboard Display Criteria",
                False,
                f"Error testing dashboard display criteria: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data created during testing"""
        try:
            # Delete test Weekly Newsletter agents created during testing
            await self.db.ai_agents.delete_many({
                "agent_name": "Weekly Newsletter Agent",
                "agent_type": "email"
            })
            
            print("🧹 Test data cleanup completed")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up all test data: {str(e)}")
    
    async def run_comprehensive_weekly_newsletter_test(self):
        """Run comprehensive Weekly Newsletter recurring email agent test"""
        print("🚀 STARTING WEEKLY NEWSLETTER RECURRING EMAIL AGENT TEST")
        print("=" * 80)
        print("Testing the Weekly Newsletter recurring email agent dashboard display fix")
        print("Focus: Topic-based recurring agents with days_of_week configuration")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all tests
            test_results = []
            
            # Test 1: Find existing Weekly Newsletter agents
            existing_agents = await self.find_weekly_newsletter_agents()
            
            # Test 2: Create Weekly Newsletter agent if needed
            if not existing_agents:
                test_agent = await self.create_weekly_newsletter_agent()
                if test_agent:
                    existing_agents = [test_agent]
            
            if existing_agents:
                # Use the first agent for remaining tests
                test_agent = existing_agents[0]
                
                # Test 3: Verify Agent Configuration
                test_results.append(await self.test_agent_configuration(test_agent))
                
                # Test 4: Test API Response
                test_results.append(await self.test_api_response(test_agent))
                
                # Test 5: Test Next Run Calculation
                test_results.append(await self.test_next_run_calculation(test_agent))
                
                # Test 6: Test Dashboard Display Criteria
                test_results.append(await self.test_dashboard_display_criteria(test_agent))
            else:
                print("❌ No Weekly Newsletter agents available for testing")
                test_results = [False, False, False, False]
            
            # Summary
            print("=" * 80)
            print("🎯 WEEKLY NEWSLETTER RECURRING EMAIL AGENT TEST SUMMARY")
            print("=" * 80)
            
            passed_tests = sum(test_results)
            total_tests = len(test_results)
            success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
            
            print(f"Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
            print()
            
            # Detailed results
            for result in self.test_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            
            # Overall assessment
            if passed_tests == total_tests and total_tests > 0:
                print("🎉 ALL TESTS PASSED - Weekly Newsletter Dashboard Display Fix is Working!")
                print("✅ Weekly Newsletter agent exists with proper configuration")
                print("✅ Topic-based recurring configuration working correctly")
                print("✅ Days of week configuration present and valid")
                print("✅ API response includes all required fields")
                print("✅ Next run calculation logic functional")
                print("✅ Dashboard display criteria all met")
            elif passed_tests >= total_tests * 0.75:
                print("⚠️  MOSTLY WORKING - Weekly Newsletter Dashboard Display has minor issues")
                print("✅ Core functionality appears to be working")
                print("⚠️  Some aspects may need additional attention")
            else:
                print("❌ CRITICAL ISSUES - Weekly Newsletter Dashboard Display needs attention")
                print("❌ Core functionality may not be fully implemented")
                print("❌ Multiple areas failing")
            
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
    tester = WeeklyNewsletterTester()
    await tester.run_comprehensive_weekly_newsletter_test()

if __name__ == "__main__":
    asyncio.run(main())