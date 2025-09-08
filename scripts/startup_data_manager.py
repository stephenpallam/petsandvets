#!/usr/bin/env python3
"""
Startup Data Manager
Ensures clean production data on server startup
Runs before the main server starts
"""
import asyncio
import sys
import os
import logging

# Setup path for backend imports
sys.path.append('/app/backend')

from data_manager import ProductionDataManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def startup_data_management():
    """Main startup data management function"""
    try:
        logger.info("🚀 Starting production data management...")
        
        data_manager = ProductionDataManager()
        
        # Step 1: Clean any test data contamination
        logger.info("🧹 Cleaning test data contamination...")
        await data_manager.clean_test_data()
        
        # Step 2: Check for latest backup and restore if needed
        latest_backup = data_manager.get_latest_backup()
        if latest_backup:
            logger.info(f"📦 Found backup: {latest_backup}")
            
            # Check if we need to restore (e.g., if critical data is missing)
            from motor.motor_asyncio import AsyncIOMotorClient
            
            mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
            db_name = os.environ.get('DB_NAME', 'animal_hospital_db')
            
            client = AsyncIOMotorClient(mongo_url)
            db = client[db_name]
            
            # Check if business info exists and is not test data
            business_info = await db.business_info.find_one()
            should_restore = False
            
            if not business_info:
                logger.info("📋 No business info found, will restore from backup")
                should_restore = True
            elif (business_info.get('address', '').find('123 Database Test Street') != -1 or
                  business_info.get('hospital_name', '').lower().find('test') != -1):
                logger.info("🚨 Test data detected in business info, will restore from backup")
                should_restore = True
            
            if should_restore:
                logger.info("🔄 Restoring production data from backup...")
                success = await data_manager.restore_from_backup(latest_backup)
                if success:
                    logger.info("✅ Production data restored successfully")
                else:
                    logger.error("❌ Failed to restore production data")
            else:
                logger.info("✅ Production data appears clean, no restore needed")
            
            client.close()
        else:
            logger.info("📦 No backup found, will initialize with clean defaults")
            await data_manager.initialize_production_data()
        
        # Step 3: Create a fresh backup for safety
        logger.info("💾 Creating fresh backup...")
        backup_file = await data_manager.backup_all_production_data()
        logger.info(f"✅ Fresh backup created: {backup_file}")
        
        logger.info("🎉 Startup data management completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Startup data management failed: {e}")
        return False

if __name__ == "__main__":
    print("🏥 Animal Hospital - Startup Data Manager")
    print("🔒 Ensuring production data integrity...")
    
    success = asyncio.run(startup_data_management())
    
    if success:
        print("✅ Startup data management completed successfully")
        sys.exit(0)
    else:
        print("❌ Startup data management failed")
        sys.exit(1)