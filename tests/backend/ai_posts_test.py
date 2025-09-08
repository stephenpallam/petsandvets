#!/usr/bin/env python3
"""
AI Posts Generation Testing
Tests if AI posts are generated correctly with titles
"""

import requests
import json
import time

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        return "http://localhost:8001"
    return "http://localhost:8001"

BASE_URL = get_backend_url()
if BASE_URL.endswith('/api'):
    API_URL = BASE_URL
else:
    API_URL = f"{BASE_URL}/api"

print(f"Testing AI Posts Generation at: {API_URL}")

# Admin credentials
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

def get_admin_token():
    """Get admin token"""
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
    except Exception as e:
        print(f"❌ Login failed: {e}")
    return None

def check_ai_posts():
    """Check if AI posts were generated"""
    admin_token = get_admin_token()
    if not admin_token:
        print("❌ Cannot get admin token")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    print("\n🔍 Checking AI Posts...")
    
    # Check ready to publish posts
    try:
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish", headers=headers)
        if response.status_code == 200:
            data = response.json()
            posts = data.get('posts', [])
            print(f"📋 Ready to Publish Posts: {len(posts)}")
            for i, post in enumerate(posts):
                if i >= 3:  # Show first 3
                    break
                title = post.get('title', 'No title')
                content_preview = post.get('content', '')[:100] + '...' if len(post.get('content', '')) > 100 else post.get('content', '')
                print(f"  - Title: {title}")
                print(f"    Content: {content_preview}")
                print(f"    Agent Type: {post.get('agent_type', 'Unknown')}")
                print(f"    Mode: {post.get('mode', 'Unknown')}")
                print()
        else:
            print(f"❌ Failed to get ready posts: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking ready posts: {e}")
    
    # Check in-review posts
    try:
        response = requests.get(f"{API_URL}/ai-posts/in-review", headers=headers)
        if response.status_code == 200:
            data = response.json()
            posts = data.get('posts', [])
            print(f"📋 In Review Posts: {len(posts)}")
            for i, post in enumerate(posts):
                if i >= 3:  # Show first 3
                    break
                title = post.get('title', 'No title')
                content_preview = post.get('content', '')[:100] + '...' if len(post.get('content', '')) > 100 else post.get('content', '')
                print(f"  - Title: {title}")
                print(f"    Content: {content_preview}")
                print(f"    Agent Type: {post.get('agent_type', 'Unknown')}")
                print(f"    Mode: {post.get('mode', 'Unknown')}")
                print()
        else:
            print(f"❌ Failed to get in-review posts: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking in-review posts: {e}")

def check_agents():
    """Check created agents"""
    admin_token = get_admin_token()
    if not admin_token:
        print("❌ Cannot get admin token")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    print("\n🤖 Checking AI Agents...")
    
    try:
        response = requests.get(f"{API_URL}/ai-agents", headers=headers)
        if response.status_code == 200:
            agents = response.json()
            social_media_agents = [agent for agent in agents if agent.get('agent_type') == 'social_media']
            print(f"📋 Total Social Media Agents: {len(social_media_agents)}")
            
            for agent in social_media_agents[-5:]:  # Show last 5
                print(f"  - Name: {agent.get('agent_name', 'No name')}")
                print(f"    Mode: {agent.get('mode', 'Unknown')}")
                print(f"    Post Title: {agent.get('post_title', 'No title')}")
                print(f"    Topic: {agent.get('topic', 'No topic')}")
                platforms = agent.get('social_platforms', {})
                active_platforms = [k for k, v in platforms.items() if v]
                print(f"    Platforms: {', '.join(active_platforms) if active_platforms else 'None'}")
                print()
        else:
            print(f"❌ Failed to get agents: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking agents: {e}")

if __name__ == "__main__":
    print("="*60)
    print("AI POSTS GENERATION CHECK")
    print("="*60)
    
    check_agents()
    check_ai_posts()
    
    print("\n✅ AI Posts check completed!")