#!/usr/bin/env python3
"""
Manual Scheduler Test

This test manually triggers the scheduled post processing to debug why scheduled SMS posts aren't being processed.
"""

import asyncio
import sys
import os
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

async def test_manual_scheduler():
    """Test manual scheduler processing"""
    
    # Connect to database
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("🔍 MANUAL SCHEDULER TEST")
        print("=" * 50)
        
        # Check for scheduled posts
        scheduled_posts = await db.ai_posts.find({
            "status": "scheduled"
        }).to_list(length=None)
        
        print(f"Found {len(scheduled_posts)} scheduled posts")
        
        for post in scheduled_posts:
            print(f"Post ID: {post.get('id')}")
            print(f"Agent Type: {post.get('agent_type')}")
            print(f"Status: {post.get('status')}")
            print(f"Scheduled For: {post.get('scheduled_for')}")
            print(f"Holiday: {post.get('holiday_name')} ({post.get('holiday_date')})")
            print(f"Content: {post.get('content', 'EMPTY')}")
            print("-" * 30)
        
        if scheduled_posts:
            # Import the processing functions
            from server import process_scheduled_posts, process_scheduled_sms_post
            
            print("\n🚀 Running process_scheduled_posts()...")
            
            # Manually trigger processing
            await process_scheduled_posts()
            
            print("✅ Processing completed")
            
            # Check posts again
            print("\n🔍 Checking posts after processing...")
            updated_posts = await db.ai_posts.find({
                "id": {"$in": [post["id"] for post in scheduled_posts]}
            }).to_list(length=None)
            
            for post in updated_posts:
                print(f"Post ID: {post.get('id')}")
                print(f"Status: {post.get('status')}")
                print(f"Content: {post.get('content', 'EMPTY')[:100]}...")
                print(f"Error: {post.get('error_message', 'None')}")
                print("-" * 30)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_manual_scheduler())