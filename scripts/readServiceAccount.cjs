const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');
const serviceAccountRaw = fs.readFileSync(serviceAccountPath, 'utf8');

console.log(serviceAccountRaw);
