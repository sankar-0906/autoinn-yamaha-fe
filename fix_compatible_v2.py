import os
import re

directory = '/home/sankar/Documents/Yamaha Depot/frontend/src/components/CompanyMasters/Company/SupplierMaster'

def fix_compatible_form(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match both Form.create and getFieldDecorator (legacy AntD 3)
    if 'Form.create' in content or 'getFieldDecorator' in content:
        # 1. Remove Form from antd import (handles single/double quotes and multi-line)
        # Using a more robust regex to find Form in any antd import block
        content = re.sub(r'import\s+{\s*([^}]*?)\bForm\b\s*,?\s*([^}]*?)\s*}\s*from\s*[\'"]antd[\'"];', 
                         r"import { \1 \2 } from 'antd';", content, flags=re.DOTALL)
        
        # Cleanup extra commas resulting from removal
        content = re.sub(r'{\s*,', '{', content)
        content = re.sub(r',\s*,', ',', content)
        content = re.sub(r',\s*}', ' }', content)
        
        # 2. Add compatible import if not present
        if "from '@ant-design/compatible'" not in content:
            if 'import React' in content:
                content = re.sub(r'(import React.*?\n)', r"\1import { Form } from '@ant-design/compatible';\n", content)
            else:
                content = "import { Form } from '@ant-design/compatible';\n" + content

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            fix_compatible_form(os.path.join(root, file))

print("Fixed compatible form imports v2")
