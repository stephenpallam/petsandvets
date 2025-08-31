#!/usr/bin/env python3
"""
Script to set up urgent care hours in the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def setup_urgent_care_hours():
    # Get MongoDB URL from environment
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/pets_and_vets')
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.pets_and_vets
    
    try:
        # Check if urgent care hours exist
        existing_hours = await db.urgent_care_hours.find_one()
        print("Existing urgent care hours:", existing_hours)
        
        # Set up default urgent care hours (8 AM to 6 PM daily)
        default_urgent_hours = {
            "monday": {"open": "08:00", "close": "18:00", "closed": False},
            "tuesday": {"open": "08:00", "close": "18:00", "closed": False},
            "wednesday": {"open": "08:00", "close": "18:00", "closed": False},
            "thursday": {"open": "08:00", "close": "18:00", "closed": False},
            "friday": {"open": "08:00", "close": "18:00", "closed": False},
            "saturday": {"open": "09:00", "close": "17:00", "closed": False},
            "sunday": {"open": "10:00", "close": "16:00", "closed": False}
        }
        
        # Clear existing and insert new hours
        await db.urgent_care_hours.delete_many({})
        result = await db.urgent_care_hours.insert_one(default_urgent_hours)
        print(f"✅ Inserted new urgent care hours with ID: {result.inserted_id}")
        
        # Verify the hours were set
        updated_hours = await db.urgent_care_hours.find_one()
        print("Updated urgent care hours:")
        for day, hours in updated_hours.items():
            if day != "_id":
                status = "CLOSED" if hours.get("closed", False) else f"{hours.get('open', 'N/A')} - {hours.get('close', 'N/A')}"
                print(f"  {day.capitalize()}: {status}")
        
    except Exception as e:
        print(f"❌ Error setting up urgent care hours: {e}")
    finally:
        # Close database connection
        client.close()
        print("Database connection closed")

if __name__ == "__main__":
    asyncio.run(setup_urgent_care_hours())