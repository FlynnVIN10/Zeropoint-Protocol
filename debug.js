const path = require('path');
const fs = require('fs');

console.log('Script starting...');
console.log('__dirname:', __dirname);
console.log('Looking for file at:', path.join(__dirname, '../DEPLOYMENT_STATUS.md'));
console.log('File exists:', fs.existsSync(path.join(__dirname, '../DEPLOYMENT_STATUS.md')));
console.log('Current directory files:', fs.readdirSync(__dirname)); 