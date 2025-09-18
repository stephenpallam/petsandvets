#!/usr/bin/env python3
"""
Detailed Auto Clock-Out Test - Simulate exact conditions
"""

import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import uuid
import bcrypt

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

async def test_detailed_auto_clockout():
    """Test auto clock-out with detailed simulation"""
    
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("🔍 DETAILED AUTO CLOCK-OUT TEST")
        print("=" * 60)
        
        # Clean up any existing test data
        await db.business_services.delete_many({"name": {"$regex": "^Test"}})
        await db.users.delete_many({"email": {"$regex": "^test_detailed"}})
        await db.time_entries.delete_many({"notes": {"$regex": "Test detailed"}})
        
        # Create business services that close earlier than current time
        current_hour = datetime.now().hour
        if current_hour > 12:
            # Create services that close earlier than current time
            close_hour = current_hour - 2  # 2 hours ago
        else:
            close_hour = 10  # 10 AM
        
        close_time = f"{close_hour:02d}:00"
        
        # Create "Test Urgent Care" service that closes at close_time
        urgent_care_data = {
            "id": str(uuid.uuid4()),
            "name": "Test Detailed Urgent Care",
            "service_type": "urgent_care",
            "operating_hours": {
                "monday": {"is_open": True, "open_time": "08:00", "close_time": close_time},
                "tuesday": {"is_open": True, "open_time": "08:00", "close_time": close_time},
                "wednesday": {"is_open": True, "open_time": "08:00", "close_time": close_time},
                "thursday": {"is_open": True, "open_time": "08:00", "close_time": close_time},
                "friday": {"is_open": True, "open_time": "08:00", "close_time": close_time},
                "saturday": {"is_open": True, "open_time": "08:00", "close_time": close_time},
                "sunday": {"is_open": True, "open_time": "08:00", "close_time": close_time}
            },
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await db.business_services.insert_one(urgent_care_data)
        print(f"✅ Created business service closing at {close_time}")
        
        # Create test employee
        test_user_id = str(uuid.uuid4())
        test_user_data = {
            "id": test_user_id,
            "email": "test_detailed_employee@hospital.com",
            "full_name": "Test Detailed Employee",
            "role": "technician",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "password_hash": bcrypt.hashpw("test123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        }
        
        await db.users.insert_one(test_user_data)
        print(f"✅ Created test employee: {test_user_id}")
        
        # Create active time entry (clocked in earlier today)
        time_entry_id = str(uuid.uuid4())
        clock_in_time = datetime.now() - timedelta(hours=6)  # Clocked in 6 hours ago
        time_entry_data = {
            "id": time_entry_id,
            "user_id": test_user_id,
            "clock_in_time": clock_in_time,  # Store as datetime object
            "clock_out_time": None,
            "breaks": [],
            "total_hours": None,
            "regular_hours": None,
            "after_hours_hours": None,
            "is_auto_clockout": False,
            "notes": "Test detailed time entry for auto clock-out",
            "status": "active",
            "created_at": clock_in_time,
            "updated_at": clock_in_time
        }
        
        await db.time_entries.insert_one(time_entry_data)
        print(f"✅ Created active time entry: {time_entry_id}")
        print(f"   Clock-in time: {clock_in_time}")
        print(f"   Expected auto clock-out time: {close_time} + 30 min = {close_hour}:30")
        
        # Import and call the auto clock-out task
        from server import auto_clockout_task
        
        print("\n🔄 Running auto clock-out task...")
        await auto_clockout_task()
        
        # Check if the time entry was updated
        updated_entry = await db.time_entries.find_one({"id": time_entry_id})
        
        print("\n📊 RESULTS:")
        print(f"   Is Auto Clockout: {updated_entry.get('is_auto_clockout', False)}")
        print(f"   Has Clock Out Time: {updated_entry.get('clock_out_time') is not None}")
        print(f"   Status: {updated_entry.get('status')}")
        print(f"   Clock Out Time: {updated_entry.get('clock_out_time', 'None')}")
        print(f"   Notes: {updated_entry.get('notes', 'None')}")
        
        # Check if auto clock-out worked
        success = (
            updated_entry.get("is_auto_clockout", False) and
            updated_entry.get("clock_out_time") is not None and
            updated_entry.get("status") == "completed" and
            "Auto clocked out" in updated_entry.get("notes", "") and
            "business closing time" in updated_entry.get("notes", "")
        )
        
        print(f"\n🎯 AUTO CLOCK-OUT SUCCESS: {success}")
        
        # Clean up
        await db.business_services.delete_one({"id": urgent_care_data["id"]})
        await db.users.delete_one({"id": test_user_id})
        await db.time_entries.delete_one({"id": time_entry_id})
        print("\n🧹 Cleaned up test data")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_detailed_auto_clockout())