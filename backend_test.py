#!/usr/bin/env python3
"""
Holiday Selection Logic Debug Test for Email Agents

This test debugs the critical issue where an email agent configured for National Cat Day 
is generating Thanksgiving-related content instead of National Cat Day content.

Expected: National Cat Day (2025-10-29) should be the next upcoming holiday
Actual: System is generating Thanksgiving content instead
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

class HolidaySelectionDebugger:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    async def get_current_system_date(self):
        """Check what the current system date is being used by the holiday selection logic"""
        print("=== CURRENT SYSTEM DATE ANALYSIS ===")
        
        # Test the exact same logic used in generate_email_for_agent
        today = datetime.now().date()
        print(f"System date (datetime.now().date()): {today}")
        print(f"Date type: {type(today)}")
        print(f"ISO format: {today.isoformat()}")
        
        return today
    
    async def get_national_cat_day_agent(self):
        """Find the email agent configured with National Cat Day"""
        print("\n=== FINDING NATIONAL CAT DAY EMAIL AGENT ===")
        
        # National Cat Day ID from database
        national_cat_day_id = "7a7596a4-9d94-4d5d-ba45-d0676304f2e5"
        
        # Find agents that have National Cat Day selected
        agents = await self.db.ai_agents.find({
            'agent_type': 'email',
            'selected_holidays': {'$in': [national_cat_day_id]}
        }).to_list(length=None)
        
        print(f"Found {len(agents)} email agents with National Cat Day selected:")
        
        for agent in agents:
            print(f"  Agent ID: {agent.get('id')}")
            print(f"  Agent Name: {agent.get('agent_name')}")
            print(f"  Selected Holidays: {agent.get('selected_holidays', [])}")
            
        return agents[0] if agents else None
    
    async def debug_holiday_selection_logic(self, agent_data):
        """Debug the exact holiday selection logic from lines 4714-4749"""
        print("\n=== DEBUGGING HOLIDAY SELECTION LOGIC ===")
        
        selected_holidays = agent_data.get('selected_holidays', [])
        print(f"Agent selected holidays: {selected_holidays}")
        
        # Get holiday information for context (exact same logic as server.py)
        holidays_cursor = self.db.holidays.find({"id": {"$in": selected_holidays}})
        holidays_list = await holidays_cursor.to_list(length=None)
        
        print(f"Found {len(holidays_list)} holidays in database:")
        for holiday in holidays_list:
            print(f"  - {holiday.get('name')} ({holiday.get('date')})")
        
        if not holidays_list:
            print("❌ ERROR: No holiday data found for selected holidays")
            return None
        
        # Find the next upcoming holiday from selected holidays (exact same logic)
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
                print(f"  Parsed {holiday.get('name')}: {holiday_date} (days from today: {(holiday_date - today).days})")
            except Exception as e:
                print(f"  ❌ Could not parse holiday date {holiday.get('date', 'unknown')}: {e}")
                continue
        
        if not valid_holidays:
            print("❌ ERROR: No valid holiday dates found")
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
        
        return upcoming_holiday
    
    async def test_generate_email_for_agent(self, agent_id, agent_data):
        """Test the generate_email_for_agent function specifically"""
        print(f"\n=== TESTING generate_email_for_agent FOR AGENT {agent_id} ===")
        
        try:
            # Import the function from server.py
            sys.path.insert(0, str(Path(__file__).parent / "backend"))
            from server import generate_email_for_agent
            
            # Call the function
            result = await generate_email_for_agent(agent_id, agent_data)
            print(f"✅ Function completed successfully: {result}")
            
            # Check what post was created
            if result and result.get('post_id'):
                post = await self.db.ai_posts.find_one({'id': result['post_id']})
                if post:
                    print(f"\n📧 GENERATED EMAIL POST:")
                    print(f"  Post ID: {post.get('id')}")
                    print(f"  Topic: {post.get('topic')}")
                    print(f"  Holiday Name: {post.get('holiday_name')}")
                    print(f"  Holiday Date: {post.get('holiday_date')}")
                    print(f"  Content Preview: {post.get('content', '')[:200]}...")
                    
                    return post
            
        except Exception as e:
            print(f"❌ ERROR in generate_email_for_agent: {str(e)}")
            import traceback
            traceback.print_exc()
            
        return None
    
    async def check_existing_posts(self):
        """Check if there are existing posts from this agent"""
        print("\n=== CHECKING EXISTING EMAIL POSTS ===")
        
        posts = await self.db.ai_posts.find({
            'agent_type': 'email',
            'status': {'$in': ['in_review', 'ready_to_publish']}
        }).sort('created_at', -1).limit(5).to_list(length=5)
        
        print(f"Found {len(posts)} recent email posts:")
        for post in posts:
            print(f"  - {post.get('topic')} | Holiday: {post.get('holiday_name')} | Status: {post.get('status')}")
    
    async def create_test_email_agent_with_national_cat_day(self):
        """Create a test email agent specifically configured for National Cat Day"""
        print("\n=== CREATING TEST EMAIL AGENT WITH NATIONAL CAT DAY ===")
        
        import uuid
        from datetime import datetime
        
        # National Cat Day ID
        national_cat_day_id = "7a7596a4-9d94-4d5d-ba45-d0676304f2e5"
        
        test_agent = {
            "id": str(uuid.uuid4()),
            "agent_name": "National Cat Day Test Agent",
            "agent_type": "email",
            "mode": "recurring",
            "selected_holidays": [national_cat_day_id],
            "email_content_template": "Dear [CUSTOMER_NAME],\n\nHappy [HOLIDAY_NAME]! We hope you and [PET_NAMES] are doing well.\n\nThis [HOLIDAY_NAME] is a special time to celebrate our feline friends. We wanted to reach out and let you know we're thinking of you and your beloved cats.\n\nWarm regards,\nThe Veterinary Team",
            "use_chatgpt_formatting": True,
            "use_customer_database": True,
            "email_type": "bulk",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        # Insert the test agent
        await self.db.ai_agents.insert_one(test_agent)
        print(f"✅ Created test agent: {test_agent['id']}")
        
        return test_agent
    
    async def run_comprehensive_debug(self):
        """Run comprehensive debugging of the holiday selection issue"""
        print("🔍 STARTING COMPREHENSIVE HOLIDAY SELECTION DEBUG")
        print("=" * 60)
        
        try:
            await self.connect()
            
            # Step 1: Check current system date
            current_date = await self.get_current_system_date()
            
            # Step 2: Find existing National Cat Day agent
            existing_agent = await self.get_national_cat_day_agent()
            
            if not existing_agent:
                print("⚠️  No existing agent found, creating test agent...")
                existing_agent = await self.create_test_email_agent_with_national_cat_day()
            
            # Step 3: Debug holiday selection logic
            selected_holiday = await self.debug_holiday_selection_logic(existing_agent)
            
            # Step 4: Test the actual function
            generated_post = await self.test_generate_email_for_agent(
                existing_agent['id'], 
                existing_agent
            )
            
            # Step 5: Check existing posts
            await self.check_existing_posts()
            
            # Step 6: Analysis and conclusions
            print("\n" + "=" * 60)
            print("🎯 ANALYSIS AND CONCLUSIONS")
            print("=" * 60)
            
            if selected_holiday:
                holiday_name = selected_holiday.get('name')
                holiday_date = selected_holiday.get('date')
                
                if 'Cat Day' in holiday_name:
                    print("✅ CORRECT: Holiday selection logic correctly identified National Cat Day")
                    print(f"   Selected: {holiday_name} ({holiday_date})")
                else:
                    print("❌ BUG FOUND: Holiday selection logic selected wrong holiday")
                    print(f"   Expected: National Cat Day (2025-10-29)")
                    print(f"   Actual: {holiday_name} ({holiday_date})")
                    
                    # Analyze why wrong holiday was selected
                    print("\n🔍 ROOT CAUSE ANALYSIS:")
                    print(f"   Current date: {current_date}")
                    
                    # Check if National Cat Day is in the future
                    cat_day_date = datetime.strptime("2025-10-29", '%Y-%m-%d').date()
                    days_to_cat_day = (cat_day_date - current_date).days
                    
                    if days_to_cat_day > 0:
                        print(f"   National Cat Day is {days_to_cat_day} days in the future - should be selected")
                    else:
                        print(f"   National Cat Day was {abs(days_to_cat_day)} days ago - explains why not selected")
                        
                        # Check if Thanksgiving is closer
                        thanksgiving_date = datetime.strptime("2025-11-28", '%Y-%m-%d').date()
                        days_to_thanksgiving = (thanksgiving_date - current_date).days
                        print(f"   Thanksgiving is {days_to_thanksgiving} days in the future")
            
            if generated_post:
                post_holiday = generated_post.get('holiday_name', '')
                if 'Cat Day' in post_holiday:
                    print("✅ GENERATED POST: Correctly used National Cat Day")
                else:
                    print(f"❌ GENERATED POST: Used wrong holiday - {post_holiday}")
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    debugger = HolidaySelectionDebugger()
    await debugger.run_comprehensive_debug()

if __name__ == "__main__":
    asyncio.run(main())