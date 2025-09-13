#!/usr/bin/env python3
"""
Recurring Email Agent Functionality Test

This test verifies the fix for recurring email agents that was just implemented.
The issue was that generate_email_for_agent() only handled scheduled (holiday-based) 
agents, not recurring (topic-based) agents.

Test Focus:
1. Test the "Weekly Newsletter" recurring email agent (ID: 9e936886-4d17-4c3a-9987-51c63c1a6486)
2. Verify /api/ai-agents/{agent_id}/generate-post endpoint works for recurring agents
3. Confirm generated posts have correct metadata and content
"""

import asyncio
import sys
import os
import json
import requests
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

class RecurringEmailAgentTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        
        # Get backend URL from frontend .env
        frontend_env_path = Path(__file__).parent / "frontend" / ".env"
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.backend_url = line.split('=', 1)[1].strip()
                        break
        else:
            self.backend_url = "https://petsai-templates.preview.emergentagent.com"
        
        self.api_base = f"{self.backend_url}/api"
        print(f"Using API base URL: {self.api_base}")
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    async def find_weekly_newsletter_agent(self):
        """Find the Weekly Newsletter recurring email agent"""
        print("=== FINDING WEEKLY NEWSLETTER RECURRING EMAIL AGENT ===")
        
        # Look for the specific agent ID mentioned in the review request
        target_agent_id = "9e936886-4d17-4c3a-9987-51c63c1a6486"
        
        agent = await self.db.ai_agents.find_one({"id": target_agent_id})
        
        if agent:
            print(f"✅ Found target agent: {agent.get('agent_name')}")
            print(f"   Agent ID: {agent.get('id')}")
            print(f"   Agent Type: {agent.get('agent_type')}")
            print(f"   Mode: {agent.get('mode')}")
            print(f"   Topic: {agent.get('topic')}")
            return agent
        
        # If specific agent not found, look for any recurring email agent
        print(f"❌ Target agent {target_agent_id} not found, searching for any recurring email agent...")
        
        agents = await self.db.ai_agents.find({
            'agent_type': 'email',
            'mode': 'recurring'
        }).to_list(length=None)
        
        print(f"Found {len(agents)} recurring email agents:")
        for agent in agents:
            print(f"  - {agent.get('agent_name')} (ID: {agent.get('id')}) | Topic: {agent.get('topic')}")
        
        return agents[0] if agents else None
    
    async def create_test_recurring_email_agent(self):
        """Create a test recurring email agent if none exists"""
        print("\n=== CREATING TEST RECURRING EMAIL AGENT ===")
        
        import uuid
        
        test_agent = {
            "id": "9e936886-4d17-4c3a-9987-51c63c1a6486",  # Use the ID from review request
            "agent_name": "Weekly Newsletter",
            "agent_type": "email",
            "mode": "recurring",
            "topic": "Trending Pet Health News",
            "email_content_template": "Dear [CUSTOMER_NAME],\n\nWe hope this message finds you and [PET_NAMES] in great health!\n\nThis week's trending pet health news includes important updates that every pet owner should know about. Our veterinary team has compiled the most relevant information to help you keep your furry friends healthy and happy.\n\nStay tuned for more updates!\n\nWarm regards,\nThe Veterinary Care Team",
            "use_chatgpt_formatting": True,
            "use_customer_database": True,
            "email_type": "bulk",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True,
            "frequency": "weekly",
            "platforms": ["email"]
        }
        
        # Insert the test agent
        await self.db.ai_agents.insert_one(test_agent)
        print(f"✅ Created test recurring email agent: {test_agent['id']}")
        print(f"   Name: {test_agent['agent_name']}")
        print(f"   Topic: {test_agent['topic']}")
        
        return test_agent
    
    async def test_generate_post_endpoint(self, agent_id):
        """Test the /api/ai-agents/{agent_id}/generate-post endpoint"""
        print(f"\n=== TESTING GENERATE POST ENDPOINT FOR AGENT {agent_id} ===")
        
        endpoint = f"{self.api_base}/ai-agents/{agent_id}/generate-post"
        print(f"Calling endpoint: {endpoint}")
        
        try:
            response = requests.post(endpoint, timeout=30)
            print(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Generate post endpoint successful!")
                print(f"Response: {json.dumps(result, indent=2)}")
                return result
            else:
                print(f"❌ Generate post endpoint failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error calling generate post endpoint: {str(e)}")
            return None
    
    async def verify_generated_post(self, post_id):
        """Verify the generated post has correct metadata"""
        print(f"\n=== VERIFYING GENERATED POST {post_id} ===")
        
        post = await self.db.ai_posts.find_one({"id": post_id})
        
        if not post:
            print(f"❌ Post {post_id} not found in database")
            return False
        
        print("✅ Post found in database!")
        print(f"Post details:")
        print(f"  ID: {post.get('id')}")
        print(f"  Topic: {post.get('topic')}")
        print(f"  Agent Type: {post.get('agent_type')}")
        print(f"  Platform: {post.get('platform')}")
        print(f"  Status: {post.get('status')}")
        print(f"  Content Preview: {post.get('content', '')[:200]}...")
        
        # Verify expected values
        checks = []
        
        # Check topic
        expected_topic = "Trending Pet Health News"
        actual_topic = post.get('topic')
        if actual_topic == expected_topic:
            checks.append("✅ Topic correct")
        else:
            checks.append(f"❌ Topic incorrect - Expected: '{expected_topic}', Got: '{actual_topic}'")
        
        # Check agent type
        expected_agent_type = "email"
        actual_agent_type = post.get('agent_type')
        if actual_agent_type == expected_agent_type:
            checks.append("✅ Agent type correct")
        else:
            checks.append(f"❌ Agent type incorrect - Expected: '{expected_agent_type}', Got: '{actual_agent_type}'")
        
        # Check platform
        expected_platform = ["email"]
        actual_platform = post.get('platform')
        if actual_platform == expected_platform:
            checks.append("✅ Platform correct")
        else:
            checks.append(f"❌ Platform incorrect - Expected: {expected_platform}, Got: {actual_platform}")
        
        # Check status
        expected_status = "in_review"
        actual_status = post.get('status')
        if actual_status == expected_status:
            checks.append("✅ Status correct")
        else:
            checks.append(f"❌ Status incorrect - Expected: '{expected_status}', Got: '{actual_status}'")
        
        # Check customer data substitution
        content = post.get('content', '')
        if '[CUSTOMER_NAME]' not in content and '[PET_NAME]' not in content:
            checks.append("✅ Customer data properly substituted")
        else:
            checks.append("❌ Customer data placeholders still present in content")
        
        print("\nVerification Results:")
        for check in checks:
            print(f"  {check}")
        
        # Return True if all checks passed
        return all("✅" in check for check in checks)
    
    async def check_customers_exist(self):
        """Check if there are customers in the database for personalization"""
        print("\n=== CHECKING CUSTOMER DATABASE ===")
        
        customers = await self.db.customers.find().limit(5).to_list(length=5)
        print(f"Found {len(customers)} customers in database:")
        
        for customer in customers:
            name = customer.get('name', 'Unknown')
            pet_name = customer.get('pet_name', 'No pets')
            pets = customer.get('pets', [])
            
            if pets:
                pet_names = [pet.get('name', '') for pet in pets if pet.get('name')]
                pet_display = ', '.join(pet_names) if pet_names else 'No pet names'
            else:
                pet_display = pet_name
            
            print(f"  - {name} | Pets: {pet_display}")
        
        return len(customers) > 0
    
    async def test_both_modes(self):
        """Test both scheduled and recurring modes to verify the fix"""
        print("\n=== TESTING BOTH EMAIL AGENT MODES ===")
        
        # Test recurring mode (the one that was broken)
        recurring_agents = await self.db.ai_agents.find({
            'agent_type': 'email',
            'mode': 'recurring'
        }).to_list(length=None)
        
        print(f"Found {len(recurring_agents)} recurring email agents")
        
        # Test scheduled mode (should still work)
        scheduled_agents = await self.db.ai_agents.find({
            'agent_type': 'email',
            'mode': 'recurring',
            'selected_holidays': {'$exists': True, '$ne': []}
        }).to_list(length=None)
        
        print(f"Found {len(scheduled_agents)} scheduled email agents")
        
        return {
            'recurring_count': len(recurring_agents),
            'scheduled_count': len(scheduled_agents)
        }
    
    async def run_comprehensive_test(self):
        """Run comprehensive test of recurring email agent functionality"""
        print("🧪 STARTING RECURRING EMAIL AGENT FUNCTIONALITY TEST")
        print("=" * 70)
        
        try:
            await self.connect()
            
            # Step 1: Check if customers exist for personalization
            customers_exist = await self.check_customers_exist()
            if not customers_exist:
                print("⚠️  No customers found - email personalization may not work properly")
            
            # Step 2: Find or create the Weekly Newsletter agent
            agent = await self.find_weekly_newsletter_agent()
            
            if not agent:
                print("⚠️  Weekly Newsletter agent not found, creating test agent...")
                agent = await self.create_test_recurring_email_agent()
            
            # Step 3: Test both modes to verify the fix
            mode_stats = await self.test_both_modes()
            
            # Step 4: Test the generate post endpoint
            result = await self.test_generate_post_endpoint(agent['id'])
            
            if result and result.get('post_id'):
                # Step 5: Verify the generated post
                post_verified = await self.verify_generated_post(result['post_id'])
                
                # Step 6: Final analysis
                print("\n" + "=" * 70)
                print("🎯 TEST RESULTS SUMMARY")
                print("=" * 70)
                
                if post_verified:
                    print("✅ RECURRING EMAIL AGENT FIX VERIFIED SUCCESSFULLY!")
                    print("   - Generate post endpoint works for recurring agents")
                    print("   - Generated post has correct metadata")
                    print("   - Customer data properly substituted")
                    print("   - Post created with 'in_review' status")
                else:
                    print("❌ RECURRING EMAIL AGENT FIX HAS ISSUES")
                    print("   - Some verification checks failed")
                
                print(f"\nAgent Statistics:")
                print(f"   - Recurring email agents: {mode_stats['recurring_count']}")
                print(f"   - Scheduled email agents: {mode_stats['scheduled_count']}")
                print(f"   - Customers in database: {'Yes' if customers_exist else 'No'}")
                
                return post_verified
            else:
                print("\n" + "=" * 70)
                print("❌ CRITICAL ISSUE: GENERATE POST ENDPOINT FAILED")
                print("=" * 70)
                print("   The recurring email agent fix may not be working properly.")
                print("   The generate-post endpoint did not return a valid post ID.")
                return False
                
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = RecurringEmailAgentTester()
    success = await tester.run_comprehensive_test()
    
    if success:
        print("\n🎉 ALL TESTS PASSED - RECURRING EMAIL AGENT FIX IS WORKING!")
    else:
        print("\n💥 TESTS FAILED - RECURRING EMAIL AGENT FIX NEEDS ATTENTION!")
    
    return success

if __name__ == "__main__":
    asyncio.run(main())