#!/usr/bin/env python3
import json
import sys
from collections import OrderedDict

def remove_specific_duplicates(file_path):
    """Remove specific duplicate keys from JSON file."""
    
    print(f"Processing file: {file_path}")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse JSON
    try:
        data = json.loads(content)
        print(f"Successfully parsed JSON")
        
        if 'translations' not in data:
            print("No 'translations' key found")
            return False
        
        translations = data['translations']
        print(f"Found {len(translations)} translations")
        
        # Find and remove duplicates
        seen_keys = set()
        unique_translations = OrderedDict()
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
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, separators=(',', ': '))
        
        print(f"Successfully removed {removed_count} duplicates")
        return True
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return False

if __name__ == "__main__":
    file_path = "client/src/config/marketTranslations.json"
    success = remove_specific_duplicates(file_path)
    sys.exit(0 if success else 1)
