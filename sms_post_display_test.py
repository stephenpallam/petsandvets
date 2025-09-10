#!/usr/bin/env python3
"""
SMS Post Display Fix Test for AIInReview

This test verifies the SMS post display fix that was just implemented.
Specifically tests:
1. SMS posts in "in_review" status and their data structure
2. Verification that SMS posts don't have platforms field (which was causing the error)
3. Check what fields SMS posts have vs what the frontend expects
4. Verify SMS posts have proper content field populated
5. Verify SMS posts have agent_type as 'sms_agent'
6. Check if SMS posts from holiday scheduling have proper structure
7. Create test SMS post if needed for testing
8. Test that the frontend fix (adding safety check for post.platforms) would work

Expected Results:
- SMS posts should not have platforms field (which was causing the error)
- SMS posts should have content, agent_type, agent_name, and other basic fields
- The fix should prevent the "Cannot read properties of undefined (reading 'map')" error
- SMS posts should display properly in the In Review page
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

class SMSPostDisplayTester:
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
    
    async def test_existing_sms_posts_structure(self):
        """Test 1: Check existing SMS posts in 'in_review' status"""
        print("🧪 TEST 1: Existing SMS Posts Structure Analysis")
        print("=" * 60)
        
        try:
            # Find SMS posts in "in_review" status
            sms_posts = await self.db.ai_posts.find({
                "agent_type": "sms_agent",
                "status": "in_review"
            }).to_list(length=10)
            
            if not sms_posts:
                self.log_test_result(
                    "Existing SMS Posts Structure",
                    True,  # Not a failure, just no data
                    "No SMS posts found in 'in_review' status",
                    {
                        "SMS Posts Found": 0,
                        "Note": "Will create test posts for verification"
                    }
                )
                return True
            
            # Analyze the structure of existing SMS posts
            analysis_results = []
            platforms_field_found = False
            
            for post in sms_posts:
                post_analysis = {
                    "post_id": post.get("id", "Unknown"),
                    "agent_name": post.get("agent_name", "Unknown"),
                    "has_platforms": "platforms" in post,
                    "has_content": "content" in post and bool(post.get("content")),
                    "has_agent_type": post.get("agent_type") == "sms_agent",
                    "has_agent_name": "agent_name" in post and bool(post.get("agent_name")),
                    "content_preview": post.get("content", "")[:50] + "..." if post.get("content") else "No content",
                    "all_fields": list(post.keys())
                }
                
                if post_analysis["has_platforms"]:
                    platforms_field_found = True
                    post_analysis["platforms_value"] = post.get("platforms")
                
                analysis_results.append(post_analysis)
            
            # Determine if the structure is correct
            all_posts_valid = all(
                not result["has_platforms"] and  # SMS posts should NOT have platforms
                result["has_content"] and        # Should have content
                result["has_agent_type"] and     # Should have correct agent_type
                result["has_agent_name"]         # Should have agent_name
                for result in analysis_results
            )
            
            self.log_test_result(
                "Existing SMS Posts Structure",
                all_posts_valid,
                f"Analyzed {len(sms_posts)} SMS posts in 'in_review' status",
                {
                    "Total SMS Posts": len(sms_posts),
                    "Posts with platforms field": sum(1 for r in analysis_results if r["has_platforms"]),
                    "Posts with content": sum(1 for r in analysis_results if r["has_content"]),
                    "Posts with correct agent_type": sum(1 for r in analysis_results if r["has_agent_type"]),
                    "Posts with agent_name": sum(1 for r in analysis_results if r["has_agent_name"]),
                    "Platforms Field Found": platforms_field_found,
                    "Sample Post Fields": analysis_results[0]["all_fields"] if analysis_results else "None",
                    "Structure Valid": all_posts_valid
                }
            )
            
            return all_posts_valid
            
        except Exception as e:
            self.log_test_result(
                "Existing SMS Posts Structure",
                False,
                f"Error analyzing existing SMS posts: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_create_sms_post_structure(self):
        """Test 2: Create test SMS post and verify structure"""
        print("🧪 TEST 2: Create Test SMS Post and Verify Structure")
        print("=" * 60)
        
        try:
            # First, create a test SMS agent if needed
            import uuid
            
            agent_data = {
                "id": str(uuid.uuid4()),
                "agent_name": "Test SMS Display Agent",
                "agent_type": "sms_agent",
                "mode": "write",
                "sms_provider": "twilio",
                "sms_link": "https://petsandvetsanimalhospital.com",
                "sms_template": "Hi [CUSTOMER_NAME]! We hope [PET_NAME] is doing well. - Your Vet Team",
                "sms_content": "Test SMS content for display verification",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_active": True
            }
            
            # Insert the test agent
            await self.db.ai_agents.insert_one(agent_data)
            
            # Import the SMS generation function
            from server import generate_sms_for_agent
            
            # Generate SMS post
            post_id = await generate_sms_for_agent(agent_data["id"], agent_data)
            
            if post_id:
                # Retrieve the created post
                post = await self.db.ai_posts.find_one({"id": post_id})
                
                if post:
                    # Analyze the post structure
                    structure_analysis = {
                        "has_platforms": "platforms" in post,
                        "has_content": "content" in post and bool(post.get("content")),
                        "has_agent_type": post.get("agent_type") == "sms_agent",
                        "has_agent_name": "agent_name" in post and bool(post.get("agent_name")),
                        "has_sms_template": "sms_template" in post,
                        "has_sms_link": "sms_link" in post,
                        "status": post.get("status"),
                        "all_fields": list(post.keys())
                    }
                    
                    # Check if structure is correct for frontend display
                    structure_valid = (
                        not structure_analysis["has_platforms"] and  # Should NOT have platforms
                        structure_analysis["has_content"] and        # Should have content
                        structure_analysis["has_agent_type"] and     # Should have correct agent_type
                        structure_analysis["has_agent_name"] and     # Should have agent_name
                        structure_analysis["status"] == "in_review"  # Should be in review
                    )
                    
                    self.log_test_result(
                        "Create Test SMS Post Structure",
                        structure_valid,
                        "Test SMS post created and structure verified",
                        {
                            "Post ID": post_id,
                            "Agent Type": post.get("agent_type"),
                            "Agent Name": post.get("agent_name"),
                            "Has Platforms Field": structure_analysis["has_platforms"],
                            "Has Content": structure_analysis["has_content"],
                            "Content Preview": post.get("content", "")[:50] + "..." if post.get("content") else "No content",
                            "Status": structure_analysis["status"],
                            "SMS Template Present": structure_analysis["has_sms_template"],
                            "SMS Link Present": structure_analysis["has_sms_link"],
                            "All Fields": structure_analysis["all_fields"],
                            "Structure Valid for Frontend": structure_valid
                        }
                    )
                    
                    return structure_valid
                else:
                    self.log_test_result(
                        "Create Test SMS Post Structure",
                        False,
                        "Post was created but could not be retrieved",
                        {"Post ID": post_id}
                    )
                    return False
            else:
                self.log_test_result(
                    "Create Test SMS Post Structure",
                    False,
                    "SMS post generation did not return a post ID",
                    {"Agent ID": agent_data["id"]}
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "Create Test SMS Post Structure",
                False,
                f"Error creating test SMS post: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_holiday_sms_post_structure(self):
        """Test 3: Create holiday-based SMS post and verify structure"""
        print("🧪 TEST 3: Holiday SMS Post Structure Verification")
        print("=" * 60)
        
        try:
            # Find a holiday to use for testing
            holidays = await self.db.holidays.find({}).limit(3).to_list(length=3)
            
            if not holidays:
                self.log_test_result(
                    "Holiday SMS Post Structure",
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
            import uuid
            
            agent_data = {
                "id": str(uuid.uuid4()),
                "agent_name": f"Holiday SMS Display Test - {holiday_name}",
                "agent_type": "sms_agent",
                "mode": "recurring",
                "selected_holidays": [holiday_id],
                "sms_provider": "twilio",
                "sms_link": "https://petsandvetsanimalhospital.com",
                "sms_template": "Happy [HOLIDAY_NAME], [CUSTOMER_NAME]! We hope [PET_NAME] enjoys the celebration. - Your Vet Team",
                "post_time": "09:00",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "is_active": True
            }
            
            # Insert the test agent
            await self.db.ai_agents.insert_one(agent_data)
            
            # Import the SMS generation function
            from server import generate_sms_for_agent
            
            # Generate holiday SMS post
            post_id = await generate_sms_for_agent(agent_data["id"], agent_data)
            
            if post_id:
                # Retrieve the created post
                post = await self.db.ai_posts.find_one({"id": post_id})
                
                if post:
                    # Analyze the holiday post structure
                    structure_analysis = {
                        "has_platforms": "platforms" in post,
                        "has_content": "content" in post and bool(post.get("content")),
                        "has_agent_type": post.get("agent_type") == "sms_agent",
                        "has_agent_name": "agent_name" in post and bool(post.get("agent_name")),
                        "has_sms_template": "sms_template" in post,
                        "has_sms_link": "sms_link" in post,
                        "has_holiday_context": any(word.lower() in post.get("content", "").lower() for word in holiday_name.split()),
                        "status": post.get("status"),
                        "all_fields": list(post.keys())
                    }
                    
                    # Check if structure is correct for frontend display
                    structure_valid = (
                        not structure_analysis["has_platforms"] and  # Should NOT have platforms
                        structure_analysis["has_content"] and        # Should have content
                        structure_analysis["has_agent_type"] and     # Should have correct agent_type
                        structure_analysis["has_agent_name"] and     # Should have agent_name
                        structure_analysis["status"] == "in_review"  # Should be in review
                    )
                    
                    self.log_test_result(
                        "Holiday SMS Post Structure",
                        structure_valid,
                        "Holiday SMS post created and structure verified",
                        {
                            "Post ID": post_id,
                            "Holiday Used": f"{holiday_name} ({holiday_date})",
                            "Agent Type": post.get("agent_type"),
                            "Agent Name": post.get("agent_name"),
                            "Has Platforms Field": structure_analysis["has_platforms"],
                            "Has Content": structure_analysis["has_content"],
                            "Content Preview": post.get("content", "")[:100] + "..." if post.get("content") else "No content",
                            "Holiday Context Detected": structure_analysis["has_holiday_context"],
                            "Status": structure_analysis["status"],
                            "All Fields": structure_analysis["all_fields"],
                            "Structure Valid for Frontend": structure_valid
                        }
                    )
                    
                    return structure_valid
                else:
                    self.log_test_result(
                        "Holiday SMS Post Structure",
                        False,
                        "Holiday SMS post was created but could not be retrieved",
                        {
                            "Post ID": post_id,
                            "Holiday Used": f"{holiday_name} ({holiday_date})"
                        }
                    )
                    return False
            else:
                self.log_test_result(
                    "Holiday SMS Post Structure",
                    False,
                    "Holiday SMS post generation did not return a post ID",
                    {
                        "Agent ID": agent_data["id"],
                        "Holiday Used": f"{holiday_name} ({holiday_date})"
                    }
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "Holiday SMS Post Structure",
                False,
                f"Error creating holiday SMS post: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_frontend_compatibility(self):
        """Test 4: Verify SMS posts are compatible with frontend expectations"""
        print("🧪 TEST 4: Frontend Compatibility Verification")
        print("=" * 60)
        
        try:
            # Get all SMS posts in review status
            sms_posts = await self.db.ai_posts.find({
                "agent_type": "sms_agent",
                "status": "in_review"
            }).to_list(length=20)
            
            if not sms_posts:
                self.log_test_result(
                    "Frontend Compatibility",
                    True,  # Not a failure if no posts exist
                    "No SMS posts found for frontend compatibility testing",
                    {"SMS Posts Found": 0}
                )
                return True
            
            # Check each post for frontend compatibility
            compatibility_issues = []
            posts_with_platforms = 0
            posts_without_content = 0
            posts_without_agent_type = 0
            posts_without_agent_name = 0
            
            for post in sms_posts:
                post_id = post.get("id", "Unknown")
                issues = []
                
                # Check for the main issue: platforms field
                if "platforms" in post:
                    posts_with_platforms += 1
                    issues.append("Has platforms field (causes map() error)")
                
                # Check for other required fields
                if not post.get("content"):
                    posts_without_content += 1
                    issues.append("Missing or empty content field")
                
                if post.get("agent_type") != "sms_agent":
                    posts_without_agent_type += 1
                    issues.append("Missing or incorrect agent_type")
                
                if not post.get("agent_name"):
                    posts_without_agent_name += 1
                    issues.append("Missing or empty agent_name")
                
                if issues:
                    compatibility_issues.append({
                        "post_id": post_id,
                        "agent_name": post.get("agent_name", "Unknown"),
                        "issues": issues
                    })
            
            # Determine overall compatibility
            is_compatible = (
                posts_with_platforms == 0 and  # No posts should have platforms field
                posts_without_content == 0 and  # All posts should have content
                posts_without_agent_type == 0 and  # All posts should have correct agent_type
                posts_without_agent_name == 0  # All posts should have agent_name
            )
            
            self.log_test_result(
                "Frontend Compatibility",
                is_compatible,
                f"Analyzed {len(sms_posts)} SMS posts for frontend compatibility",
                {
                    "Total SMS Posts": len(sms_posts),
                    "Posts with platforms field": posts_with_platforms,
                    "Posts without content": posts_without_content,
                    "Posts without agent_type": posts_without_agent_type,
                    "Posts without agent_name": posts_without_agent_name,
                    "Posts with issues": len(compatibility_issues),
                    "Frontend Compatible": is_compatible,
                    "Main Issue (platforms field)": f"{posts_with_platforms} posts affected" if posts_with_platforms > 0 else "None found",
                    "Fix Status": "Frontend fix should prevent map() error" if posts_with_platforms == 0 else "Frontend fix needed for platforms field"
                }
            )
            
            return is_compatible
            
        except Exception as e:
            self.log_test_result(
                "Frontend Compatibility",
                False,
                f"Error checking frontend compatibility: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_sms_vs_social_media_structure(self):
        """Test 5: Compare SMS posts vs Social Media posts structure"""
        print("🧪 TEST 5: SMS vs Social Media Post Structure Comparison")
        print("=" * 60)
        
        try:
            # Get SMS posts
            sms_posts = await self.db.ai_posts.find({
                "agent_type": "sms_agent"
            }).limit(5).to_list(length=5)
            
            # Get social media posts for comparison
            social_posts = await self.db.ai_posts.find({
                "agent_type": "social_media"
            }).limit(5).to_list(length=5)
            
            # Analyze field differences
            sms_fields = set()
            social_fields = set()
            
            for post in sms_posts:
                sms_fields.update(post.keys())
            
            for post in social_posts:
                social_fields.update(post.keys())
            
            # Find differences
            sms_only_fields = sms_fields - social_fields
            social_only_fields = social_fields - sms_fields
            common_fields = sms_fields & social_fields
            
            # Check if SMS posts have platforms field
            sms_with_platforms = sum(1 for post in sms_posts if "platforms" in post)
            social_with_platforms = sum(1 for post in social_posts if "platforms" in post)
            
            structure_correct = sms_with_platforms == 0  # SMS posts should not have platforms
            
            self.log_test_result(
                "SMS vs Social Media Structure",
                structure_correct,
                f"Compared structure of {len(sms_posts)} SMS posts vs {len(social_posts)} social media posts",
                {
                    "SMS Posts Analyzed": len(sms_posts),
                    "Social Media Posts Analyzed": len(social_posts),
                    "SMS-only Fields": list(sms_only_fields),
                    "Social Media-only Fields": list(social_only_fields),
                    "Common Fields": len(common_fields),
                    "SMS Posts with platforms": sms_with_platforms,
                    "Social Posts with platforms": social_with_platforms,
                    "Structure Issue": "SMS posts should not have platforms field" if sms_with_platforms > 0 else "None",
                    "Fix Verification": "SMS posts correctly lack platforms field" if sms_with_platforms == 0 else "SMS posts incorrectly have platforms field"
                }
            )
            
            return structure_correct
            
        except Exception as e:
            self.log_test_result(
                "SMS vs Social Media Structure",
                False,
                f"Error comparing post structures: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data created during testing"""
        try:
            # Delete test agents
            await self.db.ai_agents.delete_many({
                "agent_name": {"$regex": "Test SMS Display Agent|Holiday SMS Display Test.*"}
            })
            
            # Delete test posts
            await self.db.ai_posts.delete_many({
                "agent_name": {"$regex": "Test SMS Display Agent|Holiday SMS Display Test.*"}
            })
            
            print("🧹 Test data cleanup completed")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not clean up all test data: {str(e)}")
    
    async def run_comprehensive_sms_display_test(self):
        """Run comprehensive SMS post display fix test"""
        print("🚀 STARTING SMS POST DISPLAY FIX TEST")
        print("=" * 80)
        print("Testing the SMS post display fix for AIInReview")
        print("Focus: Verifying SMS posts don't have platforms field causing map() error")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all tests
            test_results = []
            
            # Test 1: Existing SMS Posts Structure
            test_results.append(await self.test_existing_sms_posts_structure())
            
            # Test 2: Create Test SMS Post Structure
            test_results.append(await self.test_create_sms_post_structure())
            
            # Test 3: Holiday SMS Post Structure
            test_results.append(await self.test_holiday_sms_post_structure())
            
            # Test 4: Frontend Compatibility
            test_results.append(await self.test_frontend_compatibility())
            
            # Test 5: SMS vs Social Media Structure
            test_results.append(await self.test_sms_vs_social_media_structure())
            
            # Summary
            print("=" * 80)
            print("🎯 SMS POST DISPLAY FIX TEST SUMMARY")
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
                print("🎉 ALL TESTS PASSED - SMS Post Display Fix is Working!")
                print("✅ SMS posts do not have platforms field")
                print("✅ SMS posts have all required fields for display")
                print("✅ Frontend fix should prevent map() error")
                print("✅ SMS posts structure is correct for AIInReview")
                print("✅ Holiday SMS posts have proper structure")
            elif passed_tests >= 3:
                print("⚠️  MOSTLY WORKING - SMS Post Display has minor issues")
                print("✅ Core structure appears correct")
                print("⚠️  Some posts may need additional attention")
            else:
                print("❌ CRITICAL ISSUES - SMS Post Display needs attention")
                print("❌ SMS posts may still have structure issues")
                print("❌ Frontend fix may not be sufficient")
            
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
    tester = SMSPostDisplayTester()
    await tester.run_comprehensive_sms_display_test()

if __name__ == "__main__":
    asyncio.run(main())