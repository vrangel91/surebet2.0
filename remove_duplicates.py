#!/usr/bin/env python3
import json
import sys

def remove_duplicates_from_json(file_path):
    """Remove duplicate keys from JSON file, keeping the last occurrence."""
    
    # Read the JSON file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse JSON
    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return False
    
    # Count duplicates before removal
    keys = list(data.keys())
    unique_keys = set(keys)
    duplicates_count = len(keys) - len(unique_keys)
    
    if duplicates_count == 0:
        print("No duplicates found.")
        return True
    
    print(f"Found {duplicates_count} duplicate keys. Removing duplicates...")
    
    # Create new dict with unique keys (keeping last occurrence)
    unique_data = {}
    seen_keys = set()
    
    for key, value in data.items():
        if key not in seen_keys:
            unique_data[key] = value
            seen_keys.add(key)
        else:
            print(f"Removing duplicate: {key}")
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(unique_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully removed {duplicates_count} duplicate keys.")
    return True

if __name__ == "__main__":
    file_path = "client/src/config/marketTranslations.json"
    success = remove_duplicates_from_json(file_path)
    sys.exit(0 if success else 1)
