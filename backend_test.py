#!/usr/bin/env python3
"""
Template Management System Comprehensive Testing

This test comprehensively tests the new Template Management System endpoints as requested:

Test Focus:
1. Initialize Default Templates and Placeholders - Test POST /api/templates/initialize-defaults
2. Template CRUD Operations - Test all template endpoints with filtering
3. Global Placeholder CRUD Operations - Test all global placeholder endpoints  
4. Validation and Error Handling - Test duplicate names, non-existent resources, etc.

Expected Results:
- Default templates and placeholders should be created successfully
- All CRUD operations should work correctly with proper validation
- Error handling should work for edge cases
- System should be ready for frontend integration
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

class TemplateManagementTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://petcare-agents.preview.emergentagent.com')
        self.auth_token = None
        self.created_template_ids = []
        self.created_placeholder_ids = []
        
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
            # Remove any existing test templates and placeholders
            await self.db.templates.delete_many({"name": {"$regex": "^Test"}})
            await self.db.global_placeholders.delete_many({"name": {"$regex": "^Test"}})
            print("🧹 Cleaned up existing test data")
        except Exception as e:
            print(f"Warning: Could not clean up test data: {e}")
    
    async def test_initialize_default_templates(self):
        """Test 1: Initialize Default Templates and Placeholders"""
        print("🔍 TEST 1: Initialize Default Templates and Placeholders")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                url = f"{self.backend_url}/api/templates/initialize-defaults"
                async with session.post(url, headers=headers, timeout=15) as response:
                    response_text = await response.text()
                    
                    if response.status == 200:
                        try:
                            result = json.loads(response_text)
                            
                            # Verify default templates were created
                            templates = await self.db.templates.find().to_list(length=None)
                            placeholders = await self.db.global_placeholders.find().to_list(length=None)
                            
                            # Check for expected default templates
                            expected_email_templates = ["Appointment Reminder", "Welcome New Customer", "Marketing Promotion"]
                            expected_sms_templates = ["Appointment Reminder", "Welcome New Customer", "Marketing Promotion"]
                            expected_placeholders = ["Website Link", "Book Now Link", "Phone Number", "Business Name", "Business Address"]
                            
                            email_templates = [t for t in templates if t.get("type") == "email"]
                            sms_templates = [t for t in templates if t.get("type") == "sms"]
                            
                            email_names = [t.get("name") for t in email_templates]
                            sms_names = [t.get("name") for t in sms_templates]
                            placeholder_names = [p.get("name") for p in placeholders]
                            
                            success = (
                                all(name in email_names for name in expected_email_templates) and
                                all(name in sms_names for name in expected_sms_templates) and
                                all(name in placeholder_names for name in expected_placeholders)
                            )
                            
                            self.log_test_result(
                                "Initialize Default Templates and Placeholders",
                                success,
                                f"Default initialization: {success}",
                                {
                                    "HTTP Status": response.status,
                                    "Response Message": result.get("message"),
                                    "Total Templates": len(templates),
                                    "Email Templates": len(email_templates),
                                    "SMS Templates": len(sms_templates),
                                    "Global Placeholders": len(placeholders),
                                    "Expected Email Templates Found": all(name in email_names for name in expected_email_templates),
                                    "Expected SMS Templates Found": all(name in sms_names for name in expected_sms_templates),
                                    "Expected Placeholders Found": all(name in placeholder_names for name in expected_placeholders),
                                    "Email Template Names": email_names,
                                    "SMS Template Names": sms_names,
                                    "Placeholder Names": placeholder_names
                                }
                            )
                            return success
                            
                        except json.JSONDecodeError:
                            self.log_test_result(
                                "Initialize Default Templates and Placeholders",
                                False,
                                "Invalid JSON response",
                                {"HTTP Status": response.status, "Response Text": response_text}
                            )
                            return False
                    else:
                        self.log_test_result(
                            "Initialize Default Templates and Placeholders",
                            False,
                            f"Failed to initialize defaults: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response Text": response_text}
                        )
                        return False
                        
        except Exception as e:
            self.log_test_result(
                "Initialize Default Templates and Placeholders",
                False,
                f"Error initializing defaults: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_template_crud_operations(self):
        """Test 2: Template CRUD Operations"""
        print("🔍 TEST 2: Template CRUD Operations")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Test 2a: GET all templates
                url = f"{self.backend_url}/api/templates"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template CRUD - GET All Templates",
                            False,
                            f"Failed to get templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    all_templates = await response.json()
                
                # Test 2b: GET templates filtered by email type
                url = f"{self.backend_url}/api/templates?template_type=email"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template CRUD - GET Email Templates",
                            False,
                            f"Failed to get email templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    email_templates = await response.json()
                
                # Test 2c: GET templates filtered by SMS type
                url = f"{self.backend_url}/api/templates?template_type=sms"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template CRUD - GET SMS Templates",
                            False,
                            f"Failed to get SMS templates: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    sms_templates = await response.json()
                
                # Test 2d: POST create custom email template
                email_template_data = {
                    "name": "Test Custom Email Template",
                    "type": "email",
                    "content": "Dear [CUSTOMER_NAME], this is a test email for [PET_NAME]. Visit [WEBSITE_LINK] for more info.",
                    "description": "Test email template for comprehensive testing"
                }
                
                url = f"{self.backend_url}/api/templates"
                async with session.post(url, headers=headers, json=email_template_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template CRUD - POST Create Email Template",
                            False,
                            f"Failed to create email template: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_email_template = await response.json()
                    email_template_id = created_email_template.get("id")
                    self.created_template_ids.append(email_template_id)
                
                # Test 2e: POST create custom SMS template
                sms_template_data = {
                    "name": "Test Custom SMS Template",
                    "type": "sms",
                    "content": "Hi [CUSTOMER_NAME]! Test SMS for [PET_NAME]. Call [PHONE_NUMBER].",
                    "description": "Test SMS template for comprehensive testing"
                }
                
                async with session.post(url, headers=headers, json=sms_template_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template CRUD - POST Create SMS Template",
                            False,
                            f"Failed to create SMS template: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_sms_template = await response.json()
                    sms_template_id = created_sms_template.get("id")
                    self.created_template_ids.append(sms_template_id)
                
                # Test 2f: GET specific template
                url = f"{self.backend_url}/api/templates/{email_template_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template CRUD - GET Specific Template",
                            False,
                            f"Failed to get specific template: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    specific_template = await response.json()
                
                # Test 2g: PUT update template
                update_data = {
                    "name": "Test Updated Email Template",
                    "content": "Updated content for [CUSTOMER_NAME] and [PET_NAME]. Visit [WEBSITE_LINK].",
                    "description": "Updated test email template"
                }
                
                url = f"{self.backend_url}/api/templates/{email_template_id}"
                async with session.put(url, headers=headers, json=update_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Template CRUD - PUT Update Template",
                            False,
                            f"Failed to update template: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    updated_template = await response.json()
                
                # Verify all operations worked correctly
                success = (
                    len(all_templates) > 0 and
                    len(email_templates) > 0 and
                    len(sms_templates) > 0 and
                    all(t.get("type") == "email" for t in email_templates) and
                    all(t.get("type") == "sms" for t in sms_templates) and
                    created_email_template.get("name") == "Test Custom Email Template" and
                    created_sms_template.get("name") == "Test Custom SMS Template" and
                    specific_template.get("id") == email_template_id and
                    updated_template.get("name") == "Test Updated Email Template"
                )
                
                self.log_test_result(
                    "Template CRUD Operations",
                    success,
                    f"Template CRUD operations: {success}",
                    {
                        "Total Templates": len(all_templates),
                        "Email Templates": len(email_templates),
                        "SMS Templates": len(sms_templates),
                        "Email Filter Working": all(t.get("type") == "email" for t in email_templates),
                        "SMS Filter Working": all(t.get("type") == "sms" for t in sms_templates),
                        "Email Template Created": created_email_template.get("name") == "Test Custom Email Template",
                        "SMS Template Created": created_sms_template.get("name") == "Test Custom SMS Template",
                        "Specific Template Retrieved": specific_template.get("id") == email_template_id,
                        "Template Updated": updated_template.get("name") == "Test Updated Email Template",
                        "Created Email Template ID": email_template_id,
                        "Created SMS Template ID": sms_template_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Template CRUD Operations",
                False,
                f"Error in template CRUD operations: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_global_placeholder_crud_operations(self):
        """Test 3: Global Placeholder CRUD Operations"""
        print("🔍 TEST 3: Global Placeholder CRUD Operations")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Test 3a: GET all global placeholders
                url = f"{self.backend_url}/api/global-placeholders"
                async with session.get(url, headers=headers, timeout=10) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Global Placeholder CRUD - GET All Placeholders",
                            False,
                            f"Failed to get placeholders: HTTP {response.status}",
                            {"HTTP Status": response.status}
                        )
                        return False
                    
                    all_placeholders = await response.json()
                
                # Test 3b: POST create custom placeholder
                placeholder_data = {
                    "name": "Test Custom Placeholder",
                    "placeholder": "[TEST_CUSTOM]",
                    "value": "Custom Test Value",
                    "description": "Test placeholder for comprehensive testing"
                }
                
                url = f"{self.backend_url}/api/global-placeholders"
                async with session.post(url, headers=headers, json=placeholder_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Global Placeholder CRUD - POST Create Placeholder",
                            False,
                            f"Failed to create placeholder: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    created_placeholder = await response.json()
                    placeholder_id = created_placeholder.get("id")
                    self.created_placeholder_ids.append(placeholder_id)
                
                # Test 3c: PUT update placeholder
                update_data = {
                    "name": "Test Updated Placeholder",
                    "value": "Updated Test Value",
                    "description": "Updated test placeholder"
                }
                
                url = f"{self.backend_url}/api/global-placeholders/{placeholder_id}"
                async with session.put(url, headers=headers, json=update_data, timeout=15) as response:
                    if response.status != 200:
                        self.log_test_result(
                            "Global Placeholder CRUD - PUT Update Placeholder",
                            False,
                            f"Failed to update placeholder: HTTP {response.status}",
                            {"HTTP Status": response.status, "Response": await response.text()}
                        )
                        return False
                    
                    updated_placeholder = await response.json()
                
                # Verify all operations worked correctly
                success = (
                    len(all_placeholders) > 0 and
                    created_placeholder.get("name") == "Test Custom Placeholder" and
                    created_placeholder.get("placeholder") == "[TEST_CUSTOM]" and
                    created_placeholder.get("value") == "Custom Test Value" and
                    updated_placeholder.get("name") == "Test Updated Placeholder" and
                    updated_placeholder.get("value") == "Updated Test Value"
                )
                
                self.log_test_result(
                    "Global Placeholder CRUD Operations",
                    success,
                    f"Global placeholder CRUD operations: {success}",
                    {
                        "Total Placeholders": len(all_placeholders),
                        "Placeholder Created": created_placeholder.get("name") == "Test Custom Placeholder",
                        "Placeholder Value Correct": created_placeholder.get("value") == "Custom Test Value",
                        "Placeholder Updated": updated_placeholder.get("name") == "Test Updated Placeholder",
                        "Updated Value Correct": updated_placeholder.get("value") == "Updated Test Value",
                        "Created Placeholder ID": placeholder_id
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Global Placeholder CRUD Operations",
                False,
                f"Error in placeholder CRUD operations: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_validation_and_error_handling(self):
        """Test 4: Validation and Error Handling"""
        print("🔍 TEST 4: Validation and Error Handling")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            validation_results = {}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # First verify our test templates still exist
                url = f"{self.backend_url}/api/templates"
                async with session.get(url, headers=headers, timeout=10) as response:
                    current_templates = await response.json()
                    template_names = [t.get("name") for t in current_templates]
                    print(f"Current templates before validation test: {template_names}")
                
                # Test 4a: Try creating duplicate template name
                duplicate_template_data = {
                    "name": "Test Updated Email Template",  # This should already exist from previous test (updated name)
                    "type": "email",
                    "content": "Duplicate template content",
                    "description": "This should fail due to duplicate name"
                }
                
                url = f"{self.backend_url}/api/templates"
                async with session.post(url, headers=headers, json=duplicate_template_data, timeout=15) as response:
                    validation_results["duplicate_template_rejected"] = response.status == 400
                
                # Test 4b: Try creating duplicate placeholder name
                duplicate_placeholder_data = {
                    "name": "Test Updated Placeholder",  # This should already exist from previous test (updated name)
                    "placeholder": "[DUPLICATE_TEST]",
                    "value": "Duplicate value",
                    "description": "This should fail due to duplicate name"
                }
                
                url = f"{self.backend_url}/api/global-placeholders"
                async with session.post(url, headers=headers, json=duplicate_placeholder_data, timeout=15) as response:
                    validation_results["duplicate_placeholder_name_rejected"] = response.status == 400
                
                # Test 4c: Try creating duplicate placeholder text
                duplicate_placeholder_text_data = {
                    "name": "Another Test Placeholder",
                    "placeholder": "[TEST_CUSTOM]",  # This should already exist from previous test
                    "value": "Another value",
                    "description": "This should fail due to duplicate placeholder text"
                }
                
                async with session.post(url, headers=headers, json=duplicate_placeholder_text_data, timeout=15) as response:
                    validation_results["duplicate_placeholder_text_rejected"] = response.status == 400
                
                # Test 4d: Try accessing non-existent template
                fake_template_id = "non-existent-template-id"
                url = f"{self.backend_url}/api/templates/{fake_template_id}"
                async with session.get(url, headers=headers, timeout=10) as response:
                    validation_results["nonexistent_template_404"] = response.status == 404
                
                # Test 4e: Try accessing non-existent placeholder
                fake_placeholder_id = "non-existent-placeholder-id"
                url = f"{self.backend_url}/api/global-placeholders/{fake_placeholder_id}"
                async with session.put(url, headers=headers, json={"name": "Test"}, timeout=10) as response:
                    validation_results["nonexistent_placeholder_404"] = response.status == 404
                
                # Test 4f: Try deleting non-existent template
                url = f"{self.backend_url}/api/templates/{fake_template_id}"
                async with session.delete(url, headers=headers, timeout=10) as response:
                    validation_results["delete_nonexistent_template_404"] = response.status == 404
                
                # Test 4g: Try deleting non-existent placeholder
                url = f"{self.backend_url}/api/global-placeholders/{fake_placeholder_id}"
                async with session.delete(url, headers=headers, timeout=10) as response:
                    validation_results["delete_nonexistent_placeholder_404"] = response.status == 404
                
                # Verify all validation tests passed
                success = all(validation_results.values())
                
                self.log_test_result(
                    "Validation and Error Handling",
                    success,
                    f"Validation and error handling: {success}",
                    {
                        "Duplicate Template Rejected": validation_results.get("duplicate_template_rejected"),
                        "Duplicate Placeholder Name Rejected": validation_results.get("duplicate_placeholder_name_rejected"),
                        "Duplicate Placeholder Text Rejected": validation_results.get("duplicate_placeholder_text_rejected"),
                        "Nonexistent Template 404": validation_results.get("nonexistent_template_404"),
                        "Nonexistent Placeholder 404": validation_results.get("nonexistent_placeholder_404"),
                        "Delete Nonexistent Template 404": validation_results.get("delete_nonexistent_template_404"),
                        "Delete Nonexistent Placeholder 404": validation_results.get("delete_nonexistent_placeholder_404"),
                        "All Validations Passed": success
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Validation and Error Handling",
                False,
                f"Error in validation testing: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_delete_operations(self):
        """Test 5: Delete Operations (cleanup test data)"""
        print("🔍 TEST 5: Delete Operations")
        print("=" * 60)
        
        try:
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            delete_results = {}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                # Delete created templates
                for template_id in self.created_template_ids:
                    url = f"{self.backend_url}/api/templates/{template_id}"
                    async with session.delete(url, headers=headers, timeout=10) as response:
                        delete_results[f"template_{template_id}"] = response.status == 200
                
                # Delete created placeholders
                for placeholder_id in self.created_placeholder_ids:
                    url = f"{self.backend_url}/api/global-placeholders/{placeholder_id}"
                    async with session.delete(url, headers=headers, timeout=10) as response:
                        delete_results[f"placeholder_{placeholder_id}"] = response.status == 200
                
                success = all(delete_results.values()) if delete_results else True
                
                self.log_test_result(
                    "Delete Operations",
                    success,
                    f"Delete operations: {success}",
                    {
                        "Templates Deleted": len([k for k in delete_results.keys() if k.startswith("template_")]),
                        "Placeholders Deleted": len([k for k in delete_results.keys() if k.startswith("placeholder_")]),
                        "All Deletes Successful": success,
                        "Delete Results": delete_results
                    }
                )
                return success
                
        except Exception as e:
            self.log_test_result(
                "Delete Operations",
                False,
                f"Error in delete operations: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_template_management_tests(self):
        """Run comprehensive template management system tests"""
        print("🔍 STARTING TEMPLATE MANAGEMENT SYSTEM TESTING")
        print("=" * 80)
        print("Testing new Template Management System endpoints comprehensively")
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
            
            # Test 1: Initialize Default Templates and Placeholders
            success1 = await self.test_initialize_default_templates()
            test_results.append(success1)
            
            # Test 2: Template CRUD Operations
            success2 = await self.test_template_crud_operations()
            test_results.append(success2)
            
            # Test 3: Global Placeholder CRUD Operations
            success3 = await self.test_global_placeholder_crud_operations()
            test_results.append(success3)
            
            # Test 4: Validation and Error Handling
            success4 = await self.test_validation_and_error_handling()
            test_results.append(success4)
            
            # Test 5: Delete Operations (cleanup)
            success5 = await self.test_delete_operations()
            test_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 TEMPLATE MANAGEMENT SYSTEM TESTING SUMMARY")
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
                print("✅ DEFAULT INITIALIZATION: Default templates and placeholders created successfully")
                print("   - Email templates: Appointment Reminder, Welcome New Customer, Marketing Promotion")
                print("   - SMS templates: Appointment Reminder, Welcome New Customer, Marketing Promotion")
                print("   - Global placeholders: Website Link, Book Now Link, Phone Number, Business Name, Business Address")
            else:
                print("❌ DEFAULT INITIALIZATION: Failed to initialize default templates and placeholders")
            
            # Test 2 Analysis
            if success2:
                print("✅ TEMPLATE CRUD: All template CRUD operations working correctly")
                print("   - GET all templates, GET filtered by type (email/SMS)")
                print("   - POST create custom templates, GET specific template")
                print("   - PUT update template, proper data persistence")
            else:
                print("❌ TEMPLATE CRUD: Template CRUD operations failed")
            
            # Test 3 Analysis
            if success3:
                print("✅ PLACEHOLDER CRUD: All global placeholder CRUD operations working correctly")
                print("   - GET all placeholders, POST create custom placeholder")
                print("   - PUT update placeholder, proper data persistence")
            else:
                print("❌ PLACEHOLDER CRUD: Global placeholder CRUD operations failed")
            
            # Test 4 Analysis
            if success4:
                print("✅ VALIDATION: All validation and error handling working correctly")
                print("   - Duplicate template names rejected (400)")
                print("   - Duplicate placeholder names/text rejected (400)")
                print("   - Non-existent resources return 404")
            else:
                print("❌ VALIDATION: Validation and error handling failed")
            
            # Test 5 Analysis
            if success5:
                print("✅ DELETE OPERATIONS: All delete operations working correctly")
                print("   - Test data cleaned up successfully")
            else:
                print("❌ DELETE OPERATIONS: Delete operations failed")
            
            print()
            print("📋 DETAILED TEST RESULTS:")
            print("=" * 40)
            
            test_names = [
                "Initialize Default Templates and Placeholders",
                "Template CRUD Operations", 
                "Global Placeholder CRUD Operations",
                "Validation and Error Handling",
                "Delete Operations"
            ]
            
            for i, (test_name, success) in enumerate(zip(test_names, test_results)):
                status = "✅ PASS" if success else "❌ FAIL"
                print(f"{i+1}. {status} {test_name}")
            
            print()
            print("🎯 SYSTEM READINESS:")
            print("=" * 40)
            
            if all(test_results):
                print("✅ TEMPLATE MANAGEMENT SYSTEM READY FOR FRONTEND INTEGRATION")
                print("   - All endpoints working correctly")
                print("   - Data properly stored and retrieved")
                print("   - Validation and error handling functional")
                print("   - System is production-ready")
            else:
                print("❌ TEMPLATE MANAGEMENT SYSTEM NEEDS FIXES")
                failed_tests = [test_names[i] for i, success in enumerate(test_results) if not success]
                print(f"   - Failed tests: {', '.join(failed_tests)}")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main testing function"""
    tester = TemplateManagementTester()
    await tester.run_template_management_tests()

if __name__ == "__main__":
    asyncio.run(main())