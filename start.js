// Root Entry Point Launcher for Render & Local Environments
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'backend/server.js'))) {
    require('./backend/server.js');
} else if (fs.existsSync(path.join(__dirname, 'server.js'))) {
    require('./server.js');
} else {
    console.error('Could not locate server.js entry point');
    process.exit(1);
}
