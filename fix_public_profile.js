const fs = require('fs');
let code = fs.readFileSync('app/profile/[username]/page.tsx', 'utf8');

code = code.replace(/\{\/\* Languages \*\/\}[\s\S]*?(?=\{\/\* Tags \*\/\}|\{\/\* Member Since \*\/\}|<\/CardContent>)/g, '');
code = code.replace(/\{\/\* Tags \*\/\}[\s\S]*?(?=\{\/\* Member Since \*\/\}|<\/CardContent>)/g, '');
code = code.replace(/<div className="flex items-center justify-between">\s*<span className="text-gray-400">Languages<\/span>[\s\S]*?<\/div>/g, '');

fs.writeFileSync('app/profile/[username]/page.tsx', code);
console.log('Public profile Languages and Tags sections removed');
