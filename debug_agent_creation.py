#!/usr/bin/env python3
"""
Debug Agent Creation Response
"""

import asyncio
import aiohttp
import ssl
import json
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
backend_dir = Path(__file__).parent / "backend"
load_dotenv(backend_dir / '.env')

async def debug_agent_creation():
    backend_url = os.environ.get('FRONTEND_URL', 'https://petsai-templates.preview.emergentagent.com')
    
    # Authenticate first
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    login_data = {
        "email": "admin@hospital.com",
        "password": "admin123"
    }
    
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
        # Login
        login_url = f"{backend_url}/api/login"
        async with session.post(login_url, json=login_data, timeout=10) as response:
            if response.status == 200:
                login_result = await response.json()
                auth_token = login_result.get("access_token")
                print(f"✅ Authentication successful")
            else:
                print(f"❌ Authentication failed: {response.status}")
                return
        
        headers = {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
        
        # Create a simple marketing agent
        agent_data = {
            "agent_type": "marketing_agent",
            "agent_name": "Debug Test Agent",
            "mode": "adhoc",
            "marketing_content_type": "topic",
            "topic": "Pet Health Tips",
            "marketing_channels": ["social_media"],
            "marketing_social_platforms": {
                "facebook": True,
                "instagram": True
            },
            "marketing_workflow_mode": "in_review",
            "word_count": "100",
            "auto_post": False
        }
        
        # Create the marketing agent
        url = f"{backend_url}/api/ai-agents"
        async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
            print(f"Agent creation status: {response.status}")
            response_text = await response.text()
            print(f"Raw response: {response_text}")
            
            if response.status == 200:
                try:
                    created_agent = json.loads(response_text)
                    print(f"Parsed response: {json.dumps(created_agent, indent=2)}")
                    
                    # Check for ID field
                    agent_id = created_agent.get("id")
                    print(f"Agent ID from 'id' field: {agent_id}")
                    
                    # Check all keys
                    print(f"All response keys: {list(created_agent.keys())}")
                    
                except json.JSONDecodeError as e:
                    print(f"JSON decode error: {e}")
            else:
                print(f"Failed to create agent: {response.status}")
                print(f"Error response: {response_text}")

if __name__ == "__main__":
    asyncio.run(debug_agent_creation())