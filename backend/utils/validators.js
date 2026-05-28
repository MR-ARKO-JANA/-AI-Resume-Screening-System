// Input validation helpers for API endpoints
const validators = {
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidObjectId(id) {
        return /^[0-9a-fA-F]{24}$/.test(id);
    },

    sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/[<>]/g, '');
    },

    isValidPassword(password) {
        return typeof password === 'string' && password.length >= 6;
    },

    isValidJobSource(source) {
        const validSources = ['Indeed', 'Naukri', 'Unstop', 'Manual', 'All'];
        return validSources.includes(source);
    }
};

module.exports = validators;
