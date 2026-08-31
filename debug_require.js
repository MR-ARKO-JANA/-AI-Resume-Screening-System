const fs = require('fs');
const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function(path, options) {
    try {
        return originalReadFileSync.apply(this, arguments);
    } catch (e) {
        console.error('FAILED TO READ FILE:', path);
        throw e;
    }
};

try {
    require('./backend/server.js');
} catch (e) {
    console.error('Caught error during require:', e);
}
