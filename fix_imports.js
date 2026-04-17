const fs = require('fs');
const path = require('path');

const dir = '/home/sankar/Documents/Yamaha Depot/frontend/src/components/CompanyMasters/Company/SupplierMaster';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace platformApi import with axiosInstance
    content = content.replace(/import \{ platformApi \} from ['"](.*?)api['"];/g, 'import axiosInstance from "../../../../api/axiosInstance";');
    content = content.replace(/platformApi\./g, 'axiosInstance.');
    
    // Replace ContextAPI logic
    content = content.replace(/import \{ ContextAPI \} from ['"].*?ContextAPI['"];/g, '');
    content = content.replace(/const \{ loginCredintials \} = useContext\(ContextAPI\);?/g, '');
    content = content.replace(/loginCredintials\.roleAccess\s*&&\s*loginCredintials\.roleAccess\.map[^{]*{/g, 'if (false) {');
    
    // Default Access to True
    content = content.replace(/const \[createAccess, setCreateAccess\] = useState\(false\);/g, 'const [createAccess, setCreateAccess] = useState(true);');
    content = content.replace(/const \[modifyAccess, setModifyAccess\] = useState\(false\)/g, 'const [modifyAccess, setModifyAccess] = useState(true)');
    content = content.replace(/const \[deleteAccess, setDeleteAccess\] = useState\(false\)/g, 'const [deleteAccess, setDeleteAccess] = useState(true)');

    // Fix context in SupplierMaster / Contacts
    content = content.replace(/import \{ callContext \} from ['"].*?App['"];/g, '');
    content = content.replace(/const \{ setMobileNumber \} = useContext\(callContext\);/g, '');
    
    // Remove Piopiy
    content = content.replace(/import \{ piopiy, piopiyDialUser \} from ['"].*?piopiy['"];/g, '');
    content = content.replace(/const telecmiUser = localStorage\.getItem\("selectedTelecmiUserId"\);/, '');
    
    // We will just replace the onClick of the phone icon to do nothing or open tel://
    content = content.replace(/onClick=\{\(event\) => \{.*?\/\/ Supplier Contact".*?\}\}/gs, 'onClick={(event) => { event.stopPropagation(); window.location.href = `tel:+91${record}`; }}');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

traverse(dir);
console.log('Done fixing imports and context');
