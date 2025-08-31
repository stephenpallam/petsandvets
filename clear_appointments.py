#!/usr/bin/env python3
"""
Script to clear all urgent care appointments from the database
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def clear_urgent_care_appointments():
    # Get MongoDB URL from environment
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/pets_and_vets')
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.pets_and_vets
    
    try:
        # Count existing appointments
        count_before = await db.urgent_care_appointments.count_documents({})
        print(f"Found {count_before} urgent care appointments in database")
        
        if count_before > 0:
            # Delete all urgent care appointments
            result = await db.urgent_care_appointments.delete_many({})
            print(f"Deleted {result.deleted_count} urgent care appointments")
        else:
            print("No urgent care appointments found to delete")
        
        # Verify deletion
        count_after = await db.urgent_care_appointments.count_documents({})
        print(f"Remaining appointments: {count_after}")
        
        if count_after == 0:
            print("✅ All urgent care appointments successfully cleared!")
        else:
            print("⚠️ Some appointments may still remain")
            
    except Exception as e:
        print(f"❌ Error clearing appointments: {e}")
    finally:
        # Close database connection
        client.close()
        print("Database connection closed")

if __name__ == "__main__":
    asyncio.run(clear_urgent_care_appointments())