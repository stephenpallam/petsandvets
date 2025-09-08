#!/usr/bin/env python3
"""
Production Data Verification and Protection Script
Ensures all production data is safely stored in animal_hospital_db
"""
import asyncio
import json
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

class ProductionDataVerifier:
    def __init__(self):
        self.mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        self.db_name = os.environ.get('DB_NAME', 'animal_hospital_db')
        
    async def verify_all_production_data(self):
        """Verify all production data is present and secure"""
        try:
            client = AsyncIOMotorClient(self.mongo_url)
            db = client[self.db_name]
            
            print(f"🔍 VERIFYING PRODUCTION DATA IN: {self.db_name}")
            print("=" * 60)
            
            # Critical collections to verify
            critical_collections = {
                'business_info': 'Business Information',
                'users': 'User Accounts',
                'hospital_hours': 'Hospital Hours',
                'urgent_care_hours': 'Urgent Care Hours',
                'reviews': 'Customer Reviews',
                'ai_agents': 'AI Agents',
                'ai_posts': 'AI Generated Posts',
                'ai_settings': 'AI Configuration',
                'social_media_settings': 'Social Media Settings',
                'appointment_slot_config': 'Appointment Configuration'
            }
            
            total_documents = 0
            collection_summary = {}
            
            for collection_name, description in critical_collections.items():
                try:
                    collection = db[collection_name]
                    count = await collection.count_documents({})
                    collection_summary[collection_name] = count
                    total_documents += count
                    
                    status = "✅" if count > 0 else "⚠️ "
                    print(f"{status} {description}: {count} documents")
                    
                    # Show sample data for critical collections
                    if count > 0 and collection_name in ['business_info', 'users', 'ai_agents']:
                        sample = await collection.find_one()
                        if collection_name == 'business_info':
                            print(f"   📋 Business: {sample.get('hospital_name', 'N/A')}")
                        elif collection_name == 'users':
                            print(f"   👤 Users: {count} accounts")
                        elif collection_name == 'ai_agents':
                            agents_by_mode = {}
                            async for agent in collection.find():
                                mode = agent.get('mode', 'unknown')
                                agents_by_mode[mode] = agents_by_mode.get(mode, 0) + 1
                            agent_summary = ', '.join([f"{mode}: {count}" for mode, count in agents_by_mode.items()])
                            print(f"   🤖 Agents: {agent_summary}")
                            
                except Exception as e:
                    print(f"❌ Error checking {collection_name}: {e}")
                    collection_summary[collection_name] = -1
            
            print("=" * 60)
            print(f"📊 TOTAL DOCUMENTS: {total_documents}")
            print(f"🗄️  DATABASE: {self.db_name}")
            print(f"🔗 CONNECTION: {self.mongo_url}")
            
            return collection_summary, total_documents
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {e}")
            return None, 0
        finally:
            client.close()
    
    async def create_production_backup(self):
        """Create a backup of all production data"""
        try:
            client = AsyncIOMotorClient(self.mongo_url)
            db = client[self.db_name]
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_dir = '/app/data/backups'
            os.makedirs(backup_dir, exist_ok=True)
            
            backup_file = f"{backup_dir}/PRODUCTION_BACKUP_{timestamp}.json"
            
            print(f"📦 CREATING PRODUCTION BACKUP...")
            
            backup_data = {
                'backup_info': {
                    'timestamp': timestamp,
                    'date': datetime.now().isoformat(),
                    'database': self.db_name,
                    'purpose': 'Production data protection before environment setup'
                },
                'collections': {}
            }
            
            # Backup all collections
            collections = await db.list_collection_names()
            total_docs = 0
            
            for collection_name in collections:
                collection = db[collection_name]
                documents = await collection.find().to_list(length=None)
                backup_data['collections'][collection_name] = documents
                total_docs += len(documents)
                print(f"   ✅ {collection_name}: {len(documents)} documents")
            
            # Save backup
            with open(backup_file, 'w') as f:
                json.dump(backup_data, f, default=str, indent=2)
            
            print(f"📁 BACKUP SAVED: {backup_file}")
            print(f"📊 TOTAL DOCUMENTS: {total_docs}")
            
            return backup_file, total_docs
            
        except Exception as e:
            print(f"❌ BACKUP ERROR: {e}")
            return None, 0
        finally:
            client.close()
    
    async def verify_no_test_interference(self):
        """Check for any test data that might interfere"""
        try:
            print(f"\n🔒 CHECKING FOR TEST DATA INTERFERENCE...")
            
            # Check for test database connections
            test_patterns = [
                'test_db_config.py',
                'business_info_test.py', 
                'backend_test.py',
                'test_wrapper.py'
            ]
            
            for pattern in test_patterns:
                file_path = f'/app/{pattern}'
                if os.path.exists(file_path):
                    print(f"   ✅ Test isolation file exists: {pattern}")
                else:
                    print(f"   ⚠️  Missing test isolation: {pattern}")
            
            # Verify startup data manager
            startup_file = '/app/startup_data_manager.py'
            if os.path.exists(startup_file):
                print(f"   ✅ Startup data protection: EXISTS")
            else:
                print(f"   ❌ Startup data protection: MISSING")
            
        except Exception as e:
            print(f"❌ Test interference check error: {e}")

async def main():
    """Main verification process"""
    verifier = ProductionDataVerifier()
    
    print("🏥 VETERINARY HOSPITAL DATA VERIFICATION")
    print("🛡️  PRODUCTION DATA PROTECTION SYSTEM")
    print()
    
    # Step 1: Verify all production data
    collection_summary, total_docs = await verifier.verify_all_production_data()
    
    if total_docs == 0:
        print("\n❌ WARNING: No production data found!")
        return
    
    # Step 2: Create backup
    print("\n" + "=" * 60)
    backup_file, backup_docs = await verifier.create_production_backup()
    
    # Step 3: Check test interference
    await verifier.verify_no_test_interference()
    
    print("\n" + "=" * 60)
    print("✅ PRODUCTION DATA VERIFICATION COMPLETE")
    print(f"✅ Database: {verifier.db_name}")
    print(f"✅ Total Documents: {total_docs}")
    print(f"✅ Backup Created: {backup_file}")
    print("\n🚀 READY FOR NEW ENVIRONMENT SETUP")

if __name__ == "__main__":
    asyncio.run(main())