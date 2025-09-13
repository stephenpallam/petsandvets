#!/usr/bin/env python3
"""
Debug Posts Structure
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

async def debug_posts():
    backend_url = os.environ.get('FRONTEND_URL', 'https://marketing-agent.preview.emergentagent.com')
    
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
        
        # Get posts in review
        url = f"{backend_url}/api/ai-posts/in-review"
        async with session.get(url, headers=headers, timeout=10) as response:
            if response.status == 200:
                posts_data = await response.json()
                posts = posts_data.get("posts", [])
                
                print(f"Found {len(posts)} posts in review")
                
                # Show structure of first few posts
                for i, post in enumerate(posts[:3]):
                    print(f"\n--- Post {i+1} ---")
                    print(f"Keys: {list(post.keys())}")
                    print(f"Agent ID: {post.get('agent_id')}")
                    print(f"Agent Type: {post.get('agent_type')}")
                    print(f"Platform: {post.get('platform')}")
                    print(f"Content (first 100 chars): {post.get('content', '')[:100]}...")
                    print(f"Email Template: {bool(post.get('email_template'))}")
                    print(f"SMS Template: {bool(post.get('sms_template'))}")
                    print(f"Email Subject: {post.get('email_subject', 'N/A')}")
                    
            else:
                print(f"Failed to get posts: {response.status}")

if __name__ == "__main__":
    asyncio.run(debug_posts())