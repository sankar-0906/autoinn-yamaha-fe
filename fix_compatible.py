import os
import re

directory = '/home/sankar/Documents/Yamaha Depot/frontend/src/components/CompanyMasters/Company/SupplierMaster'

def fix_compatible_form(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Check if Form.create is used
    if 'Form.create' in content or 'getFieldDecorator' in content:
        # Move Form from antd to @ant-design/compatible
        
        # If Form is in a multi-line import from antd:
        # import {
        #   Form, ...
        # } from 'antd';
        
        if "from 'antd'" in content:
            # Remove Form from antd import
            content = re.sub(r'Form,\s*', '', content)
            content = re.sub(r',\s*Form\b', '', content)
            
            # Add compatible import
            if "import { Form } from '@ant-design/compatible';" not in content:
                content = "import { Form } from '@ant-design/compatible';\n" + content

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            fix_compatible_form(os.path.join(root, file))

print("Fixed compatible form imports")
