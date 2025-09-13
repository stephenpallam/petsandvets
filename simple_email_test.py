#!/usr/bin/env python3
"""
Simple Email Formatting Test

Test to verify that the markdown formatting issue is fixed.
"""

import asyncio
import sys
import os
import json
import aiohttp
import ssl
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

async def test_email_formatting():
    """Simple test to verify email formatting fix"""
    
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    backend_url = os.environ.get('FRONTEND_URL', 'https://petsai-templates.preview.emergentagent.com')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Authenticate
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        login_data = {
            "email": "admin@hospital.com",
            "password": "admin123"
        }
        
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            login_url = f"{backend_url}/api/login"
            async with session.post(login_url, json=login_data, timeout=10) as response:
                if response.status == 200:
                    login_result = await response.json()
                    auth_token = login_result.get("access_token")
                    print("✅ Authentication successful")
                else:
                    print("❌ Authentication failed")
                    return
            
            headers = {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with email channel
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Simple Email Test Agent",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Dental Care",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                "email_content_template": "Dear [CUSTOMER_NAME], [CHATGPT_CONTENT] Best regards, [BUSINESS_NAME]",
                "marketing_workflow_mode": "in_review"
            }
            
            # Create the marketing agent
            url = f"{backend_url}/api/ai-agents"
            async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                if response.status != 200:
                    print(f"❌ Failed to create marketing agent: HTTP {response.status}")
                    return
                
                agent_result = await response.json()
                agent_id = agent_result.get("agent_id")
                print(f"✅ Created marketing agent: {agent_id}")
            
            # Wait a moment for agent creation to complete
            await asyncio.sleep(2)
            
            # Run the marketing campaign generation
            url = f"{backend_url}/api/ai-agents/{agent_id}/run"
            async with session.post(url, headers=headers, timeout=60) as response:
                if response.status != 200:
                    print(f"❌ Failed to run marketing campaign: HTTP {response.status}")
                    return
                
                campaign_result = await response.json()
                print(f"✅ Campaign executed: {campaign_result.get('message', 'Success')}")
            
            # Wait for posts to be generated
            await asyncio.sleep(5)
            
            # Query database to get generated email posts
            posts = await db.ai_posts.find({"agent_id": agent_id, "marketing_channel": "email"}).to_list(length=None)
            
            if not posts:
                print("❌ No email posts were generated")
                return
            
            print(f"✅ Generated {len(posts)} email post(s)")
            
            # Analyze the generated email posts
            for i, post in enumerate(posts):
                content = post.get("content", "")
                email_subject = post.get("email_subject", "")
                email_template = post.get("email_template", "")
                
                print(f"\n=== EMAIL POST {i+1} ===")
                print(f"Subject: {email_subject}")
                print(f"Content: {content[:300]}...")
                print(f"Template: {email_template[:100]}...")
                
                # Check for markdown formatting issues
                markdown_indicators = ["**Title:", "**Content:", "Title:", "Content:", "**", "##"]
                has_markdown = any(indicator in content for indicator in markdown_indicators)
                
                # Check for proper template structure
                has_greeting = any(greeting in content.lower() for greeting in ["dear", "hello", "hi"])
                has_closing = any(closing in content.lower() for closing in ["regards", "sincerely", "thank you"])
                
                print(f"Has Markdown Formatting: {'❌ YES' if has_markdown else '✅ NO'}")
                print(f"Has Proper Greeting: {'✅ YES' if has_greeting else '❌ NO'}")
                print(f"Has Proper Closing: {'✅ YES' if has_closing else '❌ NO'}")
                
                if not has_markdown and has_greeting and has_closing:
                    print("✅ EMAIL FORMATTING IS CORRECT!")
                else:
                    print("❌ EMAIL FORMATTING NEEDS IMPROVEMENT")
            
            # Clean up
            await db.ai_posts.delete_many({"agent_id": agent_id})
            await db.ai_agents.delete_one({"id": agent_id})
            print("🧹 Cleaned up test data")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_email_formatting())