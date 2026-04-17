import os
import re

directory = '/home/sankar/Documents/Yamaha Depot/frontend/src/components/CompanyMasters/Company/SupplierMaster'

def cleanup_final(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove antd/lib/form/FormItem import
    content = re.sub(r"import FormItem from 'antd/lib/form/FormItem';\n?", "", content)
    
    # 2. Replace FormItem with Form.Item
    content = content.replace("<FormItem", "<Form.Item")
    content = content.replace("</FormItem", "</Form.Item")
    
    # 3. Double check for any leftover Icon (the old one)
    # Actually, we mostly did this, but let's be sure.
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            cleanup_final(os.path.join(root, file))

print("Final cleanup done")
