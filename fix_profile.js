const fs = require('fs');
let code = fs.readFileSync('app/profile/page.tsx', 'utf8');

code = code.replace(/\{\/\* Languages Section \*\/\}[\s\S]*?<\/Card>/g, '');
code = code.replace(/\{\/\* Tags Section \*\/\}[\s\S]*?<\/Card>/g, '');

fs.writeFileSync('app/profile/page.tsx', code);
console.log('Profile page Languages and Tags sections removed');
