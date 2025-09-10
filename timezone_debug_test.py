#!/usr/bin/env python3
"""
Timezone Debug Test

This test checks if there's a timezone issue causing scheduled posts not to be found.
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

async def debug_timezone():
    """Debug timezone issues"""
    
    # Connect to database
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("🔍 TIMEZONE DEBUG TEST")
        print("=" * 50)
        
        # Import business time functions
        from server import business_now_async
        
        current_time = await business_now_async()
        utc_time = datetime.utcnow()
        past_time = current_time - timedelta(minutes=10)
        
        print(f"UTC Time: {utc_time}")
        print(f"Business Time: {current_time}")
        print(f"Past Time (for test): {past_time}")
        
        # Create a scheduled post with past time
        scheduled_post = {
            "id": str(uuid.uuid4()),
            "agent_id": "test-agent-id",
            "agent_name": "Timezone Test Agent",
            "agent_type": "sms_agent",
            "content": "",
            "status": "scheduled",
            "scheduled_for": past_time,
            "created_at": current_time,
            "updated_at": current_time
        }
        await db.ai_posts.insert_one(scheduled_post)
        print(f"✅ Created scheduled post with scheduled_for: {past_time}")
        
        # Test the query that process_scheduled_posts uses
        from server import PostStatus
        
        print(f"\n🔍 Testing query with PostStatus.SCHEDULED = '{PostStatus.SCHEDULED}'")
        
        scheduled_posts = await db.ai_posts.find({
            "status": PostStatus.SCHEDULED,
            "scheduled_for": {"$lte": current_time}
        }).to_list(length=None)
        
        print(f"Found {len(scheduled_posts)} posts with PostStatus.SCHEDULED")
        
        # Test with string status
        print(f"\n🔍 Testing query with string 'scheduled'")
        
        scheduled_posts_str = await db.ai_posts.find({
            "status": "scheduled",
            "scheduled_for": {"$lte": current_time}
        }).to_list(length=None)
        
        print(f"Found {len(scheduled_posts_str)} posts with string 'scheduled'")
        
        # Show all scheduled posts regardless of time
        all_scheduled = await db.ai_posts.find({
            "status": "scheduled"
        }).to_list(length=None)
        
        print(f"\n🔍 All scheduled posts (regardless of time): {len(all_scheduled)}")
        for post in all_scheduled:
            print(f"  Post ID: {post.get('id')}")
            print(f"  Scheduled For: {post.get('scheduled_for')}")
            print(f"  Current Time: {current_time}")
            print(f"  Should Process: {post.get('scheduled_for') <= current_time}")
            print("-" * 30)
        
        # Cleanup
        await db.ai_posts.delete_one({"id": scheduled_post["id"]})
        print("✅ Cleanup completed")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(debug_timezone())