#!/usr/bin/env python3
"""
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
Enhanced Backend API Testing for Patient Registration PDF System with Multiple Pets
Tests the new multiple pets functionality for patient registration
"""

import requests
import json
import os
from datetime import datetime
import sys

# CRITICAL: Setup test database environment
import sys
sys.path.append('/app/backend')
from test_db_config import set_test_environment
set_test_environment()
print("🧪 USING TEST DATABASE - Production data is safe!")


# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        return "http://localhost:8001"
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing Enhanced Patient Registration PDF System at: {API_URL}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def log_success(self, test_name):
        print(f"✅ {test_name}")
        self.passed += 1
        
    def log_failure(self, test_name, error):
        print(f"❌ {test_name}: {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*50}")
        print(f"ENHANCED PATIENT REGISTRATION PDF SYSTEM TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        return self.failed == 0

results = TestResults()

# Global variables for patient registration testing
patient_registration_id = None
multiple_pets_registration_id = None

def test_patient_registration_single_pet():
    """Test POST /patient-registration with single pet (minimum required)"""
    global patient_registration_id
    try:
        single_pet_data = {
            "owner_first_name": "Sarah",
            "owner_last_name": "Johnson",
            "address": "123 Main Street",
            "city": "Chantilly",
            "state": "VA",
            "zip_code": "20151",
            "email": "sarah.johnson@email.com",
            "phone": "(571) 555-0123",
            "emergency_contact_name": "Michael Johnson",
            "emergency_contact_phone": "(571) 555-0124",
            "pets": [
                {
                    "pet_name": "Bella",
                    "pet_species": "Dog",
                    "pet_breed": "Golden Retriever",
                    "pet_gender": "Female",
                    "pet_age": "3 years",
                    "pet_weight": "65 lbs",
                    "pet_color": "Golden",
                    "spayed_neutered": "Yes",
                    "current_medications": "None currently",
                    "allergies": "No known allergies",
                    "vaccination_history": "Up to date on all core vaccines. Last rabies vaccine: March 2024",
                    "medical_conditions": "Mild hip dysplasia, managed with supplements"
                }
            ],
            "previous_vet": "Chantilly Animal Hospital",
            "previous_vet_phone": "(703) 555-0100",
            "last_visit_date": "2024-11-15",
            "how_heard_about_us": "Google search",
            "preferred_appointment_type": "Morning appointments",
            "special_instructions": "Bella is very friendly but gets anxious around other dogs. Please schedule during quieter times if possible."
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=single_pet_data)
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and 
                "registration_id" in data and 
                "successfully" in data["message"].lower()):
                patient_registration_id = data["registration_id"]
                results.log_success("Patient Registration (Single Pet)")
                return True
        results.log_failure("Patient Registration (Single Pet)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration (Single Pet)", str(e))
        return False

def test_patient_registration_multiple_pets():
    """Test POST /patient-registration with multiple pets (2-4 pets)"""
    global multiple_pets_registration_id
    try:
        multiple_pets_data = {
            "owner_first_name": "Emily",
            "owner_last_name": "Rodriguez",
            "address": "789 Pine Street",
            "city": "South Riding",
            "state": "VA",
            "zip_code": "20152",
            "email": "emily.rodriguez@email.com",
            "phone": "(571) 555-0300",
            "emergency_contact_name": "Carlos Rodriguez",
            "emergency_contact_phone": "(571) 555-0301",
            "pets": [
                {
                    "pet_name": "Luna",
                    "pet_species": "Dog",
                    "pet_breed": "Border Collie",
                    "pet_gender": "Female",
                    "pet_age": "1.5 years",
                    "pet_weight": "45 lbs",
                    "pet_color": "Black and White",
                    "spayed_neutered": "Yes",
                    "current_medications": "Flea and tick prevention",
                    "allergies": "Sensitive to chicken",
                    "vaccination_history": "Puppy series completed, due for annual boosters",
                    "medical_conditions": "None known"
                },
                {
                    "pet_name": "Max",
                    "pet_species": "Cat",
                    "pet_breed": "Maine Coon",
                    "pet_gender": "Male",
                    "pet_age": "4 years",
                    "pet_weight": "18 lbs",
                    "pet_color": "Orange Tabby",
                    "spayed_neutered": "Yes",
                    "current_medications": "Joint supplements",
                    "allergies": "None known",
                    "vaccination_history": "Current on FVRCP and rabies",
                    "medical_conditions": "Mild arthritis in hind legs"
                },
                {
                    "pet_name": "Whiskers",
                    "pet_species": "Cat",
                    "pet_breed": "Domestic Shorthair",
                    "pet_gender": "Female",
                    "pet_age": "2 years",
                    "pet_weight": "10 lbs",
                    "pet_color": "Calico",
                    "spayed_neutered": "Yes",
                    "current_medications": "",
                    "allergies": "",
                    "vaccination_history": "Up to date",
                    "medical_conditions": ""
                }
            ],
            "previous_vet": "Aldie Veterinary Clinic",
            "previous_vet_phone": "(703) 555-0200",
            "last_visit_date": "2024-10-20",
            "how_heard_about_us": "Referral from friend",
            "preferred_appointment_type": "Afternoon appointments",
            "special_instructions": "Luna is very energetic. Max needs gentle handling due to arthritis. Whiskers is shy but friendly once comfortable."
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=multiple_pets_data)
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and 
                "registration_id" in data and 
                "successfully" in data["message"].lower()):
                multiple_pets_registration_id = data["registration_id"]
                results.log_success("Patient Registration (Multiple Pets - 3 pets)")
                return True
        results.log_failure("Patient Registration (Multiple Pets)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration (Multiple Pets)", str(e))
        return False

def test_patient_registration_maximum_pets():
    """Test POST /patient-registration with maximum pets (4 pets)"""
    try:
        max_pets_data = {
            "owner_first_name": "Michael",
            "owner_last_name": "Thompson",
            "address": "456 Oak Avenue",
            "city": "Ashburn",
            "state": "VA",
            "zip_code": "20147",
            "email": "michael.thompson@email.com",
            "phone": "(571) 555-0400",
            "pets": [
                {
                    "pet_name": "Buddy",
                    "pet_species": "Dog",
                    "pet_breed": "Labrador Retriever",
                    "pet_gender": "Male",
                    "pet_age": "5 years",
                    "pet_weight": "70 lbs",
                    "pet_color": "Yellow",
                    "spayed_neutered": "Yes"
                },
                {
                    "pet_name": "Mittens",
                    "pet_species": "Cat",
                    "pet_breed": "Persian",
                    "pet_gender": "Female",
                    "pet_age": "3 years",
                    "pet_weight": "12 lbs",
                    "pet_color": "White",
                    "spayed_neutered": "Yes"
                },
                {
                    "pet_name": "Rocky",
                    "pet_species": "Dog",
                    "pet_breed": "German Shepherd",
                    "pet_gender": "Male",
                    "pet_age": "2 years",
                    "pet_weight": "80 lbs",
                    "pet_color": "Black and Tan",
                    "spayed_neutered": "No"
                },
                {
                    "pet_name": "Shadow",
                    "pet_species": "Cat",
                    "pet_breed": "Siamese",
                    "pet_gender": "Male",
                    "pet_age": "1 year",
                    "pet_weight": "8 lbs",
                    "pet_color": "Seal Point",
                    "spayed_neutered": "Yes"
                }
            ],
            "previous_vet": "Ashburn Animal Hospital",
            "previous_vet_phone": "(703) 555-0300",
            "how_heard_about_us": "Veterinarian referral"
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=max_pets_data)
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and 
                "registration_id" in data and 
                "successfully" in data["message"].lower()):
                results.log_success("Patient Registration (Maximum Pets - 4 pets)")
                return True
        results.log_failure("Patient Registration (Maximum Pets)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration (Maximum Pets)", str(e))
        return False

def test_patient_registration_pets_validation_minimum():
    """Test POST /patient-registration with no pets (should fail - minimum 1 required)"""
    try:
        no_pets_data = {
            "owner_first_name": "Test",
            "owner_last_name": "NoPets",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "VA",
            "zip_code": "12345",
            "email": "test@nopets.com",
            "phone": "(555) 123-4567",
            "pets": []  # Empty pets array - should fail validation
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=no_pets_data)
        if response.status_code == 422:  # Validation error
            results.log_success("Patient Registration Pets Validation (Minimum 1 Pet Required)")
            return True
        results.log_failure("Patient Registration Pets Validation (Minimum)", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Pets Validation (Minimum)", str(e))
        return False

def test_patient_registration_pets_validation_maximum():
    """Test POST /patient-registration with too many pets (should fail - maximum 4 allowed)"""
    try:
        too_many_pets_data = {
            "owner_first_name": "Test",
            "owner_last_name": "TooManyPets",
            "address": "123 Test Street",
            "city": "Test City",
            "state": "VA",
            "zip_code": "12345",
            "email": "test@toomany.com",
            "phone": "(555) 123-4567",
            "pets": [
                {"pet_name": "Pet1", "pet_species": "Dog", "pet_gender": "Male", "pet_age": "1 year"},
                {"pet_name": "Pet2", "pet_species": "Cat", "pet_gender": "Female", "pet_age": "2 years"},
                {"pet_name": "Pet3", "pet_species": "Dog", "pet_gender": "Male", "pet_age": "3 years"},
                {"pet_name": "Pet4", "pet_species": "Cat", "pet_gender": "Female", "pet_age": "4 years"},
                {"pet_name": "Pet5", "pet_species": "Dog", "pet_gender": "Male", "pet_age": "5 years"}  # 5th pet - should fail
            ]
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=too_many_pets_data)
        if response.status_code == 422:  # Validation error
            results.log_success("Patient Registration Pets Validation (Maximum 4 Pets Allowed)")
            return True
        results.log_failure("Patient Registration Pets Validation (Maximum)", f"Expected 422, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Pets Validation (Maximum)", str(e))
        return False

def test_patient_registration_mixed_pet_data():
    """Test POST /patient-registration with pets having different amounts of medical information"""
    try:
        mixed_data_pets = {
            "owner_first_name": "Mixed",
            "owner_last_name": "DataTest",
            "address": "789 Mixed Street",
            "city": "Herndon",
            "state": "VA",
            "zip_code": "20170",
            "email": "mixed@datatest.com",
            "phone": "(571) 555-0500",
            "pets": [
                {
                    # Complete medical information
                    "pet_name": "CompleteInfo",
                    "pet_species": "Dog",
                    "pet_breed": "Beagle",
                    "pet_gender": "Female",
                    "pet_age": "6 years",
                    "pet_weight": "30 lbs",
                    "pet_color": "Tri-color",
                    "spayed_neutered": "Yes",
                    "current_medications": "Arthritis medication, heart medication",
                    "allergies": "Beef, environmental allergies",
                    "vaccination_history": "All vaccines current, last updated 2024-09-15",
                    "medical_conditions": "Arthritis, mild heart murmur"
                },
                {
                    # Minimal medical information
                    "pet_name": "MinimalInfo",
                    "pet_species": "Cat",
                    "pet_breed": "",
                    "pet_gender": "Male",
                    "pet_age": "1 year",
                    "pet_weight": "",
                    "pet_color": "",
                    "spayed_neutered": "",
                    "current_medications": "",
                    "allergies": "",
                    "vaccination_history": "",
                    "medical_conditions": ""
                }
            ],
            "how_heard_about_us": "Online search"
        }
        
        response = requests.post(f"{API_URL}/patient-registration", json=mixed_data_pets)
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and 
                "registration_id" in data and 
                "successfully" in data["message"].lower()):
                results.log_success("Patient Registration (Mixed Pet Data)")
                return True
        results.log_failure("Patient Registration (Mixed Pet Data)", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration (Mixed Pet Data)", str(e))
        return False

def test_patient_registration_pdf_generation_multiple_pets():
    """Test POST /patient-registration/pdf with multiple pets - Generate PDF and store data"""
    try:
        pdf_multiple_pets_data = {
            "owner_first_name": "PDF",
            "owner_last_name": "MultiPetTest",
            "address": "321 PDF Street",
            "city": "Centreville",
            "state": "VA",
            "zip_code": "20121",
            "email": "pdf@multipet.test",
            "phone": "(571) 555-0600",
            "pets": [
                {
                    "pet_name": "PDFDog",
                    "pet_species": "Dog",
                    "pet_breed": "Poodle",
                    "pet_gender": "Male",
                    "pet_age": "4 years",
                    "pet_weight": "50 lbs",
                    "pet_color": "Black",
                    "spayed_neutered": "Yes",
                    "current_medications": "Allergy medication",
                    "allergies": "Grass pollen",
                    "vaccination_history": "Current on all vaccines",
                    "medical_conditions": "Seasonal allergies"
                },
                {
                    "pet_name": "PDFCat",
                    "pet_species": "Cat",
                    "pet_breed": "Ragdoll",
                    "pet_gender": "Female",
                    "pet_age": "3 years",
                    "pet_weight": "14 lbs",
                    "pet_color": "Blue Point",
                    "spayed_neutered": "Yes",
                    "current_medications": "None",
                    "allergies": "None",
                    "vaccination_history": "Up to date",
                    "medical_conditions": "None"
                }
            ],
            "previous_vet": "PDF Veterinary Clinic",
            "previous_vet_phone": "(703) 555-0600",
            "last_visit_date": "2024-11-01",
            "how_heard_about_us": "Website",
            "preferred_appointment_type": "Morning",
            "special_instructions": "Both pets are well-behaved and friendly."
        }
        
        response = requests.post(f"{API_URL}/patient-registration/pdf", json=pdf_multiple_pets_data)
        if response.status_code == 200:
            # Check if response is PDF content
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            if ('application/pdf' in content_type and 
                'attachment' in content_disposition and 
                'patient_registration_MultiPetTest_' in content_disposition):
                results.log_success("Patient Registration PDF Generation (Multiple Pets)")
                return True
        results.log_failure("Patient Registration PDF Generation (Multiple Pets)", f"Status: {response.status_code}, Headers: {response.headers}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Generation (Multiple Pets)", str(e))
        return False

def test_patient_registration_pdf_retrieval_single_pet():
    """Test GET /patient-registration/{id}/pdf - Retrieve PDF for single pet registration"""
    if not patient_registration_id:
        results.log_failure("Patient Registration PDF Retrieval (Single Pet)", "No single pet registration ID available")
        return False
    
    try:
        response = requests.get(f"{API_URL}/patient-registration/{patient_registration_id}/pdf")
        if response.status_code == 200:
            # Check if response is PDF content
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            if ('application/pdf' in content_type and 
                'attachment' in content_disposition and 
                'patient_registration_Johnson_' in content_disposition):
                results.log_success("Patient Registration PDF Retrieval (Single Pet)")
                return True
        results.log_failure("Patient Registration PDF Retrieval (Single Pet)", f"Status: {response.status_code}, Headers: {response.headers}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Retrieval (Single Pet)", str(e))
        return False

def test_patient_registration_pdf_retrieval_multiple_pets():
    """Test GET /patient-registration/{id}/pdf - Retrieve PDF for multiple pets registration"""
    if not multiple_pets_registration_id:
        results.log_failure("Patient Registration PDF Retrieval (Multiple Pets)", "No multiple pets registration ID available")
        return False
    
    try:
        response = requests.get(f"{API_URL}/patient-registration/{multiple_pets_registration_id}/pdf")
        if response.status_code == 200:
            # Check if response is PDF content
            content_type = response.headers.get('content-type', '')
            content_disposition = response.headers.get('content-disposition', '')
            
            if ('application/pdf' in content_type and 
                'attachment' in content_disposition and 
                'patient_registration_Rodriguez_' in content_disposition):
                results.log_success("Patient Registration PDF Retrieval (Multiple Pets)")
                return True
        results.log_failure("Patient Registration PDF Retrieval (Multiple Pets)", f"Status: {response.status_code}, Headers: {response.headers}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Retrieval (Multiple Pets)", str(e))
        return False

def test_patient_registration_pdf_not_found():
    """Test GET /patient-registration/{id}/pdf with invalid registration ID"""
    try:
        fake_id = "non-existent-registration-id-12345"
        response = requests.get(f"{API_URL}/patient-registration/{fake_id}/pdf")
        if response.status_code == 404:
            results.log_success("Patient Registration PDF Not Found (404)")
            return True
        results.log_failure("Patient Registration PDF Not Found", f"Expected 404, got {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Not Found", str(e))
        return False

def test_patient_registration_database_storage_multiple_pets():
    """Test that multiple pets registration data is properly stored in MongoDB"""
    try:
        # This test verifies data persistence by creating a registration and then retrieving its PDF
        # If the PDF can be generated from stored data, it confirms database persistence
        
        db_test_data = {
            "owner_first_name": "Database",
            "owner_last_name": "StorageTest",
            "address": "999 Database Lane",
            "city": "Reston",
            "state": "VA",
            "zip_code": "20190",
            "email": "database@storage.test",
            "phone": "(571) 555-9999",
            "pets": [
                {
                    "pet_name": "DBPet1",
                    "pet_species": "Dog",
                    "pet_breed": "Husky",
                    "pet_gender": "Male",
                    "pet_age": "2 years",
                    "pet_weight": "60 lbs",
                    "pet_color": "Gray and White",
                    "spayed_neutered": "Yes",
                    "current_medications": "Flea prevention",
                    "allergies": "None",
                    "vaccination_history": "Current",
                    "medical_conditions": "None"
                },
                {
                    "pet_name": "DBPet2",
                    "pet_species": "Cat",
                    "pet_breed": "British Shorthair",
                    "pet_gender": "Female",
                    "pet_age": "5 years",
                    "pet_weight": "15 lbs",
                    "pet_color": "Blue",
                    "spayed_neutered": "Yes",
                    "current_medications": "Thyroid medication",
                    "allergies": "Fish",
                    "vaccination_history": "Up to date",
                    "medical_conditions": "Hyperthyroidism"
                }
            ],
            "previous_vet": "Database Animal Hospital",
            "previous_vet_phone": "(703) 555-9999",
            "last_visit_date": "2024-12-01",
            "how_heard_about_us": "Database testing",
            "preferred_appointment_type": "Any time",
            "special_instructions": "Database storage test with multiple pets"
        }
        
        # Create registration
        response = requests.post(f"{API_URL}/patient-registration", json=db_test_data)
        if response.status_code != 200:
            results.log_failure("Patient Registration Database Storage (Create)", f"Failed to create registration: {response.status_code}")
            return False
        
        registration_id = response.json().get("registration_id")
        if not registration_id:
            results.log_failure("Patient Registration Database Storage", "No registration ID returned")
            return False
        
        # Retrieve PDF to verify data was stored
        response = requests.get(f"{API_URL}/patient-registration/{registration_id}/pdf")
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type:
                results.log_success("Patient Registration Database Storage (Multiple Pets)")
                return True
        
        results.log_failure("Patient Registration Database Storage", f"PDF retrieval failed: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration Database Storage", str(e))
        return False

def test_patient_registration_pdf_filename_owner_lastname():
    """Test that PDF filename uses owner's last name (not pet name since multiple pets)"""
    try:
        filename_test_data = {
            "owner_first_name": "Filename",
            "owner_last_name": "OwnerTest",
            "address": "456 Filename Avenue",
            "city": "Ashburn",
            "state": "VA",
            "zip_code": "20147",
            "email": "filename@owner.test",
            "phone": "(571) 555-2222",
            "pets": [
                {
                    "pet_name": "FirstPet",
                    "pet_species": "Dog",
                    "pet_gender": "Male",
                    "pet_age": "3 years"
                },
                {
                    "pet_name": "SecondPet",
                    "pet_species": "Cat",
                    "pet_gender": "Female",
                    "pet_age": "2 years"
                }
            ]
        }
        
        response = requests.post(f"{API_URL}/patient-registration/pdf", json=filename_test_data)
        if response.status_code == 200:
            content_disposition = response.headers.get('content-disposition', '')
            
            # Check filename format: patient_registration_OwnerLastName_ID.pdf (not pet name)
            if ('attachment' in content_disposition and 
                'patient_registration_OwnerTest_' in content_disposition and 
                '.pdf' in content_disposition and
                'FirstPet' not in content_disposition and
                'SecondPet' not in content_disposition):
                results.log_success("Patient Registration PDF Filename (Owner Last Name)")
                return True
        
        results.log_failure("Patient Registration PDF Filename", f"Status: {response.status_code}, Disposition: {content_disposition}")
        return False
    except Exception as e:
        results.log_failure("Patient Registration PDF Filename", str(e))
        return False

def run_all_tests():
    """Run all enhanced patient registration PDF system tests"""
    print("Starting Enhanced Patient Registration PDF System Tests...")
    print(f"Backend URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print("="*50)
    
    # Test 1: Single Pet Registration (minimum required)
    test_patient_registration_single_pet()
    
    # Test 2: Multiple Pets Registration (2-4 pets)
    test_patient_registration_multiple_pets()
    
    # Test 3: Maximum Pets Registration (4 pets)
    test_patient_registration_maximum_pets()
    
    # Test 4: Pets Validation - Minimum (should fail with 0 pets)
    test_patient_registration_pets_validation_minimum()
    
    # Test 5: Pets Validation - Maximum (should fail with 5+ pets)
    test_patient_registration_pets_validation_maximum()
    
    # Test 6: Mixed Pet Data (different amounts of medical information)
    test_patient_registration_mixed_pet_data()
    
    # Test 7: PDF Generation with Multiple Pets
    test_patient_registration_pdf_generation_multiple_pets()
    
    # Test 8: PDF Retrieval for Single Pet Registration
    test_patient_registration_pdf_retrieval_single_pet()
    
    # Test 9: PDF Retrieval for Multiple Pets Registration
    test_patient_registration_pdf_retrieval_multiple_pets()
    
    # Test 10: PDF Not Found (404 handling)
    test_patient_registration_pdf_not_found()
    
    # Test 11: Database Storage Verification (Multiple Pets)
    test_patient_registration_database_storage_multiple_pets()
    
    # Test 12: PDF Filename Format (Owner Last Name, not pet names)
    test_patient_registration_pdf_filename_owner_lastname()
    
    # Print final summary
    success = results.summary()
    
    if success:
        print(f"\n🎉 ALL TESTS PASSED! Enhanced Patient Registration PDF System with Multiple Pets is working correctly.")
    else:
        print(f"\n⚠️  Some tests failed. Please review the errors above.")
    
    return success

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)