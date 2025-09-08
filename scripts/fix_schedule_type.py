#!/usr/bin/env python3
"""
Script to fix auto mode agents that don't have schedule_type field set
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

async def fix_schedule_type():
    load_dotenv('/app/backend/.env')
    
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    try:
        # Find auto mode agents without schedule_type field
        agents_without_schedule_type = await db.ai_agents.find({
            'mode': 'auto',
            'schedule_type': {'$exists': False}
        }).to_list(length=None)
        
        print(f'Found {len(agents_without_schedule_type)} auto agents without schedule_type field')
        
        # Analyze each agent and set appropriate schedule_type
        for agent in agents_without_schedule_type:
            agent_id = agent.get('id')
            days_of_week = agent.get('days_of_week', {})
            
            # Check if agent has specific days selected (any day is True)
            has_selected_days = any(days_of_week.values()) if days_of_week else False
            
            # Determine schedule_type based on days_of_week configuration
            if has_selected_days and not all(days_of_week.values()):
                # Some days selected but not all - use selected_days mode
                schedule_type = 'selected_days'
                print(f'  Agent {agent_id}: Setting to selected_days (has specific days selected)')
            else:
                # All days or no specific configuration - use all_days mode
                schedule_type = 'all_days'
                print(f'  Agent {agent_id}: Setting to all_days (frequency-based)')
            
            # Update the agent
            await db.ai_agents.update_one(
                {'id': agent_id},
                {'$set': {'schedule_type': schedule_type}}
            )
        
        # Also find agents with null schedule_type
        agents_with_null = await db.ai_agents.find({
            'mode': 'auto',
            'schedule_type': None
        }).to_list(length=None)
        
        print(f'Found {len(agents_with_null)} auto agents with null schedule_type')
        
        for agent in agents_with_null:
            agent_id = agent.get('id')
            await db.ai_agents.update_one(
                {'id': agent_id},
                {'$set': {'schedule_type': 'all_days'}}  # Default to all_days
            )
            print(f'  Agent {agent_id}: Set to all_days (was null)')
            
        print("✅ Schedule type migration completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_schedule_type())