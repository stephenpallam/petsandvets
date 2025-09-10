#!/usr/bin/env python3
"""
Email Agent ChatGPT Formatting and Personalization Investigation Test

This test investigates email agent ChatGPT formatting and personalization issues:

Investigation Focus:
1. Check Email Agent Write Mode Generation
2. Test Email Content Generation Process  
3. Check Email Preview and Personalization
4. Verify ChatGPT Integration for Email
5. Test Email Subject Generation

Expected Results:
- Should identify why ChatGPT formatting isn't working for email agents
- Should find the personalization/placeholder replacement issue
- Should determine if email subject generation needs to be implemented
- Should provide solution for proper email ChatGPT integration
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

class EmailAgentInvestigator:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://smart-sms-1.preview.emergentagent.com')
        self.auth_token = None
        
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
    
    async def check_email_agent_write_mode_generation(self):
        """Investigation 1: Check Email Agent Write Mode Generation"""
        print("🔍 INVESTIGATION 1: Check Email Agent Write Mode Generation")
        print("=" * 60)
        
        try:
            # Find write mode email agents in database
            write_mode_agents = await self.db.ai_agents.find({
                "agent_type": "email",
                "mode": "write"
            }).to_list(length=None)
            
            # Check if ChatGPT formatting flag is properly stored
            chatgpt_enabled_agents = []
            chatgpt_disabled_agents = []
            
            for agent in write_mode_agents:
                agent_id = agent.get('id')
                agent_name = agent.get('agent_name', 'Unnamed')
                use_chatgpt = agent.get('use_chatgpt_formatting', None)
                email_content = agent.get('email_content', '')
                email_subject = agent.get('email_subject', '')
                
                if use_chatgpt is True:
                    chatgpt_enabled_agents.append({
                        'id': agent_id,
                        'name': agent_name,
                        'email_content': email_content[:100] + '...' if len(email_content) > 100 else email_content,
                        'email_subject': email_subject
                    })
                elif use_chatgpt is False:
                    chatgpt_disabled_agents.append({
                        'id': agent_id,
                        'name': agent_name,
                        'email_content': email_content[:100] + '...' if len(email_content) > 100 else email_content,
                        'email_subject': email_subject
                    })
            
            success = len(write_mode_agents) > 0
            
            self.log_test_result(
                "Email Agent Write Mode Generation Check",
                success,
                f"Found {len(write_mode_agents)} write mode email agents, {len(chatgpt_enabled_agents)} with ChatGPT enabled, {len(chatgpt_disabled_agents)} with ChatGPT disabled",
                {
                    "Total Write Mode Agents": len(write_mode_agents),
                    "ChatGPT Enabled Agents": chatgpt_enabled_agents,
                    "ChatGPT Disabled Agents": chatgpt_disabled_agents,
                    "Sample Agent Data": write_mode_agents[:2] if write_mode_agents else []
                }
            )
            return success, write_mode_agents
            
        except Exception as e:
            self.log_test_result(
                "Email Agent Write Mode Generation Check",
                False,
                f"Error checking email agents: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, []
    
    async def test_email_content_generation_process(self, write_mode_agents):
        """Investigation 2: Test Email Content Generation Process"""
        print("🔍 INVESTIGATION 2: Test Email Content Generation Process")
        print("=" * 60)
        
        try:
            if not write_mode_agents:
                self.log_test_result(
                    "Email Content Generation Process Test",
                    False,
                    "No write mode email agents found to test",
                    {}
                )
                return False, {}
            
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            generation_results = {}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                
                # Test email generation for each write mode agent
                for agent in write_mode_agents[:2]:  # Test first 2 agents
                    agent_id = agent.get('id')
                    agent_name = agent.get('agent_name', 'Unnamed')
                    use_chatgpt = agent.get('use_chatgpt_formatting', False)
                    
                    try:
                        # Test the email generation API endpoint
                        run_url = f"{self.backend_url}/api/ai-agents/{agent_id}/run"
                        print(f"Testing email generation for agent: {agent_name} (ChatGPT: {use_chatgpt})")
                        
                        async with session.post(run_url, headers=headers, timeout=30) as response:
                            status = response.status
                            
                            if status == 200:
                                result_data = await response.json()
                                post_id = result_data.get('post_id')
                                
                                # Check if post was created
                                if post_id:
                                    # Get the generated post to check content
                                    post_doc = await self.db.ai_posts.find_one({"id": post_id})
                                    
                                    if post_doc:
                                        generation_results[agent_id] = {
                                            "agent_name": agent_name,
                                            "use_chatgpt": use_chatgpt,
                                            "generation_success": True,
                                            "post_id": post_id,
                                            "email_content": post_doc.get('content', '')[:200] + '...',
                                            "email_subject": post_doc.get('email_subject', ''),
                                            "status": post_doc.get('status', ''),
                                            "chatgpt_applied": post_doc.get('use_chatgpt_formatting', False)
                                        }
                                    else:
                                        generation_results[agent_id] = {
                                            "agent_name": agent_name,
                                            "use_chatgpt": use_chatgpt,
                                            "generation_success": False,
                                            "error": "Post created but not found in database"
                                        }
                                else:
                                    generation_results[agent_id] = {
                                        "agent_name": agent_name,
                                        "use_chatgpt": use_chatgpt,
                                        "generation_success": False,
                                        "error": "No post_id returned from API"
                                    }
                            else:
                                error_text = await response.text()
                                generation_results[agent_id] = {
                                    "agent_name": agent_name,
                                    "use_chatgpt": use_chatgpt,
                                    "generation_success": False,
                                    "error": f"API returned status {status}: {error_text}"
                                }
                                
                    except Exception as e:
                        generation_results[agent_id] = {
                            "agent_name": agent_name,
                            "use_chatgpt": use_chatgpt,
                            "generation_success": False,
                            "error": str(e)
                        }
            
            successful_generations = sum(1 for result in generation_results.values() if result.get('generation_success'))
            success = successful_generations > 0
            
            self.log_test_result(
                "Email Content Generation Process Test",
                success,
                f"Successfully generated content for {successful_generations}/{len(generation_results)} agents",
                {
                    "Generation Results": generation_results,
                    "Successful Generations": successful_generations,
                    "Total Tested": len(generation_results)
                }
            )
            return success, generation_results
            
        except Exception as e:
            self.log_test_result(
                "Email Content Generation Process Test",
                False,
                f"Error testing email generation: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def check_email_preview_and_personalization(self):
        """Investigation 3: Check Email Preview and Personalization"""
        print("🔍 INVESTIGATION 3: Check Email Preview and Personalization")
        print("=" * 60)
        
        try:
            # Find email posts in review status
            email_posts = await self.db.ai_posts.find({
                "agent_type": "email",
                "status": {"$in": ["in_review", "ready_to_publish"]}
            }).to_list(length=5)
            
            personalization_results = {}
            
            for post in email_posts:
                post_id = post.get('id')
                agent_id = post.get('agent_id')
                content = post.get('content', '')
                email_template = post.get('email_template', '')
                sample_customer_name = post.get('sample_customer_name', '')
                sample_pet_names = post.get('sample_pet_names', '')
                
                # Check for placeholder replacement
                has_customer_placeholder = '[CUSTOMER_NAME]' in content
                has_pet_placeholder = '[PET_NAME]' in content or '[PET_NAMES]' in content
                has_personalized_content = sample_customer_name in content if sample_customer_name else False
                has_pet_content = sample_pet_names in content if sample_pet_names else False
                
                personalization_results[post_id] = {
                    "agent_id": agent_id,
                    "status": post.get('status'),
                    "has_customer_placeholder": has_customer_placeholder,
                    "has_pet_placeholder": has_pet_placeholder,
                    "has_personalized_content": has_personalized_content,
                    "has_pet_content": has_pet_content,
                    "sample_customer_name": sample_customer_name,
                    "sample_pet_names": sample_pet_names,
                    "content_preview": content[:150] + '...' if len(content) > 150 else content,
                    "template_preview": email_template[:100] + '...' if len(email_template) > 100 else email_template
                }
            
            # Check if customer data exists for personalization
            customer_count = await self.db.customers.count_documents({})
            sample_customer = await self.db.customers.find_one({})
            
            success = len(email_posts) > 0
            
            self.log_test_result(
                "Email Preview and Personalization Check",
                success,
                f"Found {len(email_posts)} email posts for preview analysis, {customer_count} customers in database",
                {
                    "Email Posts Found": len(email_posts),
                    "Customer Count": customer_count,
                    "Sample Customer": {
                        "name": sample_customer.get('name') if sample_customer else None,
                        "pets": sample_customer.get('pets') if sample_customer else None,
                        "pet_name": sample_customer.get('pet_name') if sample_customer else None
                    } if sample_customer else None,
                    "Personalization Results": personalization_results
                }
            )
            return success, personalization_results
            
        except Exception as e:
            self.log_test_result(
                "Email Preview and Personalization Check",
                False,
                f"Error checking email preview: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def verify_chatgpt_integration_for_email(self):
        """Investigation 4: Verify ChatGPT Integration for Email"""
        print("🔍 INVESTIGATION 4: Verify ChatGPT Integration for Email")
        print("=" * 60)
        
        try:
            # Check if AI service is properly configured
            ai_service_available = False
            emergent_key_available = False
            
            try:
                # Check environment variables
                emergent_key = os.environ.get('EMERGENT_LLM_KEY')
                emergent_key_available = bool(emergent_key and emergent_key.strip())
                
                # Try to import and test AI service
                sys.path.insert(0, str(backend_dir))
                from ai_service import ai_service
                
                # Test AI service connection
                connection_test = await ai_service.test_connection()
                ai_service_available = connection_test.get('llm', False)
                
            except Exception as e:
                print(f"AI service test error: {str(e)}")
            
            # Check if email formatting functions exist
            email_formatting_functions = []
            try:
                from ai_service import format_email_content, format_topic_email_content
                email_formatting_functions = ['format_email_content', 'format_topic_email_content']
            except ImportError as e:
                print(f"Email formatting functions not found: {str(e)}")
            
            # Test email formatting with sample data
            formatting_test_results = {}
            if email_formatting_functions:
                try:
                    from ai_service import format_email_content
                    
                    # Test with sample data
                    sample_template = "Dear [CUSTOMER_NAME], we hope [PET_NAME] is doing well. Happy [HOLIDAY_NAME]!"
                    sample_customer = "John Smith"
                    sample_pet = "Buddy"
                    sample_holiday = "Christmas"
                    sample_date = "2025-12-25"
                    
                    formatted_content = await format_email_content(
                        template=sample_template,
                        customer_name=sample_customer,
                        pet_names=sample_pet,
                        holiday_name=sample_holiday,
                        holiday_date=sample_date
                    )
                    
                    formatting_test_results = {
                        "test_successful": True,
                        "original_template": sample_template,
                        "formatted_content": formatted_content[:200] + '...' if len(formatted_content) > 200 else formatted_content,
                        "chatgpt_applied": formatted_content != sample_template
                    }
                    
                except Exception as e:
                    formatting_test_results = {
                        "test_successful": False,
                        "error": str(e)
                    }
            
            success = ai_service_available and len(email_formatting_functions) > 0
            
            self.log_test_result(
                "ChatGPT Integration for Email Verification",
                success,
                f"AI service available: {ai_service_available}, Email formatting functions: {len(email_formatting_functions)}",
                {
                    "Emergent Key Available": emergent_key_available,
                    "AI Service Available": ai_service_available,
                    "Email Formatting Functions": email_formatting_functions,
                    "Formatting Test Results": formatting_test_results
                }
            )
            return success, formatting_test_results
            
        except Exception as e:
            self.log_test_result(
                "ChatGPT Integration for Email Verification",
                False,
                f"Error verifying ChatGPT integration: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def test_email_subject_generation(self):
        """Investigation 5: Test Email Subject Generation"""
        print("🔍 INVESTIGATION 5: Test Email Subject Generation")
        print("=" * 60)
        
        try:
            # Find email posts and check their subjects
            email_posts = await self.db.ai_posts.find({
                "agent_type": "email"
            }).limit(10).to_list(length=10)
            
            subject_analysis = {}
            
            for post in email_posts:
                post_id = post.get('id')
                agent_id = post.get('agent_id')
                email_subject = post.get('email_subject', '')
                use_chatgpt = post.get('use_chatgpt_formatting', False)
                
                # Get the original agent to check default subject
                agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
                original_subject = agent_doc.get('email_subject', '') if agent_doc else ''
                
                subject_analysis[post_id] = {
                    "agent_id": agent_id,
                    "email_subject": email_subject,
                    "original_subject": original_subject,
                    "use_chatgpt": use_chatgpt,
                    "subject_generated": email_subject != original_subject,
                    "has_subject": bool(email_subject and email_subject.strip())
                }
            
            # Check if subjects are being generated dynamically
            generated_subjects = sum(1 for analysis in subject_analysis.values() if analysis.get('subject_generated'))
            posts_with_subjects = sum(1 for analysis in subject_analysis.values() if analysis.get('has_subject'))
            
            success = len(email_posts) > 0 and posts_with_subjects > 0
            
            self.log_test_result(
                "Email Subject Generation Test",
                success,
                f"Found {len(email_posts)} email posts, {posts_with_subjects} with subjects, {generated_subjects} with generated subjects",
                {
                    "Total Email Posts": len(email_posts),
                    "Posts With Subjects": posts_with_subjects,
                    "Generated Subjects": generated_subjects,
                    "Subject Analysis": subject_analysis
                }
            )
            return success, subject_analysis
            
        except Exception as e:
            self.log_test_result(
                "Email Subject Generation Test",
                False,
                f"Error testing email subject generation: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def run_email_agent_investigation(self):
        """Run comprehensive email agent investigation"""
        print("🔍 STARTING EMAIL AGENT CHATGPT FORMATTING AND PERSONALIZATION INVESTIGATION")
        print("=" * 80)
        print("Investigating email agent ChatGPT formatting and personalization issues")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Authenticate first
            auth_success = await self.authenticate()
            if not auth_success:
                print("❌ Authentication failed - cannot proceed with API tests")
                return
            
            # Run all investigations
            investigation_results = []
            
            # Investigation 1: Check Email Agent Write Mode Generation
            success1, write_mode_agents = await self.check_email_agent_write_mode_generation()
            investigation_results.append(success1)
            
            # Investigation 2: Test Email Content Generation Process
            success2, generation_results = await self.test_email_content_generation_process(write_mode_agents)
            investigation_results.append(success2)
            
            # Investigation 3: Check Email Preview and Personalization
            success3, personalization_results = await self.check_email_preview_and_personalization()
            investigation_results.append(success3)
            
            # Investigation 4: Verify ChatGPT Integration for Email
            success4, chatgpt_results = await self.verify_chatgpt_integration_for_email()
            investigation_results.append(success4)
            
            # Investigation 5: Test Email Subject Generation
            success5, subject_results = await self.test_email_subject_generation()
            investigation_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 EMAIL AGENT INVESTIGATION SUMMARY")
            print("=" * 80)
            
            passed_investigations = sum(investigation_results)
            total_investigations = len(investigation_results)
            success_rate = (passed_investigations / total_investigations) * 100
            
            print(f"Successful Investigations: {passed_investigations}/{total_investigations} ({success_rate:.1f}%)")
            print()
            
            # Detailed results
            for result in self.test_results:
                status = "✅" if result["success"] else "❌"
                print(f"{status} {result['test_name']}: {result['message']}")
            
            print()
            print("🔍 KEY FINDINGS:")
            print("=" * 40)
            
            # Analyze findings for root causes
            if write_mode_agents:
                chatgpt_enabled = sum(1 for agent in write_mode_agents if agent.get('use_chatgpt_formatting', False))
                print(f"✅ WRITE MODE EMAIL AGENTS: Found {len(write_mode_agents)} agents, {chatgpt_enabled} with ChatGPT enabled")
            else:
                print("❌ NO WRITE MODE EMAIL AGENTS FOUND")
            
            if generation_results:
                successful_gens = sum(1 for result in generation_results.values() if result.get('generation_success'))
                print(f"✅ EMAIL GENERATION: {successful_gens}/{len(generation_results)} agents successfully generated content")
                
                # Check if ChatGPT is actually being applied
                chatgpt_applied = sum(1 for result in generation_results.values() 
                                    if result.get('chatgpt_applied', False))
                print(f"🔍 CHATGPT APPLICATION: {chatgpt_applied}/{len(generation_results)} posts show ChatGPT formatting applied")
            else:
                print("❌ NO EMAIL GENERATION RESULTS")
            
            if personalization_results:
                personalized_posts = sum(1 for result in personalization_results.values() 
                                       if result.get('has_personalized_content', False))
                print(f"✅ PERSONALIZATION: {personalized_posts}/{len(personalization_results)} posts show personalized content")
            else:
                print("❌ NO PERSONALIZATION DATA FOUND")
            
            if chatgpt_results.get('test_successful'):
                print("✅ CHATGPT INTEGRATION: AI service is working and can format emails")
            else:
                print("❌ CHATGPT INTEGRATION: AI service test failed")
            
            print()
            print("🎯 ROOT CAUSE ANALYSIS:")
            print("=" * 40)
            
            # Determine root causes
            if not write_mode_agents:
                print("❌ ROOT CAUSE: No write mode email agents exist in database")
                print("   - Users need to create write mode email agents first")
            elif not chatgpt_results.get('test_successful'):
                print("❌ ROOT CAUSE: ChatGPT integration is not working")
                print("   - AI service connection failed")
                print("   - Check EMERGENT_LLM_KEY configuration")
                print("   - Verify ai_service.py implementation")
            elif generation_results and not any(r.get('generation_success') for r in generation_results.values()):
                print("❌ ROOT CAUSE: Email generation API is failing")
                print("   - Email agents exist but generation process fails")
                print("   - Check generate_email_for_agent function")
                print("   - Verify API endpoint /api/ai-agents/{id}/run")
            elif personalization_results and not any(r.get('has_personalized_content') for r in personalization_results.values()):
                print("❌ ROOT CAUSE: Personalization is not working")
                print("   - Email content is not being personalized with customer data")
                print("   - Check placeholder replacement logic")
                print("   - Verify customer data availability")
            else:
                print("✅ SYSTEM APPEARS TO BE WORKING")
                print("   - Email agents exist and can generate content")
                print("   - ChatGPT integration is functional")
                print("   - Personalization is working")
                print("   - Issue may be in specific edge cases or frontend display")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during investigation: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main investigation function"""
    investigator = EmailAgentInvestigator()
    await investigator.run_email_agent_investigation()

if __name__ == "__main__":
    asyncio.run(main())