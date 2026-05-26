const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'client', 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace `--var: hsl(X Y% Z%);` with `--var: X Y% Z%;`
css = css.replace(/--([a-zA-Z0-9-]+):\s*hsl\(([^)]+)\);/g, '--$1: $2;');

fs.writeFileSync(cssPath, css);

const twPath = path.join(__dirname, 'tailwind.config.ts');
let tw = fs.readFileSync(twPath, 'utf8');

tw = tw.replace(/:\s*"var\(--([a-zA-Z0-9-]+)\)"/g, ': "hsl(var(--$1) / <alpha-value>)"');

fs.writeFileSync(twPath, tw);

console.log("Done fixing css and tailwind config");
