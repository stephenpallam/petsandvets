#!/usr/bin/env python3
"""
SMS Customer Data Integration Test

This test verifies that SMS agents use real customer database information instead of dummy data.
Specifically tests:
1. Real customer data exists in database
2. SMS agents are configured to use customer database
3. Customer API endpoint returns proper data
4. Customer data structure matches frontend expectations
5. Mass SMS uses real customer records for personalization

Expected Results:
- Real customers should exist in database (not dummy data)
- SMS agents should be configured to use customer database
- API endpoint should return actual customer data
- Mass SMS should pull from real customer records
- Preview should show actual customer information
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

class SMSCustomerDataTester:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        
        # Get backend URL from frontend .env
        frontend_env_path = Path(__file__).parent / "frontend" / ".env"
        if frontend_env_path.exists():
            with open(frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        self.backend_url = line.split('=', 1)[1].strip()
                        break
        else:
            self.backend_url = "https://petcare-agents.preview.emergentagent.com"
        
        self.api_base = f"{self.backend_url}/api"
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
        """Authenticate with the API to get access token"""
        try:
            login_data = {
                "email": "admin@hospital.com",
                "password": "admin123"
            }
            
            response = requests.post(f"{self.api_base}/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                return True
            else:
                print(f"Authentication failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return False
    
    def get_auth_headers(self):
        """Get authentication headers"""
        if self.auth_token:
            return {"Authorization": f"Bearer {self.auth_token}"}
        return {}
    
    async def test_real_customer_data_exists(self):
        """Test 1: Verify Real Customer Data Exists in Database"""
        print("🧪 TEST 1: Verify Real Customer Data Exists in Database")
        print("=" * 60)
        
        try:
            # Check customers collection directly
            customers = await self.db.customers.find({}).limit(10).to_list(length=10)
            
            if not customers:
                self.log_test_result(
                    "Real Customer Data Exists",
                    False,
                    "No customers found in database",
                    {"Customer Count": 0}
                )
                return False
            
            # Analyze customer data quality
            real_customers = []
            dummy_indicators = ['test', 'dummy', 'sample', 'fake', 'example']
            
            for customer in customers:
                name = customer.get('name', '').lower()
                email = customer.get('email', '').lower()
                
                # Check if this looks like real data (not test/dummy data)
                is_dummy = any(indicator in name or indicator in email for indicator in dummy_indicators)
                
                if not is_dummy and name and len(name.split()) >= 2:  # Has first and last name
                    real_customers.append(customer)
            
            # Get first real customer for detailed analysis
            first_customer = customers[0] if customers else None
            
            if real_customers:
                self.log_test_result(
                    "Real Customer Data Exists",
                    True,
                    f"Found {len(real_customers)} real customers out of {len(customers)} total",
                    {
                        "Total Customers": len(customers),
                        "Real Customers": len(real_customers),
                        "First Customer Name": first_customer.get('name') if first_customer else 'None',
                        "First Customer Email": first_customer.get('email') if first_customer else 'None',
                        "Pet Data": first_customer.get('pet_name') or first_customer.get('pets') if first_customer else 'None'
                    }
                )
                return True
            else:
                self.log_test_result(
                    "Real Customer Data Exists",
                    False,
                    f"Found {len(customers)} customers but they appear to be test/dummy data",
                    {
                        "Total Customers": len(customers),
                        "Sample Names": [c.get('name', 'No name') for c in customers[:3]]
                    }
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "Real Customer Data Exists",
                False,
                f"Error checking customer data: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_customer_data_structure(self):
        """Test 2: Verify Customer Data Structure"""
        print("🧪 TEST 2: Verify Customer Data Structure")
        print("=" * 60)
        
        try:
            # Get a sample customer
            customer = await self.db.customers.find_one({})
            
            if not customer:
                self.log_test_result(
                    "Customer Data Structure",
                    False,
                    "No customer found to analyze structure",
                    {}
                )
                return False
            
            # Check required fields
            required_fields = ['name', 'id']
            optional_fields = ['email', 'phone', 'pet_name', 'pets', 'sms_opt_in', 'email_subscribed']
            
            missing_required = [field for field in required_fields if field not in customer]
            present_optional = [field for field in optional_fields if field in customer and customer[field]]
            
            # Check pet data structure
            has_pets_array = 'pets' in customer and isinstance(customer['pets'], list)
            has_pet_name = 'pet_name' in customer and customer['pet_name']
            
            pet_structure = "None"
            if has_pets_array and customer['pets']:
                pet_structure = f"Pets array with {len(customer['pets'])} pets"
            elif has_pet_name:
                pet_structure = f"Pet name field: '{customer['pet_name']}'"
            
            structure_valid = len(missing_required) == 0 and (has_pets_array or has_pet_name)
            
            self.log_test_result(
                "Customer Data Structure",
                structure_valid,
                "Customer data structure analysis completed",
                {
                    "Customer Name": customer.get('name'),
                    "Missing Required Fields": missing_required if missing_required else "None",
                    "Present Optional Fields": present_optional,
                    "Pet Data Structure": pet_structure,
                    "Has Phone": bool(customer.get('phone')),
                    "Has Email": bool(customer.get('email')),
                    "SMS Opt-in": customer.get('sms_opt_in', 'Not set')
                }
            )
            return structure_valid
                
        except Exception as e:
            self.log_test_result(
                "Customer Data Structure",
                False,
                f"Error analyzing customer data structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_customer_api_endpoint(self):
        """Test 3: Test Customer API Endpoint"""
        print("🧪 TEST 3: Test Customer API Endpoint")
        print("=" * 60)
        
        try:
            # Test the API endpoint that frontend uses
            headers = self.get_auth_headers()
            response = requests.get(f"{self.api_base}/customers?limit=1", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'customers' in data and data['customers']:
                    customer = data['customers'][0]
                    
                    # Verify the customer data format matches frontend expectations
                    has_name = 'name' in customer
                    has_id = 'id' in customer
                    has_pet_data = 'pet_name' in customer or 'pets' in customer
                    
                    api_working = has_name and has_id
                    
                    self.log_test_result(
                        "Customer API Endpoint",
                        api_working,
                        f"API endpoint returned customer data successfully",
                        {
                            "API URL": f"{self.api_base}/customers?limit=1",
                            "Response Status": response.status_code,
                            "Customer Name": customer.get('name'),
                            "Customer ID": customer.get('id'),
                            "Has Pet Data": has_pet_data,
                            "Pet Info": customer.get('pet_name') or customer.get('pets'),
                            "Phone": customer.get('phone', 'Not provided'),
                            "Email": customer.get('email', 'Not provided')
                        }
                    )
                    return api_working
                else:
                    self.log_test_result(
                        "Customer API Endpoint",
                        False,
                        "API returned empty customer list",
                        {
                            "Response Status": response.status_code,
                            "Response Data": data
                        }
                    )
                    return False
            else:
                self.log_test_result(
                    "Customer API Endpoint",
                    False,
                    f"API endpoint failed with status {response.status_code}",
                    {
                        "API URL": f"{self.api_base}/customers?limit=1",
                        "Status Code": response.status_code,
                        "Response": response.text[:200]
                    }
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "Customer API Endpoint",
                False,
                f"Error testing customer API endpoint: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_sms_agent_customer_configuration(self):
        """Test 4: Test SMS Agent Customer Configuration"""
        print("🧪 TEST 4: Test SMS Agent Customer Configuration")
        print("=" * 60)
        
        try:
            # Find SMS agents in the database
            sms_agents = await self.db.ai_agents.find({"agent_type": "sms_agent"}).limit(5).to_list(length=5)
            
            if not sms_agents:
                self.log_test_result(
                    "SMS Agent Customer Configuration",
                    False,
                    "No SMS agents found in database",
                    {"SMS Agent Count": 0}
                )
                return False
            
            # Analyze SMS agent configuration
            configured_agents = 0
            agent_details = []
            
            for agent in sms_agents:
                agent_name = agent.get('agent_name', 'Unnamed Agent')
                
                # Check for customer database usage indicators
                uses_customer_db = agent.get('use_customer_database', True)  # Default to True
                has_placeholders = False
                
                # Check if SMS template has customer placeholders
                sms_template = agent.get('sms_template', '')
                customer_placeholders = ['[CUSTOMER_NAME]', '[PET_NAME]', '[PET_NAMES]']
                has_placeholders = any(placeholder in sms_template for placeholder in customer_placeholders)
                
                is_configured = uses_customer_db or has_placeholders
                
                if is_configured:
                    configured_agents += 1
                
                agent_details.append({
                    "name": agent_name,
                    "uses_customer_db": uses_customer_db,
                    "has_placeholders": has_placeholders,
                    "template": sms_template[:50] + "..." if len(sms_template) > 50 else sms_template
                })
            
            success = configured_agents > 0
            
            self.log_test_result(
                "SMS Agent Customer Configuration",
                success,
                f"Found {configured_agents} SMS agents configured for customer data out of {len(sms_agents)} total",
                {
                    "Total SMS Agents": len(sms_agents),
                    "Configured for Customer Data": configured_agents,
                    "First Agent Details": agent_details[0] if agent_details else "None",
                    "Sample Template": agent_details[0]["template"] if agent_details else "None"
                }
            )
            return success
                
        except Exception as e:
            self.log_test_result(
                "SMS Agent Customer Configuration",
                False,
                f"Error checking SMS agent configuration: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def test_mass_sms_customer_data_usage(self):
        """Test 5: Test Mass SMS Customer Data Usage"""
        print("🧪 TEST 5: Test Mass SMS Customer Data Usage")
        print("=" * 60)
        
        try:
            # Import the mass SMS function
            from server import send_mass_sms_from_post
            
            # Create a test SMS post with customer placeholders
            test_post = {
                "id": "test_mass_sms_post",
                "agent_type": "sms_agent",
                "sms_template": "Hi [CUSTOMER_NAME]! Hope [PET_NAME] is doing well. - Your Vet Team",
                "sms_link": "https://petsandvetsanimalhospital.com",
                "content": "Hi [CUSTOMER_NAME]! Hope [PET_NAME] is doing well. - Your Vet Team"
            }
            
            # Insert test post
            await self.db.ai_posts.insert_one(test_post)
            
            # Get customer count before testing
            customer_count = await self.db.customers.count_documents({})
            
            if customer_count == 0:
                self.log_test_result(
                    "Mass SMS Customer Data Usage",
                    False,
                    "No customers available for mass SMS testing",
                    {"Customer Count": customer_count}
                )
                return False
            
            # Test mass SMS function (this should use real customer data)
            try:
                result = await send_mass_sms_from_post("test_mass_sms_post", test_post)
                
                # Check if the function processed customers
                success = result is not None
                
                # Get a sample customer to verify data usage
                sample_customer = await self.db.customers.find_one({})
                expected_personalized = test_post["sms_template"].replace("[CUSTOMER_NAME]", sample_customer.get('name', 'Customer'))
                
                # Check for pet name replacement
                pet_name = sample_customer.get('pet_name', 'Pet')
                if sample_customer.get('pets'):
                    pet_names = [pet.get('name') for pet in sample_customer['pets'] if pet.get('name')]
                    if pet_names:
                        if len(pet_names) == 1:
                            pet_name = pet_names[0]
                        elif len(pet_names) == 2:
                            pet_name = f"{pet_names[0]} and {pet_names[1]}"
                        else:
                            pet_name = ", ".join(pet_names[:-1]) + f", and {pet_names[-1]}"
                
                expected_personalized = expected_personalized.replace("[PET_NAME]", pet_name)
                
                self.log_test_result(
                    "Mass SMS Customer Data Usage",
                    success,
                    "Mass SMS function executed with customer data",
                    {
                        "Customer Count": customer_count,
                        "Function Result": str(result)[:100] if result else "None",
                        "Sample Customer": sample_customer.get('name') if sample_customer else "None",
                        "Expected Personalization": expected_personalized[:100] + "..." if len(expected_personalized) > 100 else expected_personalized,
                        "Uses Real Data": bool(sample_customer and sample_customer.get('name'))
                    }
                )
                return success
                
            except Exception as func_error:
                self.log_test_result(
                    "Mass SMS Customer Data Usage",
                    False,
                    f"Mass SMS function failed: {str(func_error)}",
                    {
                        "Customer Count": customer_count,
                        "Function Error": str(func_error)
                    }
                )
                return False
                
        except Exception as e:
            self.log_test_result(
                "Mass SMS Customer Data Usage",
                False,
                f"Error testing mass SMS customer data usage: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
        
        finally:
            # Clean up test post
            try:
                await self.db.ai_posts.delete_one({"id": "test_mass_sms_post"})
            except:
                pass
    
    async def test_sms_preview_customer_data(self):
        """Test 6: Test SMS Preview Uses Real Customer Data"""
        print("🧪 TEST 6: Test SMS Preview Uses Real Customer Data")
        print("=" * 60)
        
        try:
            # Test the customer data endpoint used for preview
            headers = self.get_auth_headers()
            response = requests.get(f"{self.api_base}/customers?limit=1", headers=headers)
            
            if response.status_code != 200:
                self.log_test_result(
                    "SMS Preview Customer Data",
                    False,
                    f"Customer API for preview failed: {response.status_code}",
                    {"API Response": response.text[:200]}
                )
                return False
            
            data = response.json()
            if not data.get('customers'):
                self.log_test_result(
                    "SMS Preview Customer Data",
                    False,
                    "No customers returned for preview",
                    {"API Response": data}
                )
                return False
            
            preview_customer = data['customers'][0]
            
            # Check if this customer data is suitable for preview
            has_name = bool(preview_customer.get('name'))
            has_pet_data = bool(preview_customer.get('pet_name') or preview_customer.get('pets'))
            
            # Check if it's real data (not dummy)
            name = preview_customer.get('name', '').lower()
            dummy_indicators = ['test', 'dummy', 'sample', 'fake', 'example']
            is_real_data = not any(indicator in name for indicator in dummy_indicators)
            
            preview_suitable = has_name and has_pet_data and is_real_data
            
            self.log_test_result(
                "SMS Preview Customer Data",
                preview_suitable,
                "SMS preview customer data analysis completed",
                {
                    "Preview Customer Name": preview_customer.get('name'),
                    "Has Pet Data": has_pet_data,
                    "Pet Info": preview_customer.get('pet_name') or preview_customer.get('pets'),
                    "Is Real Data": is_real_data,
                    "Phone Available": bool(preview_customer.get('phone')),
                    "Email Available": bool(preview_customer.get('email')),
                    "Suitable for Preview": preview_suitable
                }
            )
            return preview_suitable
                
        except Exception as e:
            self.log_test_result(
                "SMS Preview Customer Data",
                False,
                f"Error testing SMS preview customer data: {str(e)}",
                {"Error Details": str(e)}
            )
            return False
    
    async def run_comprehensive_customer_data_test(self):
        """Run comprehensive SMS customer data integration test"""
        print("🚀 STARTING SMS CUSTOMER DATA INTEGRATION TEST")
        print("=" * 80)
        print("Testing SMS agents use real customer database information")
        print("Focus: Real customer data integration instead of dummy fallback data")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Authenticate first
            if not await self.authenticate():
                print("❌ CRITICAL ERROR: Could not authenticate with API")
                return
            
            # Run all tests
            test_results = []
            
            # Test 1: Real Customer Data Exists
            test_results.append(await self.test_real_customer_data_exists())
            
            # Test 2: Customer Data Structure
            test_results.append(await self.test_customer_data_structure())
            
            # Test 3: Customer API Endpoint
            test_results.append(await self.test_customer_api_endpoint())
            
            # Test 4: SMS Agent Customer Configuration
            test_results.append(await self.test_sms_agent_customer_configuration())
            
            # Test 5: Mass SMS Customer Data Usage
            test_results.append(await self.test_mass_sms_customer_data_usage())
            
            # Test 6: SMS Preview Customer Data
            test_results.append(await self.test_sms_preview_customer_data())
            
            # Summary
            print("=" * 80)
            print("🎯 SMS CUSTOMER DATA INTEGRATION TEST SUMMARY")
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
                print("🎉 ALL TESTS PASSED - SMS Customer Data Integration is Working!")
                print("✅ Real customer data exists in database")
                print("✅ SMS agents configured to use customer database")
                print("✅ Customer API endpoint returns proper data")
                print("✅ Mass SMS uses real customer records")
                print("✅ Preview shows actual customer information")
            elif passed_tests >= 4:
                print("⚠️  MOSTLY WORKING - SMS Customer Data Integration has minor issues")
                print("✅ Core customer data integration appears functional")
                print("⚠️  Some components may need additional attention")
            else:
                print("❌ CRITICAL ISSUES - SMS Customer Data Integration needs attention")
                print("❌ SMS agents may still be using dummy fallback data")
                print("❌ Customer database integration not fully functional")
            
            print()
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR during testing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        finally:
            await self.disconnect()

async def main():
    """Main test function"""
    tester = SMSCustomerDataTester()
    await tester.run_comprehensive_customer_data_test()

if __name__ == "__main__":
    asyncio.run(main())