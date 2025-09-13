#!/usr/bin/env python3
"""
Focused Marketing Campaign Testing - Specific Issue Analysis

This test focuses on the specific issues found in the marketing campaign system:
1. Platform field storage issue
2. Email subject generation format issue
3. Social media platform differentiation
"""

import asyncio
import sys
import os
import json
import aiohttp
import ssl
from datetime import datetime, date
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

async def test_platform_differentiation():
    """Test platform differentiation specifically"""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    backend_url = os.environ.get('FRONTEND_URL', 'https://marketing-agent.preview.emergentagent.com')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Authenticate
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        login_data = {"email": "admin@hospital.com", "password": "admin123"}
        
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            # Login
            login_url = f"{backend_url}/api/login"
            async with session.post(login_url, json=login_data, timeout=10) as response:
                if response.status != 200:
                    print("❌ Authentication failed")
                    return
                
                login_result = await response.json()
                auth_token = login_result.get("access_token")
            
            headers = {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with social media platforms
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Platform Test Agent",
                "mode": "adhoc",
                "marketing_content_type": "topic",
                "topic": "Pet Vaccination Tips",
                "marketing_channels": ["social_media"],
                "marketing_social_platforms": {
                    "facebook": True,
                    "instagram": True,
                    "twitter": True,
                    "linkedin": True
                },
                "marketing_workflow_mode": "in_review",
                "post_date": "2025-01-20",
                "post_time": "10:00"
            }
            
            # Create agent
            url = f"{backend_url}/api/ai-agents"
            async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
                if response.status != 200:
                    response_text = await response.text()
                    print(f"❌ Failed to create agent: {response.status}")
                    print(f"Response: {response_text}")
                    return
                
                created_agent = await response.json()
                agent_id = created_agent.get("id")
                print(f"✅ Created agent: {agent_id}")
            
            # Run the agent
            url = f"{backend_url}/api/ai-agents/{agent_id}/run"
            async with session.post(url, headers=headers, timeout=30) as response:
                if response.status != 200:
                    print(f"❌ Failed to run agent: {response.status}")
                    response_text = await response.text()
                    print(f"Response: {response_text}")
                    return
                
                print("✅ Agent ran successfully")
            
            # Check generated posts
            posts = await db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
            
            print(f"\n📊 ANALYSIS RESULTS:")
            print(f"Total posts generated: {len(posts)}")
            
            platforms_found = set()
            platform_content = {}
            
            for post in posts:
                platform = post.get("platform", "EMPTY")
                content = post.get("content", "")
                
                platforms_found.add(platform)
                if platform not in platform_content:
                    platform_content[platform] = []
                platform_content[platform].append(content[:100])
                
                print(f"\nPost ID: {post.get('id')}")
                print(f"Platform: '{platform}'")
                print(f"Content length: {len(content)}")
                print(f"Content preview: {content[:100]}...")
            
            print(f"\n🔍 PLATFORM ANALYSIS:")
            print(f"Platforms found: {list(platforms_found)}")
            print(f"Expected platforms: facebook, instagram, twitter, linkedin")
            
            # Check if platform field is properly stored
            platform_stored = not all(p == "EMPTY" or p == "" for p in platforms_found)
            print(f"Platform field properly stored: {platform_stored}")
            
            # Check content differentiation
            all_content = []
            for contents in platform_content.values():
                all_content.extend(contents)
            
            unique_content = len(set(all_content))
            content_different = unique_content > 1
            print(f"Unique content pieces: {unique_content}")
            print(f"Content different across platforms: {content_different}")
            
            # Clean up
            await db.ai_agents.delete_one({"id": agent_id})
            await db.ai_posts.delete_many({"agent_id": agent_id})
            print(f"🧹 Cleaned up test data")
            
    finally:
        client.close()

async def test_email_subject_generation():
    """Test email subject generation specifically"""
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    backend_url = os.environ.get('FRONTEND_URL', 'https://marketing-agent.preview.emergentagent.com')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Authenticate
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        login_data = {"email": "admin@hospital.com", "password": "admin123"}
        
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
            # Login
            login_url = f"{backend_url}/api/login"
            async with session.post(login_url, json=login_data, timeout=10) as response:
                if response.status != 200:
                    print("❌ Authentication failed")
                    return
                
                login_result = await response.json()
                auth_token = login_result.get("access_token")
            
            headers = {
                "Authorization": f"Bearer {auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with email channel
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Email Subject Test Agent",
                "marketing_content_type": "topic",
                "topic": "Winter Pet Care",
                "marketing_channels": ["email"],
                "marketing_email_personalized": True,
                "marketing_workflow_mode": "in_review",
                "post_date": "2025-01-20",
                "post_time": "14:00"
            }
            
            # Create agent
            url = f"{backend_url}/api/ai-agents"
            async with session.post(url, headers=headers, json=agent_data, timeout=15) as response:
                if response.status != 200:
                    response_text = await response.text()
                    print(f"❌ Failed to create agent: {response.status}")
                    print(f"Response: {response_text}")
                    return
                
                created_agent = await response.json()
                agent_id = created_agent.get("id")
                print(f"✅ Created email agent: {agent_id}")
            
            # Run the agent
            url = f"{backend_url}/api/ai-agents/{agent_id}/run"
            async with session.post(url, headers=headers, timeout=30) as response:
                if response.status != 200:
                    print(f"❌ Failed to run agent: {response.status}")
                    return
                
                print("✅ Email agent ran successfully")
            
            # Check generated posts
            posts = await db.ai_posts.find({"agent_id": agent_id}).to_list(length=None)
            
            print(f"\n📧 EMAIL SUBJECT ANALYSIS:")
            print(f"Total posts generated: {len(posts)}")
            
            for i, post in enumerate(posts, 1):
                subject = post.get("email_subject", "NO SUBJECT")
                content = post.get("content", "")
                
                print(f"\nEmail {i}:")
                print(f"Subject: '{subject}'")
                print(f"Subject length: {len(subject)}")
                print(f"Content length: {len(content)}")
                
                # Check subject quality
                has_title_format = "**Title:**" in subject
                reasonable_length = 10 <= len(subject) <= 100
                not_just_agent_name = subject != agent_data["agent_name"]
                
                print(f"Has **Title:** format (BAD): {has_title_format}")
                print(f"Reasonable length: {reasonable_length}")
                print(f"Not just agent name: {not_just_agent_name}")
            
            # Clean up
            await db.ai_agents.delete_one({"id": agent_id})
            await db.ai_posts.delete_many({"agent_id": agent_id})
            print(f"🧹 Cleaned up test data")
            
    finally:
        client.close()

async def main():
    print("🔍 FOCUSED MARKETING CAMPAIGN TESTING")
    print("=" * 50)
    
    print("\n1. Testing Platform Differentiation:")
    print("-" * 30)
    await test_platform_differentiation()
    
    print("\n2. Testing Email Subject Generation:")
    print("-" * 30)
    await test_email_subject_generation()

if __name__ == "__main__":
    asyncio.run(main())