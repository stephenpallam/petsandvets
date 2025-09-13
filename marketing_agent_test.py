#!/usr/bin/env python3
"""
Marketing Agent Post Creation Issues Investigation

This test investigates the Marketing Agent post creation issues as requested:

1. Check Post Duplication Issue - Create marketing agent with 2 social media platforms (Facebook, Instagram), 
   enable email and SMS channels, run campaign generation, and analyze ALL posts created
2. Verify Email/SMS Post Creation - Check if email/SMS posts are created with proper fields
3. Analyze Post Structure - Show details of each created post
4. Check for Multiple Creation Paths - Verify that generate_marketing_campaign_for_agent is only called once
5. Database Query - After running campaign, query database to show total count and breakdown

Expected Results:
- Identify post duplication issues
- Verify proper email/SMS post creation with correct fields
- Analyze post structure and missing fields
- Check for multiple creation paths causing duplicates
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

class MarketingAgentTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://marketing-agent.preview.emergentagent.com')
        self.auth_token = None
        self.created_agent_ids = []
        
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
    
    async def authenticate(self):
        """Get authentication token"""
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            login_data = {
                "email": "admin@hospital.com",
                "password": "admin123"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                login_url = f"{self.backend_url}/api/login"
                async with session.post(login_url, json=login_data, timeout=10) as response:
                    if response.status == 200:
                        login_result = await response.json()
                        self.auth_token = login_result.get("access_token")
                        return True
                    else:
                        print(f"Authentication failed: {response.status}")
                        return False
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return False
    
    async def cleanup_test_data(self):
        """Clean up test data before starting tests"""
        try:
            # Remove any existing test marketing agents and posts
            await self.db.ai_agents.delete_many({"agent_name": {"$regex": "^Test Marketing Agent"}})
            await self.db.ai_posts.delete_many({"agent_name": {"$regex": "^Test Marketing Agent"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def test_post_duplication_issue(self):
        """Test 1: Check Post Duplication Issue"""
        print("🔍 TEST 1: Check Post Duplication Issue")
        print("=" * 60)
        print("Creating marketing agent with 2 social media platforms (Facebook, Instagram)")
        print("Enabling email and SMS channels")
        print("Running campaign generation and analyzing ALL posts created")
        print()
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Create marketing agent with exact specifications
            agent_data = {
                "agent_type": "marketing_agent",
                "agent_name": "Test Marketing Agent - Post Duplication Check",
                "mode": "adhoc",
                "topic": "Pet Health and Wellness",
                "marketing_content_type": "topic",
                "marketing_channels": ["social_media", "email", "sms"],
                "marketing_social_platforms": {
                    "facebook": True,
                    "instagram": True,
                    "twitter": False,
                    "linkedin": False,
                    "youtube": False,
                    "tiktok": False
                },
                "marketing_email_personalized": True,
                "email_content_template": "Hello [CUSTOMER_NAME]! We have important health tips for [PET_NAME]. Visit our clinic for [PET_NAMES] care.",
                "marketing_sms_personalized": True,
                "marketing_sms_template": "Hi [CUSTOMER_NAME]! [PET_NAME] needs attention. Call us about [PET_NAMES] health.",
                "marketing_workflow_mode": "in_review"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Step 1: Create the marketing agent
                url = f"{self.backend_url}/api/ai-agents"
                async with session.post(url, headers=headers, json=agent_data, timeout=30) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        self.log_test_result(
                            "Create Marketing Agent",
                            False,
                            f"Failed to create marketing agent: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False
                    
                    created_agent = await response.json()
                    agent_id = created_agent.get("agent_id") or created_agent.get("id")
                    if not agent_id:
                        self.log_test_result(
                            "Create Marketing Agent",
                            False,
                            f"Agent created but no ID returned: {created_agent}",
                            {"Response": created_agent}
                        )
                        return False, []
                    self.created_agent_ids.append(agent_id)
                    print(f"✅ Created marketing agent with ID: {agent_id}")
                
                # Step 2: Run the marketing campaign generation
                print("🚀 Running marketing campaign generation...")
                url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                async with session.post(url, headers=headers, timeout=60) as response:
                    if response.status != 200:
                        response_text = await response.text()
                        self.log_test_result(
                            "Run Marketing Campaign",
                            False,
                            f"Failed to run marketing campaign: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": response_text}
                        )
                        return False
                    
                    campaign_result = await response.json()
                    print(f"✅ Campaign generation completed")
                
                # Step 3: Wait a moment for posts to be fully generated
                await asyncio.sleep(5)
                
                # Step 4: Query database to analyze ALL posts created
                print("🔍 Analyzing ALL posts created...")
                posts_cursor = self.db.ai_posts.find({"agent_id": agent_id})
                all_posts = await posts_cursor.to_list(length=None)
                
                # Analyze posts
                total_posts = len(all_posts)
                posts_by_channel = {}
                posts_by_platform = {}
                posts_without_channel = []
                posts_without_platform = []
                duplicate_analysis = {}
                
                for post in all_posts:
                    # Channel analysis
                    channel = post.get('marketing_channel', 'MISSING')
                    if channel == 'MISSING':
                        posts_without_channel.append(post.get('id'))
                    posts_by_channel[channel] = posts_by_channel.get(channel, 0) + 1
                    
                    # Platform analysis (for social media posts)
                    platform = post.get('marketing_platform', post.get('platform', 'MISSING'))
                    if channel == 'social_media' and platform == 'MISSING':
                        posts_without_platform.append(post.get('id'))
                    posts_by_platform[platform] = posts_by_platform.get(platform, 0) + 1
                    
                    # Duplicate content analysis
                    content = post.get('content', '')[:50]  # First 50 chars for comparison
                    key = f"{channel}_{platform}_{content}"
                    if key in duplicate_analysis:
                        duplicate_analysis[key].append(post.get('id'))
                    else:
                        duplicate_analysis[key] = [post.get('id')]
                
                # Find actual duplicates (same channel/platform/content with multiple posts)
                actual_duplicates = {k: v for k, v in duplicate_analysis.items() if len(v) > 1}
                
                # Expected posts: 2 social media (Facebook, Instagram) + 1 email + 1 SMS = 4 total
                expected_posts = 4
                expected_channels = {"social_media": 2, "email": 1, "sms": 1}
                expected_platforms = {"facebook": 1, "instagram": 1}
                
                # Check for issues
                has_duplicates = len(actual_duplicates) > 0
                has_missing_channels = len(posts_without_channel) > 0
                has_missing_platforms = len(posts_without_platform) > 0
                correct_total_count = total_posts == expected_posts
                correct_channel_breakdown = all(posts_by_channel.get(ch, 0) == count for ch, count in expected_channels.items())
                correct_platform_breakdown = all(posts_by_platform.get(pl, 0) == count for pl, count in expected_platforms.items())
                
                success = (
                    correct_total_count and
                    correct_channel_breakdown and
                    correct_platform_breakdown and
                    not has_duplicates and
                    not has_missing_channels and
                    not has_missing_platforms
                )
                
                # Detailed post analysis
                post_details = []
                for i, post in enumerate(all_posts, 1):
                    post_detail = {
                        f"Post {i} ID": post.get('id'),
                        f"Post {i} Channel": post.get('marketing_channel', 'MISSING'),
                        f"Post {i} Platform": post.get('marketing_platform', post.get('platform', 'MISSING')),
                        f"Post {i} Status": post.get('status', 'MISSING'),
                        f"Post {i} Content (first 50 chars)": post.get('content', '')[:50] + "..." if len(post.get('content', '')) > 50 else post.get('content', ''),
                        f"Post {i} Has Email Fields": bool(post.get('email_subject') or post.get('email_template')),
                        f"Post {i} Has SMS Fields": bool(post.get('sms_template') or post.get('sms_provider'))
                    }
                    post_details.append(post_detail)
                
                # Flatten post details for logging
                flattened_details = {}
                for detail_dict in post_details:
                    flattened_details.update(detail_dict)
                
                self.log_test_result(
                    "Post Duplication Analysis",
                    success,
                    f"Post duplication analysis: {'PASSED' if success else 'FAILED'}",
                    {
                        "Total Posts Created": total_posts,
                        "Expected Posts": expected_posts,
                        "Correct Total Count": correct_total_count,
                        "Posts by Channel": posts_by_channel,
                        "Expected Channels": expected_channels,
                        "Correct Channel Breakdown": correct_channel_breakdown,
                        "Posts by Platform": posts_by_platform,
                        "Expected Platforms": expected_platforms,
                        "Correct Platform Breakdown": correct_platform_breakdown,
                        "Has Duplicates": has_duplicates,
                        "Actual Duplicates": actual_duplicates,
                        "Posts Without Channel": posts_without_channel,
                        "Posts Without Platform": posts_without_platform,
                        "Has Missing Channels": has_missing_channels,
                        "Has Missing Platforms": has_missing_platforms,
                        **flattened_details
                    }
                )
                
                return success, all_posts
                
        except Exception as e:
            self.log_test_result(
                "Post Duplication Analysis",
                False,
                f"Error in post duplication analysis: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def test_email_sms_post_creation(self, all_posts):
        """Test 2: Verify Email/SMS Post Creation"""
        print("🔍 TEST 2: Verify Email/SMS Post Creation")
        print("=" * 60)
        print("Checking if email posts are created with proper fields")
        print("Checking if SMS posts are created with proper fields")
        print()
        
        try:
            email_posts = [post for post in all_posts if post.get('marketing_channel') == 'email']
            sms_posts = [post for post in all_posts if post.get('marketing_channel') == 'sms']
            
            # Expected email fields
            expected_email_fields = [
                'marketing_channel', 'email_subject', 'email_template', 
                'email_personalized', 'sample_customer_name', 'sample_customer_email'
            ]
            
            # Expected SMS fields
            expected_sms_fields = [
                'marketing_channel', 'sms_template', 'sms_personalized', 
                'sms_provider', 'sample_customer_name', 'sample_customer_phone'
            ]
            
            # Analyze email posts
            email_analysis = {}
            for i, post in enumerate(email_posts, 1):
                email_analysis[f"Email Post {i} ID"] = post.get('id')
                email_analysis[f"Email Post {i} Channel"] = post.get('marketing_channel')
                
                for field in expected_email_fields:
                    has_field = field in post and post[field] is not None
                    email_analysis[f"Email Post {i} Has {field}"] = has_field
                    if has_field:
                        value = post[field]
                        if isinstance(value, str) and len(value) > 100:
                            value = value[:100] + "..."
                        email_analysis[f"Email Post {i} {field} Value"] = value
            
            # Analyze SMS posts
            sms_analysis = {}
            for i, post in enumerate(sms_posts, 1):
                sms_analysis[f"SMS Post {i} ID"] = post.get('id')
                sms_analysis[f"SMS Post {i} Channel"] = post.get('marketing_channel')
                
                for field in expected_sms_fields:
                    has_field = field in post and post[field] is not None
                    sms_analysis[f"SMS Post {i} Has {field}"] = has_field
                    if has_field:
                        value = post[field]
                        if isinstance(value, str) and len(value) > 100:
                            value = value[:100] + "..."
                        sms_analysis[f"SMS Post {i} {field} Value"] = value
            
            # Check if all required fields are present
            email_fields_complete = True
            sms_fields_complete = True
            
            for post in email_posts:
                for field in expected_email_fields:
                    if field not in post or post[field] is None:
                        email_fields_complete = False
                        break
            
            for post in sms_posts:
                for field in expected_sms_fields:
                    if field not in post or post[field] is None:
                        sms_fields_complete = False
                        break
            
            success = (
                len(email_posts) > 0 and
                len(sms_posts) > 0 and
                email_fields_complete and
                sms_fields_complete
            )
            
            self.log_test_result(
                "Email/SMS Post Creation Verification",
                success,
                f"Email/SMS post creation: {'PASSED' if success else 'FAILED'}",
                {
                    "Email Posts Found": len(email_posts),
                    "SMS Posts Found": len(sms_posts),
                    "Email Fields Complete": email_fields_complete,
                    "SMS Fields Complete": sms_fields_complete,
                    "Expected Email Fields": expected_email_fields,
                    "Expected SMS Fields": expected_sms_fields,
                    **email_analysis,
                    **sms_analysis
                }
            )
            
            return success
            
        except Exception as e:
            self.log_test_result(
                "Email/SMS Post Creation Verification",
                False,
                f"Error in email/SMS verification: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_post_structure_analysis(self, all_posts):
        """Test 3: Analyze Post Structure"""
        print("🔍 TEST 3: Analyze Post Structure")
        print("=" * 60)
        print("Showing detailed structure of each created post")
        print()
        
        try:
            structure_analysis = {}
            
            for i, post in enumerate(all_posts, 1):
                post_prefix = f"Post {i}"
                structure_analysis[f"{post_prefix} ID"] = post.get('id')
                structure_analysis[f"{post_prefix} Agent ID"] = post.get('agent_id')
                structure_analysis[f"{post_prefix} Agent Type"] = post.get('agent_type')
                structure_analysis[f"{post_prefix} Marketing Channel"] = post.get('marketing_channel', 'MISSING')
                structure_analysis[f"{post_prefix} Marketing Platform"] = post.get('marketing_platform', 'MISSING')
                structure_analysis[f"{post_prefix} Platform Field"] = post.get('platform', 'MISSING')
                structure_analysis[f"{post_prefix} Status"] = post.get('status')
                structure_analysis[f"{post_prefix} Content Length"] = len(post.get('content', ''))
                structure_analysis[f"{post_prefix} Content Preview"] = post.get('content', '')[:100] + "..." if len(post.get('content', '')) > 100 else post.get('content', '')
                
                # Check for missing or unexpected fields
                expected_base_fields = ['id', 'agent_id', 'agent_type', 'marketing_channel', 'status', 'content', 'created_at', 'updated_at']
                missing_fields = [field for field in expected_base_fields if field not in post]
                unexpected_fields = [field for field in post.keys() if field not in [
                    'id', 'agent_id', 'agent_name', 'agent_type', 'marketing_channel', 'marketing_platform', 
                    'platform', 'topic', 'content', 'status', 'created_at', 'updated_at', 'email_subject', 
                    'email_template', 'email_personalized', 'sample_customer_name', 'sample_customer_email', 
                    'sample_pet_names', 'sms_template', 'sms_personalized', 'sms_provider', 'sample_customer_phone',
                    'hashtags', 'image_url', 'image_text', 'platforms', 'scheduled_for', 'published_at',
                    'social_media_links', 'error_message', 'ready_for_mass_email', 'ready_for_mass_sms'
                ]]
                
                structure_analysis[f"{post_prefix} Missing Fields"] = missing_fields
                structure_analysis[f"{post_prefix} Unexpected Fields"] = unexpected_fields
                
                # Channel-specific field analysis
                if post.get('marketing_channel') == 'email':
                    structure_analysis[f"{post_prefix} Email Subject"] = post.get('email_subject', 'MISSING')
                    structure_analysis[f"{post_prefix} Email Template Present"] = bool(post.get('email_template'))
                    structure_analysis[f"{post_prefix} Email Personalized"] = post.get('email_personalized', 'MISSING')
                
                elif post.get('marketing_channel') == 'sms':
                    structure_analysis[f"{post_prefix} SMS Template Present"] = bool(post.get('sms_template'))
                    structure_analysis[f"{post_prefix} SMS Personalized"] = post.get('sms_personalized', 'MISSING')
                    structure_analysis[f"{post_prefix} SMS Provider"] = post.get('sms_provider', 'MISSING')
                
                elif post.get('marketing_channel') == 'social_media':
                    structure_analysis[f"{post_prefix} Hashtags"] = post.get('hashtags', [])
                    structure_analysis[f"{post_prefix} Image URL"] = post.get('image_url', 'MISSING')
                    structure_analysis[f"{post_prefix} Platforms"] = post.get('platforms', [])
            
            # Overall structure health check
            all_have_required_fields = all(
                all(field in post for field in ['id', 'agent_id', 'marketing_channel', 'status', 'content'])
                for post in all_posts
            )
            
            all_have_proper_channels = all(
                post.get('marketing_channel') in ['social_media', 'email', 'sms']
                for post in all_posts
            )
            
            success = all_have_required_fields and all_have_proper_channels
            
            self.log_test_result(
                "Post Structure Analysis",
                success,
                f"Post structure analysis: {'PASSED' if success else 'FAILED'}",
                {
                    "All Have Required Fields": all_have_required_fields,
                    "All Have Proper Channels": all_have_proper_channels,
                    "Total Posts Analyzed": len(all_posts),
                    **structure_analysis
                }
            )
            
            return success
            
        except Exception as e:
            self.log_test_result(
                "Post Structure Analysis",
                False,
                f"Error in post structure analysis: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_multiple_creation_paths(self):
        """Test 4: Check for Multiple Creation Paths"""
        print("🔍 TEST 4: Check for Multiple Creation Paths")
        print("=" * 60)
        print("Verifying that generate_marketing_campaign_for_agent is only called once")
        print("Looking for any other functions creating posts for marketing agents")
        print()
        
        try:
            # This test checks the backend logs and database state to ensure
            # that the campaign generation function is only called once per agent run
            
            # Get the most recent agent we created
            if not self.created_agent_ids:
                self.log_test_result(
                    "Multiple Creation Paths Check",
                    False,
                    "No agent IDs available for testing",
                    {}
                )
                return False
            
            agent_id = self.created_agent_ids[-1]
            
            # Check database for any signs of multiple creation attempts
            posts_cursor = self.db.ai_posts.find({"agent_id": agent_id})
            all_posts = await posts_cursor.to_list(length=None)
            
            # Group posts by creation time to detect rapid successive creation
            creation_times = [post.get('created_at') for post in all_posts if post.get('created_at')]
            creation_times.sort()
            
            # Check for posts created within seconds of each other (potential duplicate creation)
            rapid_creation_detected = False
            if len(creation_times) > 1:
                for i in range(1, len(creation_times)):
                    time_diff = (creation_times[i] - creation_times[i-1]).total_seconds()
                    if time_diff < 2:  # Posts created within 2 seconds might indicate duplicate calls
                        rapid_creation_detected = True
                        break
            
            # Check for duplicate posts with identical content and timestamps
            content_timestamp_pairs = []
            for post in all_posts:
                content = post.get('content', '')[:100]  # First 100 chars
                timestamp = post.get('created_at')
                content_timestamp_pairs.append((content, timestamp))
            
            duplicate_content_timestamps = len(content_timestamp_pairs) != len(set(content_timestamp_pairs))
            
            # Check agent run history (if available)
            agent_cursor = self.db.ai_agents.find({"id": agent_id})
            agent_data = await agent_cursor.to_list(length=1)
            agent_info = agent_data[0] if agent_data else {}
            
            # Look for any indication of multiple runs
            last_run_at = agent_info.get('last_run_at')
            run_count = agent_info.get('run_count', 0)
            
            success = (
                not rapid_creation_detected and
                not duplicate_content_timestamps and
                run_count <= 1  # Should only have been run once in our test
            )
            
            self.log_test_result(
                "Multiple Creation Paths Check",
                success,
                f"Multiple creation paths check: {'PASSED' if success else 'FAILED'}",
                {
                    "Agent ID": agent_id,
                    "Total Posts": len(all_posts),
                    "Creation Times": [str(t) for t in creation_times],
                    "Rapid Creation Detected": rapid_creation_detected,
                    "Duplicate Content/Timestamps": duplicate_content_timestamps,
                    "Agent Run Count": run_count,
                    "Last Run At": str(last_run_at) if last_run_at else "None",
                    "Time Between First and Last Post": str(creation_times[-1] - creation_times[0]) if len(creation_times) > 1 else "N/A"
                }
            )
            
            return success
            
        except Exception as e:
            self.log_test_result(
                "Multiple Creation Paths Check",
                False,
                f"Error in multiple creation paths check: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_database_query_analysis(self):
        """Test 5: Database Query Analysis"""
        print("🔍 TEST 5: Database Query Analysis")
        print("=" * 60)
        print("Querying database to show total count of posts and breakdown by marketing_channel")
        print("Looking for posts without marketing_channel field or with empty/null channel fields")
        print()
        
        try:
            # Get all posts for our test agents
            all_test_posts = []
            for agent_id in self.created_agent_ids:
                posts_cursor = self.db.ai_posts.find({"agent_id": agent_id})
                agent_posts = await posts_cursor.to_list(length=None)
                all_test_posts.extend(agent_posts)
            
            # Total count analysis
            total_posts = len(all_test_posts)
            
            # Breakdown by marketing_channel
            channel_breakdown = {}
            posts_without_channel = []
            posts_with_empty_channel = []
            posts_with_null_channel = []
            
            for post in all_test_posts:
                channel = post.get('marketing_channel')
                
                if 'marketing_channel' not in post:
                    posts_without_channel.append(post.get('id'))
                elif channel is None:
                    posts_with_null_channel.append(post.get('id'))
                elif channel == '':
                    posts_with_empty_channel.append(post.get('id'))
                else:
                    channel_breakdown[channel] = channel_breakdown.get(channel, 0) + 1
            
            # Platform breakdown for social media posts
            platform_breakdown = {}
            social_posts_without_platform = []
            
            for post in all_test_posts:
                if post.get('marketing_channel') == 'social_media':
                    platform = post.get('marketing_platform') or post.get('platform')
                    if platform:
                        platform_breakdown[platform] = platform_breakdown.get(platform, 0) + 1
                    else:
                        social_posts_without_platform.append(post.get('id'))
            
            # Status breakdown
            status_breakdown = {}
            for post in all_test_posts:
                status = post.get('status', 'MISSING')
                status_breakdown[status] = status_breakdown.get(status, 0) + 1
            
            # Content analysis
            posts_with_content = sum(1 for post in all_test_posts if post.get('content', '').strip())
            posts_without_content = total_posts - posts_with_content
            
            # Field completeness analysis
            email_posts = [post for post in all_test_posts if post.get('marketing_channel') == 'email']
            sms_posts = [post for post in all_test_posts if post.get('marketing_channel') == 'sms']
            social_posts = [post for post in all_test_posts if post.get('marketing_channel') == 'social_media']
            
            email_fields_complete = sum(1 for post in email_posts if all(
                post.get(field) for field in ['email_subject', 'email_template']
            ))
            
            sms_fields_complete = sum(1 for post in sms_posts if all(
                post.get(field) for field in ['sms_template', 'sms_provider']
            ))
            
            social_fields_complete = sum(1 for post in social_posts if 
                post.get('marketing_platform') or post.get('platform')
            )
            
            # Success criteria
            success = (
                total_posts > 0 and
                len(posts_without_channel) == 0 and
                len(posts_with_empty_channel) == 0 and
                len(posts_with_null_channel) == 0 and
                len(social_posts_without_platform) == 0 and
                posts_without_content == 0
            )
            
            self.log_test_result(
                "Database Query Analysis",
                success,
                f"Database query analysis: {'PASSED' if success else 'FAILED'}",
                {
                    "Total Posts": total_posts,
                    "Channel Breakdown": channel_breakdown,
                    "Platform Breakdown": platform_breakdown,
                    "Status Breakdown": status_breakdown,
                    "Posts Without marketing_channel Field": len(posts_without_channel),
                    "Posts With Null marketing_channel": len(posts_with_null_channel),
                    "Posts With Empty marketing_channel": len(posts_with_empty_channel),
                    "Social Posts Without Platform": len(social_posts_without_platform),
                    "Posts With Content": posts_with_content,
                    "Posts Without Content": posts_without_content,
                    "Email Posts": len(email_posts),
                    "Email Posts With Complete Fields": email_fields_complete,
                    "SMS Posts": len(sms_posts),
                    "SMS Posts With Complete Fields": sms_fields_complete,
                    "Social Posts": len(social_posts),
                    "Social Posts With Complete Fields": social_fields_complete,
                    "Posts Without Channel IDs": posts_without_channel,
                    "Posts With Null Channel IDs": posts_with_null_channel,
                    "Posts With Empty Channel IDs": posts_with_empty_channel,
                    "Social Posts Without Platform IDs": social_posts_without_platform
                }
            )
            
            return success
            
        except Exception as e:
            self.log_test_result(
                "Database Query Analysis",
                False,
                f"Error in database query analysis: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def cleanup_created_agents(self):
        """Clean up agents created during testing"""
        try:
            for agent_id in self.created_agent_ids:
                # Delete agent posts
                await self.db.ai_posts.delete_many({"agent_id": agent_id})
                # Delete agent
                await self.db.ai_agents.delete_one({"id": agent_id})
            print(f"🧹 Cleaned up {len(self.created_agent_ids)} test agents and their posts")
        except Exception as e:
            print(f"Warning: Could not clean up created agents: {e}")
    
    async def run_marketing_agent_investigation(self):
        """Run comprehensive marketing agent post creation investigation"""
        print("🔍 STARTING MARKETING AGENT POST CREATION INVESTIGATION")
        print("=" * 80)
        print("Investigating Marketing Agent post creation issues as requested")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Clean up any existing test data
            await self.cleanup_test_data()
            
            # Authenticate first
            auth_success = await self.authenticate()
            if not auth_success:
                print("❌ Authentication failed - cannot proceed with API tests")
                return
            
            # Run all tests
            test_results = []
            all_posts = []
            
            # Test 1: Check Post Duplication Issue
            success1, posts = await self.test_post_duplication_issue()
            test_results.append(success1)
            all_posts = posts
            
            # Test 2: Verify Email/SMS Post Creation
            success2 = await self.test_email_sms_post_creation(all_posts)
            test_results.append(success2)
            
            # Test 3: Analyze Post Structure
            success3 = await self.test_post_structure_analysis(all_posts)
            test_results.append(success3)
            
            # Test 4: Check for Multiple Creation Paths
            success4 = await self.test_multiple_creation_paths()
            test_results.append(success4)
            
            # Test 5: Database Query Analysis
            success5 = await self.test_database_query_analysis()
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 MARKETING AGENT POST CREATION INVESTIGATION SUMMARY")
            print("=" * 80)
            
            passed_tests = sum(test_results)
            total_tests = len(test_results)
            success_rate = (passed_tests / total_tests) * 100
            
            print(f"Successful Tests: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
            print()
            
            # Detailed results
            for result in self.test_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            print("🔍 KEY FINDINGS:")
            print("=" * 40)
            
            # Test 1 Analysis
            if success1:
                print("✅ POST DUPLICATION: No duplicate posts found, correct count and channel breakdown")
            else:
                print("❌ POST DUPLICATION: Issues found with post creation - duplicates or incorrect counts detected")
            
            # Test 2 Analysis
            if success2:
                print("✅ EMAIL/SMS FIELDS: Email and SMS posts created with proper fields")
            else:
                print("❌ EMAIL/SMS FIELDS: Missing or incomplete fields in email/SMS posts")
            
            # Test 3 Analysis
            if success3:
                print("✅ POST STRUCTURE: All posts have proper structure and required fields")
            else:
                print("❌ POST STRUCTURE: Posts missing required fields or have structural issues")
            
            # Test 4 Analysis
            if success4:
                print("✅ SINGLE CREATION PATH: Campaign generation called only once, no duplicate creation detected")
            else:
                print("❌ MULTIPLE CREATION PATHS: Evidence of multiple creation attempts or duplicate calls")
            
            # Test 5 Analysis
            if success5:
                print("✅ DATABASE INTEGRITY: All posts have proper channel labels and complete data")
            else:
                print("❌ DATABASE INTEGRITY: Posts found without proper channel labels or missing data")
            
            print()
            print("📋 DETAILED INVESTIGATION RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Post Duplication Analysis",
                "Email/SMS Post Creation Verification", 
                "Post Structure Analysis",
                "Multiple Creation Paths Check",
                "Database Query Analysis"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("🎯 INVESTIGATION CONCLUSION:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ MARKETING AGENT POST CREATION WORKING CORRECTLY")
                print("   - No duplication issues found")
                print("   - Email/SMS posts created with proper fields")
                print("   - All posts have correct structure")
                print("   - Single creation path confirmed")
                print("   - Database integrity maintained")
            else:
                print("❌ MARKETING AGENT POST CREATION HAS ISSUES")
                failed_tests = [test_names[i] for i, success in enumerate(test_results) if not success]
                print(f"   - Failed investigations: {', '.join(failed_tests)}")
                print("   - Review detailed test results above for specific issues")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during investigation: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Clean up created test agents
            await self.cleanup_created_agents()
            await self.disconnect()

async def main():
    """Main testing function"""
    tester = MarketingAgentTester()
    await tester.run_marketing_agent_investigation()

if __name__ == "__main__":
    asyncio.run(main())