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
        # Set up default urgent care hours using the correct API format
        default_urgent_hours = {
            "id": "urgent-care-hours-default",
            "monday": {"is_open": True, "open_time": "08:00", "close_time": "18:00"},
            "tuesday": {"is_open": True, "open_time": "08:00", "close_time": "18:00"},
            "wednesday": {"is_open": True, "open_time": "08:00", "close_time": "18:00"},
            "thursday": {"is_open": True, "open_time": "08:00", "close_time": "18:00"},
            "friday": {"is_open": True, "open_time": "08:00", "close_time": "18:00"},
            "saturday": {"is_open": True, "open_time": "09:00", "close_time": "17:00"},
            "sunday": {"is_open": True, "open_time": "10:00", "close_time": "20:00"},  # Extended Sunday hours for testing
            "updated_by": "system"
        }
        
        # Clear existing and insert new hours
        await db.urgent_care_hours.delete_many({})
        result = await db.urgent_care_hours.insert_one(default_urgent_hours)
        print(f"✅ Inserted new urgent care hours with ID: {result.inserted_id}")
        
        # Verify the hours were set
        updated_hours = await db.urgent_care_hours.find_one()
        print("Updated urgent care hours:")
        for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            if day in updated_hours:
                hours = updated_hours[day]
                if hours.get('is_open', True):
                    print(f"  {day.capitalize()}: {hours.get('open_time', 'N/A')} - {hours.get('close_time', 'N/A')}")
                else:
                    print(f"  {day.capitalize()}: CLOSED")
        
    except Exception as e:
        print(f"❌ Error setting up urgent care hours: {e}")
    finally:
        client.close()
        print("Database connection closed")

if __name__ == "__main__":
    asyncio.run(setup_urgent_care_hours())