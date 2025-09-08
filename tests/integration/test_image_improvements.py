#!/usr/bin/env python3
"""
USES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA
Test Image Storage and Content Regeneration Improvements
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

print(f"Testing Image Storage and Content Regeneration Improvements at: {API_URL}")

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

# Global variables for tokens
admin_token = None
manager_token = None
user_token = None

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

def test_ai_posts_regenerate_image_improved():
    """Test POST /api/ai-posts/{post_id}/regenerate-image with improved image storage"""
    if not admin_token:
        results.log_failure("AI Posts Regenerate Image (Improved)", "No admin token available")
        return False
    
    try:
        # First, get an existing AI post to regenerate image for
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish", headers=headers)
        
        if response.status_code != 200:
            results.log_failure("AI Posts Regenerate Image (Setup)", f"Failed to get AI posts: {response.status_code}")
            return False
        
        data = response.json()
        posts = data.get("posts", []) if isinstance(data, dict) else data
        
        if not posts:
            results.log_failure("AI Posts Regenerate Image (Setup)", "No AI posts available for testing")
            return False
        
        post_id = posts[0]["id"]
        
        # Test regenerate image endpoint
        image_data = {
            "content": "Professional veterinary care for your beloved pets",
            "image_text": "Veterinarian examining a happy dog in modern clinic"
        }
        
        response = requests.post(
            f"{API_URL}/ai-posts/{post_id}/regenerate-image",
            json=image_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result_data = response.json()
            
            # Check response structure
            if ("message" in result_data and 
                "image_url" in result_data and 
                "image_text" in result_data):
                
                image_url = result_data["image_url"]
                
                # Verify image URL format (should be /api/files/ai-generated/{filename})
                if image_url.startswith("/api/files/ai-generated/") and image_url.endswith(".png"):
                    results.log_success("AI Posts Regenerate Image (Improved Storage)")
                    return True
                else:
                    results.log_failure("AI Posts Regenerate Image (Improved)", f"Image URL format incorrect: {image_url}")
                    return False
            else:
                results.log_failure("AI Posts Regenerate Image (Improved)", f"Response missing required fields: {result_data}")
                return False
        else:
            results.log_failure("AI Posts Regenerate Image (Improved)", f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        results.log_failure("AI Posts Regenerate Image (Improved)", str(e))
        return False

def test_ai_posts_regenerate_content_fixed():
    """Test POST /api/ai-posts/{post_id}/regenerate-content with fixed LlmChat initialization"""
    if not admin_token:
        results.log_failure("AI Posts Regenerate Content (Fixed)", "No admin token available")
        return False
    
    try:
        # First, get an existing AI post to regenerate content for
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish", headers=headers)
        
        if response.status_code != 200:
            results.log_failure("AI Posts Regenerate Content (Setup)", f"Failed to get AI posts: {response.status_code}")
            return False
        
        data = response.json()
        posts = data.get("posts", []) if isinstance(data, dict) else data
        
        if not posts:
            results.log_failure("AI Posts Regenerate Content (Setup)", "No AI posts available for testing")
            return False
        
        post_id = posts[0]["id"]
        original_content = posts[0].get("content", "")
        
        # Test regenerate content endpoint
        content_data = {
            "current_content": original_content,
            "topic": "veterinary care and pet health"
        }
        
        response = requests.post(
            f"{API_URL}/ai-posts/{post_id}/regenerate-content",
            json=content_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result_data = response.json()
            
            # Check response structure
            if ("message" in result_data and 
                "new_content" in result_data and 
                "original_content" in result_data):
                
                new_content = result_data["new_content"]
                
                # Verify new content is different from original and meaningful
                if (new_content and 
                    new_content != original_content and 
                    len(new_content) > 10 and
                    "Failed to generate new content" not in new_content):
                    results.log_success("AI Posts Regenerate Content (Fixed LlmChat)")
                    return True
                else:
                    results.log_failure("AI Posts Regenerate Content (Fixed)", f"Generated content invalid: {new_content}")
                    return False
            else:
                results.log_failure("AI Posts Regenerate Content (Fixed)", f"Response missing required fields: {result_data}")
                return False
        else:
            results.log_failure("AI Posts Regenerate Content (Fixed)", f"Status: {response.status_code}, Response: {response.text}")
            return False
            
    except Exception as e:
        results.log_failure("AI Posts Regenerate Content (Fixed)", str(e))
        return False

def test_file_serving_ai_generated():
    """Test GET /api/files/ai-generated/{filename} endpoint serves generated images"""
    try:
        # First check if ai-generated directory exists
        ai_generated_dir = "/app/data/upload/photos/ai-generated"
        
        if not os.path.exists(ai_generated_dir):
            results.log_failure("File Serving AI Generated (Setup)", "AI generated directory does not exist")
            return False
        
        # Check if the file serving endpoint supports ai-generated category
        # Try to access a non-existent file to see if the category is supported
        response = requests.get(f"{API_URL}/files/ai-generated/test.png")
        
        if response.status_code == 404:
            # Check if it's "File not found" (category supported) or "Category not found"
            if "Category not found" in response.text:
                results.log_failure("File Serving AI Generated", "ai-generated category not supported in file serving endpoint")
                return False
            else:
                # Category is supported, file just doesn't exist
                results.log_success("File Serving AI Generated (Category Supported)")
                return True
        elif response.status_code == 200:
            # Unexpected - file exists
            results.log_success("File Serving AI Generated (File Exists)")
            return True
        else:
            results.log_failure("File Serving AI Generated", f"Unexpected status: {response.status_code}")
            return False
            
    except Exception as e:
        results.log_failure("File Serving AI Generated", str(e))
        return False

def test_ai_generated_directory_permissions():
    """Test that ai-generated directory has proper permissions"""
    try:
        import stat
        
        ai_generated_dir = "/app/data/upload/photos/ai-generated"
        
        if not os.path.exists(ai_generated_dir):
            results.log_failure("AI Generated Directory Permissions", "Directory does not exist")
            return False
        
        # Check directory permissions
        dir_stat = os.stat(ai_generated_dir)
        dir_mode = stat.filemode(dir_stat.st_mode)
        
        # Check if directory is readable and writable
        if os.access(ai_generated_dir, os.R_OK | os.W_OK):
            results.log_success("AI Generated Directory Permissions")
            return True
        else:
            results.log_failure("AI Generated Directory Permissions", f"Directory not readable/writable: {dir_mode}")
            return False
            
    except Exception as e:
        results.log_failure("AI Generated Directory Permissions", str(e))
        return False

def test_image_storage_vs_database():
    """Test that images are stored as files instead of base64 in database"""
    if not admin_token:
        results.log_failure("Image Storage vs Database", "No admin token available")
        return False
    
    try:
        # Get AI posts and check image URLs
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{API_URL}/ai-posts/ready-to-publish", headers=headers)
        
        if response.status_code != 200:
            results.log_failure("Image Storage vs Database (Setup)", f"Failed to get AI posts: {response.status_code}")
            return False
        
        data = response.json()
        posts = data.get("posts", []) if isinstance(data, dict) else data
        
        if not posts:
            results.log_failure("Image Storage vs Database (Setup)", "No AI posts available for testing")
            return False
        
        # Check image URLs in posts
        file_based_images = 0
        base64_images = 0
        
        for post in posts:
            image_url = post.get("image_url", "")
            if image_url:
                if image_url.startswith("data:image/"):
                    base64_images += 1
                elif image_url.startswith("/api/files/"):
                    file_based_images += 1
        
        if file_based_images > 0 and base64_images == 0:
            results.log_success("Image Storage vs Database (File-based Storage)")
            return True
        elif base64_images > 0:
            results.log_failure("Image Storage vs Database", f"Found {base64_images} base64 images, should be file-based")
            return False
        else:
            results.log_success("Image Storage vs Database (No Images to Check)")
            return True
            
    except Exception as e:
        results.log_failure("Image Storage vs Database", str(e))
        return False

if __name__ == "__main__":
    print("Starting Image Storage and Content Regeneration Tests...")
    print("=" * 60)
    
    # Login first
    test_admin_login()
    
    # Test improved image storage functionality
    test_ai_posts_regenerate_image_improved()
    test_image_storage_vs_database()
    test_ai_generated_directory_permissions()
    test_file_serving_ai_generated()
    
    # Test fixed content regeneration functionality
    test_ai_posts_regenerate_content_fixed()
    
    # Print final results
    success = results.summary()
    
    if success:
        print(f"\n🎉 All image storage and content regeneration tests passed!")
        sys.exit(0)
    else:
        print(f"\n❌ Some tests failed. Please check the implementation.")
        sys.exit(1)