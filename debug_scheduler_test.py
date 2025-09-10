#!/usr/bin/env python3
"""
Debug Scheduler Test

This test creates scheduled posts and then tests the processing functionality step by step.
"""

import asyncio
import sys
import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

async def debug_scheduler():
    """Debug scheduler step by step"""
    
    # Connect to database
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("🔍 DEBUG SCHEDULER TEST")
        print("=" * 50)
        
        current_time = datetime.utcnow()
        past_time = current_time - timedelta(minutes=5)  # 5 minutes ago
        
        # Step 1: Create a test holiday
        test_holiday = {
            "id": str(uuid.uuid4()),
            "name": "Debug Test Holiday",
            "date": current_time.strftime("%Y-%m-%d"),
            "month_day": current_time.strftime("%m-%d"),
            "is_recurring": True,
            "is_enabled": True,
            "category": "test"
        }
        await db.holidays.insert_one(test_holiday)
        print(f"✅ Created test holiday: {test_holiday['name']}")
        
        # Step 2: Create a test SMS agent
        test_agent = {
            "id": str(uuid.uuid4()),
            "agent_name": "Debug SMS Agent",
            "agent_type": "sms_agent",
            "mode": "recurring",
            "selected_holidays": [test_holiday["id"]],
            "post_time": "09:00",
            "sms_provider": "twilio",
            "sms_link": "https://petsandvetsanimalhospital.com",
            "sms_template": "Happy [HOLIDAY_NAME], [CUSTOMER_NAME]! We hope [PET_NAME] is doing well. Visit: [LINK]",
            "created_at": current_time,
            "updated_at": current_time,
            "is_active": True
        }
        await db.ai_agents.insert_one(test_agent)
        print(f"✅ Created test SMS agent: {test_agent['agent_name']}")
        
        # Step 3: Create a scheduled SMS post (ready for processing)
        scheduled_post = {
            "id": str(uuid.uuid4()),
            "agent_id": test_agent["id"],
            "agent_name": test_agent["agent_name"],
            "agent_type": "sms_agent",
            "content": "",  # Empty - should be generated
            "sms_template": test_agent["sms_template"],
            "sms_link": test_agent["sms_link"],
            "holiday_name": test_holiday["name"],
            "holiday_date": test_holiday["date"],
            "status": "scheduled",
            "scheduled_for": past_time,  # Past time so it gets processed
            "created_at": current_time,
            "updated_at": current_time
        }
        await db.ai_posts.insert_one(scheduled_post)
        print(f"✅ Created scheduled SMS post: {scheduled_post['id']}")
        print(f"   Scheduled for: {past_time} (should be processed)")
        
        # Step 4: Test the process_scheduled_posts function
        print("\n🚀 Testing process_scheduled_posts()...")
        
        from server import process_scheduled_posts
        await process_scheduled_posts()
        
        # Step 5: Check the result
        print("\n🔍 Checking result...")
        processed_post = await db.ai_posts.find_one({"id": scheduled_post["id"]})
        
        if processed_post:
            print(f"Post Status: {processed_post.get('status')}")
            print(f"Content: {processed_post.get('content', 'EMPTY')}")
            print(f"Error Message: {processed_post.get('error_message', 'None')}")
            
            if processed_post.get('content'):
                print("✅ SUCCESS: Content was generated!")
            else:
                print("❌ FAILED: No content generated")
                
            if processed_post.get('error_message'):
                print(f"❌ ERROR: {processed_post['error_message']}")
        else:
            print("❌ FAILED: Post not found after processing")
        
        # Step 6: Test the AI service directly
        print("\n🧪 Testing AI service directly...")
        try:
            from ai_service import ai_service
            
            result = await ai_service.generate_sms_content(
                topic=f"Holiday SMS for {test_holiday['name']}",
                custom_topic=f"Create a warm, festive SMS message for {test_holiday['name']} on {test_holiday['date']}. Keep it brief, include placeholders [CUSTOMER_NAME] and [PET_NAME], and add [LINK] for the website link.",
                track_usage=True,
                user_id="debug_test",
                agent_id=test_agent["id"]
            )
            
            if result and result.get("content"):
                print(f"✅ AI Service Working: {result['content'][:100]}...")
            else:
                print(f"❌ AI Service Failed: {result}")
                
        except Exception as ai_error:
            print(f"❌ AI Service Error: {ai_error}")
        
        # Cleanup
        print("\n🧹 Cleaning up test data...")
        await db.holidays.delete_one({"id": test_holiday["id"]})
        await db.ai_agents.delete_one({"id": test_agent["id"]})
        await db.ai_posts.delete_one({"id": scheduled_post["id"]})
        print("✅ Cleanup completed")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(debug_scheduler())