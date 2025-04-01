
// This is a temporary script to read and output the skills-globe.js content
const fs = require('fs');
const path = require('path');

try {
  const content = fs.readFileSync(path.join(__dirname, 'src', 'utils', 'skills-globe.js'), 'utf8');
  console.log(content);
} catch (err) {
  console.error('Error reading file:', err);
}
