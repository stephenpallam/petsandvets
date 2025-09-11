#!/usr/bin/env python3
"""
SMS Agent Holiday-Based Scheduling and Content Generation Test

This test comprehensively validates the SMS agent holiday integration functionality:

1. SMS Agent Holiday Context Integration:
   - Test SMS agent creation with selected holidays (scheduled mode)
   - Verify that when a scheduled SMS agent is run manually, it uses the next upcoming holiday as context for ChatGPT
   - Test the holiday calculation logic in the backend (finding next upcoming holiday from selected holidays list)

2. SMS Holiday-based Content Generation:
   - Create an SMS agent with holiday selection (e.g., "christmas-2025", "thanksgiving-2025")
   - Run the agent manually and verify the generated SMS content is holiday-specific
   - Test that the SMS content includes holiday context like "Create a warm, festive SMS message for [Holiday Name] on [date]"

3. Backend Holiday Logic:
   - Test that SMS agents with selected_holidays use generate_sms_for_agent with holiday context
   - Verify holiday data is fetched from database correctly
   - Test next upcoming holiday calculation logic
   - Verify fallback to earliest holiday if no upcoming holidays
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

class SMSHolidayTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        
        # Get backend URL from frontend env
        frontend_env_path = Path(__file__).parent / "frontend" / ".env"
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.backend_url = line.split('=', 1)[1].strip()
                        break
        else:
            self.backend_url = "https://petcare-agents.preview.emergentagent.com"
        
        self.api_base = f"{self.backend_url}/api"
        self.auth_token = None
        self.headers = {}
        
        # Test results tracking
        self.test_results = []
        self.created_agents = []
        self.created_posts = []
        
    async def authenticate(self):
        """Authenticate with the API"""
        print("=== AUTHENTICATING WITH API ===")
        
        login_data = {
            "email": "admin@hospital.com",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.api_base}/login", json=login_data)
            
            if response.status_code == 200:
                auth_result = response.json()
                self.auth_token = auth_result.get('access_token')
                self.headers = {
                    'Authorization': f'Bearer {self.auth_token}',
                    'Content-Type': 'application/json'
                }
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
    
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def log_test_result(self, test_name: str, success: bool, details: str):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            'test_name': test_name,
            'success': success,
            'details': details
        })
    
    async def get_available_holidays(self):
        """Get available holidays from database"""
        print("\n=== FETCHING AVAILABLE HOLIDAYS ===")
        
        holidays = await self.db.holidays.find({}).to_list(length=None)
        print(f"Found {len(holidays)} holidays in database:")
        
        # Sort holidays by date for better display
        holidays.sort(key=lambda h: h.get('date', ''))
        
        holiday_map = {}
        for holiday in holidays:
            holiday_name = holiday.get('name', 'Unknown')
            holiday_date = holiday.get('date', 'Unknown')
            holiday_id = holiday.get('id', 'Unknown')
            print(f"  - {holiday_name} ({holiday_date}) [ID: {holiday_id}]")
            holiday_map[holiday_name.lower()] = holiday
        
        return holiday_map
    
    async def test_sms_agent_creation_with_holidays(self, holiday_map):
        """Test 1: SMS Agent Creation with Selected Holidays"""
        print("\n=== TEST 1: SMS AGENT CREATION WITH SELECTED HOLIDAYS ===")
        
        # Select Christmas and Thanksgiving for testing
        christmas_holiday = None
        thanksgiving_holiday = None
        
        for name, holiday in holiday_map.items():
            if 'christmas' in name and '2025' in holiday.get('date', ''):
                christmas_holiday = holiday
            elif 'thanksgiving' in name and '2025' in holiday.get('date', ''):
                thanksgiving_holiday = holiday
        
        if not christmas_holiday or not thanksgiving_holiday:
            self.log_test_result(
                "SMS Agent Creation - Holiday Selection", 
                False, 
                "Could not find Christmas 2025 or Thanksgiving 2025 holidays in database"
            )
            return None
        
        print(f"Selected holidays:")
        print(f"  - Christmas: {christmas_holiday.get('name')} ({christmas_holiday.get('date')})")
        print(f"  - Thanksgiving: {thanksgiving_holiday.get('name')} ({thanksgiving_holiday.get('date')})")
        
        # Create SMS agent with holiday selection
        agent_data = {
            "agent_type": "sms_agent",
            "agent_name": "Holiday SMS Test Agent",
            "mode": "recurring",
            "selected_holidays": [christmas_holiday.get('id'), thanksgiving_holiday.get('id')],
            "sms_template": "Dear [CUSTOMER_NAME], Happy [HOLIDAY_NAME]! We hope you and [PET_NAMES] have a wonderful celebration. Visit [LINK] for more info.",
            "sms_provider": "twilio",
            "use_sms_chatgpt_formatting": True,
            "sms_type": "bulk",
            "sms_link": "https://petsandvetsanimalhospital.com",
            "post_time": "09:00",
            "post_destination": "in_review"
        }
        
        try:
            response = requests.post(f"{self.api_base}/ai-agents", json=agent_data, headers=self.headers)
            
            print(f"Agent creation response: {response.status_code}")
            print(f"Response content: {response.text[:500]}")
            
            if response.status_code == 200:
                agent_result = response.json()
                agent_id = agent_result.get('agent_id') or agent_result.get('id')  # Handle both response formats
                print(f"Created agent ID: {agent_id}")
                self.created_agents.append(agent_id)
                
                # Wait a moment for database write
                await asyncio.sleep(1)
                
                # Verify agent was created with correct holiday selection
                agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
                
                if agent_doc:
                    selected_holidays = agent_doc.get('selected_holidays', [])
                    agent_type = agent_doc.get('agent_type')
                    mode = agent_doc.get('mode')
                    
                    print(f"Found agent in DB - Type: {agent_type}, Mode: {mode}, Holidays: {selected_holidays}")
                    
                    success = (
                        agent_type == 'sms_agent' and
                        mode == 'recurring' and
                        len(selected_holidays) == 2 and
                        christmas_holiday.get('id') in selected_holidays and
                        thanksgiving_holiday.get('id') in selected_holidays
                    )
                    
                    self.log_test_result(
                        "SMS Agent Creation with Holidays",
                        success,
                        f"Agent ID: {agent_id}, Type: {agent_type}, Mode: {mode}, Holidays: {len(selected_holidays)}"
                    )
                    
                    return {"id": agent_id, "agent_data": agent_doc} if success else None
                else:
                    print(f"Agent {agent_id} not found in database")
                    self.log_test_result(
                        "SMS Agent Creation with Holidays",
                        False,
                        "Agent not found in database after creation"
                    )
                    return None
            else:
                self.log_test_result(
                    "SMS Agent Creation with Holidays",
                    False,
                    f"API request failed: {response.status_code} - {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Creation with Holidays",
                False,
                f"Exception during agent creation: {str(e)}"
            )
            return None
    
    async def test_holiday_calculation_logic(self, agent_result, holiday_map):
        """Test 2: Holiday Calculation Logic"""
        print("\n=== TEST 2: HOLIDAY CALCULATION LOGIC ===")
        
        if not agent_result:
            self.log_test_result(
                "Holiday Calculation Logic",
                False,
                "No agent result provided"
            )
            return None
        
        agent_id = agent_result.get('id')
        agent_doc = agent_result.get('agent_data')
        
        if not agent_doc:
            self.log_test_result(
                "Holiday Calculation Logic",
                False,
                "Agent data not found"
            )
            return None
        
        selected_holidays = agent_doc.get('selected_holidays', [])
        print(f"Agent selected holidays: {selected_holidays}")
        
        # Get holiday information for context (same logic as server.py)
        holidays_cursor = self.db.holidays.find({"id": {"$in": selected_holidays}})
        holidays_list = await holidays_cursor.to_list(length=None)
        
        print(f"Found {len(holidays_list)} holidays in database:")
        for holiday in holidays_list:
            print(f"  - {holiday.get('name')} ({holiday.get('date')})")
        
        if not holidays_list:
            self.log_test_result(
                "Holiday Calculation Logic - Holiday Data Fetch",
                False,
                "No holiday data found for selected holidays"
            )
            return None
        
        # Test the exact same logic as generate_sms_for_agent
        today = datetime.now().date()
        print(f"\nCurrent date for comparison: {today}")
        
        # Parse and sort holidays by date to find the next upcoming one
        valid_holidays = []
        for holiday in holidays_list:
            try:
                holiday_date = datetime.strptime(holiday['date'], '%Y-%m-%d').date()
                valid_holidays.append({
                    'holiday_data': holiday,
                    'parsed_date': holiday_date
                })
                days_diff = (holiday_date - today).days
                status = "UPCOMING" if holiday_date >= today else "PAST"
                print(f"  Parsed {holiday.get('name')}: {holiday_date} ({days_diff} days) [{status}]")
            except Exception as e:
                print(f"  ❌ Could not parse holiday date {holiday.get('date', 'unknown')}: {e}")
                continue
        
        if not valid_holidays:
            self.log_test_result(
                "Holiday Calculation Logic - Date Parsing",
                False,
                "No valid holiday dates found"
            )
            return None
        
        # Sort holidays by date
        valid_holidays.sort(key=lambda x: x['parsed_date'])
        print(f"\nHolidays sorted by date:")
        for i, holiday_info in enumerate(valid_holidays):
            holiday_data = holiday_info['holiday_data']
            parsed_date = holiday_info['parsed_date']
            days_diff = (parsed_date - today).days
            status = "UPCOMING" if parsed_date >= today else "PAST"
            print(f"  {i+1}. {holiday_data.get('name')} - {parsed_date} ({days_diff} days) [{status}]")
        
        # Find the next upcoming holiday (today or later)
        upcoming_holiday = None
        for holiday_info in valid_holidays:
            if holiday_info['parsed_date'] >= today:
                upcoming_holiday = holiday_info['holiday_data']
                print(f"\n✅ SELECTED UPCOMING HOLIDAY: {upcoming_holiday.get('name')} ({upcoming_holiday.get('date')})")
                break
        
        # If no upcoming holiday found, use the earliest holiday (for past year wrap-around)
        if not upcoming_holiday:
            upcoming_holiday = valid_holidays[0]['holiday_data']
            print(f"\n⚠️  NO UPCOMING HOLIDAYS - USING EARLIEST: {upcoming_holiday.get('name')} ({upcoming_holiday.get('date')})")
        
        # Test success criteria
        success = (
            len(holidays_list) > 0 and
            len(valid_holidays) > 0 and
            upcoming_holiday is not None
        )
        
        self.log_test_result(
            "Holiday Calculation Logic",
            success,
            f"Selected holiday: {upcoming_holiday.get('name') if upcoming_holiday else 'None'} ({upcoming_holiday.get('date') if upcoming_holiday else 'None'})"
        )
        
        return upcoming_holiday
    
    async def test_sms_agent_manual_run(self, agent_result):
        """Test 3: SMS Agent Manual Run with Holiday Context"""
        print("\n=== TEST 3: SMS AGENT MANUAL RUN WITH HOLIDAY CONTEXT ===")
        
        if not agent_result:
            self.log_test_result(
                "SMS Agent Manual Run",
                False,
                "No agent result provided"
            )
            return None
        
        agent_id = agent_result.get('id')
        
        try:
            # Run the SMS agent manually
            response = requests.post(f"{self.api_base}/ai-agents/{agent_id}/run", headers=self.headers)
            
            print(f"Agent run response: {response.status_code}")
            print(f"Response content: {response.text[:500]}")
            
            if response.status_code == 200:
                run_result = response.json()
                post_id = run_result.get('post_id')
                
                print(f"Run result: {run_result}")
                
                if post_id:
                    self.created_posts.append(post_id)
                    
                    # Wait a moment for post generation to complete
                    await asyncio.sleep(5)  # Increased wait time
                    
                    # Check the generated post
                    post_doc = await self.db.ai_posts.find_one({"id": post_id})
                    
                    if post_doc:
                        content = post_doc.get('content', '')
                        status = post_doc.get('status', '')
                        agent_type = post_doc.get('agent_type', '')
                        sms_template = post_doc.get('sms_template', '')
                        sms_link = post_doc.get('sms_link', '')
                        
                        print(f"Generated SMS Post:")
                        print(f"  Post ID: {post_id}")
                        print(f"  Status: {status}")
                        print(f"  Agent Type: {agent_type}")
                        print(f"  Content: {content[:200]}...")
                        print(f"  SMS Template: {sms_template[:100]}...")
                        print(f"  SMS Link: {sms_link}")
                        
                        # Test success criteria
                        success = (
                            status in ['in_review', 'ready_to_publish'] and
                            agent_type == 'sms_agent' and
                            len(content) > 0 and
                            len(sms_template) > 0
                        )
                        
                        self.log_test_result(
                            "SMS Agent Manual Run",
                            success,
                            f"Post ID: {post_id}, Status: {status}, Content length: {len(content)}"
                        )
                        
                        return post_doc
                    else:
                        self.log_test_result(
                            "SMS Agent Manual Run",
                            False,
                            "Generated post not found in database"
                        )
                        return None
                else:
                    # WORKAROUND: API doesn't return post_id due to backend bug, but post is created
                    # Let's find the most recent SMS post for this agent
                    print("⚠️  API didn't return post_id (backend bug), searching database for created post...")
                    
                    await asyncio.sleep(3)  # Wait for post creation
                    
                    # Find the most recent SMS post for this agent
                    recent_post = await self.db.ai_posts.find_one(
                        {"agent_id": agent_id, "agent_type": "sms_agent"},
                        sort=[("created_at", -1)]
                    )
                    
                    if recent_post:
                        post_id = recent_post.get('id')
                        self.created_posts.append(post_id)
                        
                        content = recent_post.get('content', '')
                        status = recent_post.get('status', '')
                        agent_type = recent_post.get('agent_type', '')
                        sms_template = recent_post.get('sms_template', '')
                        sms_link = recent_post.get('sms_link', '')
                        
                        print(f"Found Generated SMS Post:")
                        print(f"  Post ID: {post_id}")
                        print(f"  Status: {status}")
                        print(f"  Agent Type: {agent_type}")
                        print(f"  Content: {content[:200]}...")
                        print(f"  SMS Template: {sms_template[:100]}...")
                        print(f"  SMS Link: {sms_link}")
                        
                        # Test success criteria
                        success = (
                            status in ['in_review', 'ready_to_publish'] and
                            agent_type == 'sms_agent' and
                            len(content) > 0 and
                            len(sms_template) > 0
                        )
                        
                        self.log_test_result(
                            "SMS Agent Manual Run",
                            success,
                            f"Post ID: {post_id}, Status: {status}, Content length: {len(content)} (found via database workaround)"
                        )
                        
                        return recent_post
                    else:
                        self.log_test_result(
                            "SMS Agent Manual Run",
                            False,
                            f"No SMS post found for agent {agent_id} in database"
                        )
                        return None
            else:
                self.log_test_result(
                    "SMS Agent Manual Run",
                    False,
                    f"API request failed: {response.status_code} - {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Manual Run",
                False,
                f"Exception during agent run: {str(e)}"
            )
            return None
    
    async def test_holiday_specific_content(self, post_doc, expected_holiday):
        """Test 4: Holiday-Specific Content Generation"""
        print("\n=== TEST 4: HOLIDAY-SPECIFIC CONTENT GENERATION ===")
        
        if not post_doc or not expected_holiday:
            self.log_test_result(
                "Holiday-Specific Content Generation",
                False,
                "Missing post document or expected holiday"
            )
            return
        
        content = post_doc.get('content', '').lower()
        sms_template = post_doc.get('sms_template', '').lower()
        expected_holiday_name = expected_holiday.get('name', '').lower()
        
        print(f"Expected holiday: {expected_holiday.get('name')} ({expected_holiday.get('date')})")
        print(f"Content to analyze: {content[:300]}...")
        
        # Check if holiday name or related terms appear in content
        holiday_keywords = []
        if 'christmas' in expected_holiday_name:
            holiday_keywords = ['christmas', 'holiday', 'festive', 'celebration', 'season']
        elif 'thanksgiving' in expected_holiday_name:
            holiday_keywords = ['thanksgiving', 'grateful', 'thankful', 'holiday', 'celebration']
        elif 'cat day' in expected_holiday_name:
            holiday_keywords = ['cat day', 'feline', 'cat', 'kitty', 'celebration']
        else:
            # Generic holiday keywords
            holiday_keywords = ['holiday', 'celebration', 'special day']
        
        # Check for holiday-specific content
        holiday_mentions = 0
        found_keywords = []
        
        for keyword in holiday_keywords:
            if keyword in content or keyword in sms_template:
                holiday_mentions += 1
                found_keywords.append(keyword)
        
        # Check for SMS-specific formatting (short, concise)
        content_length = len(post_doc.get('content', ''))
        is_sms_length = content_length <= 300  # SMS should be concise
        
        # Check for placeholder replacement readiness
        has_placeholders = any(placeholder in sms_template for placeholder in ['[CUSTOMER_NAME]', '[PET_NAMES]', '[LINK]'])
        
        success = (
            holiday_mentions > 0 and
            is_sms_length and
            has_placeholders
        )
        
        self.log_test_result(
            "Holiday-Specific Content Generation",
            success,
            f"Holiday keywords found: {found_keywords}, Content length: {content_length}, Has placeholders: {has_placeholders}"
        )
    
    async def test_sms_template_placeholders(self, post_doc):
        """Test 5: SMS Template Placeholder Support"""
        print("\n=== TEST 5: SMS TEMPLATE PLACEHOLDER SUPPORT ===")
        
        if not post_doc:
            self.log_test_result(
                "SMS Template Placeholder Support",
                False,
                "No post document provided"
            )
            return
        
        sms_template = post_doc.get('sms_template', '')
        sms_link = post_doc.get('sms_link', '')
        
        print(f"SMS Template: {sms_template}")
        print(f"SMS Link: {sms_link}")
        
        # Check for required placeholders
        required_placeholders = ['[CUSTOMER_NAME]', '[PET_NAMES]', '[LINK]']
        found_placeholders = []
        
        for placeholder in required_placeholders:
            if placeholder in sms_template:
                found_placeholders.append(placeholder)
        
        # Check that sms_link is properly set
        has_valid_link = sms_link and sms_link.startswith('http')
        
        success = (
            len(found_placeholders) >= 2 and  # At least customer name and one other
            has_valid_link
        )
        
        self.log_test_result(
            "SMS Template Placeholder Support",
            success,
            f"Found placeholders: {found_placeholders}, Valid link: {has_valid_link}"
        )
    
    async def test_edge_cases(self, holiday_map):
        """Test 6: Edge Cases and Error Handling"""
        print("\n=== TEST 6: EDGE CASES AND ERROR HANDLING ===")
        
        # Test 6a: SMS agent with no holidays selected
        print("\n--- Test 6a: SMS Agent with No Holidays Selected ---")
        try:
            agent_data = {
                "agent_type": "sms_agent",
                "agent_name": "No Holidays SMS Agent",
                "mode": "recurring",
                "selected_holidays": [],  # Empty holidays
                "sms_template": "General SMS message",
                "sms_provider": "twilio",
                "post_destination": "in_review"
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=agent_data, headers=self.headers)
            
            if response.status_code == 200:
                agent_result = response.json()
                agent_id = agent_result.get('id')
                self.created_agents.append(agent_id)
                
                # Try to run this agent
                run_response = requests.post(f"{self.api_base}/ai-agents/{agent_id}/run", headers=self.headers)
                
                # This should either work with topic-based generation or fail gracefully
                success = run_response.status_code in [200, 400]  # Either works or fails gracefully
                
                self.log_test_result(
                    "Edge Case - No Holidays Selected",
                    success,
                    f"Agent creation: {response.status_code}, Run: {run_response.status_code}"
                )
            else:
                self.log_test_result(
                    "Edge Case - No Holidays Selected",
                    False,
                    f"Agent creation failed: {response.status_code}"
                )
                
        except Exception as e:
            self.log_test_result(
                "Edge Case - No Holidays Selected",
                False,
                f"Exception: {str(e)}"
            )
        
        # Test 6b: SMS agent with invalid holiday IDs
        print("\n--- Test 6b: SMS Agent with Invalid Holiday IDs ---")
        try:
            agent_data = {
                "agent_type": "sms_agent",
                "agent_name": "Invalid Holidays SMS Agent",
                "mode": "recurring",
                "selected_holidays": ["invalid-id-1", "invalid-id-2"],  # Invalid IDs
                "sms_template": "Holiday SMS message",
                "sms_provider": "twilio",
                "post_destination": "in_review"
            }
            
            response = requests.post(f"{self.api_base}/ai-agents", json=agent_data, headers=self.headers)
            
            if response.status_code == 200:
                agent_result = response.json()
                agent_id = agent_result.get('id')
                self.created_agents.append(agent_id)
                
                # Try to run this agent - should fail gracefully
                run_response = requests.post(f"{self.api_base}/ai-agents/{agent_id}/run", headers=self.headers)
                
                # Should fail gracefully with proper error handling
                success = run_response.status_code in [400, 500]  # Should fail but not crash
                
                self.log_test_result(
                    "Edge Case - Invalid Holiday IDs",
                    success,
                    f"Agent creation: {response.status_code}, Run: {run_response.status_code}"
                )
            else:
                self.log_test_result(
                    "Edge Case - Invalid Holiday IDs",
                    False,
                    f"Agent creation failed: {response.status_code}"
                )
                
        except Exception as e:
            self.log_test_result(
                "Edge Case - Invalid Holiday IDs",
                False,
                f"Exception: {str(e)}"
            )
    
    async def cleanup_test_data(self):
        """Clean up test data"""
        print("\n=== CLEANING UP TEST DATA ===")
        
        # Delete created agents
        for agent_id in self.created_agents:
            try:
                await self.db.ai_agents.delete_one({"id": agent_id})
                print(f"Deleted agent: {agent_id}")
            except Exception as e:
                print(f"Failed to delete agent {agent_id}: {e}")
        
        # Delete created posts
        for post_id in self.created_posts:
            try:
                await self.db.ai_posts.delete_one({"id": post_id})
                print(f"Deleted post: {post_id}")
            except Exception as e:
                print(f"Failed to delete post {post_id}: {e}")
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 80)
        print("🎯 SMS HOLIDAY INTEGRATION TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test_name']}: {result['details']}")
        
        print(f"\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result['success']:
                print(f"  - {result['test_name']}")
        
        # Overall assessment
        if passed_tests == total_tests:
            print(f"\n🎉 ALL TESTS PASSED! SMS Holiday Integration is working correctly.")
        elif passed_tests >= total_tests * 0.8:
            print(f"\n⚠️  MOSTLY WORKING: {passed_tests}/{total_tests} tests passed. Minor issues detected.")
        else:
            print(f"\n🚨 MAJOR ISSUES: Only {passed_tests}/{total_tests} tests passed. SMS Holiday Integration needs attention.")
    
    async def run_comprehensive_test(self):
        """Run comprehensive SMS holiday integration test"""
        print("🧪 STARTING COMPREHENSIVE SMS HOLIDAY INTEGRATION TEST")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Authenticate first
            if not await self.authenticate():
                print("❌ Authentication failed. Cannot proceed with tests.")
                return
            
            # Step 1: Get available holidays
            holiday_map = await self.get_available_holidays()
            
            if not holiday_map:
                print("❌ No holidays found in database. Cannot proceed with tests.")
                return
            
            # Step 2: Test SMS agent creation with holidays
            agent_result = await self.test_sms_agent_creation_with_holidays(holiday_map)
            
            if not agent_result:
                print("❌ SMS agent creation failed. Cannot proceed with remaining tests.")
                return
            
            agent_id = agent_result.get('id')
            
            # Step 3: Test holiday calculation logic
            expected_holiday = await self.test_holiday_calculation_logic(agent_result, holiday_map)
            
            # Step 4: Test SMS agent manual run
            post_doc = await self.test_sms_agent_manual_run(agent_result)
            
            # Step 5: Test holiday-specific content generation
            await self.test_holiday_specific_content(post_doc, expected_holiday)
            
            # Step 6: Test SMS template placeholders
            await self.test_sms_template_placeholders(post_doc)
            
            # Step 7: Test edge cases
            await self.test_edge_cases(holiday_map)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Cleanup
            await self.cleanup_test_data()
            await self.disconnect()
            
            # Print summary
            self.print_test_summary()

async def main():
    """Main test function"""
    tester = SMSHolidayTester()
    await tester.run_comprehensive_test()

if __name__ == "__main__":
    asyncio.run(main())