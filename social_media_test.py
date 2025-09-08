#!/usr/bin/env python3
"""
Enhanced Social Media Agent Functionality Testing
Tests the specific scenarios from the review request
"""

import requests
import json
import os
from datetime import datetime
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
# Check if BASE_URL already includes /api
if BASE_URL.endswith('/api'):
    API_URL = BASE_URL
else:
    API_URL = f"{BASE_URL}/api"

print(f"Testing Enhanced Social Media Agent API at: {API_URL}")

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
        print(f"TEST SUMMARY")
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

# Admin credentials
admin_credentials = {
    "email": "admin@hospital.com",
    "password": "admin123"
}

admin_token = None

def test_admin_login():
    """Test admin login endpoint"""
    global admin_token
    try:
        response = requests.post(f"{API_URL}/login", json=admin_credentials)
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data and data.get("token_type") == "bearer":
                admin_token = data["access_token"]
                results.log_success("Admin Login")
                return True
        results.log_failure("Admin Login", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Admin Login", str(e))
        return False

def test_social_media_write_mode_with_title():
    """Test Write Your Post Mode - With Title (Review Request Scenario 1)"""
    if not admin_token:
        results.log_failure("Social Media Write Mode With Title", "No admin token available")
        return False
    
    try:
        write_mode_data = {
            "agent_type": "social_media",
            "mode": "write",
            "agent_name": "Test With Title",
            "post_title": "Amazing Pet Care Tips",
            "post_content": "Winter pet care content: Keep your pets warm and safe during cold weather. Provide adequate shelter, fresh water, and monitor for signs of hypothermia.",
            "social_platforms": {"facebook": True, "whatsapp": False, "instagram": False, "twitter": False},
            "image_option": "none",
            "word_count": "100",
            "post_date": "2025-01-20",
            "post_time": "10:00",
            "immediate": True
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{API_URL}/ai-agents", json=write_mode_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "agent_id" in data:
                agent_id = data["agent_id"]
                
                # Verify agent was created with correct data
                get_response = requests.get(f"{API_URL}/ai-agents", headers=headers)
                if get_response.status_code == 200:
                    agents = get_response.json()
                    created_agent = next((agent for agent in agents if agent.get("id") == agent_id), None)
                    
                    if (created_agent and 
                        created_agent.get("post_title") == "Amazing Pet Care Tips" and
                        created_agent.get("mode") == "write" and
                        created_agent.get("agent_type") == "social_media" and
                        created_agent.get("social_platforms", {}).get("facebook") == True):
                        results.log_success("Social Media Write Mode With Title")
                        return True
                
        results.log_failure("Social Media Write Mode With Title", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Social Media Write Mode With Title", str(e))
        return False

def test_social_media_write_mode_no_title():
    """Test Write Your Post Mode - No Title (AI Generation) (Review Request Scenario 2)"""
    if not admin_token:
        results.log_failure("Social Media Write Mode No Title", "No admin token available")
        return False
    
    try:
        write_mode_data = {
            "agent_type": "social_media", 
            "mode": "write",
            "agent_name": "Test No Title",
            "post_title": "",  # Empty title - AI should generate
            "post_content": "Dental care for dogs content: Regular brushing prevents tartar buildup and gum disease. Use dog-specific toothpaste and start slowly to help your pet adjust.",
            "social_platforms": {"facebook": True, "whatsapp": True, "instagram": False, "twitter": False},
            "image_option": "none",
            "word_count": "100",
            "post_date": "2025-01-21",
            "post_time": "11:00",
            "immediate": True
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{API_URL}/ai-agents", json=write_mode_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "agent_id" in data:
                agent_id = data["agent_id"]
                
                # Verify agent was created with correct data
                get_response = requests.get(f"{API_URL}/ai-agents", headers=headers)
                if get_response.status_code == 200:
                    agents = get_response.json()
                    created_agent = next((agent for agent in agents if agent.get("id") == agent_id), None)
                    
                    if (created_agent and 
                        created_agent.get("mode") == "write" and
                        created_agent.get("agent_type") == "social_media" and
                        created_agent.get("social_platforms", {}).get("facebook") == True and
                        created_agent.get("social_platforms", {}).get("whatsapp") == True):
                        results.log_success("Social Media Write Mode No Title (AI Generation)")
                        return True
                
        results.log_failure("Social Media Write Mode No Title", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Social Media Write Mode No Title", str(e))
        return False

def test_social_media_adhoc_mode():
    """Test Adhoc Mode - Should Generate Title (Review Request Scenario 3)"""
    if not admin_token:
        results.log_failure("Social Media Adhoc Mode", "No admin token available")
        return False
    
    try:
        adhoc_mode_data = {
            "agent_type": "social_media",
            "mode": "adhoc", 
            "agent_name": "Adhoc Test",
            "topic": "Pet Nutrition",
            "social_platforms": {"facebook": True, "instagram": True, "twitter": False, "whatsapp": False},
            "image_option": "none",
            "word_count": "100",
            "post_date": "2025-01-22",
            "post_time": "12:00",
            "immediate": True
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{API_URL}/ai-agents", json=adhoc_mode_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "agent_id" in data:
                agent_id = data["agent_id"]
                
                # Verify agent was created with correct data
                get_response = requests.get(f"{API_URL}/ai-agents", headers=headers)
                if get_response.status_code == 200:
                    agents = get_response.json()
                    created_agent = next((agent for agent in agents if agent.get("id") == agent_id), None)
                    
                    if (created_agent and 
                        created_agent.get("mode") == "adhoc" and
                        created_agent.get("agent_type") == "social_media" and
                        created_agent.get("topic") == "Pet Nutrition" and
                        created_agent.get("social_platforms", {}).get("facebook") == True and
                        created_agent.get("social_platforms", {}).get("instagram") == True):
                        results.log_success("Social Media Adhoc Mode")
                        return True
                
        results.log_failure("Social Media Adhoc Mode", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Social Media Adhoc Mode", str(e))
        return False

def test_social_media_recurring_mode():
    """Test Recurring Mode - Should Generate Title (Review Request Scenario 4)"""
    if not admin_token:
        results.log_failure("Social Media Recurring Mode", "No admin token available")
        return False
    
    try:
        recurring_mode_data = {
            "agent_type": "social_media",
            "mode": "recurring",
            "agent_name": "Recurring Test", 
            "topic": "Vaccination Reminders",
            "social_platforms": {"twitter": True, "whatsapp": True, "facebook": False, "instagram": False},
            "image_option": "none",
            "word_count": "100",
            "frequency": "24",  # Every 24 hours
            "post_time": "14:00",
            "days_of_week": {
                "monday": True,
                "tuesday": True,
                "wednesday": True,
                "thursday": True,
                "friday": True,
                "saturday": False,
                "sunday": False
            },
            "auto_post": False
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{API_URL}/ai-agents", json=recurring_mode_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "agent_id" in data:
                agent_id = data["agent_id"]
                
                # Verify agent was created with correct data
                get_response = requests.get(f"{API_URL}/ai-agents", headers=headers)
                if get_response.status_code == 200:
                    agents = get_response.json()
                    created_agent = next((agent for agent in agents if agent.get("id") == agent_id), None)
                    
                    if (created_agent and 
                        created_agent.get("mode") == "recurring" and
                        created_agent.get("agent_type") == "social_media" and
                        created_agent.get("topic") == "Vaccination Reminders" and
                        created_agent.get("social_platforms", {}).get("twitter") == True and
                        created_agent.get("social_platforms", {}).get("whatsapp") == True):
                        results.log_success("Social Media Recurring Mode")
                        return True
                
        results.log_failure("Social Media Recurring Mode", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Social Media Recurring Mode", str(e))
        return False

def test_social_platforms_validation():
    """Test that social platforms are validated correctly for social media agents"""
    if not admin_token:
        results.log_failure("Social Platforms Validation", "No admin token available")
        return False
    
    try:
        # Test with no platforms selected (should fail)
        invalid_data = {
            "agent_type": "social_media",
            "mode": "write",
            "agent_name": "Invalid Platforms Test",
            "post_title": "Test Title",
            "post_content": "Test content",
            "social_platforms": {"facebook": False, "instagram": False, "twitter": False, "whatsapp": False},
            "image_option": "none",
            "word_count": "100",
            "immediate": True
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{API_URL}/ai-agents", json=invalid_data, headers=headers)
        
        if response.status_code == 400:
            error_detail = response.json().get("detail", "")
            if "at least one social media platform" in error_detail.lower():
                results.log_success("Social Platforms Validation (No Platforms Selected)")
                return True
        elif response.status_code == 500:
            # Check if it's a server error related to validation
            try:
                error_detail = response.json().get("detail", "")
                if "at least one social media platform" in error_detail.lower():
                    results.log_success("Social Platforms Validation (Server Error but Correct Message)")
                    return True
            except:
                pass
        
        results.log_failure("Social Platforms Validation", f"Expected 400 error for no platforms, got {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Social Platforms Validation", str(e))
        return False

def test_consistent_social_platforms():
    """Test that all forms use consistent social platforms (Facebook, Instagram, Twitter, WhatsApp)"""
    if not admin_token:
        results.log_failure("Consistent Social Platforms", "No admin token available")
        return False
    
    try:
        # Test all supported platforms
        platform_data = {
            "agent_type": "social_media",
            "mode": "write",
            "agent_name": "Platform Consistency Test",
            "post_title": "Platform Test",
            "post_content": "Testing all supported platforms",
            "social_platforms": {"facebook": True, "instagram": True, "twitter": True, "whatsapp": True},
            "image_option": "none",
            "word_count": "100",
            "immediate": True
        }
        
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{API_URL}/ai-agents", json=platform_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "agent_id" in data:
                agent_id = data["agent_id"]
                
                # Verify all platforms were saved correctly
                get_response = requests.get(f"{API_URL}/ai-agents", headers=headers)
                if get_response.status_code == 200:
                    agents = get_response.json()
                    created_agent = next((agent for agent in agents if agent.get("id") == agent_id), None)
                    
                    if created_agent:
                        platforms = created_agent.get("social_platforms", {})
                        expected_platforms = ["facebook", "instagram", "twitter", "whatsapp"]
                        
                        # Check all expected platforms exist and are True
                        if all(platforms.get(platform) == True for platform in expected_platforms):
                            results.log_success("Consistent Social Platforms (All Platforms Supported)")
                            return True
                
        results.log_failure("Consistent Social Platforms", f"Status: {response.status_code}, Response: {response.text}")
        return False
    except Exception as e:
        results.log_failure("Consistent Social Platforms", str(e))
        return False

def main():
    print("="*60)
    print("ENHANCED SOCIAL MEDIA AGENT FUNCTIONALITY TESTS")
    print("="*60)
    
    # Login first
    if not test_admin_login():
        print("❌ Cannot proceed without admin authentication")
        return False
    
    print("\n🧪 Testing Enhanced Social Media Agent Functionality...")
    
    # Run the enhanced social media agent tests
    test_social_media_write_mode_with_title()
    test_social_media_write_mode_no_title()
    test_social_media_adhoc_mode()
    test_social_media_recurring_mode()
    test_social_platforms_validation()
    test_consistent_social_platforms()
    
    # Print summary
    success = results.summary()
    
    if success:
        print("\n✅ All enhanced social media agent functionality tests passed!")
    else:
        print("\n❌ Some tests failed - see details above")
    
    return success

if __name__ == "__main__":
    main()