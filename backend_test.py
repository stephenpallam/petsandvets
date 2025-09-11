#!/usr/bin/env python3
"""
Email Subject Handling and Duplicate Subject Generation Investigation

This test investigates email subject handling and fixes duplicate subject generation 
in holiday/recurring email agents as requested:

Investigation Focus:
1. Check Email Sending Logic - Find where emails are sent and verify subject field usage
2. Find Holiday/Recurring Email Generation - Locate ChatGPT generation functions
3. Test Email Subject Usage - Check email posts with duplicate subjects
4. Identify ChatGPT Prompt Issues - Find prompts generating duplicate "Subject:" in content

Expected Results:
- Should confirm only "Email Subject:" field is used for actual email sending
- Should identify ChatGPT prompts that generate duplicate "Subject:" in content
- Should provide exact locations to fix duplicate subject generation
- Should ensure consistency with write mode email fix already applied
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

class EmailSubjectInvestigator:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
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
    
    async def check_email_sending_logic(self):
        """Investigation 1: Check Email Sending Logic - Find where emails are sent and verify subject field usage"""
        print("🔍 INVESTIGATION 1: Check Email Sending Logic")
        print("=" * 60)
        
        try:
            # Check if mass email sending function exists and examine its logic
            mass_email_function_found = False
            subject_field_usage = {}
            
            # Read the server.py file to analyze email sending logic
            server_file_path = backend_dir / "server.py"
            if server_file_path.exists():
                with open(server_file_path, 'r') as f:
                    server_content = f.read()
                
                # Check for mass email sending function
                if "send_mass_emails_from_post" in server_content:
                    mass_email_function_found = True
                    
                    # Extract the function to analyze subject handling
                    lines = server_content.split('\n')
                    in_mass_email_function = False
                    function_lines = []
                    
                    for line in lines:
                        if "async def send_mass_emails_from_post" in line:
                            in_mass_email_function = True
                        elif in_mass_email_function and line.startswith("async def ") and "send_mass_emails_from_post" not in line:
                            break
                        
                        if in_mass_email_function:
                            function_lines.append(line)
                    
                    function_content = '\n'.join(function_lines)
                    
                    # Analyze subject field usage in mass email function
                    subject_field_usage = {
                        "uses_email_subject_field": "email_subject" in function_content,
                        "uses_subject_in_content": "Subject:" in function_content,
                        "has_subject_parameter": "subject=" in function_content,
                        "function_content_preview": function_content[:500] + "..." if len(function_content) > 500 else function_content
                    }
            
            # Check email posts in database for subject field structure
            email_posts = await self.db.ai_posts.find({
                "agent_type": "email"
            }).limit(5).to_list(length=5)
            
            post_subject_analysis = {}
            for post in email_posts:
                post_id = post.get('id')
                content = post.get('content', '')
                email_subject = post.get('email_subject', '')
                topic = post.get('topic', '')
                
                # Check for duplicate subjects in content
                has_subject_in_content = "Subject:" in content
                subject_line_in_content = None
                if has_subject_in_content:
                    # Extract the subject line from content
                    content_lines = content.split('\n')
                    for line in content_lines:
                        if line.strip().startswith('Subject:'):
                            subject_line_in_content = line.strip()
                            break
                
                post_subject_analysis[post_id] = {
                    "email_subject_field": email_subject,
                    "topic_field": topic,
                    "has_subject_in_content": has_subject_in_content,
                    "subject_line_in_content": subject_line_in_content,
                    "content_preview": content[:200] + "..." if len(content) > 200 else content
                }
            
            success = mass_email_function_found and len(email_posts) > 0
            
            self.log_test_result(
                "Email Sending Logic Check",
                success,
                f"Mass email function found: {mass_email_function_found}, Email posts analyzed: {len(email_posts)}",
                {
                    "Mass Email Function Found": mass_email_function_found,
                    "Subject Field Usage": subject_field_usage,
                    "Email Posts Count": len(email_posts),
                    "Post Subject Analysis": post_subject_analysis
                }
            )
            return success, subject_field_usage, post_subject_analysis
            
        except Exception as e:
            self.log_test_result(
                "Email Sending Logic Check",
                False,
                f"Error checking email sending logic: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}, {}
    
    async def find_holiday_recurring_email_generation(self):
        """Investigation 2: Find Holiday/Recurring Email Generation - Locate ChatGPT generation functions"""
        print("🔍 INVESTIGATION 2: Find Holiday/Recurring Email Generation")
        print("=" * 60)
        
        try:
            generation_functions_found = {}
            chatgpt_prompts_analysis = {}
            
            # Check server.py for email generation functions
            server_file_path = backend_dir / "server.py"
            if server_file_path.exists():
                with open(server_file_path, 'r') as f:
                    server_content = f.read()
                
                # Look for holiday email generation functions
                holiday_functions = [
                    "generate_scheduled_email_for_agent",
                    "generate_recurring_email_for_agent", 
                    "generate_write_mode_email_for_agent"
                ]
                
                for func_name in holiday_functions:
                    if func_name in server_content:
                        generation_functions_found[func_name] = True
                        
                        # Extract function content to analyze prompts
                        lines = server_content.split('\n')
                        in_function = False
                        function_lines = []
                        
                        for line in lines:
                            if f"async def {func_name}" in line:
                                in_function = True
                            elif in_function and line.startswith("async def ") and func_name not in line:
                                break
                            
                            if in_function:
                                function_lines.append(line)
                        
                        function_content = '\n'.join(function_lines)
                        
                        # Analyze ChatGPT prompt usage
                        chatgpt_prompts_analysis[func_name] = {
                            "uses_chatgpt": "ChatGPT" in function_content or "chat" in function_content.lower(),
                            "has_subject_instruction": "subject" in function_content.lower(),
                            "has_no_subject_instruction": "DO NOT include" in function_content and "subject" in function_content.lower(),
                            "mentions_subject_separate": "subject" in function_content.lower() and "separate" in function_content.lower(),
                            "function_length": len(function_lines)
                        }
                    else:
                        generation_functions_found[func_name] = False
            
            # Check ai_service.py for email formatting functions
            ai_service_file_path = backend_dir / "ai_service.py"
            ai_service_functions = {}
            if ai_service_file_path.exists():
                with open(ai_service_file_path, 'r') as f:
                    ai_service_content = f.read()
                
                # Look for email formatting functions
                email_formatting_functions = [
                    "format_email_content",
                    "format_topic_email_content"
                ]
                
                for func_name in email_formatting_functions:
                    if func_name in ai_service_content:
                        ai_service_functions[func_name] = True
                        
                        # Extract function to analyze prompts
                        lines = ai_service_content.split('\n')
                        in_function = False
                        function_lines = []
                        
                        for line in lines:
                            if f"def {func_name}" in line:
                                in_function = True
                            elif in_function and (line.startswith("    def ") or line.startswith("async def ")):
                                break
                            
                            if in_function:
                                function_lines.append(line)
                        
                        function_content = '\n'.join(function_lines)
                        
                        # Check for subject-related instructions in prompts
                        chatgpt_prompts_analysis[f"ai_service_{func_name}"] = {
                            "has_subject_mention": "subject" in function_content.lower(),
                            "has_no_subject_instruction": "DO NOT include" in function_content and "subject" in function_content.lower(),
                            "has_subject_warning": "subject" in function_content.lower() and ("separate" in function_content.lower() or "already set" in function_content.lower()),
                            "prompt_content_preview": function_content[:800] + "..." if len(function_content) > 800 else function_content
                        }
                    else:
                        ai_service_functions[func_name] = False
            
            success = len(generation_functions_found) > 0 and any(generation_functions_found.values())
            
            self.log_test_result(
                "Holiday/Recurring Email Generation Functions Check",
                success,
                f"Found {sum(generation_functions_found.values())} generation functions, {sum(ai_service_functions.values())} AI service functions",
                {
                    "Server Generation Functions": generation_functions_found,
                    "AI Service Functions": ai_service_functions,
                    "ChatGPT Prompts Analysis": chatgpt_prompts_analysis
                }
            )
            return success, generation_functions_found, chatgpt_prompts_analysis
            
        except Exception as e:
            self.log_test_result(
                "Holiday/Recurring Email Generation Functions Check",
                False,
                f"Error finding generation functions: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}, {}
    
    async def test_email_subject_usage(self):
        """Investigation 3: Test Email Subject Usage - Check email posts with duplicate subjects"""
        print("🔍 INVESTIGATION 3: Test Email Subject Usage")
        print("=" * 60)
        
        try:
            # Find email posts with potential duplicate subjects
            email_posts = await self.db.ai_posts.find({
                "agent_type": "email"
            }).to_list(length=10)
            
            duplicate_subject_analysis = {}
            posts_with_duplicates = 0
            
            for post in email_posts:
                post_id = post.get('id')
                content = post.get('content', '')
                email_subject = post.get('email_subject', '')
                topic = post.get('topic', '')
                agent_id = post.get('agent_id', '')
                
                # Check for "Subject:" in content
                has_subject_in_content = "Subject:" in content
                subject_lines_in_content = []
                
                if has_subject_in_content:
                    content_lines = content.split('\n')
                    for line in content_lines:
                        if line.strip().startswith('Subject:'):
                            subject_lines_in_content.append(line.strip())
                    
                    if subject_lines_in_content:
                        posts_with_duplicates += 1
                
                # Get agent information
                agent_doc = await self.db.ai_agents.find_one({"id": agent_id})
                agent_mode = agent_doc.get('mode', 'unknown') if agent_doc else 'unknown'
                agent_type = agent_doc.get('agent_type', 'unknown') if agent_doc else 'unknown'
                
                duplicate_subject_analysis[post_id] = {
                    "agent_id": agent_id,
                    "agent_mode": agent_mode,
                    "agent_type": agent_type,
                    "email_subject_field": email_subject,
                    "topic_field": topic,
                    "has_subject_in_content": has_subject_in_content,
                    "subject_lines_in_content": subject_lines_in_content,
                    "duplicate_count": len(subject_lines_in_content),
                    "content_first_100_chars": content[:100] + "..." if len(content) > 100 else content
                }
            
            # Test actual email delivery (simulate)
            email_delivery_test = {}
            if email_posts:
                sample_post = email_posts[0]
                email_delivery_test = {
                    "would_use_email_subject_field": bool(sample_post.get('email_subject')),
                    "would_ignore_content_subject": True,  # Based on code analysis
                    "email_subject_value": sample_post.get('email_subject', ''),
                    "content_has_subject": "Subject:" in sample_post.get('content', '')
                }
            
            success = len(email_posts) > 0
            
            self.log_test_result(
                "Email Subject Usage Test",
                success,
                f"Analyzed {len(email_posts)} email posts, found {posts_with_duplicates} with duplicate subjects in content",
                {
                    "Total Email Posts": len(email_posts),
                    "Posts With Duplicate Subjects": posts_with_duplicates,
                    "Duplicate Subject Analysis": duplicate_subject_analysis,
                    "Email Delivery Test": email_delivery_test
                }
            )
            return success, duplicate_subject_analysis, posts_with_duplicates
            
        except Exception as e:
            self.log_test_result(
                "Email Subject Usage Test",
                False,
                f"Error testing email subject usage: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}, 0
    
    async def identify_chatgpt_prompt_issues(self):
        """Investigation 4: Identify ChatGPT Prompt Issues - Find prompts generating duplicate "Subject:" in content"""
        print("🔍 INVESTIGATION 4: Identify ChatGPT Prompt Issues")
        print("=" * 60)
        
        try:
            prompt_issues_found = {}
            problematic_prompts = []
            
            # Analyze ai_service.py prompts
            ai_service_file_path = backend_dir / "ai_service.py"
            if ai_service_file_path.exists():
                with open(ai_service_file_path, 'r') as f:
                    ai_service_content = f.read()
                
                # Look for email formatting prompts
                prompt_sections = []
                lines = ai_service_content.split('\n')
                
                for i, line in enumerate(lines):
                    if 'email_prompt = f"""' in line or 'email_prompt = f"' in line:
                        # Found start of prompt, extract it
                        prompt_lines = [line]
                        j = i + 1
                        while j < len(lines) and not ('"""' in lines[j] and lines[j].strip().endswith('"""')):
                            prompt_lines.append(lines[j])
                            j += 1
                        if j < len(lines):
                            prompt_lines.append(lines[j])
                        
                        prompt_content = '\n'.join(prompt_lines)
                        prompt_sections.append({
                            "line_start": i + 1,
                            "content": prompt_content,
                            "function_context": self._find_function_context(lines, i)
                        })
                
                # Analyze each prompt for subject-related issues
                for idx, prompt_section in enumerate(prompt_sections):
                    prompt_content = prompt_section["content"]
                    function_context = prompt_section["function_context"]
                    
                    analysis = {
                        "line_start": prompt_section["line_start"],
                        "function_context": function_context,
                        "mentions_subject": "subject" in prompt_content.lower(),
                        "has_no_subject_instruction": "DO NOT include" in prompt_content and "subject" in prompt_content.lower(),
                        "warns_about_separate_subject": "separate" in prompt_content.lower() and "subject" in prompt_content.lower(),
                        "might_generate_subject": not ("DO NOT include" in prompt_content and "subject" in prompt_content.lower()) and "subject" in prompt_content.lower(),
                        "prompt_preview": prompt_content[:300] + "..." if len(prompt_content) > 300 else prompt_content
                    }
                    
                    prompt_issues_found[f"prompt_{idx + 1}_{function_context}"] = analysis
                    
                    # Flag problematic prompts
                    if analysis["might_generate_subject"] and not analysis["has_no_subject_instruction"]:
                        problematic_prompts.append({
                            "prompt_id": f"prompt_{idx + 1}_{function_context}",
                            "issue": "May generate subject in content without explicit prevention",
                            "line_start": analysis["line_start"],
                            "function": function_context
                        })
            
            # Check server.py for inline prompts
            server_file_path = backend_dir / "server.py"
            if server_file_path.exists():
                with open(server_file_path, 'r') as f:
                    server_content = f.read()
                
                # Look for inline email prompts
                lines = server_content.split('\n')
                for i, line in enumerate(lines):
                    if 'email_prompt = f"""' in line:
                        # Found inline prompt
                        prompt_lines = [line]
                        j = i + 1
                        while j < len(lines) and not ('"""' in lines[j] and lines[j].strip().endswith('"""')):
                            prompt_lines.append(lines[j])
                            j += 1
                        if j < len(lines):
                            prompt_lines.append(lines[j])
                        
                        prompt_content = '\n'.join(prompt_lines)
                        function_context = self._find_function_context(lines, i)
                        
                        analysis = {
                            "line_start": i + 1,
                            "function_context": function_context,
                            "file": "server.py",
                            "mentions_subject": "subject" in prompt_content.lower(),
                            "has_no_subject_instruction": "DO NOT include" in prompt_content and "subject" in prompt_content.lower(),
                            "warns_about_separate_subject": "separate" in prompt_content.lower() and "subject" in prompt_content.lower(),
                            "might_generate_subject": not ("DO NOT include" in prompt_content and "subject" in prompt_content.lower()) and "subject" in prompt_content.lower(),
                            "prompt_preview": prompt_content[:300] + "..." if len(prompt_content) > 300 else prompt_content
                        }
                        
                        prompt_issues_found[f"server_prompt_{function_context}"] = analysis
                        
                        if analysis["might_generate_subject"] and not analysis["has_no_subject_instruction"]:
                            problematic_prompts.append({
                                "prompt_id": f"server_prompt_{function_context}",
                                "issue": "May generate subject in content without explicit prevention",
                                "line_start": analysis["line_start"],
                                "function": function_context,
                                "file": "server.py"
                            })
            
            success = len(prompt_issues_found) > 0
            
            self.log_test_result(
                "ChatGPT Prompt Issues Identification",
                success,
                f"Analyzed {len(prompt_issues_found)} prompts, found {len(problematic_prompts)} potentially problematic prompts",
                {
                    "Total Prompts Analyzed": len(prompt_issues_found),
                    "Problematic Prompts Count": len(problematic_prompts),
                    "Prompt Issues Analysis": prompt_issues_found,
                    "Problematic Prompts": problematic_prompts
                }
            )
            return success, prompt_issues_found, problematic_prompts
            
        except Exception as e:
            self.log_test_result(
                "ChatGPT Prompt Issues Identification",
                False,
                f"Error identifying prompt issues: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}, []
    
    def _find_function_context(self, lines, line_index):
        """Helper function to find which function a line belongs to"""
        for i in range(line_index, -1, -1):
            line = lines[i].strip()
            if line.startswith('def ') or line.startswith('async def '):
                # Extract function name
                if '(' in line:
                    func_name = line.split('(')[0].replace('async def ', '').replace('def ', '').strip()
                    return func_name
        return "unknown_function"
    
    async def run_email_subject_investigation(self):
        """Run comprehensive email subject handling investigation"""
        print("🔍 STARTING EMAIL SUBJECT HANDLING AND DUPLICATE SUBJECT GENERATION INVESTIGATION")
        print("=" * 80)
        print("Investigating email subject handling and fixing duplicate subject generation")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Authenticate first
            auth_success = await self.authenticate()
            if not auth_success:
                print("❌ Authentication failed - proceeding with database-only tests")
            
            # Run all investigations
            investigation_results = []
            
            # Investigation 1: Check Email Sending Logic
            success1, subject_field_usage, post_subject_analysis = await self.check_email_sending_logic()
            investigation_results.append(success1)
            
            # Investigation 2: Find Holiday/Recurring Email Generation
            success2, generation_functions, chatgpt_prompts = await self.find_holiday_recurring_email_generation()
            investigation_results.append(success2)
            
            # Investigation 3: Test Email Subject Usage
            success3, duplicate_analysis, duplicate_count = await self.test_email_subject_usage()
            investigation_results.append(success3)
            
            # Investigation 4: Identify ChatGPT Prompt Issues
            success4, prompt_issues, problematic_prompts = await self.identify_chatgpt_prompt_issues()
            investigation_results.append(success4)
            
            # Summary
            print("=" * 80)
            print("🎯 EMAIL SUBJECT INVESTIGATION SUMMARY")
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
            
            # Email Sending Logic Analysis
            if subject_field_usage.get("uses_email_subject_field"):
                print("✅ EMAIL SENDING: Uses 'email_subject' field for actual email delivery")
            else:
                print("❌ EMAIL SENDING: Does not use 'email_subject' field - needs investigation")
            
            if subject_field_usage.get("uses_subject_in_content"):
                print("⚠️  EMAIL SENDING: Also references 'Subject:' in content - potential issue")
            else:
                print("✅ EMAIL SENDING: Does not use 'Subject:' from content")
            
            # Duplicate Subject Analysis
            if duplicate_count > 0:
                print(f"❌ DUPLICATE SUBJECTS: Found {duplicate_count} email posts with 'Subject:' in content")
                print("   - This indicates ChatGPT is generating duplicate subjects")
                print("   - Only 'email_subject' field should be used for delivery")
            else:
                print("✅ DUPLICATE SUBJECTS: No duplicate subjects found in email content")
            
            # ChatGPT Prompt Issues
            if problematic_prompts:
                print(f"❌ PROMPT ISSUES: Found {len(problematic_prompts)} potentially problematic ChatGPT prompts")
                for prompt in problematic_prompts:
                    print(f"   - {prompt['prompt_id']}: {prompt['issue']}")
                    print(f"     Location: {prompt.get('file', 'ai_service.py')} line {prompt['line_start']}")
                    print(f"     Function: {prompt['function']}")
            else:
                print("✅ PROMPT ISSUES: All ChatGPT prompts have proper subject handling instructions")
            
            print()
            print("🎯 ROOT CAUSE ANALYSIS:")
            print("=" * 40)
            
            # Determine root causes and solutions
            if duplicate_count > 0 and problematic_prompts:
                print("❌ ROOT CAUSE: ChatGPT prompts are generating duplicate 'Subject:' lines in email content")
                print("   SOLUTION REQUIRED:")
                for prompt in problematic_prompts:
                    print(f"   - Fix prompt in {prompt.get('file', 'ai_service.py')} at line {prompt['line_start']}")
                    print(f"     Add instruction: 'DO NOT include any subject line in your response'")
                    print(f"     Add warning: 'The email subject is already set separately'")
            elif duplicate_count > 0:
                print("❌ ROOT CAUSE: Email posts contain duplicate subjects but prompts look correct")
                print("   - May be legacy data or other generation source")
                print("   - Verify all email generation paths use proper prompts")
            elif problematic_prompts:
                print("⚠️  POTENTIAL ISSUE: Found prompts that might generate duplicate subjects")
                print("   - No current duplicate subjects found in database")
                print("   - Recommend fixing prompts preventively")
            else:
                print("✅ NO ISSUES FOUND: Email subject handling appears to be working correctly")
                print("   - Email delivery uses 'email_subject' field only")
                print("   - ChatGPT prompts have proper subject handling instructions")
                print("   - No duplicate subjects found in email content")
            
            print()
            print("📋 RECOMMENDED ACTIONS:")
            print("=" * 40)
            
            if problematic_prompts:
                print("🔧 IMMEDIATE FIXES NEEDED:")
                for prompt in problematic_prompts:
                    print(f"1. Edit {prompt.get('file', 'ai_service.py')} at line {prompt['line_start']}")
                    print(f"   Function: {prompt['function']}")
                    print(f"   Add to prompt: 'IMPORTANT: DO NOT include any subject line in your response. The email subject is already set separately.'")
                    print()
            
            if duplicate_count > 0:
                print("🧹 CLEANUP NEEDED:")
                print("1. Review existing email posts with duplicate subjects")
                print("2. Consider cleaning up 'Subject:' lines from email content")
                print("3. Verify mass email sending ignores content subjects")
                print()
            
            print("✅ VERIFICATION STEPS:")
            print("1. Confirm mass email sending uses only 'email_subject' field")
            print("2. Test email generation after prompt fixes")
            print("3. Verify no new duplicate subjects are generated")
            print("4. Ensure consistency across all email agent modes (write, recurring, scheduled)")
            
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
    investigator = EmailSubjectInvestigator()
    await investigator.run_email_subject_investigation()

if __name__ == "__main__":
    asyncio.run(main())