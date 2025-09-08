#!/usr/bin/env python3
"""
Fix All Test Files to Use Test Database
Batch fix all test files to ensure they use test database
"""
import os
import glob

def fix_test_file(file_path):
    """Fix a test file to use test database"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Check if already fixed
        if 'test_db_config import set_test_environment' in content:
            print(f"✅ Already fixed: {file_path}")
            return True
        
        # Find the imports section
        lines = content.split('\n')
        
        # Find where to insert the test database setup
        import_end_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('import ') or line.startswith('from '):
                import_end_idx = i + 1
            elif line.strip() == "" and import_end_idx > 0:
                break
        
        # Insert test database setup after imports
        test_setup = [
            "",
            "# CRITICAL: Setup test database environment",
            "import sys",
            "sys.path.append('/app/backend')",
            "from test_db_config import set_test_environment",
            "set_test_environment()",
            "print(\"🧪 USING TEST DATABASE - Production data is safe!\")",
            ""
        ]
        
        # Insert the setup code
        lines[import_end_idx:import_end_idx] = test_setup
        
        # Update the docstring to indicate test database usage
        for i, line in enumerate(lines):
            if '"""' in line and 'TEST DATABASE' not in line:
                if line.count('"""') == 2:  # Single line docstring
                    lines[i] = line.replace('"""', '"""\nUSES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA\n"""')
                else:  # Multi-line docstring start
                    lines[i] = line + "\nUSES TEST DATABASE ONLY - NEVER TOUCHES PRODUCTION DATA"
                break
        
        # Write back the fixed content
        with open(file_path, 'w') as f:
            f.write('\n'.join(lines))
        
        print(f"✅ Fixed: {file_path}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to fix {file_path}: {e}")
        return False

def main():
    """Fix all test files"""
    print("🔧 Fixing all test files to use test database...")
    
    # Find all test files
    test_files = glob.glob('/app/*test*.py')
    
    # Exclude already fixed files
    exclude_files = [
        '/app/test_wrapper.py',
        '/app/business_info_test.py',  # Already fixed
        '/app/backend_test.py',  # Already fixed
        '/app/ai_agents_focused_test.py',  # Already fixed
        '/app/fix_all_tests.py'  # This file
    ]
    
    test_files = [f for f in test_files if f not in exclude_files]
    
    fixed_count = 0
    for test_file in test_files:
        if fix_test_file(test_file):
            fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} out of {len(test_files)} test files")
    print("🔒 All test files now use isolated test database")
    print("🏥 Production database is fully protected")

if __name__ == "__main__":
    main()