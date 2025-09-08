#!/usr/bin/env python3
"""
Production Data Management System
Handles backup, restore, and data integrity for production database
"""
import json
import os
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductionDataManager:
    def __init__(self):
        # Production database only
        self.mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        self.db_name = os.environ.get('DB_NAME', 'animal_hospital_db')
        self.backup_dir = '/app/data/backups'
        
        # Ensure backup directory exists
        os.makedirs(self.backup_dir, exist_ok=True)
        
    async def backup_all_production_data(self) -> str:
        """Create a complete backup of all production data"""
        try:
            client = AsyncIOMotorClient(self.mongo_url)
            db = client[self.db_name]
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = f"{self.backup_dir}/production_backup_{timestamp}.json"
            
            backup_data = {
                'backup_timestamp': timestamp,
                'backup_date': datetime.now().isoformat(),
                'database_name': self.db_name,
                'collections': {}
            }
            
            # Collections to backup
            collections_to_backup = [
                'business_info',
                'users', 
                'hospital_hours',
                'urgent_care_hours',
                'reviews',
                'ai_settings',
                'email_config'
                # Note: We don't backup ai_agents and ai_posts as they might be test data
                # User can recreate agents through the UI
            ]
            
            for collection_name in collections_to_backup:
                try:
                    collection = db[collection_name]
                    documents = await collection.find().to_list(length=None)
                    
                    # Convert ObjectId to string for JSON serialization
                    for doc in documents:
                        if '_id' in doc:
                            doc['_id'] = str(doc['_id'])
                    
                    backup_data['collections'][collection_name] = documents
                    logger.info(f"Backed up {len(documents)} documents from {collection_name}")
                    
                except Exception as e:
                    logger.warning(f"Could not backup collection {collection_name}: {e}")
                    backup_data['collections'][collection_name] = []
            
            # Save backup
            with open(backup_file, 'w') as f:
                json.dump(backup_data, f, indent=2, default=str)
            
            logger.info(f"✅ Production data backed up to: {backup_file}")
            client.close()
            return backup_file
            
        except Exception as e:
            logger.error(f"❌ Backup failed: {e}")
            if 'client' in locals():
                client.close()
            raise
    
    async def restore_from_backup(self, backup_file: Optional[str] = None) -> bool:
        """Restore production data from backup file"""
        try:
            # Use latest backup if no specific file provided
            if not backup_file:
                backup_file = self.get_latest_backup()
                if not backup_file:
                    logger.warning("No backup file found for restoration")
                    return False
            
            if not os.path.exists(backup_file):
                logger.error(f"Backup file not found: {backup_file}")
                return False
            
            client = AsyncIOMotorClient(self.mongo_url)
            db = client[self.db_name]
            
            # Load backup
            with open(backup_file, 'r') as f:
                backup_data = json.load(f)
            
            restored_collections = 0
            
            for collection_name, documents in backup_data['collections'].items():
                if not documents:  # Skip empty collections
                    continue
                    
                try:
                    collection = db[collection_name]
                    
                    # Clear existing data in production collection
                    await collection.delete_many({})
                    
                    # Prepare documents for insertion
                    for doc in documents:
                        if '_id' in doc:
                            del doc['_id']  # Let MongoDB generate new IDs
                    
                    # Insert restored data
                    if documents:
                        await collection.insert_many(documents)
                        restored_collections += 1
                        logger.info(f"Restored {len(documents)} documents to {collection_name}")
                    
                except Exception as e:
                    logger.error(f"Failed to restore collection {collection_name}: {e}")
            
            logger.info(f"✅ Restored {restored_collections} collections from backup: {backup_file}")
            client.close()
            return True
            
        except Exception as e:
            logger.error(f"❌ Restore failed: {e}")
            if 'client' in locals():
                client.close()
            return False
    
    def get_latest_backup(self) -> Optional[str]:
        """Get the most recent backup file"""
        try:
            backup_files = [f for f in os.listdir(self.backup_dir) if f.startswith('production_backup_') and f.endswith('.json')]
            if not backup_files:
                return None
            
            # Sort by timestamp in filename
            backup_files.sort(reverse=True)
            latest_backup = os.path.join(self.backup_dir, backup_files[0])
            logger.info(f"Latest backup found: {latest_backup}")
            return latest_backup
            
        except Exception as e:
            logger.error(f"Error finding latest backup: {e}")
            return None
    
    async def clean_test_data(self):
        """Remove any test data from production database"""
        try:
            client = AsyncIOMotorClient(self.mongo_url)
            db = client[self.db_name]
            
            # Clean test business info
            test_business_patterns = [
                {"hospital_name": {"$regex": "test", "$options": "i"}},
                {"address": {"$regex": "123 Database Test Street"}},
                {"hospital_name": {"$regex": "Database Storage Test"}},
                {"email": {"$regex": "dbtest@"}}
            ]
            
            for pattern in test_business_patterns:
                result = await db.business_info.delete_many(pattern)
                if result.deleted_count > 0:
                    logger.info(f"Cleaned {result.deleted_count} test business records")
            
            # Clean test agents (optional - might want to keep legitimate agents)
            # This is commented out since user might have legitimate agents
            # test_agent_patterns = [
            #     {"name": {"$regex": "test", "$options": "i"}},
            #     {"topic": {"$regex": "test", "$options": "i"}}
            # ]
            
            logger.info("✅ Test data cleanup completed")
            client.close()
            
        except Exception as e:
            logger.error(f"❌ Test data cleanup failed: {e}")
            if 'client' in locals():
                client.close()

    async def initialize_production_data(self):
        """Initialize production data with clean defaults if no backup exists"""
        try:
            client = AsyncIOMotorClient(self.mongo_url)
            db = client[self.db_name]
            
            # Check if business_info exists
            business_info = await db.business_info.find_one()
            if not business_info:
                # Create clean default business info (user will update through UI)
                from datetime import datetime
                import uuid
                
                default_info = {
                    "id": str(uuid.uuid4()),
                    "hospital_name": "Pets and Vets Animal Hospital & Urgent Care",
                    "tagline": "Compassionate Care for Your Beloved Pets",
                    "phone": "(703) 957-3297",
                    "email": "vet@petsandvetsanimalhospital.com", 
                    "address": "43114 Peacock Market Plaza, Suite F110, South Riding, VA 20152",
                    "timezone": "America/New_York",
                    "referral_hospital_name": "VCA SouthPaws",
                    "referral_hospital_phone": "(703) 752-9100",
                    "facebook_link": "",
                    "instagram_link": "",
                    "twitter_link": "",
                    "whatsapp_group_link": "",
                    "google_reviews_link": "",
                    "yelp_reviews_link": "",
                    "facebook_reviews_link": "",
                    "hero_images": [
                        "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ulwulpak_emilee.png",
                        "https://customer-assets.emergentagent.com/job_peacock-pet-care/artifacts/ej59vv47_vanama.png"
                    ],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                
                await db.business_info.insert_one(default_info)
                logger.info("✅ Initialized default business info")
            
            client.close()
            
        except Exception as e:
            logger.error(f"❌ Production data initialization failed: {e}")
            if 'client' in locals():
                client.close()

# Utility functions for command line usage
async def backup_production_data():
    """Create backup of production data"""
    manager = ProductionDataManager()
    backup_file = await manager.backup_all_production_data()
    print(f"Backup created: {backup_file}")
    return backup_file

async def restore_production_data(backup_file: str = None):
    """Restore production data from backup"""
    manager = ProductionDataManager()
    success = await manager.restore_from_backup(backup_file)
    if success:
        print("✅ Production data restored successfully")
    else:
        print("❌ Failed to restore production data")
    return success

async def clean_production_test_data():
    """Clean test data from production database"""
    manager = ProductionDataManager()
    await manager.clean_test_data()
    print("✅ Test data cleaned from production database")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "backup":
            asyncio.run(backup_production_data())
        elif command == "restore":
            backup_file = sys.argv[2] if len(sys.argv) > 2 else None
            asyncio.run(restore_production_data(backup_file))
        elif command == "clean":
            asyncio.run(clean_production_test_data())
        else:
            print("Usage: python data_manager.py [backup|restore|clean] [backup_file]")
    else:
        print("Production Data Manager")
        print("Commands:")
        print("  backup  - Create backup of production data")
        print("  restore [file] - Restore from backup")
        print("  clean   - Clean test data from production")