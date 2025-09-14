#!/usr/bin/env python3
import json
import sys
from collections import OrderedDict

def fix_json_duplicates(file_path):
    """Fix JSON file by removing duplicate keys and keeping the last occurrence."""
    
    print(f"Processing file: {file_path}")
    
    # Read the file as text first to preserve structure
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try to parse as JSON
    try:
        data = json.loads(content)
        print(f"Successfully parsed JSON with {len(data)} top-level keys")
        
        # Check if there's a translations key
        if 'translations' in data:
            translations = data['translations']
            print(f"Found 'translations' key with {len(translations)} entries")
            
            # Count duplicates in translations
            keys = list(translations.keys())
            unique_keys = set(keys)
            duplicates = len(keys) - len(unique_keys)
            
            if duplicates == 0:
                print("No duplicates found in translations.")
                return True
            
            print(f"Found {duplicates} duplicate keys in translations")
            
            # Create new ordered dict with unique keys (keeping last occurrence)
            unique_translations = OrderedDict()
            seen_keys = set()
            removed_count = 0
            
            for key, value in translations.items():
                if key not in seen_keys:
                    unique_translations[key] = value
                    seen_keys.add(key)
                else:
                    print(f"Removing duplicate: {key}")
                    removed_count += 1
            
            print(f"Removed {removed_count} duplicate entries")
            
            # Update the data structure
            data['translations'] = unique_translations
            
            # Write back to file with proper formatting
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, separators=(',', ': '))
            
            print(f"Successfully fixed {duplicates} duplicates")
            return True
        else:
            print("No 'translations' key found")
            return False
            
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return False

if __name__ == "__main__":
    file_path = "client/src/config/marketTranslations.json"
    success = fix_json_duplicates(file_path)
    sys.exit(0 if success else 1)
