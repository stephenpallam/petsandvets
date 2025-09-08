#!/usr/bin/env python3
"""
Test Wrapper - Ensures all tests use test database
NEVER run tests against production database
"""
import os
import sys
import subprocess
import asyncio

# Setup backend path
sys.path.append('/app/backend')
from test_db_config import set_test_environment, TestDatabaseManager, restore_production_environment

def run_test_safely(test_script_path: str, *args):
    """Run a test script safely with test database"""
    try:
        print(f"🧪 Setting up test environment for: {test_script_path}")
        
        # Set test environment
        set_test_environment()
        
        # Setup test database
        test_manager = TestDatabaseManager()
        asyncio.run(test_manager.setup_test_database())
        
        print(f"🔒 Production database protected: {os.environ.get('DB_NAME')}")
        print(f"🧪 Running tests against test database...")
        
        # Run the test script
        cmd = [sys.executable, test_script_path] + list(args)
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        # Print output
        if result.stdout:
            print("STDOUT:")
            print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        
        # Cleanup test database
        asyncio.run(test_manager.cleanup_test_database())
        print("🧹 Test database cleaned up")
        
        # Restore production environment
        restore_production_environment()
        print("🔄 Production environment restored")
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        
        # Ensure environment is restored even on error
        try:
            restore_production_environment()
        except:
            pass
            
        return False

def main():
    """Main function for command line usage"""
    if len(sys.argv) < 2:
        print("Usage: python test_wrapper.py <test_script> [args...]")
        print("Example: python test_wrapper.py business_info_test.py")
        sys.exit(1)
    
    test_script = sys.argv[1]
    test_args = sys.argv[2:]
    
    print("="*60)
    print("🧪 SAFE TEST EXECUTION WRAPPER")
    print("="*60)
    print(f"🔒 Production database will be PROTECTED")
    print(f"🧪 All tests will use ISOLATED test database")
    print("="*60)
    
    success = run_test_safely(test_script, *test_args)
    
    if success:
        print("✅ Tests completed successfully")
        sys.exit(0)
    else:
        print("❌ Tests failed or encountered errors")
        sys.exit(1)

if __name__ == "__main__":
    main()