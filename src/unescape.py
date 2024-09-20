import json
import html
import re
from bs4 import BeautifulSoup
import os

def unescape_special_chars(text):
    # Unescape HTML entities
    unescaped = html.unescape(text)
    
    # Handle special cases like &#xFFFD; which html.unescape doesn't handle
    unescaped = re.sub(r'&#x([0-9A-Fa-f]+);', lambda m: chr(int(m.group(1), 16)), unescaped)
    
    # Remove d:priority attributes
    unescaped = re.sub(r'\s*d:priority="[^"]*"', '', unescaped)

    # Trim leading and trailing whitespace
    unescaped = unescaped.strip()
    
    # Replace multiple spaces with a single space
    unescaped = re.sub(r'\s+', ' ', unescaped)
    
    # Replace curly double quotes with straight double quotes
    unescaped = unescaped.replace('“', '"').replace('”', '"')
    
    # Replace curly single quotes with straight single quotes
    unescaped = unescaped.replace('‘', "'").replace('’', "'")

    # Remove leading space before a semicolon
    unescaped = re.sub(r'\s+;', ';', unescaped)
    
    # Handle the ‖ character and replace <b> with <strong> and <i> with <em>
    soup = BeautifulSoup(unescaped, 'html.parser')
    
    for char in soup.find_all(string=re.compile('‖')):
        next_tag = char.find_next()
        if next_tag:
            next_tag['data-alt'] = 'true'
        char.replace_with(char.string.replace('‖', ''))
    
    for tag in soup.find_all('b'):
        tag.name = 'strong'
    
    for tag in soup.find_all('i'):
        tag.name = 'em'
    
    unescaped = str(soup)
    
    return unescaped

def wrap_in_entry_div(item):
    return f'<div class="entry">{item}</div>'

def process_json(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Recursively process all string values in the JSON
    def process_item(item):
        if isinstance(item, str):
            wrapped_item = wrap_in_entry_div(item)
            return unescape_special_chars(wrapped_item)
        elif isinstance(item, list):
            return [process_item(i) for i in item]
        elif isinstance(item, dict):
            return {k: process_item(v) for k, v in item.items()}
        else:
            return item
    
    processed_data = process_item(data)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=2)

# Update the file paths
script_dir = os.path.dirname(os.path.abspath(__file__))
full_dict_file = os.path.join(script_dir, 'dict.json')
sample_dict_file = os.path.join(script_dir, 'dict-sample.json')

# Update the output paths
output_dir = os.path.join(script_dir, '..', 'app', 'data')
os.makedirs(output_dir, exist_ok=True)

process_json(full_dict_file, os.path.join(output_dir, 'dict.json'))
process_json(sample_dict_file, os.path.join(output_dir, 'dict-sample.json'))

print("Processing complete. Output files saved in app/data directory.")
