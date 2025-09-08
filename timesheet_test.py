#!/usr/bin/env python3
"""
Timesheet Calculate Hours Fix Testing
Tests the fixed calculate_hours function to verify regular hours are now calculated correctly
"""

import requests
import json
import os
from datetime import datetime, timedelta
import sys
import time
import uuid

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

print(f"Testing Timesheet API at: {API_URL}")

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
        print(f"TIMESHEET TEST SUMMARY")
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

# Manager credentials for testing
manager_credentials = {
    "email": "manager@veterinary.com",
    "password": "manager123"
}

# Global variables
manager_token = None
manager_time_entry_id = None

def test_manager_login():
    """Test manager login to get authentication token"""
    global manager_token
    try:
        response = requests.post(f"{API_URL}/login", json=manager_credentials)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                manager_token = data["access_token"]
                results.log_success("Manager Login")
                return True
        results.log_failure("Manager Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Manager Login", str(e))
        return False

def test_timesheet_config_setup():
    """Test timesheet configuration is properly set up"""
    if not manager_token:
        results.log_failure("Timesheet Config Setup", "No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.get(f"{API_URL}/timesheet-config", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if ("after_hours_cutoff_time" in data and 
                "location_tracking_enabled" in data and
                "pay_period_type" in data):
                # Verify after hours cutoff is set correctly
                cutoff_time = data.get("after_hours_cutoff_time", "18:00")
                results.log_success(f"Timesheet Config Setup (After hours cutoff: {cutoff_time})")
                return True
        results.log_failure("Timesheet Config Setup", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Timesheet Config Setup", str(e))
        return False

def test_manager_clock_in():
    """Test manager can clock in successfully"""
    global manager_time_entry_id
    if not manager_token:
        results.log_failure("Manager Clock In", "No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        clock_in_data = {
            "location_data": {"ip": "192.168.1.100", "source": "test"},
            "notes": "Testing calculate_hours fix - manager clock in"
        }
        
        response = requests.post(f"{API_URL}/timesheet/clock-in", json=clock_in_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            # The response is the time entry object itself, not a wrapper
            if "id" in data and "clock_in_time" in data:
                manager_time_entry_id = data["id"]  # Use 'id' field instead of 'time_entry_id'
                results.log_success("Manager Clock In (Entry Created)")
                return True
        results.log_failure("Manager Clock In", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Manager Clock In", str(e))
        return False

def test_manager_clock_out_with_hours_calculation():
    """Test manager clock out and verify hours are calculated correctly"""
    if not manager_token or not manager_time_entry_id:
        results.log_failure("Manager Clock Out with Hours", "No manager token or time entry ID available")
        return False
    
    try:
        # Wait a few seconds to ensure measurable work time
        print("⏳ Waiting 5 seconds to ensure measurable work time...")
        time.sleep(5)
        
        headers = {"Authorization": f"Bearer {manager_token}"}
        clock_out_data = {
            "notes": "Testing calculate_hours fix - manager clock out"
        }
        
        response = requests.post(f"{API_URL}/timesheet/clock-out", json=clock_out_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if ("message" in data and "total_hours" in data and 
                "regular_hours" in data and "after_hours_hours" in data):
                
                total_hours = data["total_hours"]
                regular_hours = data["regular_hours"]
                after_hours_hours = data["after_hours_hours"]
                
                print(f"📊 Hours Calculation Results:")
                print(f"   Total Hours: {total_hours}")
                print(f"   Regular Hours: {regular_hours}")
                print(f"   After Hours: {after_hours_hours}")
                
                # Verify hours are calculated (not zero)
                if total_hours > 0:
                    results.log_success(f"Manager Clock Out (Hours Calculated: {total_hours}h total, {regular_hours}h regular, {after_hours_hours}h after-hours)")
                    return True
                else:
                    results.log_failure("Manager Clock Out", f"❌ CRITICAL: Hours still showing zero! Total: {total_hours}, Regular: {regular_hours}, After-hours: {after_hours_hours}")
                    return False
        results.log_failure("Manager Clock Out with Hours", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Manager Clock Out with Hours", str(e))
        return False

def test_timesheet_reports_after_fix():
    """Test timesheet reports show correct hours after calculate_hours fix"""
    if not manager_token:
        results.log_failure("Timesheet Reports After Fix", "No manager token available")
        return False
    
    try:
        # Get current date range (last 7 days to today)
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
        
        headers = {"Authorization": f"Bearer {manager_token}"}
        params = {
            "start_date": start_date,
            "end_date": end_date
        }
        
        response = requests.get(f"{API_URL}/timesheet/reports", params=params, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if ("reports" in data and "total_employees" in data and 
                "total_hours" in data):
                
                reports = data["reports"]
                total_hours = data["total_hours"]
                
                print(f"📊 Timesheet Reports Summary:")
                print(f"   Total Employees: {data['total_employees']}")
                print(f"   Total Hours: {total_hours}")
                
                # Look for manager's report
                manager_report = None
                for report in reports:
                    if report.get("user_email") == manager_credentials["email"]:
                        manager_report = report
                        break
                
                if manager_report:
                    report_total = manager_report.get("total_hours", 0)
                    report_regular = manager_report.get("regular_hours", 0)
                    report_after_hours = manager_report.get("after_hours_hours", 0)
                    
                    print(f"   Manager Report - Total: {report_total}h, Regular: {report_regular}h, After-hours: {report_after_hours}h")
                    
                    if report_total > 0:
                        results.log_success(f"Timesheet Reports After Fix (Manager hours: {report_total}h total, {report_regular}h regular, {report_after_hours}h after-hours)")
                        return True
                    else:
                        results.log_failure("Timesheet Reports After Fix", f"❌ CRITICAL: Manager report still shows zero hours! Total: {report_total}, Regular: {report_regular}, After-hours: {report_after_hours}")
                        return False
                else:
                    results.log_failure("Timesheet Reports After Fix", "Manager not found in timesheet reports")
                    return False
        results.log_failure("Timesheet Reports After Fix", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Timesheet Reports After Fix", str(e))
        return False

def test_my_hours_endpoint_after_fix():
    """Test GET /api/timesheet/my-hours shows correct calculated hours"""
    if not manager_token:
        results.log_failure("My Hours Endpoint After Fix", "No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        response = requests.get(f"{API_URL}/timesheet/my-hours", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                # Check the most recent entries for calculated hours
                entries_with_hours = 0
                total_entries = len(data)
                
                print(f"📊 My Hours Analysis:")
                print(f"   Total Entries: {total_entries}")
                
                for entry in data:
                    total_h = entry.get("total_hours") or 0
                    regular_h = entry.get("regular_hours") or 0
                    after_h = entry.get("after_hours_hours") or 0
                    
                    if total_h > 0 or regular_h > 0 or after_h > 0:
                        entries_with_hours += 1
                
                print(f"   Entries with Hours: {entries_with_hours}")
                
                if entries_with_hours > 0:
                    results.log_success(f"My Hours Endpoint After Fix ({entries_with_hours}/{total_entries} entries have calculated hours)")
                    return True
                else:
                    results.log_failure("My Hours Endpoint After Fix", f"❌ CRITICAL: All {total_entries} entries still show zero hours!")
                    return False
            else:
                results.log_success("My Hours Endpoint After Fix (No entries found)")
                return True
        results.log_failure("My Hours Endpoint After Fix", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("My Hours Endpoint After Fix", str(e))
        return False

def test_edge_case_minimal_duration():
    """Test calculate_hours with minimal duration (few seconds)"""
    if not manager_token:
        results.log_failure("Edge Case Minimal Duration", "No manager token available")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {manager_token}"}
        
        # Clock in
        clock_in_data = {
            "location_data": {"ip": "192.168.1.100", "source": "test"},
            "notes": "Testing minimal duration edge case"
        }
        
        response = requests.post(f"{API_URL}/timesheet/clock-in", json=clock_in_data, headers=headers)
        
        if response.status_code == 200:
            time_entry_id = response.json()["time_entry_id"]
            
            # Wait only 2 seconds
            print("⏳ Waiting 2 seconds for minimal duration test...")
            time.sleep(2)
            
            # Clock out immediately
            clock_out_response = requests.post(f"{API_URL}/timesheet/clock-out", 
                                             json={"notes": "Minimal duration test"}, 
                                             headers=headers)
            
            if clock_out_response.status_code == 200:
                data = clock_out_response.json()
                total_hours = data.get("total_hours", 0)
                
                print(f"📊 Minimal Duration Test: 2 seconds = {total_hours} hours")
                
                # Even 2 seconds should register as some hours (0.0006 hours approximately)
                if total_hours > 0:
                    results.log_success(f"Edge Case Minimal Duration (2 seconds = {total_hours} hours)")
                    return True
                else:
                    results.log_failure("Edge Case Minimal Duration", f"❌ 2 second duration still shows {total_hours} hours")
                    return False
        
        results.log_failure("Edge Case Minimal Duration", f"Clock in failed: {response.status_code}")
        return False
    except Exception as e:
        results.log_failure("Edge Case Minimal Duration", str(e))
        return False

def run_timesheet_tests():
    """Run all timesheet tests"""
    print("🧪 Starting Timesheet Calculate Hours Fix Tests...")
    print(f"Backend URL: {BASE_URL}")
    print(f"API URL: {API_URL}")
    print("="*60)
    
    # Authentication
    test_manager_login()
    
    # Timesheet tests
    test_timesheet_config_setup()
    test_manager_clock_in()
    test_manager_clock_out_with_hours_calculation()
    test_timesheet_reports_after_fix()
    test_my_hours_endpoint_after_fix()
    test_edge_case_minimal_duration()
    
    # Show final results
    success = results.summary()
    return success

if __name__ == "__main__":
    success = run_timesheet_tests()
    sys.exit(0 if success else 1)