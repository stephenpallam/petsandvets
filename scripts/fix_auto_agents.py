#!/usr/bin/env python3
"""
Script to fix auto mode agents that don't have post_destination field set
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def fix_auto_agents_post_destination():
    load_dotenv('/app/backend/.env')
    
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    try:
        # Find auto mode agents without post_destination field
        agents_to_fix = await db.ai_agents.find({
            'mode': 'auto',
            'post_destination': {'$exists': False}
        }).to_list(length=None)
        
        print(f'Found {len(agents_to_fix)} auto agents without post_destination field')
        
        # Update them to have post_destination: 'in_review' by default
        if agents_to_fix:
            result = await db.ai_agents.update_many(
                {'mode': 'auto', 'post_destination': {'$exists': False}},
                {'$set': {'post_destination': 'in_review'}}
            )
            print(f'Updated {result.modified_count} auto agents to use in_review destination')
        
        # Also find agents with null post_destination
        agents_with_null = await db.ai_agents.find({
            'mode': 'auto',
            'post_destination': None
        }).to_list(length=None)
        
        print(f'Found {len(agents_with_null)} auto agents with null post_destination')
        
        if agents_with_null:
            result2 = await db.ai_agents.update_many(
                {'mode': 'auto', 'post_destination': None},
                {'$set': {'post_destination': 'in_review'}}
            )
            print(f'Updated {result2.modified_count} auto agents with null post_destination')
            
        print("✅ Auto agents post_destination fix completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_auto_agents_post_destination())