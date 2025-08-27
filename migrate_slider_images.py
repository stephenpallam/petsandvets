#!/usr/bin/env python3
"""
Script to migrate hero images to slider images in database
"""
import asyncio
import sys
import os
from datetime import datetime
import uuid

# Add the backend directory to Python path
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient

# Hero images from mock data
hero_images = [
    {
        "title": "Professional Veterinary Care",
        "description": "Compassionate care for your beloved pets with experienced veterinarians and modern facilities",
        "image_url": "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
        "order": 0
    },
    {
        "title": "State-of-the-Art Facility", 
        "description": "Modern equipment and comfortable environment for the best possible care for your furry family members",
        "image_url": "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png",
        "order": 1
    }
]

async def migrate_slider_images():
    """Migrate hero images to slider images in database"""
    
    # Connect to MongoDB
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Check if slider images already exist
        existing_count = await db.slider_images.count_documents({})
        if existing_count > 0:
            print(f"Found {existing_count} existing slider images. Skipping migration.")
            return
        
        print("Migrating hero images to slider images in database...")
        
        # Insert slider images
        migrated_images = []
        now = datetime.utcnow()
        
        for image in hero_images:
            slider_image = {
                "id": str(uuid.uuid4()),
                "title": image["title"],
                "description": image["description"],
                "image_url": image["image_url"],
                "order": image["order"],
                "created_at": now,
                "updated_at": now
            }
            migrated_images.append(slider_image)
        
        # Insert all images
        result = await db.slider_images.insert_many(migrated_images)
        print(f"✅ Successfully migrated {len(result.inserted_ids)} slider images to database!")
        
        # List migrated images
        print("\nMigrated slider images:")
        for image in migrated_images:
            print(f"  - {image['title']}: {image['description'][:50]}...")
            
    except Exception as e:
        print(f"❌ Error migrating slider images: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(migrate_slider_images())