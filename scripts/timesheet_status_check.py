#!/usr/bin/env python3
"""
Check timesheet status and clock out if needed
"""

import requests
import json
from datetime import datetime, timedelta

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

# Manager credentials
manager_credentials = {
    "email": "manager@veterinary.com",
    "password": "manager123"
}

def get_manager_token():
    response = requests.post(f"{API_URL}/login", json=manager_credentials)
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def check_timesheet_status():
    token = get_manager_token()
    if not token:
        print("❌ Failed to get manager token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Check current status
    print("🔍 Checking timesheet status...")
    response = requests.get(f"{API_URL}/timesheet/status", headers=headers)
    if response.status_code == 200:
        status = response.json()
        print(f"📊 Current Status: {json.dumps(status, indent=2)}")
        
        if status.get("is_clocked_in"):
            print("⏰ Manager is currently clocked in. Attempting to clock out...")
            
            # Clock out
            clock_out_response = requests.post(f"{API_URL}/timesheet/clock-out", 
                                             json={"notes": "Auto clock out for testing"}, 
                                             headers=headers)
            
            if clock_out_response.status_code == 200:
                data = clock_out_response.json()
                print("✅ Successfully clocked out!")
                print(f"📊 Clock out result: {json.dumps(data, indent=2)}")
                
                # Check if hours were calculated
                total_hours = data.get("total_hours", 0)
                regular_hours = data.get("regular_hours", 0)
                after_hours_hours = data.get("after_hours_hours", 0)
                
                print(f"\n📈 HOURS CALCULATION RESULTS:")
                print(f"   Total Hours: {total_hours}")
                print(f"   Regular Hours: {regular_hours}")
                print(f"   After Hours: {after_hours_hours}")
                
                if total_hours > 0:
                    print("✅ Hours calculation is working!")
                else:
                    print("❌ Hours calculation still showing zero!")
            else:
                print(f"❌ Failed to clock out: {clock_out_response.status_code} - {clock_out_response.text}")
        else:
            print("✅ Manager is not currently clocked in")
    else:
        print(f"❌ Failed to check status: {response.status_code} - {response.text}")

def check_my_hours():
    token = get_manager_token()
    if not token:
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔍 Checking my hours entries...")
    response = requests.get(f"{API_URL}/timesheet/my-hours", headers=headers)
    if response.status_code == 200:
        entries = response.json()
        print(f"📊 Found {len(entries)} time entries")
        
        entries_with_hours = 0
        for i, entry in enumerate(entries[:5]):  # Check first 5 entries
            total_h = entry.get("total_hours") or 0
            regular_h = entry.get("regular_hours") or 0
            after_h = entry.get("after_hours_hours") or 0
            status = entry.get("status", "unknown")
            
            print(f"   Entry {i+1}: Status={status}, Total={total_h}h, Regular={regular_h}h, After={after_h}h")
            
            if total_h > 0 or regular_h > 0 or after_h > 0:
                entries_with_hours += 1
        
        print(f"\n📈 SUMMARY: {entries_with_hours} out of {min(5, len(entries))} entries have calculated hours")
        
        if entries_with_hours == 0:
            print("❌ CRITICAL: No entries have calculated hours - calculate_hours function may still be broken!")
        else:
            print("✅ Some entries have calculated hours - calculate_hours function appears to be working!")
    else:
        print(f"❌ Failed to get my hours: {response.status_code}")

def check_timesheet_reports():
    token = get_manager_token()
    if not token:
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🔍 Checking timesheet reports...")
    
    # Get current date range (last 7 days to today)
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    
    params = {
        "start_date": start_date,
        "end_date": end_date
    }
    
    response = requests.get(f"{API_URL}/timesheet/reports", params=params, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"📊 Report Summary:")
        print(f"   Total Employees: {data.get('total_employees', 0)}")
        print(f"   Total Hours: {data.get('total_hours', 0)}")
        
        reports = data.get("reports", [])
        for report in reports:
            name = report.get("user_name", "Unknown")
            email = report.get("user_email", "Unknown")
            total_h = report.get("total_hours", 0)
            regular_h = report.get("regular_hours", 0)
            after_h = report.get("after_hours_hours", 0)
            
            print(f"   {name} ({email}): Total={total_h}h, Regular={regular_h}h, After={after_h}h")
    else:
        print(f"❌ Failed to get reports: {response.status_code}")

if __name__ == "__main__":
    print("🧪 Timesheet Status Check and Hours Verification")
    print("="*60)
    
    check_timesheet_status()
    check_my_hours()
    check_timesheet_reports()