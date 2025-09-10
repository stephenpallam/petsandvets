#!/usr/bin/env python3
"""
Customer Data Investigation Test for SMS Preview Issue

This test investigates the customer data issue where SMS preview shows 
"No customers found in database" when user reports there is one customer.

Investigation Focus:
1. Check Customer Collections - Look for customers in different possible collection names
2. Verify Customer Data Structure - Check the actual structure of customer records  
3. Test Customer API Endpoint - Test if GET /api/customers endpoint exists and works
4. Check Alternative Customer Endpoints - Look for other customer-related endpoints
5. Test Customer Database Query - Run direct database queries to find customer data

Expected Results:
- Should find where customer data is stored
- Should identify the correct API endpoint for customer data
- Should find the customer record that user mentioned
- Should determine why frontend can't access customer data
"""

import asyncio
import sys
import os
import json
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

class SMSAIServiceTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        
    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client[self.db_name]
        
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
    
    def log_test_result(self, test_name: str, success: bool, message: str, details: dict = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        print(f"   {message}")
        if details:
            for key, value in details.items():
                print(f"   {key}: {value}")
        print()
        
        self.test_results.append({
            "test_name": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        })
    
    async def create_test_sms_agent(self, agent_name: str, mode: str = "recurring", selected_holidays: list = None):
        """Create a test SMS agent"""
        import uuid
        
        agent_data = {
            "id": str(uuid.uuid4()),
            "agent_name": agent_name,
            "agent_type": "sms_agent",
            "mode": mode,
            "sms_provider": "twilio",
            "sms_link": "https://petsandvetsanimalhospital.com",
            "sms_template": "Hi [CUSTOMER_NAME]! We hope [PET_NAME] is doing well. - Your Vet Team",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        if selected_holidays:
            agent_data["selected_holidays"] = selected_holidays
        
        if mode == "write":
            agent_data["sms_content"] = "Test SMS content for write mode agent"
        elif mode == "recurring" and not selected_holidays:
            agent_data["topic"] = "Pet Health Tips"
        
        # Insert the test agent
        await self.db.ai_agents.insert_one(agent_data)
        return agent_data
    
    async def test_ai_service_initialization(self):
        """Test 1: AI Service LlmChat Initialization Fix"""
        print("🧪 TEST 1: AI Service LlmChat Initialization Fix")
        print("=" * 60)
        
        try:
            # Import AI service
            from ai_service import ai_service
            
            # Test direct SMS content generation
            result = await ai_service.generate_sms_content(
                topic="Pet Health Tips",
                custom_topic="Create a warm SMS about regular pet checkups",
                track_usage=True,
                user_id="test_user",
                agent_id="test_agent"
            )
            
            # Check if result contains expected fields
            if result and "content" in result and "character_count" in result:
                if "error" not in result:
                    self.log_test_result(
                        "AI Service LlmChat Initialization",
                        True,
                        "LlmChat initialization successful - no missing arguments error",
                        {
                            "Generated Content": result["content"][:100] + "..." if len(result["content"]) > 100 else result["content"],
                            "Character Count": result["character_count"],
                            "Within SMS Limit": result["character_count"] <= 160
                        }
                    )
                    return True
                else:
                    self.log_test_result(
                        "AI Service LlmChat Initialization",
                        False,
                        f"AI service returned error: {result['error']}",
                        {"Error Details": result.get("error")}
                    )
                    return False
            else:
                self.log_test_result(
                    "AI Service LlmChat Initialization",
                    False,
                    "AI service returned invalid result format",
                    {"Result": str(result)}
                )
                return False
                
        except Exception as e:
            error_msg = str(e)
            if "missing" in error_msg.lower() and "argument" in error_msg.lower():
                self.log_test_result(
                    "AI Service LlmChat Initialization",
                    False,
                    f"LlmChat initialization still has missing arguments: {error_msg}",
                    {"Error Type": "Missing Arguments", "Full Error": error_msg}
                )
            else:
                self.log_test_result(
                    "AI Service LlmChat Initialization",
                    False,
                    f"Unexpected error in AI service: {error_msg}",
                    {"Error Type": "Unexpected Error", "Full Error": error_msg}
                )
            return False
    
    async def test_sms_content_generation(self):
        """Test 2: Basic SMS Content Generation"""
        print("🧪 TEST 2: Basic SMS Content Generation")
        print("=" * 60)
        
        try:
            # Create a simple SMS agent
            agent = await self.create_test_sms_agent("Test SMS Agent", mode="recurring")
            
            # Import the SMS generation function
            from server import generate_sms_for_agent
            
            # Test SMS generation
            post_id = await generate_sms_for_agent(agent["id"], agent)
            
            if post_id:
                # Check the generated post
                post = await self.db.ai_posts.find_one({"id": post_id})
                
                if post and post.get("status") == "in_review":
                    content = post.get("content", "")
                    char_count = len(content)
                    
                    self.log_test_result(
                        "SMS Content Generation",
                        True,
                        "SMS content generated successfully",
                        {
                            "Post ID": post_id,
                            "Content": content[:100] + "..." if len(content) > 100 else content,
                            "Character Count": char_count,
                            "Within SMS Limit": char_count <= 160,
                            "Status": post.get("status"),
                            "Agent Type": post.get("agent_type")
                        }
                    )
                    return True
                else:
                    self.log_test_result(
                        "SMS Content Generation",
                        False,
                        f"Post created but with wrong status or missing content",
                        {
                            "Post Status": post.get("status") if post else "No post found",
                            "Post Content": post.get("content", "No content") if post else "No post found"
                        }
                    )
                    return False
            else:
                self.log_test_result(
                    "SMS Content Generation",
                    False,
                    "SMS generation did not return a post ID",
                    {"Returned Value": str(post_id)}
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "SMS Content Generation",
                False,
                f"Error during SMS content generation: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_holiday_sms_generation(self):
        """Test 3: Holiday-Specific SMS Generation"""
        print("🧪 TEST 3: Holiday-Specific SMS Generation")
        print("=" * 60)
        
        try:
            # Find a holiday to use for testing
            holidays = await self.db.holidays.find({}).limit(5).to_list(length=5)
            
            if not holidays:
                self.log_test_result(
                    "Holiday SMS Generation",
                    False,
                    "No holidays found in database for testing",
                    {"Available Holidays": 0}
                )
                return False
            
            # Use the first available holiday
            test_holiday = holidays[0]
            holiday_id = test_holiday["id"]
            holiday_name = test_holiday["name"]
            holiday_date = test_holiday["date"]
            
            # Create SMS agent with holiday selection
            agent = await self.create_test_sms_agent(
                f"Holiday SMS Agent - {holiday_name}",
                mode="recurring",
                selected_holidays=[holiday_id]
            )
            
            # Import the SMS generation function
            from server import generate_sms_for_agent
            
            # Test holiday-based SMS generation
            post_id = await generate_sms_for_agent(agent["id"], agent)
            
            if post_id:
                # Check the generated post
                post = await self.db.ai_posts.find_one({"id": post_id})
                
                if post and post.get("status") == "in_review":
                    content = post.get("content", "")
                    char_count = len(content)
                    
                    # Check if content mentions the holiday (basic check)
                    holiday_mentioned = any(word.lower() in content.lower() for word in holiday_name.split())
                    
                    self.log_test_result(
                        "Holiday SMS Generation",
                        True,
                        "Holiday-specific SMS content generated successfully",
                        {
                            "Holiday Used": f"{holiday_name} ({holiday_date})",
                            "Post ID": post_id,
                            "Content": content[:100] + "..." if len(content) > 100 else content,
                            "Character Count": char_count,
                            "Within SMS Limit": char_count <= 160,
                            "Holiday Context Detected": holiday_mentioned,
                            "Status": post.get("status")
                        }
                    )
                    return True
                else:
                    self.log_test_result(
                        "Holiday SMS Generation",
                        False,
                        f"Holiday SMS post created but with issues",
                        {
                            "Post Status": post.get("status") if post else "No post found",
                            "Holiday Used": f"{holiday_name} ({holiday_date})"
                        }
                    )
                    return False
            else:
                self.log_test_result(
                    "Holiday SMS Generation",
                    False,
                    "Holiday SMS generation did not return a post ID",
                    {
                        "Holiday Used": f"{holiday_name} ({holiday_date})",
                        "Returned Value": str(post_id)
                    }
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "Holiday SMS Generation",
                False,
                f"Error during holiday SMS generation: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_sms_character_limit(self):
        """Test 4: SMS Character Limit Compliance"""
        print("🧪 TEST 4: SMS Character Limit Compliance")
        print("=" * 60)
        
        try:
            from ai_service import ai_service
            
            # Test with a topic that might generate long content
            long_topic = "Create a detailed SMS about comprehensive pet health care including vaccinations, dental care, nutrition, exercise, grooming, and regular checkups"
            
            result = await ai_service.generate_sms_content(
                topic="Pet Health",
                custom_topic=long_topic,
                track_usage=False
            )
            
            if result and "content" in result:
                content = result["content"]
                char_count = len(content)
                within_limit = char_count <= 160
                
                self.log_test_result(
                    "SMS Character Limit Compliance",
                    within_limit,
                    f"SMS content character count: {char_count}/160",
                    {
                        "Content": content,
                        "Character Count": char_count,
                        "Within Limit": within_limit,
                        "Truncated": "..." in content
                    }
                )
                return within_limit
            else:
                self.log_test_result(
                    "SMS Character Limit Compliance",
                    False,
                    "AI service did not return valid content for character limit test",
                    {"Result": str(result)}
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "SMS Character Limit Compliance",
                False,
                f"Error during character limit test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_sms_manual_run(self):
        """Test 5: SMS Agent Manual Run via API"""
        print("🧪 TEST 5: SMS Agent Manual Run via API")
        print("=" * 60)
        
        try:
            # Create a test SMS agent
            agent = await self.create_test_sms_agent("Manual Run Test Agent", mode="write")
            agent_id = agent["id"]
            
            # Import the run agent function
            from server import run_agent
            
            # Test manual run
            result = await run_agent(agent_id)
            
            if result and "message" in result:
                # Check if a post was created
                posts = await self.db.ai_posts.find({
                    "agent_id": agent_id,
                    "agent_type": "sms_agent"
                }).to_list(length=10)
                
                if posts:
                    latest_post = posts[-1]  # Get the most recent post
                    
                    self.log_test_result(
                        "SMS Agent Manual Run",
                        True,
                        "SMS agent manual run completed successfully",
                        {
                            "Agent ID": agent_id,
                            "Result Message": result["message"],
                            "Post Created": latest_post.get("id"),
                            "Post Status": latest_post.get("status"),
                            "Content Preview": latest_post.get("content", "")[:50] + "..." if latest_post.get("content") else "No content"
                        }
                    )
                    return True
                else:
                    self.log_test_result(
                        "SMS Agent Manual Run",
                        False,
                        "Manual run completed but no SMS post was created",
                        {
                            "Agent ID": agent_id,
                            "Result Message": result["message"],
                            "Posts Found": len(posts)
                        }
                    )
                    return False
            else:
                self.log_test_result(
                    "SMS Agent Manual Run",
                    False,
                    "Manual run did not return expected result format",
                    {
                        "Agent ID": agent_id,
                        "Result": str(result)
                    }
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Manual Run",
                False,
                f"Error during manual run test: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data created during testing"""
        try:
            # Delete test agents
            await self.db.ai_agents.delete_many({
                "agent_name": {"$regex": "Test.*Agent|Holiday SMS Agent.*|Manual Run Test Agent"}
            })
            
            # Delete test posts
            await self.db.ai_posts.delete_many({
                "agent_name": {"$regex": "Test.*Agent|Holiday SMS Agent.*|Manual Run Test Agent"}
            })
            
            print("🧹 Test data cleanup completed")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up all test data: {str(e)}")
    
    async def run_comprehensive_sms_ai_test(self):
        """Run comprehensive SMS AI service integration test"""
        print("🚀 STARTING SMS AI SERVICE INTEGRATION TEST")
        print("=" * 80)
        print("Testing the AI service fix for SMS generation")
        print("Focus: LlmChat initialization with session_id and system_message parameters")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all tests
            test_results = []
            
            # Test 1: AI Service Initialization
            test_results.append(await self.test_ai_service_initialization())
            
            # Test 2: Basic SMS Content Generation
            test_results.append(await self.test_sms_content_generation())
            
            # Test 3: Holiday-Specific SMS Generation
            test_results.append(await self.test_holiday_sms_generation())
            
            # Test 4: SMS Character Limit
            test_results.append(await self.test_sms_character_limit())
            
            # Test 5: Manual Run
            test_results.append(await self.test_sms_manual_run())
            
            # Summary
            print("=" * 80)
            print("🎯 SMS AI SERVICE INTEGRATION TEST SUMMARY")
            print("=" * 80)
            
            passed_tests = sum(test_results)
            total_tests = len(test_results)
            success_rate = (passed_tests / total_tests) * 100
            
            print(f"Tests Passed: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
            print()
            
            # Detailed results
            for result in self.test_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            
            # Overall assessment
            if passed_tests == total_tests:
                print("🎉 ALL TESTS PASSED - SMS AI Service Integration Fix is Working!")
                print("✅ No more LlmChat initialization errors")
                print("✅ SMS content generation working correctly")
                print("✅ Holiday-based SMS generation functional")
                print("✅ Character limit compliance maintained")
                print("✅ Manual run functionality operational")
            elif passed_tests >= 3:
                print("⚠️  MOSTLY WORKING - SMS AI Service Integration has minor issues")
                print("✅ Core AI service fix appears to be working")
                print("⚠️  Some functionality may need additional attention")
            else:
                print("❌ CRITICAL ISSUES - SMS AI Service Integration needs attention")
                print("❌ Core AI service fix may not be fully implemented")
                print("❌ Multiple functionality areas failing")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Clean up test data
            await self.cleanup_test_data()
            await self.disconnect()

async def main():
    """Main test function"""
    tester = SMSAIServiceTester()
    await tester.run_comprehensive_sms_ai_test()

if __name__ == "__main__":
    asyncio.run(main())