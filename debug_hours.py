#!/usr/bin/env python3
"""
Debug script to check urgent care hours in database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def debug_urgent_care_hours():
    # Get MongoDB URL from environment
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/pets_and_vets')
    print(f"Connecting to: {MONGO_URL}")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.pets_and_vets
    
    try:
        # Check database collections
        collections = await db.list_collection_names()
        print(f"Available collections: {collections}")
        
        # Get urgent care hours
        urgent_hours = await db.urgent_care_hours.find_one()
        print(f"Urgent care hours document: {urgent_hours}")
        
        if urgent_hours:
            print("Found urgent care hours:")
            for key, value in urgent_hours.items():
                if key != "_id":
                    print(f"  {key}: {value}")
        
        # Get today's info
        today = datetime.now()
        day_name = today.strftime("%A").lower()
        print(f"Today is: {day_name}")
        print(f"Date: {today.strftime('%Y-%m-%d')}")
        
        if urgent_hours and day_name in urgent_hours:
            today_hours = urgent_hours[day_name]
            print(f"Today's urgent care hours: {today_hours}")
        else:
            print(f"No hours found for {day_name}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(debug_urgent_care_hours())