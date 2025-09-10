#!/usr/bin/env python3
"""
Create Holiday Email Agent

This script creates a permanent Holiday Email Scheduled Agent that will appear in the dashboard.
This solves the issue where no Holiday Email Agents existed in the database.
"""

import asyncio
import sys
import os
from datetime import datetime
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

async def create_holiday_email_agent():
    """Create a Holiday Email Scheduled Agent"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        print("🎯 CREATING HOLIDAY EMAIL SCHEDULED AGENT")
        print("=" * 50)
        
        # Get available holidays
        holidays = await db.holidays.find({}).limit(5).to_list(length=5)
        
        if not holidays:
            print("❌ No holidays found in database")
            return
        
        # Select holidays for the agent (Christmas, New Year, Thanksgiving)
        selected_holiday_ids = []
        holiday_names = []
        
        for holiday in holidays:
            if any(keyword in holiday.get("name", "").lower() for keyword in ["christmas", "new year", "thanksgiving", "valentine", "easter"]):
                selected_holiday_ids.append(holiday["id"])
                holiday_names.append(holiday["name"])
                if len(selected_holiday_ids) >= 3:
                    break
        
        # If we don't have enough specific holidays, use the first 3
        if len(selected_holiday_ids) < 3:
            selected_holiday_ids = [h["id"] for h in holidays[:3]]
            holiday_names = [h["name"] for h in holidays[:3]]
        
        import uuid
        
        # Create Holiday Email Scheduled Agent
        agent_data = {
            "id": str(uuid.uuid4()),
            "agent_name": "Holiday Email Scheduled Agent",
            "agent_type": "email",
            "mode": "recurring",
            "selected_holidays": selected_holiday_ids,
            "email_content_template": "Dear [CUSTOMER_NAME],\n\nAs [HOLIDAY_NAME] approaches, we wanted to reach out and wish you and [PET_NAME] all the best during this special time.\n\nWe're grateful for the trust you place in us for [PET_NAME]'s care, and we hope you both enjoy a wonderful [HOLIDAY_NAME] celebration.\n\nWarm regards,\nYour Veterinary Care Team",
            "use_chatgpt_formatting": True,
            "use_customer_database": True,
            "email_type": "bulk",
            "post_time": "09:00",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Check if agent already exists
        existing_agent = await db.ai_agents.find_one({
            "agent_name": "Holiday Email Scheduled Agent"
        })
        
        if existing_agent:
            print("✅ Holiday Email Scheduled Agent already exists")
            print(f"   Agent ID: {existing_agent['id']}")
            print(f"   Selected Holidays: {len(existing_agent.get('selected_holidays', []))}")
        else:
            # Insert the agent
            await db.ai_agents.insert_one(agent_data)
            
            # Verify creation
            created_agent = await db.ai_agents.find_one({"id": agent_data["id"]})
            
            if created_agent:
                print("✅ Holiday Email Scheduled Agent created successfully!")
                print(f"   Agent ID: {agent_data['id']}")
                print(f"   Agent Name: {agent_data['agent_name']}")
                print(f"   Agent Type: {agent_data['agent_type']}")
                print(f"   Mode: {agent_data['mode']}")
                print(f"   Selected Holidays: {holiday_names}")
                print(f"   Holiday Count: {len(selected_holiday_ids)}")
                print(f"   Is Active: {agent_data['is_active']}")
                print(f"   Has ChatGPT: {agent_data['use_chatgpt_formatting']}")
                print(f"   Post Time: {agent_data['post_time']}")
                
                print("\n🎉 SUCCESS: Holiday Email Scheduled Agent is now available in the dashboard!")
            else:
                print("❌ Failed to create Holiday Email Scheduled Agent")
        
        # Verify total holiday email agents
        total_holiday_agents = await db.ai_agents.count_documents({
            "agent_type": "email",
            "selected_holidays": {"$exists": True, "$ne": []}
        })
        
        print(f"\n📊 Total Holiday Email Agents in database: {total_holiday_agents}")
        
    except Exception as e:
        print(f"❌ Error creating Holiday Email Agent: {str(e)}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_holiday_email_agent())