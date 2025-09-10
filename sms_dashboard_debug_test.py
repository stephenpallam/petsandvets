#!/usr/bin/env python3
"""
SMS Agent Dashboard "No Days Selected" Debug Test

This test specifically debugs the issue where SMS agents show "No days selected" 
in the dashboard instead of showing the actual selected holidays.

Debug Focus:
1. Check SMS Agent Data Structure - Find existing SMS agents with selected holidays
2. Test Holiday Data - Verify holidays are properly stored and accessible
3. Simulate Frontend Holiday Calculation - Test getNextScheduledHoliday logic
4. Verify Agent Display Condition - Check if agents meet display conditions

Expected Results:
- Should find SMS agents with selected_holidays array
- Should be able to calculate next upcoming holiday
- Should identify why frontend shows "No days selected"
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

class SMSDashboardDebugger:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.debug_results = []
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def log_debug_result(self, test_name: str, success: bool, message: str, details: dict = None):
        """Log debug result"""
        status = "✅ FOUND" if success else "❌ ISSUE"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
        print()
        
        self.debug_results.append({
            "test_name": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        })
    
    async def debug_sms_agent_data_structure(self):
        """Debug 1: Check SMS Agent Data Structure"""
        print("🔍 DEBUG 1: SMS Agent Data Structure Analysis")
        print("=" * 60)
        
        try:
            # Find all SMS agents
            sms_agents = await self.db.ai_agents.find({
                "agent_type": "sms_agent"
            }).to_list(length=100)
            
            if not sms_agents:
                self.log_debug_result(
                    "SMS Agent Data Structure",
                    False,
                    "No SMS agents found in database",
                    {"Total SMS Agents": 0}
                )
                return False
            
            # Analyze SMS agents with selected holidays
            agents_with_holidays = []
            agents_without_holidays = []
            
            for agent in sms_agents:
                agent_info = {
                    "id": agent.get("id"),
                    "name": agent.get("agent_name"),
                    "mode": agent.get("mode"),
                    "selected_holidays": agent.get("selected_holidays", []),
                    "holiday_count": len(agent.get("selected_holidays", []))
                }
                
                if agent.get("selected_holidays") and len(agent.get("selected_holidays", [])) > 0:
                    agents_with_holidays.append(agent_info)
                else:
                    agents_without_holidays.append(agent_info)
            
            # Log findings
            if agents_with_holidays:
                self.log_debug_result(
                    "SMS Agents with Selected Holidays",
                    True,
                    f"Found {len(agents_with_holidays)} SMS agents with selected holidays",
                    {
                        "Total SMS Agents": len(sms_agents),
                        "Agents with Holidays": len(agents_with_holidays),
                        "Agents without Holidays": len(agents_without_holidays),
                        "Sample Agent with Holidays": agents_with_holidays[0] if agents_with_holidays else "None"
                    }
                )
                
                # Show detailed structure of first agent with holidays
                sample_agent = agents_with_holidays[0]
                full_agent = next(a for a in sms_agents if a.get("id") == sample_agent["id"])
                
                print("📋 DETAILED STRUCTURE OF SMS AGENT WITH HOLIDAYS:")
                print(f"   Agent ID: {full_agent.get('id')}")
                print(f"   Agent Name: {full_agent.get('agent_name')}")
                print(f"   Agent Type: {full_agent.get('agent_type')}")
                print(f"   Mode: {full_agent.get('mode')}")
                print(f"   Selected Holidays: {full_agent.get('selected_holidays')}")
                print(f"   Holiday Count: {len(full_agent.get('selected_holidays', []))}")
                print()
                
                return True
            else:
                self.log_debug_result(
                    "SMS Agents with Selected Holidays",
                    False,
                    f"No SMS agents found with selected holidays (found {len(sms_agents)} total SMS agents)",
                    {
                        "Total SMS Agents": len(sms_agents),
                        "Agents with Holidays": 0,
                        "Sample Agent Structure": sms_agents[0] if sms_agents else "None"
                    }
                )
                return False
                
        except Exception as e:
            self.log_debug_result(
                "SMS Agent Data Structure",
                False,
                f"Error analyzing SMS agent data structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def debug_holiday_data(self):
        """Debug 2: Test Holiday Data"""
        print("🔍 DEBUG 2: Holiday Data Analysis")
        print("=" * 60)
        
        try:
            # Get all holidays
            holidays = await self.db.holidays.find({}).to_list(length=100)
            
            if not holidays:
                self.log_debug_result(
                    "Holiday Data",
                    False,
                    "No holidays found in database",
                    {"Total Holidays": 0}
                )
                return False
            
            # Analyze holiday structure
            current_date = datetime.now().date()
            upcoming_holidays = []
            past_holidays = []
            
            for holiday in holidays:
                holiday_date_str = holiday.get("date")
                if holiday_date_str:
                    try:
                        holiday_date = datetime.strptime(holiday_date_str, "%Y-%m-%d").date()
                        holiday_info = {
                            "id": holiday.get("id"),
                            "name": holiday.get("name"),
                            "date": holiday_date_str,
                            "days_from_now": (holiday_date - current_date).days,
                            "is_enabled": holiday.get("is_enabled", True)
                        }
                        
                        if holiday_date >= current_date:
                            upcoming_holidays.append(holiday_info)
                        else:
                            past_holidays.append(holiday_info)
                    except ValueError:
                        print(f"   ⚠️  Invalid date format for holiday: {holiday.get('name')} - {holiday_date_str}")
            
            # Sort upcoming holidays by date
            upcoming_holidays.sort(key=lambda x: x["days_from_now"])
            
            self.log_debug_result(
                "Holiday Data Structure",
                True,
                f"Found {len(holidays)} total holidays in database",
                {
                    "Total Holidays": len(holidays),
                    "Upcoming Holidays": len(upcoming_holidays),
                    "Past Holidays": len(past_holidays),
                    "Next Upcoming Holiday": upcoming_holidays[0] if upcoming_holidays else "None",
                    "Sample Holiday Structure": holidays[0] if holidays else "None"
                }
            )
            
            # Show upcoming holidays
            if upcoming_holidays:
                print("📅 UPCOMING HOLIDAYS (Next 5):")
                for i, holiday in enumerate(upcoming_holidays[:5]):
                    print(f"   {i+1}. {holiday['name']} - {holiday['date']} ({holiday['days_from_now']} days away)")
                print()
            
            return len(holidays) > 0
                
        except Exception as e:
            self.log_debug_result(
                "Holiday Data",
                False,
                f"Error analyzing holiday data: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def debug_frontend_holiday_calculation(self):
        """Debug 3: Simulate Frontend Holiday Calculation Logic"""
        print("🔍 DEBUG 3: Frontend Holiday Calculation Simulation")
        print("=" * 60)
        
        try:
            # Find SMS agents with holidays
            sms_agents = await self.db.ai_agents.find({
                "agent_type": "sms_agent",
                "selected_holidays": {"$exists": True, "$ne": []}
            }).to_list(length=10)
            
            if not sms_agents:
                self.log_debug_result(
                    "Frontend Holiday Calculation",
                    False,
                    "No SMS agents with selected holidays found for calculation test",
                    {"SMS Agents with Holidays": 0}
                )
                return False
            
            # Get all holidays for reference
            all_holidays = await self.db.holidays.find({}).to_list(length=100)
            holidays_dict = {h["id"]: h for h in all_holidays}
            
            # Test holiday calculation for each agent
            calculation_results = []
            
            for agent in sms_agents:
                agent_id = agent.get("id")
                agent_name = agent.get("agent_name")
                selected_holiday_ids = agent.get("selected_holidays", [])
                
                # Simulate getNextScheduledHoliday logic
                agent_holidays = []
                for holiday_id in selected_holiday_ids:
                    if holiday_id in holidays_dict:
                        holiday = holidays_dict[holiday_id]
                        holiday_date_str = holiday.get("date")
                        if holiday_date_str:
                            try:
                                holiday_date = datetime.strptime(holiday_date_str, "%Y-%m-%d").date()
                                current_date = datetime.now().date()
                                
                                if holiday_date >= current_date:
                                    days_away = (holiday_date - current_date).days
                                    agent_holidays.append({
                                        "id": holiday_id,
                                        "name": holiday.get("name"),
                                        "date": holiday_date_str,
                                        "days_away": days_away
                                    })
                            except ValueError:
                                print(f"   ⚠️  Invalid date format: {holiday_date_str}")
                
                # Sort by days away (closest first)
                agent_holidays.sort(key=lambda x: x["days_away"])
                
                next_holiday = agent_holidays[0] if agent_holidays else None
                
                result = {
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "selected_holiday_ids": selected_holiday_ids,
                    "valid_upcoming_holidays": len(agent_holidays),
                    "next_holiday": next_holiday,
                    "calculation_success": next_holiday is not None
                }
                
                calculation_results.append(result)
            
            # Log results
            successful_calculations = sum(1 for r in calculation_results if r["calculation_success"])
            
            self.log_debug_result(
                "Frontend Holiday Calculation Simulation",
                successful_calculations > 0,
                f"Holiday calculation test completed for {len(calculation_results)} SMS agents",
                {
                    "Total Agents Tested": len(calculation_results),
                    "Successful Calculations": successful_calculations,
                    "Failed Calculations": len(calculation_results) - successful_calculations,
                    "Sample Successful Result": next((r for r in calculation_results if r["calculation_success"]), "None")
                }
            )
            
            # Show detailed results
            print("🧮 HOLIDAY CALCULATION RESULTS:")
            for result in calculation_results:
                status = "✅" if result["calculation_success"] else "❌"
                print(f"   {status} Agent: {result['agent_name']}")
                print(f"      Selected Holiday IDs: {result['selected_holiday_ids']}")
                print(f"      Valid Upcoming Holidays: {result['valid_upcoming_holidays']}")
                if result["next_holiday"]:
                    print(f"      Next Holiday: {result['next_holiday']['name']} ({result['next_holiday']['days_away']} days away)")
                else:
                    print(f"      Next Holiday: None found")
                print()
            
            return successful_calculations > 0
                
        except Exception as e:
            self.log_debug_result(
                "Frontend Holiday Calculation",
                False,
                f"Error simulating frontend holiday calculation: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def debug_agent_display_condition(self):
        """Debug 4: Verify Agent Display Condition"""
        print("🔍 DEBUG 4: Agent Display Condition Verification")
        print("=" * 60)
        
        try:
            # Find all SMS agents
            all_sms_agents = await self.db.ai_agents.find({
                "agent_type": "sms_agent"
            }).to_list(length=100)
            
            if not all_sms_agents:
                self.log_debug_result(
                    "Agent Display Condition",
                    False,
                    "No SMS agents found for display condition test",
                    {"Total SMS Agents": 0}
                )
                return False
            
            # Test display condition: agent.mode === 'recurring' && agent.selected_holidays && agent.selected_holidays.length > 0
            display_condition_results = []
            
            for agent in all_sms_agents:
                agent_id = agent.get("id")
                agent_name = agent.get("agent_name")
                agent_type = agent.get("agent_type")
                mode = agent.get("mode")
                selected_holidays = agent.get("selected_holidays", [])
                
                # Check each condition
                condition_checks = {
                    "agent_type_is_sms": agent_type == "sms_agent",
                    "mode_is_recurring": mode == "recurring",
                    "has_selected_holidays_field": "selected_holidays" in agent,
                    "selected_holidays_not_empty": len(selected_holidays) > 0,
                    "selected_holidays_is_array": isinstance(selected_holidays, list)
                }
                
                # Overall display condition
                should_display = (
                    condition_checks["agent_type_is_sms"] and
                    condition_checks["mode_is_recurring"] and
                    condition_checks["has_selected_holidays_field"] and
                    condition_checks["selected_holidays_not_empty"]
                )
                
                result = {
                    "agent_id": agent_id,
                    "agent_name": agent_name,
                    "agent_type": agent_type,
                    "mode": mode,
                    "selected_holidays": selected_holidays,
                    "condition_checks": condition_checks,
                    "should_display": should_display
                }
                
                display_condition_results.append(result)
            
            # Count results
            should_display_count = sum(1 for r in display_condition_results if r["should_display"])
            should_not_display_count = len(display_condition_results) - should_display_count
            
            self.log_debug_result(
                "Agent Display Condition Verification",
                should_display_count > 0,
                f"Display condition analysis completed for {len(display_condition_results)} SMS agents",
                {
                    "Total SMS Agents": len(display_condition_results),
                    "Should Display (with holidays)": should_display_count,
                    "Should Not Display": should_not_display_count,
                    "Display Condition": "mode === 'recurring' && selected_holidays.length > 0"
                }
            )
            
            # Show detailed breakdown
            print("📊 DISPLAY CONDITION BREAKDOWN:")
            print(f"   Total SMS Agents: {len(display_condition_results)}")
            print(f"   Should Display: {should_display_count}")
            print(f"   Should Not Display: {should_not_display_count}")
            print()
            
            # Show agents that should display
            if should_display_count > 0:
                print("✅ AGENTS THAT SHOULD DISPLAY HOLIDAYS:")
                for result in display_condition_results:
                    if result["should_display"]:
                        print(f"   • {result['agent_name']} (ID: {result['agent_id']})")
                        print(f"     Mode: {result['mode']}, Holidays: {len(result['selected_holidays'])}")
                print()
            
            # Show agents that should not display and why
            if should_not_display_count > 0:
                print("❌ AGENTS THAT SHOULD NOT DISPLAY HOLIDAYS (and why):")
                for result in display_condition_results:
                    if not result["should_display"]:
                        print(f"   • {result['agent_name']} (ID: {result['agent_id']})")
                        print(f"     Mode: {result['mode']}")
                        failed_conditions = [k for k, v in result["condition_checks"].items() if not v]
                        print(f"     Failed Conditions: {', '.join(failed_conditions)}")
                print()
            
            return should_display_count > 0
                
        except Exception as e:
            self.log_debug_result(
                "Agent Display Condition",
                False,
                f"Error verifying agent display condition: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def debug_api_holiday_access(self):
        """Debug 5: Test Holiday Data API Access"""
        print("🔍 DEBUG 5: Holiday Data API Access Test")
        print("=" * 60)
        
        try:
            # Test direct database access to holidays (simulating API call)
            holidays = await self.db.holidays.find({}).to_list(length=100)
            
            if not holidays:
                self.log_debug_result(
                    "Holiday API Access",
                    False,
                    "No holidays accessible via database query",
                    {"Holidays Found": 0}
                )
                return False
            
            # Test holiday ID format and accessibility
            holiday_id_formats = {}
            valid_holidays = []
            
            for holiday in holidays:
                holiday_id = holiday.get("id")
                holiday_name = holiday.get("name")
                holiday_date = holiday.get("date")
                
                if holiday_id:
                    # Analyze ID format
                    if holiday_id.startswith("holiday_"):
                        id_format = "prefixed"
                    elif len(holiday_id) == 36 and "-" in holiday_id:
                        id_format = "uuid"
                    else:
                        id_format = "other"
                    
                    holiday_id_formats[id_format] = holiday_id_formats.get(id_format, 0) + 1
                    
                    valid_holidays.append({
                        "id": holiday_id,
                        "name": holiday_name,
                        "date": holiday_date,
                        "id_format": id_format
                    })
            
            self.log_debug_result(
                "Holiday API Access",
                len(valid_holidays) > 0,
                f"Holiday data accessible via API simulation",
                {
                    "Total Holidays": len(holidays),
                    "Valid Holidays": len(valid_holidays),
                    "ID Formats": holiday_id_formats,
                    "Sample Holiday": valid_holidays[0] if valid_holidays else "None"
                }
            )
            
            # Show holiday ID formats
            print("🔑 HOLIDAY ID FORMATS:")
            for format_type, count in holiday_id_formats.items():
                print(f"   {format_type}: {count} holidays")
            print()
            
            return len(valid_holidays) > 0
                
        except Exception as e:
            self.log_debug_result(
                "Holiday API Access",
                False,
                f"Error testing holiday API access: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_comprehensive_debug(self):
        """Run comprehensive SMS dashboard debug analysis"""
        print("🔍 STARTING SMS DASHBOARD 'NO DAYS SELECTED' DEBUG")
        print("=" * 80)
        print("Debugging why SMS agents show 'No days selected' instead of holiday info")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all debug tests
            debug_results = []
            
            # Debug 1: SMS Agent Data Structure
            debug_results.append(await self.debug_sms_agent_data_structure())
            
            # Debug 2: Holiday Data
            debug_results.append(await self.debug_holiday_data())
            
            # Debug 3: Frontend Holiday Calculation
            debug_results.append(await self.debug_frontend_holiday_calculation())
            
            # Debug 4: Agent Display Condition
            debug_results.append(await self.debug_agent_display_condition())
            
            # Debug 5: Holiday API Access
            debug_results.append(await self.debug_api_holiday_access())
            
            # Summary
            print("=" * 80)
            print("🎯 SMS DASHBOARD DEBUG SUMMARY")
            print("=" * 80)
            
            passed_checks = sum(debug_results)
            total_checks = len(debug_results)
            
            print(f"Debug Checks Passed: {passed_checks}/{total_checks}")
            print()
            
            # Detailed results
            for result in self.debug_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            
            # Root cause analysis
            print("🔍 ROOT CAUSE ANALYSIS:")
            
            if passed_checks == 0:
                print("❌ CRITICAL: No SMS agents with holidays found - this explains 'No days selected'")
                print("   • Check if SMS agents are being created with selected_holidays field")
                print("   • Verify holiday selection is working in the frontend form")
            elif passed_checks == 1:
                print("⚠️  SMS agents exist but holiday data or calculation is failing")
                print("   • SMS agents found but holiday processing has issues")
            elif passed_checks <= 3:
                print("⚠️  Partial functionality - some components working, others failing")
                print("   • Data exists but frontend calculation logic may have issues")
            else:
                print("✅ Most components working - issue may be in frontend display logic")
                print("   • Backend data appears correct")
                print("   • Check frontend getNextScheduledHoliday function implementation")
                print("   • Verify frontend is calling the correct API endpoints")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during debug analysis: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main debug function"""
    debugger = SMSDashboardDebugger()
    await debugger.run_comprehensive_debug()

if __name__ == "__main__":
    asyncio.run(main())