#!/usr/bin/env python3
"""
Script to extend Sunday urgent care hours for testing
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def extend_sunday_hours():
    # Get MongoDB URL from environment
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/pets_and_vets')
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.pets_and_vets
    
    try:
        # Update Sunday hours to close at 8 PM instead of 4 PM
        result = await db.urgent_care_hours.update_one(
            {},
            {"$set": {"sunday.close": "20:00"}}
        )
        
        print(f"✅ Updated Sunday urgent care hours: {result.modified_count} document(s) modified")
        
        # Verify the update
        updated_hours = await db.urgent_care_hours.find_one()
        print(f"Sunday hours now: {updated_hours['sunday']}")
        
    except Exception as e:
        print(f"❌ Error updating Sunday hours: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(extend_sunday_hours())