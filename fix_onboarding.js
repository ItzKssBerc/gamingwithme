const fs = require('fs');
let code = fs.readFileSync('app/onboarding/page.tsx', 'utf8');

code = code.replace(/\{\[1, 2, 3, 4\]\.map/g, '{[1, 2, 3].map');
code = code.replace(/Step \{currentStep\} of 4/g, 'Step {currentStep} of 3');
code = code.replace(/step < 4 && \(/g, 'step < 3 && (');

const step3Start = code.indexOf('{currentStep === 3 && (');
const step4Start = code.indexOf('{currentStep === 4 && (');
if (step3Start !== -1 && step4Start !== -1) {
    code = code.substring(0, step3Start) + code.substring(step4Start);
}

code = code.replace(/\{currentStep === 4 && \(/g, '{currentStep === 3 && (');

code = code.replace(/Math\.min\(4, prev \+ 1\)/g, 'Math.min(3, prev + 1)');
code = code.replace(/if \(currentStep === 4\)/g, 'if (currentStep === 3)');
code = code.replace(/currentStep === 4 \?/g, 'currentStep === 3 ?');

// Remove Languages and Tags from Review Step
code = code.replace(/\{\/\* Languages \*\/\}[\s\S]*?(?=<\/CardContent>)/g, '');

fs.writeFileSync('app/onboarding/page.tsx', code);
console.log("Onboarding updated");
