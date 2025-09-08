#!/usr/bin/env python3
"""
Automatic Backup System
Periodically backs up production data to ensure data safety
"""
import asyncio
import logging
from datetime import datetime, timedelta
from data_manager import ProductionDataManager
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AutoBackupService:
    def __init__(self, backup_interval_hours: int = 6):
        self.data_manager = ProductionDataManager()
        self.backup_interval = backup_interval_hours * 3600  # Convert to seconds
        self.running = False
        
    async def start_backup_service(self):
        """Start the automatic backup service"""
        self.running = True
        logger.info(f"🔄 Auto backup service started (interval: {self.backup_interval/3600} hours)")
        
        while self.running:
            try:
                # Create backup
                backup_file = await self.data_manager.backup_all_production_data()
                logger.info(f"✅ Automatic backup completed: {backup_file}")
                
                # Clean old backups (keep last 10)
                await self.cleanup_old_backups()
                
                # Wait for next backup cycle
                await asyncio.sleep(self.backup_interval)
                
            except Exception as e:
                logger.error(f"❌ Auto backup failed: {e}")
                # Wait shorter interval before retrying on error
                await asyncio.sleep(3600)  # 1 hour
    
    async def cleanup_old_backups(self, keep_count: int = 10):
        """Clean up old backup files, keeping only the most recent ones"""
        try:
            backup_dir = self.data_manager.backup_dir
            backup_files = [f for f in os.listdir(backup_dir) 
                          if f.startswith('production_backup_') and f.endswith('.json')]
            
            if len(backup_files) > keep_count:
                # Sort by timestamp in filename (most recent first)
                backup_files.sort(reverse=True)
                
                # Remove old backups
                for old_backup in backup_files[keep_count:]:
                    old_backup_path = os.path.join(backup_dir, old_backup)
                    os.remove(old_backup_path)
                    logger.info(f"🗑️  Removed old backup: {old_backup}")
                    
        except Exception as e:
            logger.error(f"❌ Backup cleanup failed: {e}")
    
    def stop_backup_service(self):
        """Stop the automatic backup service"""
        self.running = False
        logger.info("🛑 Auto backup service stopped")

# Background task runner
async def run_auto_backup_service():
    """Run the auto backup service"""
    backup_service = AutoBackupService(backup_interval_hours=6)
    try:
        await backup_service.start_backup_service()
    except KeyboardInterrupt:
        backup_service.stop_backup_service()
        logger.info("Auto backup service terminated by user")

if __name__ == "__main__":
    print("Starting automatic backup service...")
    asyncio.run(run_auto_backup_service())