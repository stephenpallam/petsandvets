#!/usr/bin/env python3
"""
Thorough cleanup script to find and remove all urgent care appointments
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def thorough_cleanup():
    # Get MongoDB URL from environment
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/pets_and_vets')
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.pets_and_vets
    
    try:
        # List all collections
        collections = await db.list_collection_names()
        print(f"Available collections: {collections}")
        
        # Check each collection for appointments
        for collection_name in collections:
            collection = db[collection_name]
            count = await collection.count_documents({})
            print(f"Collection '{collection_name}': {count} documents")
            
            # If it's the urgent care appointments collection, show and delete all
            if 'appointment' in collection_name.lower() or 'urgent' in collection_name.lower():
                print(f"\n📋 Examining collection: {collection_name}")
                
                # Show all documents in this collection
                all_docs = await collection.find({}).to_list(length=100)
                for i, doc in enumerate(all_docs):
                    print(f"  Document {i+1}:")
                    if 'appointment_time' in doc:
                        print(f"    Time: {doc.get('appointment_time')}")
                    if 'owner_first_name' in doc:
                        print(f"    Name: {doc.get('owner_first_name')} {doc.get('owner_last_name', '')}")
                    if 'status' in doc:
                        print(f"    Status: {doc.get('status')}")
                    print(f"    ID: {doc.get('id', doc.get('_id', 'N/A'))}")
                
                if all_docs:
                    # Delete all documents in this collection
                    result = await collection.delete_many({})
                    print(f"  ✅ Deleted {result.deleted_count} documents from {collection_name}")
                else:
                    print(f"  ℹ️ No documents found in {collection_name}")
        
        print(f"\n🔍 Final verification:")
        # Check the specific urgent care appointments collection again
        final_count = await db.urgent_care_appointments.count_documents({})
        print(f"urgent_care_appointments collection: {final_count} documents")
        
        if final_count == 0:
            print("🎉 All urgent care appointments successfully cleared!")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
    finally:
        client.close()
        print("Database connection closed")

if __name__ == "__main__":
    asyncio.run(thorough_cleanup())