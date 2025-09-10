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

class CustomerDataInvestigator:
    def __init__(self):
        self.mongo_url = os.environ['MONGO_URL']
        self.db_name = os.environ['DB_NAME']
        self.client = None
        self.db = None
        self.test_results = []
        self.backend_url = os.environ.get('FRONTEND_URL', 'https://smart-sms-1.preview.emergentagent.com')
        
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
    
    async def investigate_customer_collections(self):
        """Investigation 1: Check Customer Collections"""
        print("🔍 INVESTIGATION 1: Check Customer Collections")
        print("=" * 60)
        
        try:
            # Get all collection names
            collections = await self.db.list_collection_names()
            
            # Look for customer-related collections
            customer_collections = []
            possible_names = ['customers', 'users', 'customer_data', 'client', 'clients', 'patient', 'patients']
            
            for collection_name in collections:
                if any(name in collection_name.lower() for name in possible_names):
                    customer_collections.append(collection_name)
            
            # Check each potential customer collection
            collection_data = {}
            for collection_name in customer_collections:
                try:
                    count = await self.db[collection_name].count_documents({})
                    sample_doc = await self.db[collection_name].find_one({})
                    collection_data[collection_name] = {
                        "count": count,
                        "sample_structure": list(sample_doc.keys()) if sample_doc else []
                    }
                except Exception as e:
                    collection_data[collection_name] = {"error": str(e)}
            
            # Also check all collections for any that might contain customer data
            all_collection_data = {}
            for collection_name in collections:
                try:
                    count = await self.db[collection_name].count_documents({})
                    if count > 0:
                        sample_doc = await self.db[collection_name].find_one({})
                        # Check if this collection has customer-like fields
                        if sample_doc and any(field in str(sample_doc).lower() for field in ['name', 'email', 'phone', 'customer', 'pet']):
                            all_collection_data[collection_name] = {
                                "count": count,
                                "sample_structure": list(sample_doc.keys()) if sample_doc else [],
                                "sample_data": {k: v for k, v in sample_doc.items() if k != '_id'}
                            }
                except Exception as e:
                    continue
            
            success = len(customer_collections) > 0 or len(all_collection_data) > 0
            
            self.log_test_result(
                "Customer Collections Investigation",
                success,
                f"Found {len(customer_collections)} obvious customer collections and {len(all_collection_data)} collections with customer-like data",
                {
                    "All Collections": collections,
                    "Customer Collections": customer_collections,
                    "Customer Collection Data": collection_data,
                    "All Collections with Customer Data": all_collection_data
                }
            )
            return success, all_collection_data
            
        except Exception as e:
            self.log_test_result(
                "Customer Collections Investigation",
                False,
                f"Error investigating collections: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def verify_customer_data_structure(self, collections_data):
        """Investigation 2: Verify Customer Data Structure"""
        print("🔍 INVESTIGATION 2: Verify Customer Data Structure")
        print("=" * 60)
        
        try:
            customer_records = []
            
            # Check each collection that might contain customer data
            for collection_name, data in collections_data.items():
                if data.get("count", 0) > 0:
                    try:
                        # Get a few sample records
                        records = await self.db[collection_name].find({}).limit(5).to_list(length=5)
                        for record in records:
                            # Remove MongoDB _id for cleaner display
                            if '_id' in record:
                                del record['_id']
                            customer_records.append({
                                "collection": collection_name,
                                "record": record
                            })
                    except Exception as e:
                        continue
            
            # Look specifically for the customer mentioned by user (Stephen Pallam)
            stephen_records = []
            for collection_name in collections_data.keys():
                try:
                    # Search for Stephen Pallam specifically
                    stephen_docs = await self.db[collection_name].find({
                        "$or": [
                            {"name": {"$regex": "Stephen", "$options": "i"}},
                            {"customer_name": {"$regex": "Stephen", "$options": "i"}},
                            {"full_name": {"$regex": "Stephen", "$options": "i"}},
                            {"owner_first_name": {"$regex": "Stephen", "$options": "i"}}
                        ]
                    }).to_list(length=10)
                    
                    for doc in stephen_docs:
                        if '_id' in doc:
                            del doc['_id']
                        stephen_records.append({
                            "collection": collection_name,
                            "record": doc
                        })
                except Exception as e:
                    continue
            
            success = len(customer_records) > 0
            
            self.log_test_result(
                "Customer Data Structure Verification",
                success,
                f"Found {len(customer_records)} customer records across collections, {len(stephen_records)} Stephen Pallam records",
                {
                    "Total Customer Records": len(customer_records),
                    "Sample Customer Records": customer_records[:3],  # Show first 3
                    "Stephen Pallam Records": stephen_records,
                    "Collections with Data": list(collections_data.keys())
                }
            )
            return success, customer_records, stephen_records
            
        except Exception as e:
            self.log_test_result(
                "Customer Data Structure Verification",
                False,
                f"Error verifying customer data structure: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, [], []
    
    async def test_customer_api_endpoint(self):
        """Investigation 3: Test Customer API Endpoint"""
        print("🔍 INVESTIGATION 3: Test Customer API Endpoint")
        print("=" * 60)
        
        try:
            import aiohttp
            import ssl
            
            # Create SSL context that doesn't verify certificates (for testing)
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            # Test different customer endpoints
            endpoints_to_test = [
                "/api/customers",
                "/api/customers?limit=1",
                "/api/customers?limit=10",
                "/api/users",
                "/api/customer-data",
                "/api/clients"
            ]
            
            endpoint_results = {}
            
            async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
                for endpoint in endpoints_to_test:
                    try:
                        url = f"{self.backend_url}{endpoint}"
                        print(f"Testing endpoint: {url}")
                        
                        async with session.get(url, timeout=10) as response:
                            status = response.status
                            try:
                                data = await response.json()
                            except:
                                data = await response.text()
                            
                            endpoint_results[endpoint] = {
                                "status": status,
                                "data": data,
                                "success": status == 200
                            }
                            
                    except Exception as e:
                        endpoint_results[endpoint] = {
                            "status": "error",
                            "error": str(e),
                            "success": False
                        }
            
            # Check if any endpoint returned customer data
            working_endpoints = [ep for ep, result in endpoint_results.items() if result.get("success")]
            
            success = len(working_endpoints) > 0
            
            self.log_test_result(
                "Customer API Endpoint Testing",
                success,
                f"Found {len(working_endpoints)} working customer endpoints out of {len(endpoints_to_test)} tested",
                {
                    "Working Endpoints": working_endpoints,
                    "All Endpoint Results": endpoint_results,
                    "Backend URL": self.backend_url
                }
            )
            return success, endpoint_results
            
        except Exception as e:
            self.log_test_result(
                "Customer API Endpoint Testing",
                False,
                f"Error testing customer API endpoints: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def check_alternative_endpoints(self):
        """Investigation 4: Check Alternative Customer Endpoints"""
        print("🔍 INVESTIGATION 4: Check Alternative Customer Endpoints")
        print("=" * 60)
        
        try:
            # Check server.py for customer-related routes
            server_file_path = Path(__file__).parent / "backend" / "server.py"
            
            customer_routes = []
            if server_file_path.exists():
                with open(server_file_path, 'r') as f:
                    content = f.read()
                    
                # Look for customer-related routes
                import re
                route_patterns = [
                    r'@api_router\.(get|post|put|delete)\("([^"]*customer[^"]*)"',
                    r'@api_router\.(get|post|put|delete)\("([^"]*client[^"]*)"',
                    r'@api_router\.(get|post|put|delete)\("([^"]*user[^"]*)"',
                ]
                
                for pattern in route_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    for method, route in matches:
                        customer_routes.append(f"{method.upper()} {route}")
            
            # Also check what collections are actually being used in the server code
            collection_usage = []
            if server_file_path.exists():
                with open(server_file_path, 'r') as f:
                    content = f.read()
                    
                # Look for db.collection_name patterns
                db_patterns = re.findall(r'db\.([a-zA-Z_]+)', content)
                collection_usage = list(set(db_patterns))
            
            success = len(customer_routes) > 0
            
            self.log_test_result(
                "Alternative Customer Endpoints Check",
                success,
                f"Found {len(customer_routes)} customer-related routes in server.py",
                {
                    "Customer Routes Found": customer_routes,
                    "Database Collections Used": collection_usage,
                    "Server File Path": str(server_file_path)
                }
            )
            return success, customer_routes, collection_usage
            
        except Exception as e:
            self.log_test_result(
                "Alternative Customer Endpoints Check",
                False,
                f"Error checking alternative endpoints: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, [], []
    
    async def test_direct_database_queries(self):
        """Investigation 5: Test Direct Database Queries"""
        print("🔍 INVESTIGATION 5: Test Direct Database Queries")
        print("=" * 60)
        
        try:
            # Test various queries to find customer data
            query_results = {}
            
            # Get all collections
            collections = await self.db.list_collection_names()
            
            # Query 1: Look for any document with "Stephen" in any field
            stephen_results = []
            for collection_name in collections:
                try:
                    # Search for Stephen in any text field
                    docs = await self.db[collection_name].find({
                        "$or": [
                            {"name": {"$regex": "Stephen", "$options": "i"}},
                            {"customer_name": {"$regex": "Stephen", "$options": "i"}},
                            {"full_name": {"$regex": "Stephen", "$options": "i"}},
                            {"owner_first_name": {"$regex": "Stephen", "$options": "i"}},
                            {"email": {"$regex": "stephen", "$options": "i"}}
                        ]
                    }).to_list(length=10)
                    
                    if docs:
                        for doc in docs:
                            if '_id' in doc:
                                del doc['_id']
                            stephen_results.append({
                                "collection": collection_name,
                                "document": doc
                            })
                except Exception as e:
                    continue
            
            query_results["stephen_search"] = stephen_results
            
            # Query 2: Look for any document with pet names (Molly, Dolly)
            pet_results = []
            for collection_name in collections:
                try:
                    docs = await self.db[collection_name].find({
                        "$or": [
                            {"pet_name": {"$regex": "Molly|Dolly", "$options": "i"}},
                            {"pets.name": {"$regex": "Molly|Dolly", "$options": "i"}},
                            {"pet_names": {"$regex": "Molly|Dolly", "$options": "i"}}
                        ]
                    }).to_list(length=10)
                    
                    if docs:
                        for doc in docs:
                            if '_id' in doc:
                                del doc['_id']
                            pet_results.append({
                                "collection": collection_name,
                                "document": doc
                            })
                except Exception as e:
                    continue
            
            query_results["pet_search"] = pet_results
            
            # Query 3: Look for any document with email addresses
            email_results = []
            for collection_name in collections:
                try:
                    docs = await self.db[collection_name].find({
                        "email": {"$exists": True, "$ne": ""}
                    }).limit(5).to_list(length=5)
                    
                    if docs:
                        for doc in docs:
                            if '_id' in doc:
                                del doc['_id']
                            email_results.append({
                                "collection": collection_name,
                                "document": doc
                            })
                except Exception as e:
                    continue
            
            query_results["email_search"] = email_results
            
            # Query 4: Count documents in each collection
            collection_counts = {}
            for collection_name in collections:
                try:
                    count = await self.db[collection_name].count_documents({})
                    if count > 0:
                        collection_counts[collection_name] = count
                except Exception as e:
                    continue
            
            query_results["collection_counts"] = collection_counts
            
            total_results = len(stephen_results) + len(pet_results) + len(email_results)
            success = total_results > 0
            
            self.log_test_result(
                "Direct Database Queries",
                success,
                f"Found {total_results} relevant documents across database queries",
                {
                    "Stephen Search Results": len(stephen_results),
                    "Pet Search Results": len(pet_results), 
                    "Email Search Results": len(email_results),
                    "Collection Counts": collection_counts,
                    "Detailed Results": query_results
                }
            )
            return success, query_results
            
        except Exception as e:
            self.log_test_result(
                "Direct Database Queries",
                False,
                f"Error running direct database queries: {str(e)}",
                {"Error Details": str(e)}
            )
            return False, {}
    
    async def run_customer_data_investigation(self):
        """Run comprehensive customer data investigation"""
        print("🔍 STARTING CUSTOMER DATA INVESTIGATION")
        print("=" * 80)
        print("Investigating why SMS preview shows 'No customers found in database'")
        print("when user reports there is one customer (Stephen Pallam)")
        print("=" * 80)
        
        try:
            await self.connect()
            
            # Run all investigations
            investigation_results = []
            
            # Investigation 1: Check Customer Collections
            success1, collections_data = await self.investigate_customer_collections()
            investigation_results.append(success1)
            
            # Investigation 2: Verify Customer Data Structure
            success2, customer_records, stephen_records = await self.verify_customer_data_structure(collections_data)
            investigation_results.append(success2)
            
            # Investigation 3: Test Customer API Endpoint
            success3, endpoint_results = await self.test_customer_api_endpoint()
            investigation_results.append(success3)
            
            # Investigation 4: Check Alternative Endpoints
            success4, customer_routes, collection_usage = await self.check_alternative_endpoints()
            investigation_results.append(success4)
            
            # Investigation 5: Test Direct Database Queries
            success5, query_results = await self.test_direct_database_queries()
            investigation_results.append(success5)
            
            # Summary
            print("=" * 80)
            print("🎯 CUSTOMER DATA INVESTIGATION SUMMARY")
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
            
            # Analyze findings
            if stephen_records:
                print(f"✅ FOUND STEPHEN PALLAM: Located {len(stephen_records)} records")
                for record in stephen_records:
                    print(f"   Collection: {record['collection']}")
                    print(f"   Data: {record['record']}")
            else:
                print("❌ STEPHEN PALLAM NOT FOUND: No records found in database")
            
            if any(result.get("success") for result in endpoint_results.values()):
                working_endpoints = [ep for ep, result in endpoint_results.items() if result.get("success")]
                print(f"✅ WORKING API ENDPOINTS: {working_endpoints}")
            else:
                print("❌ NO WORKING CUSTOMER API ENDPOINTS FOUND")
            
            if customer_routes:
                print(f"✅ CUSTOMER ROUTES IN CODE: {customer_routes}")
            else:
                print("❌ NO CUSTOMER ROUTES FOUND IN SERVER CODE")
            
            print()
            print("🎯 DIAGNOSIS:")
            print("=" * 40)
            
            if not stephen_records:
                print("❌ ROOT CAUSE: No customer data found in database")
                print("   - The customer Stephen Pallam does not exist in any collection")
                print("   - SMS preview is correct - there are no customers to show")
                print("   - User may need to add customer data first")
            elif not any(result.get("success") for result in endpoint_results.values()):
                print("❌ ROOT CAUSE: Customer API endpoints not working")
                print("   - Customer data exists in database")
                print("   - But API endpoints are not accessible or returning errors")
                print("   - Frontend cannot retrieve customer data via API")
            else:
                print("✅ CUSTOMER DATA AND API WORKING")
                print("   - Customer data exists in database")
                print("   - API endpoints are accessible")
                print("   - Issue may be in frontend SMS preview component")
            
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
    investigator = CustomerDataInvestigator()
    await investigator.run_customer_data_investigation()

if __name__ == "__main__":
    asyncio.run(main())