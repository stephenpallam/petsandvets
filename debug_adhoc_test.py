#!/usr/bin/env python3
"""
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
Debug test for adhoc agent postDestination functionality
"""

import requests
import json
import time

# CRITICAL: Setup test database environment
import sys
sys.path.append('/app/backend')
from test_db_config import set_test_environment
set_test_environment()
print("🧪 USING TEST DATABASE - Production data is safe!")


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
API_URL = f"{BASE_URL}/api"

print(f"Testing Backend API at: {API_URL}")

# Login as admin
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

print("🔐 Logging in as admin...")
response = requests.post(f"{API_URL}/login", json=admin_credentials)
if response.status_code != 200:
    print(f"❌ Login failed: {response.status_code}")
    exit(1)

admin_token = response.json()["access_token"]
headers = {"Authorization": f"Bearer {admin_token}"}
print("✅ Admin login successful")

# Create adhoc agent with in_review destination
print("\n🔧 Creating adhoc agent with postDestination='in_review'...")
agent_data = {
    "mode": "adhoc",
    "agent_name": "Debug Test Adhoc Agent",
    "topic": "Pet Health Tips",
    "custom_topic": "",
    "image_option": "none",
    "uploaded_images": [],
    "social_platforms": {
        "facebook": True,
        "instagram": True,
        "twitter": False,
        "whatsapp": False
    },
    "image_text": "Pet Health",
    "word_count": "100",
    "post_date": "2025-01-15",
    "post_destination": "in_review",  # This is the key field
    "immediate": True
}

print(f"Agent data: {json.dumps(agent_data, indent=2)}")

response = requests.post(f"{API_URL}/ai-agents", json=agent_data, headers=headers)
if response.status_code != 200:
    print(f"❌ Agent creation failed: {response.status_code}")
    print(f"Response: {response.text}")
    exit(1)

agent_result = response.json()
agent_id = agent_result["agent_id"]
print(f"✅ Agent created successfully: {agent_id}")

# Wait for post generation
print("⏳ Waiting 5 seconds for post generation...")
time.sleep(5)

# Check if agent was saved correctly
print(f"\n🔍 Checking saved agent data...")
response = requests.get(f"{API_URL}/ai-agents", headers=headers)
if response.status_code == 200:
    agents = response.json().get("agents", [])
    our_agent = None
    for agent in agents:
        if agent.get("id") == agent_id:
            our_agent = agent
            break
    
    if our_agent:
        print(f"Agent found in database:")
        print(f"  - ID: {our_agent.get('id')}")
        print(f"  - Name: {our_agent.get('agent_name')}")
        print(f"  - Mode: {our_agent.get('mode')}")
        print(f"  - Post Destination: {our_agent.get('post_destination')}")
        print(f"  - Immediate: {our_agent.get('immediate')}")
    else:
        print("❌ Agent not found in database!")

# Check in-review posts
print(f"\n📋 Checking in-review posts...")
response = requests.get(f"{API_URL}/ai-posts/in-review?page=1&limit=10", headers=headers)
if response.status_code == 200:
    data = response.json()
    posts = data.get("posts", [])
    our_posts = [p for p in posts if p.get("agent_id") == agent_id]
    print(f"Total in-review posts: {len(posts)}")
    print(f"Our agent's posts in in-review: {len(our_posts)}")
    if our_posts:
        for post in our_posts:
            print(f"  - Post ID: {post.get('id', 'N/A')[:8]}... Status: {post.get('status', 'N/A')}")

# Check ready-to-publish posts
print(f"\n📋 Checking ready-to-publish posts...")
response = requests.get(f"{API_URL}/ai-posts/ready-to-publish?page=1&limit=10", headers=headers)
if response.status_code == 200:
    data = response.json()
    posts = data.get("posts", [])
    our_posts = [p for p in posts if p.get("agent_id") == agent_id]
    print(f"Total ready-to-publish posts: {len(posts)}")
    print(f"Our agent's posts in ready-to-publish: {len(our_posts)}")
    if our_posts:
        for post in our_posts:
            print(f"  - Post ID: {post.get('id', 'N/A')[:8]}... Status: {post.get('status', 'N/A')}")

print("\n🏁 Debug test complete!")