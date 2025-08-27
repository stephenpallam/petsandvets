#!/usr/bin/env python3
"""
Script to migrate facility images from mock data to database
"""
import asyncio
import sys
import os
from datetime import datetime
import uuid

# Add the backend directory to Python path
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient

# Facility images from mock data
facility_images = [
    {
        "id": 1,
        "url": "https://petsandvetsanimalhospital.com/images/clinic/reception.png",
        "title": "Reception Area",
        "description": "Simple & elegant barn style reception area"
    },
    {
        "id": 2,
        "url": "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ue0839v0_coffee.png",
        "title": "Reception Coffee Station",
        "description": "Daily freshly brewed coffee for our guests with modern barn door design"
    },
    {
        "id": 3,
        "url": "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/iuvc8byk_seating.png",
        "title": "Reception Seating Area",
        "description": "Comfortable seating area where you can relax while we care for your pet"
    },
    {
        "id": 4,
        "url": "https://petsandvetsanimalhospital.com/images/clinic/exam_room.png",
        "title": "Exam Room",
        "description": "Clean and contemporary exam rooms"
    },
    {
        "id": 5,
        "url": "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/a395zwon_exam_room_view.png",
        "title": "Exam Room Equipment",
        "description": "Modern exam room with stainless steel table and professional medical equipment"
    },
    {
        "id": 6,
        "url": "https://petsandvetsanimalhospital.com/images/clinic/surgery.png",
        "title": "Surgery Suite",
        "description": "Advanced lighting and heated surgical table"
    },
    {
        "id": 7,
        "url": "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/44h6ktjn_surgery_view.png",
        "title": "Surgery Anesthesia Equipment",
        "description": "State-of-the-art anesthesia machine and surgical monitoring equipment for safe procedures"
    },
    {
        "id": 8,
        "url": "https://petsandvetsanimalhospital.com/images/clinic/dental.png",
        "title": "Dental Equipment",
        "description": "Latest iM3 Pro-2000 dental machine"
    },
    {
        "id": 9,
        "url": "https://petsandvetsanimalhospital.com/images/clinic/blood_analyzers.png",
        "title": "Blood Analyzers",
        "description": "VETSCAN HM5 hematology analyzer"
    },
    {
        "id": 10,
        "url": "https://petsandvetsanimalhospital.com/images/clinic/lab.png",
        "title": "Diagnostic Lab",
        "description": "On-site pharmacy and diagnostic equipment"
    }
]

async def migrate_facility_photos():
    """Migrate facility photos from mock data to database"""
    
    # Connect to MongoDB
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Check if facility photos already exist
        existing_count = await db.facility_photos.count_documents({})
        if existing_count > 0:
            print(f"Found {existing_count} existing facility photos. Skipping migration.")
            return
        
        print("Migrating facility photos to database...")
        
        # Insert facility photos
        migrated_photos = []
        now = datetime.utcnow()
        
        for i, image in enumerate(facility_images):
            facility_photo = {
                "id": str(uuid.uuid4()),
                "title": image["title"],
                "description": image["description"],
                "photo_url": image["url"],
                "order": i,  # Use index as order
                "created_at": now,
                "updated_at": now
            }
            migrated_photos.append(facility_photo)
        
        # Insert all photos
        result = await db.facility_photos.insert_many(migrated_photos)
        print(f"✅ Successfully migrated {len(result.inserted_ids)} facility photos to database!")
        
        # List migrated photos
        print("\nMigrated photos:")
        for photo in migrated_photos:
            print(f"  - {photo['title']}: {photo['description'][:50]}...")
            
    except Exception as e:
        print(f"❌ Error migrating facility photos: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(migrate_facility_photos())