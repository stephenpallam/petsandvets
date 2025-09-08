#!/usr/bin/env python3
"""
Business Info Backup Script
Creates a backup of current business information
"""
import json
import os
from datetime import datetime
from pymongo import MongoClient

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'animal_hospital_db')

def backup_business_info():
    """Create a backup of business information"""
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Get business info
        business_info = db.business_info.find_one()
        
        if business_info:
            # Convert ObjectId to string for JSON serialization
            business_info['_id'] = str(business_info['_id'])
            
            # Create backup filename with timestamp
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_file = f"/app/business_info_backup_{timestamp}.json"
            
            # Save backup
            with open(backup_file, 'w') as f:
                json.dump(business_info, f, indent=2, default=str)
            
            print(f"✅ Business info backed up to: {backup_file}")
            print(f"   Hospital: {business_info.get('hospital_name', 'N/A')}")
            print(f"   Phone: {business_info.get('phone', 'N/A')}")
            
            return backup_file
        else:
            print("❌ No business info found to backup")
            return None
            
    except Exception as e:
        print(f"❌ Backup failed: {e}")
        return None
    finally:
        client.close()

def restore_business_info(backup_file):
    """Restore business information from backup"""
    try:
        if not os.path.exists(backup_file):
            print(f"❌ Backup file not found: {backup_file}")
            return False
            
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Load backup
        with open(backup_file, 'r') as f:
            business_info = json.load(f)
        
        # Remove the _id for insertion
        if '_id' in business_info:
            del business_info['_id']
        
        # Replace existing business info
        result = db.business_info.replace_one({}, business_info, upsert=True)
        
        print(f"✅ Business info restored from: {backup_file}")
        print(f"   Matched: {result.matched_count}, Modified: {result.modified_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Restore failed: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'restore':
        if len(sys.argv) > 2:
            restore_business_info(sys.argv[2])
        else:
            print("Usage: python backup_business_info.py restore <backup_file>")
    else:
        backup_business_info()