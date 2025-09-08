# Test Organization

This directory contains all test files organized by category for better maintainability.

## Directory Structure

### `/backend/`
Contains all backend API and service tests:
- `backend_test.py` - Main backend API tests
- `ai_agents_focused_test.py` - AI agent creation and management tests
- `ai_posts_test.py` - AI post generation and management tests
- `email_agent_test.py` - Email agent functionality tests
- `social_media_test.py` - Social media agent tests
- `timesheet_test.py` - Timesheet agent tests
- `customer_test.py` - Customer management tests
- `business_info_test.py` - Business information tests
- `health_check_test.py` - Health check endpoint tests

### `/frontend/`
Contains all frontend and UI tests:
- `navigation_auth_test.py` - Navigation and authentication UI tests
- `auth_review_test.py` - Authentication review tests

### `/integration/`
Contains end-to-end and integration tests:
- `write_mode_test.py` - Write mode workflow tests
- `regenerate_image_test.py` - Image regeneration tests
- `test_regenerate_content.py` - Content regeneration tests
- `test_blocked_slots.py` - Appointment blocking tests
- `urgent_care_timezone_test.py` - Timezone handling tests

### `/debug/`
Contains debug scripts and temporary test files:
- `debug_adhoc_test.py` - Debug script for adhoc functionality
- `ai_agent_deletion_debug.py` - Debug script for agent deletion
- `fix_all_tests.py` - Test utility scripts
- `test_wrapper.py` - Test wrapper utilities

## Running Tests

To run tests from specific categories:
```bash
# Run all backend tests
python -m pytest tests/backend/

# Run all frontend tests  
python -m pytest tests/frontend/

# Run all integration tests
python -m pytest tests/integration/

# Run a specific test file
python tests/backend/backend_test.py
```