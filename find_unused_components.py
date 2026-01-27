
import os
import re

COMPONENTS_DIR = '/home/darkwebplayer/Documents/Infywork/CRMHotel/hotel-dashboard/components'
PAGES_DIR = '/home/darkwebplayer/Documents/Infywork/CRMHotel/hotel-dashboard/pages'
LAYOUTS_DIR = '/home/darkwebplayer/Documents/Infywork/CRMHotel/hotel-dashboard/layouts'
APP_VUE = '/home/darkwebplayer/Documents/Infywork/CRMHotel/hotel-dashboard/app.vue'

def to_pascal_case(s):
    # If no separators, assume it's already proper casing (Camel or Pascal) or single word
    # Just ensure first char is upper
    if not re.search(r'[_\-\s]', s):
        if not s: return ""
        return s[0].upper() + s[1:]
    
    parts = re.split(r'[_\-\s]+', s)
    # capitalize() lowercases the tail, we just want to uppercase the head
    return ''.join(p[0].upper() + p[1:] for p in parts if p)

def get_search_patterns(file_path, root_dir):
    rel_path = os.path.relpath(file_path, root_dir)
    parts = rel_path.split(os.sep)
    
    # Remove extension from last part
    filename = os.path.splitext(parts[-1])[0]
    
    # Short Name (Filename only)
    short_name = to_pascal_case(filename)
    
    # Auto Import Name
    # Walk path parts, PascalCase each, join, deduce duplicates
    # Logic: Start with short_name. Prepend parent. Dedupe.
    
    auto_name = short_name
    
    # Iterate parents in reverse
    for part in reversed(parts[:-1]):
        part_pascal = to_pascal_case(part)
        # Deduplication: 
        # If auto_name starts with part_pascal, assumption is it's already there
        # e.g. Hotel / HotelBasicInfo.
        if not auto_name.startswith(part_pascal):
            auto_name = part_pascal + auto_name

    patterns = set()
    patterns.add(short_name)
    patterns.add(auto_name)
    
    return list(patterns)

def get_all_files(directory, extensions=['.vue', '.ts', '.js']):
    file_list = []
    if not os.path.exists(directory):
        return file_list
    for root, dirs, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_list.append(os.path.join(root, file))
    return file_list

def search_usage(patterns, files_content):
    # Return true if ANY pattern is found
    for name in patterns:
        # Regex for strictly component usage or import
        # Matches: <Name, :is="Name", import Name, { Name }
        # To be safe, just matching the word 'Name' with boundary is usually sufficient and covers imports
        
        regex = re.compile(r'\b' + re.escape(name) + r'\b')
        
        for content in files_content:
            if regex.search(content):
                return True
    return False

def main():
    component_files = get_all_files(COMPONENTS_DIR, ['.vue'])
    
    # Prepare component data
    # component_path -> [patterns]
    component_map = {}
    for f in component_files:
        if f.endswith('index.vue') and os.path.dirname(f) == COMPONENTS_DIR:
             continue # Skip root index.vue if it exists?
        
        # Handle index.vue special case for naming (Folder name)
        # But get_search_patterns handles filename 'index' -> 'Index'
        # Nuxt maps Folder/index.vue -> <Folder />
        # My logic: filename='index' -> short_name='Index'. 
        # auto_name -> ParentIndex.
        # This is wrong.
        # Correct login for index.vue:
        # name is Parent.
        
        name_file = f
        rel = os.path.relpath(f, COMPONENTS_DIR)
        parts = rel.split(os.sep)
        if parts[-1] == 'index.vue' and len(parts) > 1:
             # It acts as the directory component
             # But let's just stick to the generic generator and see
             # Usually people don't name component index.vue unless it's the folder component
             pass

        patterns = get_search_patterns(f, COMPONENTS_DIR)
        
        # Special fix for index.vue -> use folder name as one of the patterns
        if os.path.basename(f) == 'index.vue':
             parent = os.path.basename(os.path.dirname(f))
             patterns.append(to_pascal_case(parent))
             
        component_map[f] = patterns
    
    # Collect targets
    target_files = []
    target_files.extend(get_all_files(PAGES_DIR))
    target_files.extend(get_all_files(COMPONENTS_DIR))
    target_files.extend(get_all_files(LAYOUTS_DIR))
    if os.path.exists(APP_VUE):
        target_files.append(APP_VUE)
        
    # Read contents
    file_contents_map = {}
    for f in target_files:
        try:
            with open(f, 'r', encoding='utf-8') as file:
                file_contents_map[f] = file.read()
        except:
            pass
            
    used = []
    unused = []
    
    for comp_file, patterns in component_map.items():
        # Search in all OTHER files
        # Check if used
        is_used = False
        
        # Optimization: pre-compile regexes? 
        # Doing it inside loop for now
        
        # Scan files
        for target_f, content in file_contents_map.items():
            if target_f == comp_file:
                continue
            
            if search_usage(patterns, [content]):
                is_used = True
                break
        
        rel = os.path.relpath(comp_file, COMPONENTS_DIR)
        if is_used:
            used.append((rel, patterns))
        else:
            unused.append((rel, patterns))

    print(f"Total: {len(component_map)}")
    print(f"Used: {len(used)}")
    print(f"Unused: {len(unused)}")
    
    print("\n--- Unused Components ---")
    for path, patterns in sorted(unused, key=lambda x: x[0]):
        print(f"[UNUSED] {path} (Patterns: {patterns})")

if __name__ == "__main__":
    main()
