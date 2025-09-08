#!/usr/bin/env python3
"""
Test Database Configuration
Ensures all tests use a separate test database and never contaminate production
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestDatabaseManager:
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017') 
        self.production_db = os.environ.get('DB_NAME', 'animal_hospital_db')
        self.test_db = f"{self.production_db}_test"
        
    def get_test_db_name(self) -> str:
        """Get the test database name"""
        return self.test_db
    
    def get_production_db_name(self) -> str:
        """Get the production database name"""
        return self.production_db
        
    async def setup_test_database(self):
        """Setup clean test database for testing"""
        try:
            client = AsyncIOMotorClient(self.mongo_url)
            test_db = client[self.test_db]
            
            # Drop test database to ensure clean state
            await client.drop_database(self.test_db)
            logger.info(f"✅ Dropped test database: {self.test_db}")
            
            # Create test admin user for testing
            from datetime import datetime
            import uuid
            from server import hash_password, UserRole  # Import from main server
            
            admin_user = {
                "id": str(uuid.uuid4()),
                "email": "admin@hospital.com",
                "full_name": "Test Hospital Administrator", 
                "role": "admin",
                "password_hash": hash_password("admin123"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await test_db.users.insert_one(admin_user)
            
            # Create test business info
            test_business_info = {
                "id": str(uuid.uuid4()),
                "hospital_name": "Test Pets and Vets Animal Hospital",
                "tagline": "Test Compassionate Care for Your Beloved Pets",
                "phone": "(703) 957-0000",
                "email": "test@petsandvetsanimalhospital.com",
                "address": "123 Test Street, Test City, VA 20000", 
                "timezone": "America/New_York",
                "referral_hospital_name": "Test VCA SouthPaws",
                "referral_hospital_phone": "(703) 752-0000",
                "facebook_link": "",
                "instagram_link": "",
                "twitter_link": "",
                "whatsapp_group_link": "",
                "google_reviews_link": "",
                "yelp_reviews_link": "",
                "facebook_reviews_link": "",
                "hero_images": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await test_db.business_info.insert_one(test_business_info)
            
            logger.info(f"✅ Test database setup completed: {self.test_db}")
            client.close()
            
        except Exception as e:
            logger.error(f"❌ Test database setup failed: {e}")
            if 'client' in locals():
                client.close()
            raise
    
    async def cleanup_test_database(self):
        """Clean up test database after tests"""
        try:
            client = AsyncIOMotorClient(self.mongo_url)
            await client.drop_database(self.test_db)
            logger.info(f"✅ Test database cleaned up: {self.test_db}")
            client.close()
            
        except Exception as e:
            logger.error(f"❌ Test database cleanup failed: {e}")
            if 'client' in locals():
                client.close()

def get_test_database_url() -> str:
    """Get the database name for tests"""
    manager = TestDatabaseManager()
    return manager.get_test_db_name()

def get_production_database_url() -> str:
    """Get the database name for production"""
    manager = TestDatabaseManager()
    return manager.get_production_database_url()

# Environment variable setter for tests
def set_test_environment():
    """Set environment variables for test execution"""
    manager = TestDatabaseManager()
    os.environ['DB_NAME'] = manager.get_test_db_name()
    logger.info(f"Set test environment: DB_NAME={manager.get_test_db_name()}")

def restore_production_environment():
    """Restore production environment variables"""
    manager = TestDatabaseManager()
    os.environ['DB_NAME'] = manager.get_production_db_name()
    logger.info(f"Restored production environment: DB_NAME={manager.get_production_db_name()}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "setup":
            asyncio.run(TestDatabaseManager().setup_test_database())
        elif command == "cleanup":
            asyncio.run(TestDatabaseManager().cleanup_test_database())
        else:
            print("Usage: python test_db_config.py [setup|cleanup]")
    else:
        print("Test Database Manager")
        print("Commands:")
        print("  setup   - Setup clean test database")
        print("  cleanup - Cleanup test database")