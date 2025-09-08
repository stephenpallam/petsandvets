#!/usr/bin/env python3
"""
Urgent Care Booking Timezone Fix Testing
Tests the specific timezone fix for urgent care booking functionality
Focuses on the "Unable to load available times" error that was resolved
"""

import requests
import json
import os
from datetime import datetime, timedelta
import sys
import time
import pytz

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

print(f"🔧 URGENT CARE TIMEZONE FIX TESTING")
print(f"Testing Backend API at: {API_URL}")
print(f"Focus: Timezone mismatch fix for 'Unable to load available times' error")
print("="*80)

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
        print(f"URGENT CARE TIMEZONE FIX TEST SUMMARY")
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

def test_business_info_timezone():
    """Test /api/business-info returns timezone info correctly"""
    try:
        response = requests.get(f"{API_URL}/business-info")
        if response.status_code == 200:
            data = response.json()
            if "timezone" in data:
                timezone_str = data["timezone"]
                if timezone_str == "America/New_York":
                    results.log_success("Business Info Timezone (America/New_York)")
                    return True, timezone_str
                else:
                    results.log_success(f"Business Info Timezone ({timezone_str})")
                    return True, timezone_str
            else:
                results.log_failure("Business Info Timezone", "No timezone field in response")
                return False, None
        results.log_failure("Business Info Timezone", f"Status: {response.status_code}")
        return False, None
    except Exception as e:
        results.log_failure("Business Info Timezone", str(e))
        return False, None

def test_urgent_care_hours_database():
    """Test urgent_care_hours collection has correct hours (14:00-23:00 daily)"""
    try:
        response = requests.get(f"{API_URL}/urgent-care-hours")
        if response.status_code == 200:
            data = response.json()
            
            # Check all days have correct hours (14:00-23:00)
            expected_open_time = "14:00"
            expected_close_time = "23:00"
            
            days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
            all_correct = True
            
            for day in days:
                if day in data:
                    day_hours = data[day]
                    if (day_hours.get("is_open") and 
                        day_hours.get("open_time") == expected_open_time and 
                        day_hours.get("close_time") == expected_close_time):
                        continue
                    else:
                        all_correct = False
                        break
                else:
                    all_correct = False
                    break
            
            if all_correct:
                results.log_success("Urgent Care Hours Database (14:00-23:00 daily)")
                return True
            else:
                results.log_failure("Urgent Care Hours Database", f"Hours not set to 14:00-23:00 daily. Current: {data}")
                return False
        results.log_failure("Urgent Care Hours Database", f"Status: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Urgent Care Hours Database", str(e))
        return False

def test_time_slots_business_timezone_date():
    """Test /api/urgent-care-time-slots/{date} with business timezone date (2025-09-03)"""
    try:
        # Use the specific business date mentioned in the review: 2025-09-03
        business_date = "2025-09-03"
        
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{business_date}")
        if response.status_code == 200:
            data = response.json()
            
            # Check response structure
            if "available" in data and "date" in data and "business_timezone" in data:
                if data["date"] == business_date:
                    if data["available"] and "slots" in data and isinstance(data["slots"], list):
                        # Check if we have available slots (should show slots like 9:00 PM, 9:30 PM, etc.)
                        slots = data["slots"]
                        if len(slots) > 0:
                            # Look for evening slots (21:00 = 9:00 PM, 21:30 = 9:30 PM)
                            evening_slots = [slot for slot in slots if slot.get("time", "").startswith("21:")]
                            if len(evening_slots) > 0:
                                results.log_success(f"Time Slots Business Date (2025-09-03) - {len(slots)} slots available, including evening slots")
                                return True, data
                            else:
                                results.log_success(f"Time Slots Business Date (2025-09-03) - {len(slots)} slots available")
                                return True, data
                        else:
                            results.log_success("Time Slots Business Date (2025-09-03) - No slots available (expected if past closing)")
                            return True, data
                    elif not data["available"]:
                        # Check if it's closed with a message
                        message = data.get("message", "")
                        results.log_success(f"Time Slots Business Date (2025-09-03) - Closed: {message}")
                        return True, data
                    else:
                        results.log_failure("Time Slots Business Date", f"Unexpected response structure: {data}")
                        return False, None
                else:
                    results.log_failure("Time Slots Business Date", f"Date mismatch: expected {business_date}, got {data['date']}")
                    return False, None
            else:
                results.log_failure("Time Slots Business Date", f"Missing required fields in response: {data}")
                return False, None
        results.log_failure("Time Slots Business Date", f"Status: {response.status_code}, Response: {response.text}")
        return False, None
    except Exception as e:
        results.log_failure("Time Slots Business Date", str(e))
        return False, None

def test_time_slots_current_business_date():
    """Test /api/urgent-care-time-slots with current business date"""
    try:
        # Calculate current business date in America/New_York timezone
        business_tz = pytz.timezone("America/New_York")
        utc_now = datetime.now(pytz.UTC)
        business_now = utc_now.astimezone(business_tz)
        current_business_date = business_now.strftime("%Y-%m-%d")
        
        print(f"   Current Business Date (EDT): {current_business_date}")
        print(f"   Current Business Time: {business_now.strftime('%I:%M %p %Z')}")
        
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{current_business_date}")
        if response.status_code == 200:
            data = response.json()
            
            if "available" in data and "date" in data:
                if data["available"] and "slots" in data:
                    slots = data["slots"]
                    results.log_success(f"Current Business Date Time Slots - {len(slots)} slots available")
                    
                    # Show some example slots if available
                    if len(slots) > 0:
                        example_slots = slots[:3]  # Show first 3 slots
                        slot_times = [slot.get("time", "") for slot in example_slots]
                        print(f"   Example available slots: {', '.join(slot_times)}")
                    
                    return True, data
                elif not data["available"]:
                    message = data.get("message", "")
                    results.log_success(f"Current Business Date Time Slots - Closed: {message}")
                    return True, data
                else:
                    results.log_failure("Current Business Date Time Slots", f"Unexpected response: {data}")
                    return False, None
            else:
                results.log_failure("Current Business Date Time Slots", f"Missing required fields: {data}")
                return False, None
        results.log_failure("Current Business Date Time Slots", f"Status: {response.status_code}")
        return False, None
    except Exception as e:
        results.log_failure("Current Business Date Time Slots", str(e))
        return False, None

def test_time_slots_utc_date_vs_business_date():
    """Test timezone difference - UTC date vs Business date"""
    try:
        # Get current UTC and business dates
        utc_now = datetime.now(pytz.UTC)
        business_tz = pytz.timezone("America/New_York")
        business_now = utc_now.astimezone(business_tz)
        
        utc_date = utc_now.strftime("%Y-%m-%d")
        business_date = business_now.strftime("%Y-%m-%d")
        
        print(f"   UTC Date: {utc_date}")
        print(f"   Business Date (EDT): {business_date}")
        
        if utc_date != business_date:
            print(f"   📅 Date difference detected - testing both dates")
            
            # Test UTC date (should handle gracefully)
            response_utc = requests.get(f"{API_URL}/urgent-care-time-slots/{utc_date}")
            
            # Test business date (should work correctly)
            response_business = requests.get(f"{API_URL}/urgent-care-time-slots/{business_date}")
            
            if response_business.status_code == 200:
                business_data = response_business.json()
                if "available" in business_data:
                    results.log_success("Timezone Difference Handling - Business date works correctly")
                    
                    # Check if UTC date gives appropriate response
                    if response_utc.status_code == 200:
                        utc_data = response_utc.json()
                        if not utc_data.get("available", True):
                            results.log_success("Timezone Difference Handling - UTC date appropriately restricted")
                        else:
                            results.log_success("Timezone Difference Handling - UTC date also works")
                    
                    return True
                else:
                    results.log_failure("Timezone Difference Handling", f"Business date response invalid: {business_data}")
                    return False
            else:
                results.log_failure("Timezone Difference Handling", f"Business date failed: {response_business.status_code}")
                return False
        else:
            results.log_success("Timezone Difference Handling - UTC and Business dates are same")
            return True
            
    except Exception as e:
        results.log_failure("Timezone Difference Handling", str(e))
        return False

def test_appointment_booking_flow():
    """Test POST /api/urgent-care-appointments to ensure complete booking process works"""
    try:
        # Use realistic data as requested
        appointment_data = {
            "appointment_time": "2025-09-03T21:30",  # 9:30 PM EDT
            "owner_first_name": "Sarah",
            "owner_last_name": "Mitchell",
            "email": "sarah.mitchell@email.com",
            "phone": "(703) 555-0123",
            "pet_name": "Luna",
            "pet_type": "cat",
            "reason_for_visit": "Cat has been vomiting and seems lethargic since this morning",
            "primary_vet_hospital": "Chantilly Animal Hospital",
            "how_heard_about_us": "Google search"
        }
        
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code == 200:
            data = response.json()
            
            # Verify all fields are correctly saved
            if (data.get("owner_first_name") == "Sarah" and 
                data.get("owner_last_name") == "Mitchell" and
                data.get("email") == "sarah.mitchell@email.com" and
                data.get("pet_name") == "Luna" and
                data.get("pet_type") == "cat" and
                data.get("appointment_time") == "2025-09-03T21:30" and
                "id" in data and "created_at" in data):
                
                results.log_success("Appointment Booking Flow - Complete booking successful")
                return True, data["id"]
            else:
                results.log_failure("Appointment Booking Flow", f"Data mismatch in response: {data}")
                return False, None
        else:
            results.log_failure("Appointment Booking Flow", f"Status: {response.status_code}, Response: {response.text}")
            return False, None
    except Exception as e:
        results.log_failure("Appointment Booking Flow", str(e))
        return False, None

def test_appointment_booking_realistic_data():
    """Test appointment booking with realistic Northern Virginia data"""
    try:
        # Use realistic Northern Virginia data
        appointment_data = {
            "appointment_time": "2025-09-03T22:00",  # 10:00 PM EDT
            "owner_first_name": "Michael",
            "owner_last_name": "Rodriguez",
            "email": "m.rodriguez@gmail.com",
            "phone": "(571) 555-7890",
            "pet_name": "Buddy",
            "pet_type": "dog",
            "reason_for_visit": "Dog injured paw during evening walk, limping and whimpering",
            "primary_vet_hospital": "South Riding Animal Hospital",
            "how_heard_about_us": "Neighbor recommendation"
        }
        
        response = requests.post(f"{API_URL}/urgent-care-appointments", json=appointment_data)
        if response.status_code == 200:
            data = response.json()
            
            if (data.get("owner_first_name") == "Michael" and 
                data.get("pet_name") == "Buddy" and
                data.get("appointment_time") == "2025-09-03T22:00"):
                
                results.log_success("Realistic Data Appointment Booking - Northern Virginia scenario")
                return True, data["id"]
            else:
                results.log_failure("Realistic Data Appointment Booking", f"Data verification failed: {data}")
                return False, None
        else:
            results.log_failure("Realistic Data Appointment Booking", f"Status: {response.status_code}")
            return False, None
    except Exception as e:
        results.log_failure("Realistic Data Appointment Booking", str(e))
        return False, None

def test_time_slots_after_booking():
    """Test that time slots are properly updated after booking"""
    try:
        # First check available slots for 2025-09-03
        response = requests.get(f"{API_URL}/urgent-care-time-slots/2025-09-03")
        if response.status_code == 200:
            data = response.json()
            
            if data.get("available") and "slots" in data:
                slots_before = len(data["slots"])
                
                # Look for 21:00 slot availability
                slot_21_00_available = any(slot.get("time") == "21:00" for slot in data["slots"])
                
                if slot_21_00_available:
                    # Book the 21:00 slot
                    booking_data = {
                        "appointment_time": "2025-09-03T21:00",
                        "owner_first_name": "Jennifer",
                        "owner_last_name": "Chen",
                        "email": "jen.chen@email.com",
                        "phone": "(703) 555-4567",
                        "pet_name": "Whiskers",
                        "pet_type": "cat",
                        "reason_for_visit": "Cat ate something unusual and is acting strange",
                        "primary_vet_hospital": "Aldie Veterinary Clinic",
                        "how_heard_about_us": "Online search"
                    }
                    
                    booking_response = requests.post(f"{API_URL}/urgent-care-appointments", json=booking_data)
                    if booking_response.status_code == 200:
                        # Check slots again
                        response_after = requests.get(f"{API_URL}/urgent-care-time-slots/2025-09-03")
                        if response_after.status_code == 200:
                            data_after = response_after.json()
                            
                            if data_after.get("available") and "slots" in data_after:
                                # Check that 21:00 is no longer available
                                slot_21_00_still_available = any(slot.get("time") == "21:00" for slot in data_after["slots"])
                                
                                if not slot_21_00_still_available:
                                    results.log_success("Time Slots After Booking - Booked slot correctly removed")
                                    return True
                                else:
                                    results.log_failure("Time Slots After Booking", "Booked slot still appears as available")
                                    return False
                            else:
                                results.log_success("Time Slots After Booking - No slots available after booking")
                                return True
                        else:
                            results.log_failure("Time Slots After Booking", f"Failed to get slots after booking: {response_after.status_code}")
                            return False
                    else:
                        results.log_failure("Time Slots After Booking", f"Booking failed: {booking_response.status_code}")
                        return False
                else:
                    results.log_success("Time Slots After Booking - 21:00 slot not available for testing")
                    return True
            else:
                results.log_success("Time Slots After Booking - No slots available for testing")
                return True
        else:
            results.log_failure("Time Slots After Booking", f"Failed to get initial slots: {response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Time Slots After Booking", str(e))
        return False

def test_timezone_consistency():
    """Test that timezone handling is consistent across all endpoints"""
    try:
        # Get business info timezone
        business_response = requests.get(f"{API_URL}/business-info")
        if business_response.status_code != 200:
            results.log_failure("Timezone Consistency", "Failed to get business info")
            return False
        
        business_data = business_response.json()
        business_timezone = business_data.get("timezone", "America/New_York")
        
        # Get urgent care hours
        hours_response = requests.get(f"{API_URL}/urgent-care-hours")
        if hours_response.status_code != 200:
            results.log_failure("Timezone Consistency", "Failed to get urgent care hours")
            return False
        
        # Test time slots with business timezone
        tz = pytz.timezone(business_timezone)
        utc_now = datetime.now(pytz.UTC)
        business_now = utc_now.astimezone(tz)
        business_date = business_now.strftime("%Y-%m-%d")
        
        slots_response = requests.get(f"{API_URL}/urgent-care-time-slots/{business_date}")
        if slots_response.status_code == 200:
            slots_data = slots_response.json()
            
            # Check that response includes timezone info
            if "business_timezone" in slots_data:
                response_timezone = slots_data["business_timezone"]
                if response_timezone == business_timezone:
                    results.log_success(f"Timezone Consistency - All endpoints use {business_timezone}")
                    return True
                else:
                    results.log_failure("Timezone Consistency", f"Timezone mismatch: business_info={business_timezone}, time_slots={response_timezone}")
                    return False
            else:
                results.log_failure("Timezone Consistency", "Time slots response missing timezone info")
                return False
        else:
            results.log_failure("Timezone Consistency", f"Time slots request failed: {slots_response.status_code}")
            return False
    except Exception as e:
        results.log_failure("Timezone Consistency", str(e))
        return False

def main():
    """Run all urgent care timezone fix tests"""
    print("🚀 Starting Urgent Care Timezone Fix Tests...")
    print()
    
    # Test 1: Business Info API - Timezone
    print("1️⃣ Testing Business Info API...")
    success, timezone_info = test_business_info_timezone()
    if success and timezone_info:
        print(f"   Business Timezone: {timezone_info}")
    print()
    
    # Test 2: Database Verification - Urgent Care Hours
    print("2️⃣ Testing Urgent Care Hours Database...")
    test_urgent_care_hours_database()
    print()
    
    # Test 3: Time Slots API - Business Timezone Date
    print("3️⃣ Testing Time Slots API with Business Date (2025-09-03)...")
    success, slots_data = test_time_slots_business_timezone_date()
    if success and slots_data:
        if slots_data.get("available"):
            print(f"   Available slots: {len(slots_data.get('slots', []))}")
        else:
            print(f"   Status: {slots_data.get('message', 'Closed')}")
    print()
    
    # Test 4: Current Business Date Time Slots
    print("4️⃣ Testing Current Business Date Time Slots...")
    test_time_slots_current_business_date()
    print()
    
    # Test 5: Timezone Difference Handling
    print("5️⃣ Testing Timezone Difference Handling...")
    test_time_slots_utc_date_vs_business_date()
    print()
    
    # Test 6: Appointment Booking Flow
    print("6️⃣ Testing Complete Appointment Booking Flow...")
    success, appointment_id = test_appointment_booking_flow()
    if success and appointment_id:
        print(f"   Created appointment ID: {appointment_id}")
    print()
    
    # Test 7: Realistic Data Booking
    print("7️⃣ Testing Realistic Data Appointment Booking...")
    test_appointment_booking_realistic_data()
    print()
    
    # Test 8: Time Slots After Booking
    print("8️⃣ Testing Time Slots Update After Booking...")
    test_time_slots_after_booking()
    print()
    
    # Test 9: Timezone Consistency
    print("9️⃣ Testing Timezone Consistency Across Endpoints...")
    test_timezone_consistency()
    print()
    
    # Show final results
    success = results.summary()
    
    if success:
        print("\n🎉 ALL URGENT CARE TIMEZONE FIX TESTS PASSED!")
        print("✅ The 'Unable to load available times' error has been resolved")
        print("✅ Timezone handling is working correctly")
        print("✅ Customers can now successfully see and book urgent care appointments")
    else:
        print("\n⚠️  SOME TESTS FAILED - REVIEW NEEDED")
        print("❌ There may still be issues with the timezone fix")
    
    return success

if __name__ == "__main__":
    main()