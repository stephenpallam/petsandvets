#!/usr/bin/env python3
"""
SMS Agent API Dashboard Test

This test verifies the API endpoints work correctly for SMS agents with holidays
by testing the actual GET /api/ai-agents endpoint that the frontend uses.
"""

import asyncio
import sys
import os
import json
import aiohttp
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

class APIDashboardTester:
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
            self.backend_url = "https://vetssms.preview.emergentagent.com"
        
        self.api_url = f"{self.backend_url}/api"
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    async def create_test_sms_agent_with_holidays(self):
        """Create a test SMS agent with holidays for API testing"""
        import uuid
        
        # Get some holidays
        holidays = await self.db.holidays.find({}).limit(3).to_list(length=3)
        if not holidays:
            print("❌ No holidays found in database")
            return None
        
        selected_holiday_ids = [holiday["id"] for holiday in holidays[:2]]
        
        agent_data = {
            "id": str(uuid.uuid4()),
            "agent_name": "API Test SMS Agent",
            "agent_type": "sms_agent",
            "mode": "recurring",
            "selected_holidays": selected_holiday_ids,
            "sms_provider": "twilio",
            "sms_link": "https://petsandvetsanimalhospital.com",
            "sms_template": "Hi [CUSTOMER_NAME]! Happy [HOLIDAY_NAME]! We hope you and [PET_NAME] have a wonderful celebration. - Your Vet Team",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        # Insert the test agent
        await self.db.ai_agents.insert_one(agent_data)
        return agent_data
    
    async def test_api_agents_endpoint(self):
        """Test the GET /api/ai-agents endpoint"""
        print("🧪 Testing GET /api/ai-agents endpoint")
        print("=" * 60)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/ai-agents") as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        # Find SMS agents in the response
                        sms_agents = [agent for agent in data if agent.get("agent_type") == "sms_agent"]
                        
                        print(f"✅ API Response Status: {response.status}")
                        print(f"✅ Total Agents Returned: {len(data)}")
                        print(f"✅ SMS Agents Found: {len(sms_agents)}")
                        
                        # Check SMS agents with holidays
                        sms_agents_with_holidays = []
                        for agent in sms_agents:
                            if agent.get("selected_holidays") and len(agent.get("selected_holidays", [])) > 0:
                                sms_agents_with_holidays.append(agent)
                                
                                print(f"\n📱 SMS Agent: {agent.get('agent_name')}")
                                print(f"   - Agent Type: {agent.get('agent_type')}")
                                print(f"   - Mode: {agent.get('mode')}")
                                print(f"   - Selected Holidays: {len(agent.get('selected_holidays', []))} holidays")
                                print(f"   - Holiday IDs: {agent.get('selected_holidays', [])}")
                                
                                # Test the dashboard condition
                                condition_passes = (
                                    agent.get("selected_holidays") is not None and 
                                    len(agent.get("selected_holidays", [])) > 0
                                )
                                print(f"   - Dashboard Condition (selected_holidays && length > 0): {condition_passes}")
                        
                        print(f"\n✅ SMS Agents with Holidays: {len(sms_agents_with_holidays)}")
                        
                        if sms_agents_with_holidays:
                            print("✅ API endpoint returns SMS agents with proper holiday data structure")
                            return True
                        else:
                            print("⚠️  No SMS agents with holidays found in API response")
                            return False
                    else:
                        print(f"❌ API Response Status: {response.status}")
                        error_text = await response.text()
                        print(f"❌ Error: {error_text}")
                        return False
                        
        except Exception as e:
            print(f"❌ Error testing API endpoint: {str(e)}")
            return False
    
    async def test_specific_agent_retrieval(self, agent_id: str):
        """Test retrieving a specific SMS agent"""
        print(f"\n🧪 Testing GET /api/ai-agents/{agent_id}")
        print("=" * 60)
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.api_url}/ai-agents/{agent_id}") as response:
                    if response.status == 200:
                        agent = await response.json()
                        
                        print(f"✅ Agent Retrieved: {agent.get('agent_name')}")
                        print(f"✅ Agent Type: {agent.get('agent_type')}")
                        print(f"✅ Mode: {agent.get('mode')}")
                        
                        # Check holiday data
                        selected_holidays = agent.get("selected_holidays", [])
                        print(f"✅ Selected Holidays Count: {len(selected_holidays)}")
                        print(f"✅ Holiday IDs: {selected_holidays}")
                        
                        # Test dashboard condition
                        condition_passes = selected_holidays is not None and len(selected_holidays) > 0
                        print(f"✅ Dashboard Condition Passes: {condition_passes}")
                        
                        return condition_passes
                    else:
                        print(f"❌ API Response Status: {response.status}")
                        return False
                        
        except Exception as e:
            print(f"❌ Error testing specific agent retrieval: {str(e)}")
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data"""
        try:
            await self.db.ai_agents.delete_many({
                "agent_name": {"$regex": "API Test SMS Agent"}
            })
            print("🧹 Test data cleanup completed")
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up test data: {str(e)}")
    
    async def run_api_dashboard_test(self):
        """Run API dashboard test"""
        print("🚀 STARTING SMS AGENT API DASHBOARD TEST")
        print("=" * 80)
        print(f"Testing API endpoint: {self.api_url}")
        print("Verifying SMS agents with holidays are properly returned by API")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Create test SMS agent with holidays
            print("📝 Creating test SMS agent with holidays...")
            test_agent = await self.create_test_sms_agent_with_holidays()
            
            if not test_agent:
                print("❌ Failed to create test agent")
                return
            
            print(f"✅ Created test agent: {test_agent['agent_name']} (ID: {test_agent['id']})")
            
            # Test API endpoints
            print("\n" + "=" * 80)
            
            # Test 1: GET /api/ai-agents
            api_test_passed = await self.test_api_agents_endpoint()
            
            # Test 2: GET /api/ai-agents/{id}
            specific_test_passed = await self.test_specific_agent_retrieval(test_agent['id'])
            
            # Summary
            print("\n" + "=" * 80)
            print("🎯 API DASHBOARD TEST SUMMARY")
            print("=" * 80)
            
            if api_test_passed and specific_test_passed:
                print("🎉 ALL API TESTS PASSED!")
                print("✅ GET /api/ai-agents returns SMS agents with holiday data")
                print("✅ GET /api/ai-agents/{id} returns specific agent with holiday data")
                print("✅ Dashboard condition (selected_holidays && length > 0) works correctly")
                print("✅ Frontend should be able to access holiday data and show proper display")
                print("\n🔧 FRONTEND INTEGRATION READY:")
                print("   - API endpoints return proper data structure")
                print("   - selected_holidays array is populated")
                print("   - Dashboard condition will pass")
                print("   - getNextScheduledHoliday logic can access holiday data")
            else:
                print("❌ SOME API TESTS FAILED")
                print(f"   - GET /api/ai-agents: {'✅ PASS' if api_test_passed else '❌ FAIL'}")
                print(f"   - GET /api/ai-agents/{{id}}: {'✅ PASS' if specific_test_passed else '❌ FAIL'}")
            
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during API testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.cleanup_test_data()
            await self.disconnect()

async def main():
    """Main test function"""
    tester = APIDashboardTester()
    await tester.run_api_dashboard_test()

if __name__ == "__main__":
    asyncio.run(main())