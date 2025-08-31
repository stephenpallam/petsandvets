#!/usr/bin/env python3
"""
Script to update all pages to use dynamic business info instead of static hospitalInfo
"""
import os
import re
import glob

# List of files to skip (already updated manually)
skip_files = [
    'MessageUs.jsx',
    'ReachUs.jsx', 
    'ReviewUs.jsx',
    'Home.jsx',
    'Footer.jsx',
    'useBusinessInfo.js'
]

def update_file(file_path):
    """Update a single file to use useBusinessInfo hook"""
    print(f"Processing: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Skip if file doesn't import hospitalInfo
        if 'hospitalInfo' not in content:
            return False
            
        # Skip if already updated
        if 'useBusinessInfo' in content:
            print(f"  Already updated, skipping")
            return False
            
        # Add useBusinessInfo import if hospitalInfo is imported
        if "import { hospitalInfo }" in content:
            content = content.replace(
                "import { hospitalInfo }",
                "import { hospitalInfo }\nimport { useBusinessInfo }"
            )
        elif "from '../mock';" in content and "hospitalInfo" in content:
            # Add the import after the mock import
            content = content.replace(
                "from '../mock';",
                "from '../mock';\nimport { useBusinessInfo } from '../hooks/useBusinessInfo';"
            )
        
        # Add hook usage in component
        # Find the component function start
        component_match = re.search(r'const (\w+) = \(\) => \{', content)
        if component_match:
            component_name = component_match.group(1)
            hook_line = "  const { businessInfo: currentBusinessInfo } = useBusinessInfo();\n"
            
            # Add hook at the beginning of the component
            insertion_point = component_match.end()
            content = content[:insertion_point + 1] + hook_line + content[insertion_point + 1:]
        
        # Replace hospitalInfo.phone references
        content = re.sub(
            r'\bhospitalInfo\.phone\b',
            'currentBusinessInfo.phone',
            content
        )
        
        # Replace hospitalInfo.email references  
        content = re.sub(
            r'\bhospitalInfo\.email\b',
            'currentBusinessInfo.email',
            content
        )
        
        # Replace hospitalInfo.address references
        content = re.sub(
            r'\bhospitalInfo\.address\b', 
            'currentBusinessInfo.address',
            content
        )
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  Updated successfully")
            return True
        else:
            print(f"  No changes needed")
            return False
            
    except Exception as e:
        print(f"  Error processing {file_path}: {e}")
        return False

def main():
    """Main function to update all files"""
    frontend_dir = "/app/frontend/src"
    
    # Find all JSX files
    jsx_files = glob.glob(f"{frontend_dir}/**/*.jsx", recursive=True)
    
    updated_count = 0
    skipped_count = 0
    
    for file_path in jsx_files:
        filename = os.path.basename(file_path)
        
        # Skip files already updated manually
        if filename in skip_files:
            print(f"Skipping manually updated file: {filename}")
            skipped_count += 1
            continue
            
        if update_file(file_path):
            updated_count += 1
        else:
            skipped_count += 1
    
    print(f"\nSummary:")
    print(f"Files updated: {updated_count}")
    print(f"Files skipped: {skipped_count}")
    print(f"Total files processed: {len(jsx_files)}")

if __name__ == "__main__":
    main()