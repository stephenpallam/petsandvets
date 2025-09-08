#!/usr/bin/env python3
"""
Holiday Selection Fix Verification Test for Email Agents

This test verifies the critical fix for email agent holiday selection where:
- Previously: Email agent configured for National Cat Day was generating Thanksgiving content 
  due to incorrect Thanksgiving date in database (was 2025-11-28)
- Fixed: Thanksgiving date corrected to 2025-11-27, ensuring proper holiday selection logic

Test Requirements:
1. Verify Thanksgiving 2025 date is correctly stored as 2025-11-27 in database
2. Test email agent holiday selection logic confirms National Cat Day (2025-10-29) is selected as next upcoming holiday
3. Run generate_email_for_agent function for agent with both National Cat Day and Thanksgiving selected
4. Confirm generated email content mentions "National Cat Day" and not "Thanksgiving"
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

class HolidaySelectionFixTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = {
            'thanksgiving_date_correct': False,
            'holiday_selection_correct': False,
            'email_generation_correct': False,
            'content_verification_correct': False
        }
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    async def test_1_verify_thanksgiving_date(self):
        """Test 1: Verify Thanksgiving 2025 date is correctly stored as 2025-11-27"""
        print("=== TEST 1: VERIFY THANKSGIVING 2025 DATE ===")
        
        thanksgiving = await self.db.holidays.find_one({
            'name': {'$regex': 'Thanksgiving 2025', '$options': 'i'}
        })
        
        if not thanksgiving:
            print("❌ FAIL: Thanksgiving 2025 holiday not found in database")
            return False
            
        thanksgiving_date = thanksgiving.get('date')
        expected_date = '2025-11-27'
        
        print(f"Expected Thanksgiving date: {expected_date}")
        print(f"Actual Thanksgiving date: {thanksgiving_date}")
        
        if thanksgiving_date == expected_date:
            print("✅ PASS: Thanksgiving 2025 date is correctly stored as 2025-11-27")
            self.test_results['thanksgiving_date_correct'] = True
            return True
        else:
            print(f"❌ FAIL: Thanksgiving date is {thanksgiving_date}, expected {expected_date}")
            return False
    
    async def test_2_holiday_selection_logic(self):
        """Test 2: Verify National Cat Day is selected as next upcoming holiday"""
        print("\n=== TEST 2: VERIFY HOLIDAY SELECTION LOGIC ===")
        
        # Find email agent with both National Cat Day and Thanksgiving selected
        agent = await self.db.ai_agents.find_one({
            'agent_type': 'email',
            'selected_holidays': {
                '$all': [
                    '7a7596a4-9d94-4d5d-ba45-d0676304f2e5',  # National Cat Day 2025
                    'dd8471d4-7963-4a22-8a5c-161c8401f5eb'   # Thanksgiving 2025
                ]
            }
        })
        
        if not agent:
            print("⚠️  No existing agent found with both holidays, creating test agent...")
            agent = await self.create_test_agent_with_both_holidays()
        
        print(f"Testing agent: {agent.get('agent_name')} (ID: {agent.get('id')})")
        print(f"Selected holidays: {agent.get('selected_holidays')}")
        
        # Test the holiday selection logic
        selected_holidays = agent.get('selected_holidays', [])
        holidays_cursor = self.db.holidays.find({"id": {"$in": selected_holidays}})
        holidays_list = await holidays_cursor.to_list(length=None)
        
        print(f"Found {len(holidays_list)} holidays:")
        for holiday in holidays_list:
            print(f"  - {holiday.get('name')}: {holiday.get('date')}")
        
        # Simulate the exact logic from generate_email_for_agent
        today = datetime.now().date()
        print(f"Current date: {today}")
        
        valid_holidays = []
        for holiday in holidays_list:
            try:
                holiday_date = datetime.strptime(holiday['date'], '%Y-%m-%d').date()
                valid_holidays.append({
                    'holiday_data': holiday,
                    'parsed_date': holiday_date
                })
                days_diff = (holiday_date - today).days
                print(f"  {holiday.get('name')}: {holiday_date} ({days_diff} days from today)")
            except Exception as e:
                print(f"  ❌ Could not parse {holiday.get('name')}: {e}")
                continue
        
        # Sort holidays by date
        valid_holidays.sort(key=lambda x: x['parsed_date'])
        
        # Find next upcoming holiday
        upcoming_holiday = None
        for holiday_info in valid_holidays:
            if holiday_info['parsed_date'] >= today:
                upcoming_holiday = holiday_info['holiday_data']
                break
        
        if not upcoming_holiday:
            upcoming_holiday = valid_holidays[0]['holiday_data']
        
        selected_holiday_name = upcoming_holiday.get('name')
        print(f"Selected upcoming holiday: {selected_holiday_name}")
        
        if 'Cat Day' in selected_holiday_name:
            print("✅ PASS: National Cat Day correctly selected as next upcoming holiday")
            self.test_results['holiday_selection_correct'] = True
            return agent, upcoming_holiday
        else:
            print(f"❌ FAIL: Wrong holiday selected - {selected_holiday_name}")
            return agent, upcoming_holiday
    
    async def test_3_email_generation(self, agent):
        """Test 3: Run generate_email_for_agent function"""
        print("\n=== TEST 3: TEST EMAIL GENERATION FUNCTION ===")
        
        try:
            # Import the function from server.py
            from server import generate_email_for_agent
            
            agent_id = agent.get('id')
            print(f"Calling generate_email_for_agent for agent {agent_id}")
            
            # Call the function
            result = await generate_email_for_agent(agent_id, agent)
            
            if result and result.get('post_id'):
                print(f"✅ PASS: Email generation completed successfully")
                print(f"Generated post ID: {result['post_id']}")
                self.test_results['email_generation_correct'] = True
                return result['post_id']
            else:
                print("❌ FAIL: Email generation did not return expected result")
                return None
                
        except Exception as e:
            print(f"❌ FAIL: Email generation failed with error: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    async def test_4_content_verification(self, post_id):
        """Test 4: Verify generated email content mentions National Cat Day, not Thanksgiving"""
        print("\n=== TEST 4: VERIFY EMAIL CONTENT ===")
        
        if not post_id:
            print("❌ FAIL: No post ID provided for content verification")
            return False
        
        # Get the generated post
        post = await self.db.ai_posts.find_one({'id': post_id})
        
        if not post:
            print(f"❌ FAIL: Post {post_id} not found in database")
            return False
        
        content = post.get('content', '')
        topic = post.get('topic', '')
        holiday_name = post.get('holiday_name', '')
        
        print(f"Post topic: {topic}")
        print(f"Holiday name: {holiday_name}")
        print(f"Content preview: {content[:200]}...")
        
        # Check for National Cat Day mentions
        cat_day_mentions = content.lower().count('cat day') + content.lower().count('national cat day')
        thanksgiving_mentions = content.lower().count('thanksgiving')
        
        print(f"National Cat Day mentions in content: {cat_day_mentions}")
        print(f"Thanksgiving mentions in content: {thanksgiving_mentions}")
        
        # Verify holiday name field
        holiday_name_correct = 'Cat Day' in holiday_name
        print(f"Holiday name field contains 'Cat Day': {holiday_name_correct}")
        
        # Content should mention Cat Day and NOT mention Thanksgiving
        content_correct = cat_day_mentions > 0 and thanksgiving_mentions == 0
        
        if holiday_name_correct and content_correct:
            print("✅ PASS: Email content correctly references National Cat Day and not Thanksgiving")
            self.test_results['content_verification_correct'] = True
            return True
        else:
            print("❌ FAIL: Email content verification failed")
            if not holiday_name_correct:
                print(f"  - Holiday name field incorrect: {holiday_name}")
            if not content_correct:
                print(f"  - Content mentions: Cat Day={cat_day_mentions}, Thanksgiving={thanksgiving_mentions}")
            return False
    
    async def create_test_agent_with_both_holidays(self):
        """Create a test email agent with both National Cat Day and Thanksgiving selected"""
        import uuid
        
        test_agent = {
            "id": str(uuid.uuid4()),
            "agent_name": "Holiday Selection Fix Test Agent",
            "agent_type": "email",
            "mode": "recurring",
            "selected_holidays": [
                "7a7596a4-9d94-4d5d-ba45-d0676304f2e5",  # National Cat Day 2025
                "dd8471d4-7963-4a22-8a5c-161c8401f5eb"   # Thanksgiving 2025
            ],
            "email_content_template": "Dear [CUSTOMER_NAME],\n\nHappy [HOLIDAY_NAME]! We hope you and [PET_NAMES] are doing well.\n\nThis [HOLIDAY_NAME] is a special time to celebrate. We wanted to reach out and let you know we're thinking of you.\n\nWarm regards,\nThe Veterinary Team",
            "use_chatgpt_formatting": True,
            "use_customer_database": True,
            "email_type": "bulk",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        await self.db.ai_agents.insert_one(test_agent)
        print(f"Created test agent: {test_agent['id']}")
        return test_agent
    
    async def run_comprehensive_test(self):
        """Run all tests to verify the holiday selection fix"""
        print("🧪 STARTING HOLIDAY SELECTION FIX VERIFICATION TESTS")
        print("=" * 70)
        
        try:
            await self.connect()
            
            # Test 1: Verify Thanksgiving date
            test1_pass = await self.test_1_verify_thanksgiving_date()
            
            # Test 2: Verify holiday selection logic
            agent, selected_holiday = await self.test_2_holiday_selection_logic()
            
            # Test 3: Test email generation
            post_id = None
            if agent:
                post_id = await self.test_3_email_generation(agent)
            
            # Test 4: Verify content
            test4_pass = False
            if post_id:
                test4_pass = await self.test_4_content_verification(post_id)
            
            # Final results
            print("\n" + "=" * 70)
            print("🎯 FINAL TEST RESULTS")
            print("=" * 70)
            
            all_tests_passed = all(self.test_results.values())
            
            for test_name, passed in self.test_results.items():
                status = "✅ PASS" if passed else "❌ FAIL"
                print(f"{status}: {test_name.replace('_', ' ').title()}")
            
            print(f"\nOverall Result: {'✅ ALL TESTS PASSED' if all_tests_passed else '❌ SOME TESTS FAILED'}")
            
            if all_tests_passed:
                print("\n🎉 HOLIDAY SELECTION FIX VERIFICATION SUCCESSFUL!")
                print("✅ Thanksgiving 2025 date correctly stored as 2025-11-27")
                print("✅ National Cat Day (2025-10-29) correctly selected as next upcoming holiday")
                print("✅ Email generation function working correctly")
                print("✅ Generated email content references National Cat Day, not Thanksgiving")
            else:
                print("\n⚠️  SOME TESTS FAILED - REVIEW RESULTS ABOVE")
            
            return all_tests_passed
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = HolidaySelectionFixTester()
    success = await tester.run_comprehensive_test()
    return success

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)