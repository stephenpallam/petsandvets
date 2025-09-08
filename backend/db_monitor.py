#!/usr/bin/env python3
"""
Database Monitor - Track business info changes and prevent data loss
"""
import asyncio
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'animal_hospital_db')

async def monitor_business_info():
    """Monitor business info for unexpected changes"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Check business info
        business_info = await db.business_info.find_one()
        
        if business_info:
            print(f"✅ Business Info Found - ID: {business_info.get('id', 'N/A')}")
            print(f"   Hospital Name: {business_info.get('hospital_name', 'N/A')}")
            print(f"   Phone: {business_info.get('phone', 'N/A')}")
            print(f"   Email: {business_info.get('email', 'N/A')}")
            print(f"   Updated: {business_info.get('updated_at', 'N/A')}")
            
            # Check for default/test values that indicate reset
            if (business_info.get('hospital_name') == "Pets and Vets Animal Hospital & Urgent Care" and
                business_info.get('phone') == "(703) 957-3297"):
                print("⚠️  WARNING: Business info appears to be reset to defaults!")
            
        else:
            print("❌ No business info found in database")
            
        # Count total records
        count = await db.business_info.count_documents({})
        print(f"📊 Total business_info records: {count}")
        
        if count > 1:
            print("⚠️  WARNING: Multiple business info records found!")
            
    except Exception as e:
        print(f"❌ Database monitoring error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print(f"🔍 Database Monitor - {datetime.now()}")
    print(f"   DB: {DB_NAME}")
    print(f"   URL: {MONGO_URL}")
    asyncio.run(monitor_business_info())