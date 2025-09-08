#!/usr/bin/env python3
"""
Urgent Care Blocked Slots Visibility Testing - Critical Bug Investigation
Tests the specific issue where blocked slots disappear from manager's view
"""

import requests
import json
import os
from datetime import datetime
import sys

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

print(f"🔍 TESTING BLOCKED SLOTS VISIBILITY BUG")
print(f"Backend API: {API_URL}")
print("="*60)

# Test credentials
manager_credentials = {
    "email": "manager@veterinary.com",
    "password": "manager123"
}

# Global variables
manager_token = None
created_blocked_slot_id = None

def login_manager():
    """Login as manager and get token"""
    global manager_token
    try:
        response = requests.post(f"{API_URL}/login", json=manager_credentials)
        if response.status_code == 200:
            data = response.json()
            manager_token = data["access_token"]
            print("✅ Manager login successful")
            return True
        else:
            print(f"❌ Manager login failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Manager login error: {e}")
        return False

def test_create_blocked_slot():
    """Test creating a blocked slot"""
    global created_blocked_slot_id
    if not manager_token:
        print("❌ No manager token available")
        return False
    
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        blocked_slot_data = {
            "date": today,
            "time": "16:30",
            "reason": "Staff meeting - testing blocked slots visibility"
        }
        
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.post(f"{API_URL}/blocked-slots", json=blocked_slot_data, headers=headers)
        
        print(f"📝 Creating blocked slot for {today} at 16:30...")
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            created_blocked_slot_id = data["id"]
            print(f"✅ Blocked slot created successfully: {created_blocked_slot_id}")
            print(f"   Date: {data.get('date')}")
            print(f"   Time: {data.get('time')}")
            print(f"   Reason: {data.get('reason')}")
            print(f"   Blocked by: {data.get('blocked_by_name')}")
            return True
        elif response.status_code == 400 and "already blocked" in response.json().get("detail", ""):
            print("✅ Slot already blocked (expected)")
            # Try to get existing blocked slots
            get_response = requests.get(f"{API_URL}/blocked-slots/{today}", headers=headers)
            if get_response.status_code == 200:
                blocked_slots = get_response.json()
                for slot in blocked_slots:
                    if slot.get("time") == "16:30":
                        created_blocked_slot_id = slot["id"]
                        print(f"✅ Found existing blocked slot: {created_blocked_slot_id}")
                        break
            return True
        else:
            print(f"❌ Failed to create blocked slot: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating blocked slot: {e}")
        return False

def test_get_time_slots_with_manager_auth():
    """Test getting time slots WITH manager authentication - should show blocked slots"""
    if not manager_token:
        print("❌ No manager token available")
        return False
    
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{today}", headers=headers)
        
        print(f"\n🔍 TESTING TIME SLOTS WITH MANAGER AUTHENTICATION")
        print(f"Date: {today}")
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Available: {data.get('available')}")
            
            if data.get("available") and "slots" in data:
                slots = data["slots"]
                print(f"Total slots returned: {len(slots)}")
                
                # Look for blocked slots
                blocked_slots = [slot for slot in slots if slot.get("is_blocked") == True]
                print(f"Blocked slots found: {len(blocked_slots)}")
                
                if blocked_slots:
                    print("✅ BLOCKED SLOTS ARE VISIBLE TO MANAGER!")
                    for i, slot in enumerate(blocked_slots):
                        print(f"   Blocked Slot {i+1}:")
                        print(f"     Time: {slot.get('time')}")
                        print(f"     Is Blocked: {slot.get('is_blocked')}")
                        if "blocked_info" in slot:
                            blocked_info = slot["blocked_info"]
                            print(f"     Blocked Info:")
                            print(f"       ID: {blocked_info.get('id')}")
                            print(f"       Reason: {blocked_info.get('reason')}")
                            print(f"       Blocked By: {blocked_info.get('blocked_by')}")
                            print(f"       Blocked At: {blocked_info.get('blocked_at')}")
                        else:
                            print(f"     ❌ Missing blocked_info!")
                    return True
                else:
                    print("❌ CRITICAL BUG CONFIRMED: NO BLOCKED SLOTS VISIBLE TO MANAGER!")
                    print("   This is the reported issue - blocked slots disappearing from manager view")
                    
                    # Show some sample slots for debugging
                    print(f"\n   Sample slots returned:")
                    for i, slot in enumerate(slots[:5]):
                        print(f"     Slot {i+1}: {slot.get('time')} - is_blocked: {slot.get('is_blocked', 'not set')}")
                    
                    return False
            else:
                print(f"Day not available or no slots: {data.get('message', 'No message')}")
                return True
        else:
            print(f"❌ Failed to get time slots: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting time slots: {e}")
        return False

def test_get_time_slots_without_auth():
    """Test getting time slots WITHOUT authentication - should NOT show blocked slots"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        # No authentication headers
        response = requests.get(f"{API_URL}/urgent-care-time-slots/{today}")
        
        print(f"\n🔍 TESTING TIME SLOTS WITHOUT AUTHENTICATION")
        print(f"Date: {today}")
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Available: {data.get('available')}")
            
            if data.get("available") and "slots" in data:
                slots = data["slots"]
                print(f"Total slots returned: {len(slots)}")
                
                # Look for blocked slots - should NOT find any
                blocked_slots = [slot for slot in slots if slot.get("is_blocked") == True]
                print(f"Blocked slots found: {len(blocked_slots)}")
                
                if not blocked_slots:
                    print("✅ CORRECT: No blocked slots visible to public users")
                    return True
                else:
                    print(f"❌ BUG: Blocked slots visible to public! Found {len(blocked_slots)} blocked slots")
                    return False
            else:
                print(f"Day not available or no slots: {data.get('message', 'No message')}")
                return True
        else:
            print(f"❌ Failed to get time slots: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error getting time slots: {e}")
        return False

def test_staff_detection():
    """Test that staff detection is working properly"""
    if not manager_token:
        print("❌ No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.get(f"{API_URL}/me", headers=headers)
        
        print(f"\n🔍 TESTING STAFF DETECTION LOGIC")
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            user_role = user_data.get("role")
            user_email = user_data.get("email")
            
            print(f"User email: {user_email}")
            print(f"User role: {user_role}")
            
            if user_role in ['manager', 'technician', 'admin']:
                print(f"✅ User correctly identified as staff (role: {user_role})")
                return True
            else:
                print(f"❌ User role '{user_role}' not recognized as staff")
                return False
        else:
            print(f"❌ Failed to get user info: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing staff detection: {e}")
        return False

def cleanup_blocked_slot():
    """Clean up the test blocked slot"""
    if not manager_token or not created_blocked_slot_id:
        return
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.delete(f"{API_URL}/blocked-slots/{created_blocked_slot_id}", headers=headers)
        if response.status_code == 200:
            print(f"✅ Cleaned up test blocked slot: {created_blocked_slot_id}")
        else:
            print(f"⚠️  Could not clean up blocked slot: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Error cleaning up: {e}")

def main():
    """Run all blocked slots visibility tests"""
    print("Starting blocked slots visibility investigation...")
    
    # Step 1: Login as manager
    if not login_manager():
        return False
    
    # Step 2: Create a blocked slot
    if not test_create_blocked_slot():
        return False
    
    # Step 3: Test staff detection
    if not test_staff_detection():
        return False
    
    # Step 4: Test time slots WITH manager auth (should show blocked slots)
    manager_auth_result = test_get_time_slots_with_manager_auth()
    
    # Step 5: Test time slots WITHOUT auth (should NOT show blocked slots)
    no_auth_result = test_get_time_slots_without_auth()
    
    # Step 6: Cleanup
    cleanup_blocked_slot()
    
    # Summary
    print("\n" + "="*60)
    print("🔍 BLOCKED SLOTS VISIBILITY TEST SUMMARY")
    print("="*60)
    
    if manager_auth_result and no_auth_result:
        print("✅ ALL TESTS PASSED - Blocked slots visibility working correctly")
        print("   - Blocked slots visible to authenticated staff ✅")
        print("   - Blocked slots hidden from public users ✅")
        return True
    else:
        print("❌ CRITICAL BUG CONFIRMED!")
        if not manager_auth_result:
            print("   - Blocked slots NOT visible to authenticated staff ❌")
            print("   - This matches the reported issue!")
        if not no_auth_result:
            print("   - Blocked slots incorrectly visible to public ❌")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)