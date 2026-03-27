#!/usr/bin/env python3
"""
Script untuk convert familyData.ts dari string ID ke integer ID
"""
import re
import json

# Read file
with open('src/data/familyData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract array content
match = re.search(r'export const familyData: FamilyMember\[\] = \[(.*)\];', content, re.DOTALL)
if not match:
    print("❌ Tidak bisa parse familyData!")
    exit(1)

array_content = '[' + match.group(1) + ']'

# Convert TypeScript object to JSON
json_content = array_content
# Replace single quotes with double quotes
json_content = json_content.replace("'", '"')
# Fix undefined values
json_content = json_content.replace('undefined', 'null')

try:
    members = json.loads(json_content)
except json.JSONDecodeError as e:
    print(f"❌ JSON Parse Error: {e}")
    exit(1)

print(f"✅ Berhasil parse {len(members)} members\n")

# Create ID mapping
id_mapping = {}
for idx, member in enumerate(members, 1):
    old_id = member.get('id')
    if old_id:
        id_mapping[old_id] = idx

print(f"📌 Total ID mappings: {len(id_mapping)}\n")

# Sample mappings
print("Sample ID Mappings:")
print(f"  father-1 → {id_mapping.get('father-1')}")
print(f"  mother-1 → {id_mapping.get('mother-1')}")
print(f"  masduha-9-1 → {id_mapping.get('masduha-9-1')}")
print(f"  masduha-9-1-1 → {id_mapping.get('masduha-9-1-1')}\n")

# Convert members
converted_members = []
for member in members:
    converted = {}
    
    # Convert ID
    old_id = member.get('id')
    converted['id'] = id_mapping.get(old_id, 0)
    
    # Basic fields
    for field in ['name', 'arabicName', 'birth', 'death', 'gender', 'generation', 'status', 'address', 'description', 'childNumber']:
        if field in member and member[field] is not None:
            converted[field] = member[field]
    
    # Handle parentIds
    parent_ids = []
    if member.get('parentIds') and isinstance(member['parentIds'], list):
        parent_ids = [id_mapping.get(p_id) for p_id in member['parentIds'] if p_id in id_mapping]
    elif member.get('parentId') and member['parentId'] in id_mapping:
        parent_ids = [id_mapping[member['parentId']]]
    
    if parent_ids:
        converted['parentIds'] = parent_ids
    
    # Handle spouse
    if member.get('spouseName') or member.get('spouse'):
        spouse_obj = {}
        if isinstance(member.get('spouse'), dict):
            spouse_obj = member['spouse'].copy()
        if member.get('spouseName'):
            spouse_obj['name'] = member['spouseName']
        if spouse_obj:
            converted['spouse'] = spouse_obj
    
    converted_members.append(converted)

# Save converted data
output = {
    'metadata': {
        'totalMembers': len(converted_members),
        'convertedDate': '2026-03-27',
    },
    'idMapping': id_mapping,
    'members': converted_members
}

with open('family-data-converted.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print("✅ Conversion complete!")
print(f"📁 File saved: family-data-converted.json\n")

# Statistics
gen_stats = {}
for m in converted_members:
    gen = m.get('generation', -1)
    gen_stats[gen] = gen_stats.get(gen, 0) + 1

print("📊 Generation Statistics:")
for gen in sorted(gen_stats.keys()):
    print(f"   Generation {gen}: {gen_stats[gen]} members")

# Show sample conversions
print(f"\n🔍 Sample Converted Members:")
for m in converted_members[:3]:
    parents = ', '.join(str(p) for p in m.get('parentIds', []))
    print(f"   ID: {m['id']:3d}, Name: {m['name']:30s}, Gen: {m['generation']}, Parents: [{parents}]")
