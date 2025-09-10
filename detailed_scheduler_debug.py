#!/usr/bin/env python3
"""
Detailed Scheduler Debug

This test creates a scheduled post and then manually steps through the process_scheduled_posts function
to see exactly where it's failing.
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

async def detailed_debug():
    """Detailed debug of scheduler processing"""
    
    # Connect to database
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("🔍 DETAILED SCHEDULER DEBUG")
        print("=" * 50)
        
        # Import required functions
        from server import business_now_async, PostStatus, process_scheduled_sms_post
        from ai_service import ai_service
        
        current_time = await business_now_async()
        past_time = current_time - timedelta(minutes=10)
        
        print(f"Current Business Time: {current_time}")
        print(f"Past Time: {past_time}")
        
        # Create test holiday and agent
        test_holiday = {
            "id": str(uuid.uuid4()),
            "name": "Detailed Debug Holiday",
            "date": current_time.strftime("%Y-%m-%d"),
            "month_day": current_time.strftime("%m-%d"),
            "is_recurring": True,
            "is_enabled": True,
            "category": "test"
        }
        await db.holidays.insert_one(test_holiday)
        
        test_agent = {
            "id": str(uuid.uuid4()),
            "agent_name": "Detailed Debug SMS Agent",
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
        
        # Create scheduled SMS post
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
            "scheduled_for": past_time,
            "created_at": current_time,
            "updated_at": current_time
        }
        await db.ai_posts.insert_one(scheduled_post)
        
        print(f"✅ Created test data")
        print(f"   Holiday: {test_holiday['name']}")
        print(f"   Agent: {test_agent['agent_name']}")
        print(f"   Post: {scheduled_post['id']}")
        
        # Step 1: Manually replicate the query from process_scheduled_posts
        print(f"\n🔍 Step 1: Finding scheduled posts")
        
        scheduled_posts = await db.ai_posts.find({
            "status": PostStatus.SCHEDULED,
            "scheduled_for": {"$lte": current_time}
        }).to_list(length=None)
        
        print(f"Found {len(scheduled_posts)} scheduled posts ready for processing")
        
        if not scheduled_posts:
            print("❌ No posts found - this is the issue!")
            
            # Check what posts exist
            all_posts = await db.ai_posts.find({"id": scheduled_post["id"]}).to_list(length=1)
            if all_posts:
                post = all_posts[0]
                print(f"Post exists with:")
                print(f"  Status: {post.get('status')} (type: {type(post.get('status'))})")
                print(f"  Scheduled For: {post.get('scheduled_for')} (type: {type(post.get('scheduled_for'))})")
                print(f"  PostStatus.SCHEDULED: {PostStatus.SCHEDULED} (type: {type(PostStatus.SCHEDULED)})")
                print(f"  Current Time: {current_time} (type: {type(current_time)})")
                print(f"  Time comparison: {post.get('scheduled_for')} <= {current_time} = {post.get('scheduled_for') <= current_time}")
            
            # Cleanup and exit
            await db.holidays.delete_one({"id": test_holiday["id"]})
            await db.ai_agents.delete_one({"id": test_agent["id"]})
            await db.ai_posts.delete_one({"id": scheduled_post["id"]})
            return
        
        # Step 2: Process the first scheduled post
        post = scheduled_posts[0]
        print(f"\n🔍 Step 2: Processing post {post['id']}")
        
        # Check if it's an SMS post without content
        if post.get("agent_type") == "sms_agent" and not post.get("content"):
            print("✅ This is an SMS post without content - should be processed")
            
            # Step 3: Call process_scheduled_sms_post
            print(f"\n🔍 Step 3: Calling process_scheduled_sms_post")
            
            try:
                await process_scheduled_sms_post(post, current_time)
                print("✅ process_scheduled_sms_post completed without error")
            except Exception as e:
                print(f"❌ process_scheduled_sms_post failed: {e}")
                import traceback
                traceback.print_exc()
        
        # Step 4: Check the result
        print(f"\n🔍 Step 4: Checking result")
        
        processed_post = await db.ai_posts.find_one({"id": post["id"]})
        if processed_post:
            print(f"Post Status: {processed_post.get('status')}")
            print(f"Content Length: {len(processed_post.get('content', ''))}")
            print(f"Content Preview: {processed_post.get('content', '')[:100]}...")
            print(f"Error Message: {processed_post.get('error_message', 'None')}")
            
            if processed_post.get('status') == 'published' and processed_post.get('content'):
                print("✅ SUCCESS: Post was processed correctly!")
            else:
                print("❌ FAILED: Post was not processed correctly")
        
        # Cleanup
        print(f"\n🧹 Cleaning up...")
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
    asyncio.run(detailed_debug())