// Request Logger Middleware - Logs incoming HTTP requests

module.exports = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
