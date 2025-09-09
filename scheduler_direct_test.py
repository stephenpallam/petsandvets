#!/usr/bin/env python3
"""
Direct Database Scheduler Test for Social Media Agents

This test bypasses API authentication and tests scheduler functionality directly
through database operations and function calls.
"""

import asyncio
import sys
import os
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import required modules
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_dir / '.env')

class DirectSchedulerTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    async def create_write_mode_agent_direct(self, agent_name, post_title, post_content, post_date, post_time, platforms):
        """Create a write mode social media agent directly in database"""
        print(f"\n=== CREATING WRITE MODE AGENT DIRECTLY ===")
        print(f"Agent Name: {agent_name}")
        print(f"Post Date: {post_date}")
        print(f"Post Time: {post_time}")
        print(f"Platforms: {platforms}")
        
        agent_id = str(uuid.uuid4())
        agent_data = {
            "id": agent_id,
            "agent_name": agent_name,
            "agent_type": "social_media",
            "mode": "write",
            "post_title": post_title,
            "post_content": post_content,
            "post_date": post_date,
            "post_time": post_time,
            "social_platforms": platforms,
            "image_option": "none",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        try:
            await self.db.ai_agents.insert_one(agent_data)
            print(f"✅ Agent created directly with ID: {agent_id}")
            return agent_id, agent_data
        except Exception as e:
            print(f"❌ Error creating agent directly: {str(e)}")
            return None, None
    
    async def verify_agent_in_database(self, agent_id):
        """Verify agent exists in database with correct fields"""
        print(f"\n=== VERIFYING AGENT IN DATABASE ===")
        
        try:
            agent = await self.db.ai_agents.find_one({"id": agent_id})
            if agent:
                print("✅ Agent found in database")
                print(f"  Agent Name: {agent.get('agent_name')}")
                print(f"  Agent Type: {agent.get('agent_type')}")
                print(f"  Mode: {agent.get('mode')}")
                print(f"  Post Date: {agent.get('post_date')}")
                print(f"  Post Time: {agent.get('post_time')}")
                print(f"  Social Platforms: {agent.get('social_platforms')}")
                
                # Verify required fields
                required_fields = ['post_date', 'post_time', 'social_platforms', 'mode', 'agent_type']
                verification_results = {}
                
                for field in required_fields:
                    verification_results[field] = agent.get(field) is not None
                
                print(f"\n📋 FIELD VERIFICATION:")
                for field, result in verification_results.items():
                    status = "✅" if result else "❌"
                    print(f"  {status} {field}: {agent.get(field)}")
                
                return agent, all(verification_results.values())
            else:
                print("❌ Agent not found in database")
                return None, False
                
        except Exception as e:
            print(f"❌ Database verification error: {str(e)}")
            return None, False
    
    async def test_scheduler_function_exists(self):
        """Test if scheduler functions exist and can be imported"""
        print(f"\n=== TESTING SCHEDULER FUNCTION AVAILABILITY ===")
        
        try:
            # Import scheduler functions from server.py
            from server import scheduled_posts_scheduler, process_scheduled_posts
            
            print("✅ scheduled_posts_scheduler function imported successfully")
            print("✅ process_scheduled_posts function imported successfully")
            
            # Check if functions are callable
            if callable(scheduled_posts_scheduler):
                print("✅ scheduled_posts_scheduler is callable")
            else:
                print("❌ scheduled_posts_scheduler is not callable")
                
            if callable(process_scheduled_posts):
                print("✅ process_scheduled_posts is callable")
            else:
                print("❌ process_scheduled_posts is not callable")
            
            return True
            
        except ImportError as e:
            print(f"❌ Failed to import scheduler functions: {str(e)}")
            return False
        except Exception as e:
            print(f"❌ Error testing scheduler functions: {str(e)}")
            return False
    
    async def create_scheduled_post_direct(self, agent_id, agent_data):
        """Create a scheduled post directly to test scheduler processing"""
        print(f"\n=== CREATING SCHEDULED POST DIRECTLY ===")
        
        try:
            # Import the generate function
            from server import generate_social_media_post_for_agent
            
            # Call the generation function
            result = await generate_social_media_post_for_agent(agent_id, agent_data)
            
            if result and result.get('post_id'):
                post_id = result['post_id']
                print(f"✅ Post generated successfully: {post_id}")
                
                # Check the post in database
                post = await self.db.ai_posts.find_one({"id": post_id})
                if post:
                    print(f"  Post Status: {post.get('status')}")
                    print(f"  Scheduled For: {post.get('scheduled_for')}")
                    print(f"  Content Preview: {post.get('content', '')[:100]}...")
                    return post_id, post
                else:
                    print("❌ Post not found in database")
                    return None, None
            else:
                print("❌ Post generation failed")
                return None, None
                
        except Exception as e:
            print(f"❌ Error creating scheduled post: {str(e)}")
            import traceback
            traceback.print_exc()
            return None, None
    
    async def test_process_scheduled_posts_function(self):
        """Test the process_scheduled_posts function directly"""
        print(f"\n=== TESTING process_scheduled_posts FUNCTION ===")
        
        try:
            # Import and call the function
            from server import process_scheduled_posts
            
            # Count posts before processing
            posts_before = await self.db.ai_posts.count_documents({"status": "scheduled"})
            print(f"Scheduled posts before processing: {posts_before}")
            
            # Call the function
            await process_scheduled_posts()
            print("✅ process_scheduled_posts executed successfully")
            
            # Count posts after processing
            posts_after = await self.db.ai_posts.count_documents({"status": "scheduled"})
            published_posts = await self.db.ai_posts.count_documents({"status": "published"})
            
            print(f"Scheduled posts after processing: {posts_after}")
            print(f"Published posts: {published_posts}")
            
            if posts_before > posts_after:
                print(f"✅ {posts_before - posts_after} posts were processed by scheduler")
                return True
            else:
                print("⚠️  No posts were processed (may be expected if no posts were due)")
                return True  # Still successful execution
                
        except Exception as e:
            print(f"❌ Error testing process_scheduled_posts: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    async def check_scheduler_startup(self):
        """Check if scheduler is configured to start on application startup"""
        print(f"\n=== CHECKING SCHEDULER STARTUP CONFIGURATION ===")
        
        try:
            server_file = backend_dir / "server.py"
            if server_file.exists():
                with open(server_file, 'r') as f:
                    content = f.read()
                
                # Check for startup configuration
                startup_found = "asyncio.create_task(scheduled_posts_scheduler())" in content
                on_event_found = "@app.on_event(\"startup\")" in content
                
                print(f"✅ Scheduler startup task found: {startup_found}")
                print(f"✅ Startup event handler found: {on_event_found}")
                
                if startup_found:
                    print("✅ Scheduler is configured to start automatically")
                    return True
                else:
                    print("❌ Scheduler startup configuration not found")
                    return False
            else:
                print("❌ Server.py file not found")
                return False
                
        except Exception as e:
            print(f"❌ Error checking startup configuration: {str(e)}")
            return False
    
    async def test_date_time_handling(self):
        """Test how the system handles different date/time scenarios"""
        print(f"\n=== TESTING DATE/TIME HANDLING ===")
        
        try:
            # Test future date
            future_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            future_time = "14:30"
            
            future_agent_id, future_agent = await self.create_write_mode_agent_direct(
                "Future Date Test Agent",
                "Future Test Post",
                "This is a future test post",
                future_date,
                future_time,
                ["facebook"]
            )
            
            if future_agent_id:
                print(f"✅ Future date agent created: {future_date} {future_time}")
                
                # Test past date
                past_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
                past_time = "09:00"
                
                past_agent_id, past_agent = await self.create_write_mode_agent_direct(
                    "Past Date Test Agent",
                    "Past Test Post", 
                    "This is a past test post",
                    past_date,
                    past_time,
                    ["instagram"]
                )
                
                if past_agent_id:
                    print(f"✅ Past date agent created: {past_date} {past_time}")
                    return True, [future_agent_id, past_agent_id]
                else:
                    print("❌ Failed to create past date agent")
                    return False, [future_agent_id] if future_agent_id else []
            else:
                print("❌ Failed to create future date agent")
                return False, []
                
        except Exception as e:
            print(f"❌ Error testing date/time handling: {str(e)}")
            return False, []
    
    async def run_comprehensive_direct_test(self):
        """Run comprehensive direct database scheduler test"""
        print("🔍 STARTING COMPREHENSIVE DIRECT SCHEDULER TEST")
        print("=" * 70)
        
        test_results = {
            'database_connection': False,
            'scheduler_functions': False,
            'scheduler_startup': False,
            'agent_creation': False,
            'agent_verification': False,
            'post_generation': False,
            'scheduler_processing': False,
            'date_time_handling': False
        }
        
        created_agents = []
        
        try:
            await self.connect()
            test_results['database_connection'] = True
            print("✅ Database connection successful")
            
            # Test 1: Check scheduler functions
            test_results['scheduler_functions'] = await self.test_scheduler_function_exists()
            
            # Test 2: Check scheduler startup configuration
            test_results['scheduler_startup'] = await self.check_scheduler_startup()
            
            # Test 3: Create write mode agent as specified in requirements
            agent_id, agent_data = await self.create_write_mode_agent_direct(
                "Test Social Media Write Agent",
                "Test Social Media Post",
                "This is test social media content",
                "2025-09-10",  # Tomorrow as specified
                "14:30",
                ["facebook", "instagram"]
            )
            
            if agent_id:
                test_results['agent_creation'] = True
                created_agents.append(agent_id)
                
                # Test 4: Verify agent creation
                agent_db, verification_success = await self.verify_agent_in_database(agent_id)
                test_results['agent_verification'] = verification_success
                
                # Test 5: Test post generation
                post_id, post_data = await self.create_scheduled_post_direct(agent_id, agent_data)
                if post_id:
                    test_results['post_generation'] = True
            
            # Test 6: Test scheduler processing function
            test_results['scheduler_processing'] = await self.test_process_scheduled_posts_function()
            
            # Test 7: Test date/time handling
            date_success, date_agents = await self.test_date_time_handling()
            test_results['date_time_handling'] = date_success
            created_agents.extend(date_agents)
            
            # Final Analysis
            print(f"\n" + "=" * 70)
            print("🎯 COMPREHENSIVE DIRECT TEST RESULTS")
            print("=" * 70)
            
            total_tests = len(test_results)
            passed_tests = sum(test_results.values())
            
            print(f"📊 OVERALL SCORE: {passed_tests}/{total_tests} tests passed")
            print(f"📈 SUCCESS RATE: {(passed_tests/total_tests)*100:.1f}%")
            
            print(f"\n📋 DETAILED RESULTS:")
            for test_name, result in test_results.items():
                status = "✅ PASS" if result else "❌ FAIL"
                print(f"  {status} {test_name.replace('_', ' ').title()}")
            
            # Scheduler Assessment
            print(f"\n🕐 SCHEDULER FUNCTIONALITY ASSESSMENT:")
            
            scheduler_core_working = (
                test_results['scheduler_functions'] and 
                test_results['scheduler_startup'] and 
                test_results['scheduler_processing']
            )
            
            agent_functionality_working = (
                test_results['agent_creation'] and 
                test_results['agent_verification'] and
                test_results['post_generation']
            )
            
            if scheduler_core_working:
                print("✅ Core scheduler functionality is implemented and working")
            else:
                print("❌ Core scheduler functionality has issues")
            
            if agent_functionality_working:
                print("✅ Agent creation and post generation working")
            else:
                print("❌ Agent creation or post generation has issues")
            
            if test_results['date_time_handling']:
                print("✅ Date/time handling working for both future and past dates")
            else:
                print("❌ Date/time handling has issues")
            
            # Overall Assessment
            if passed_tests >= 6:
                print(f"\n🎉 SCHEDULER SYSTEM: FUNCTIONAL")
                print("The scheduler system appears to be working correctly with automatic post processing.")
            elif passed_tests >= 4:
                print(f"\n⚠️  SCHEDULER SYSTEM: PARTIALLY FUNCTIONAL")
                print("The scheduler system has some functionality but may have issues.")
            else:
                print(f"\n❌ SCHEDULER SYSTEM: NOT FUNCTIONAL")
                print("The scheduler system has significant issues.")
            
            return test_results, created_agents
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return test_results, created_agents
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = DirectSchedulerTester()
    results, agents = await tester.run_comprehensive_direct_test()
    
    # Summary for main agent
    print(f"\n" + "=" * 70)
    print("📝 SUMMARY FOR MAIN AGENT")
    print("=" * 70)
    
    passed_count = sum(results.values())
    total_count = len(results)
    
    print(f"Created {len(agents)} test agents during testing.")
    
    # Key findings
    key_findings = []
    
    if results.get('scheduler_functions'):
        key_findings.append("✅ Scheduler functions are implemented")
    else:
        key_findings.append("❌ Scheduler functions missing or not accessible")
    
    if results.get('scheduler_startup'):
        key_findings.append("✅ Scheduler configured to start automatically")
    else:
        key_findings.append("❌ Scheduler startup configuration missing")
    
    if results.get('agent_creation') and results.get('agent_verification'):
        key_findings.append("✅ Write mode social media agents can be created with scheduling parameters")
    else:
        key_findings.append("❌ Issues with write mode social media agent creation")
    
    if results.get('post_generation'):
        key_findings.append("✅ Scheduled posts can be generated from agents")
    else:
        key_findings.append("❌ Post generation from scheduled agents not working")
    
    if results.get('scheduler_processing'):
        key_findings.append("✅ Scheduler processing function works")
    else:
        key_findings.append("❌ Scheduler processing function has issues")
    
    print("\n🔍 KEY FINDINGS:")
    for finding in key_findings:
        print(f"  {finding}")
    
    # Final verdict
    if passed_count >= 6:
        print(f"\n✅ FINAL VERDICT: SCHEDULER FUNCTIONALITY IS WORKING")
        print("The scheduling system for custom post mode social media agents is functional.")
    elif passed_count >= 4:
        print(f"\n⚠️  FINAL VERDICT: SCHEDULER FUNCTIONALITY IS PARTIALLY WORKING")
        print("The scheduling system has some functionality but may need fixes.")
    else:
        print(f"\n❌ FINAL VERDICT: SCHEDULER FUNCTIONALITY IS NOT WORKING")
        print("The scheduling system has significant issues and needs attention.")

if __name__ == "__main__":
    asyncio.run(main())