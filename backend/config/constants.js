// Application-wide constants
const CONSTANTS = {
    // Scoring thresholds
    SCORE_SHORTLISTED: 75,
    SCORE_PENDING: 50,

    // File upload limits
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_FILE_TYPES: ['.pdf'],

    // Job sources
    JOB_SOURCES: ['Indeed', 'Naukri', 'Unstop', 'Manual'],

    // Pagination defaults
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // AI confidence bounds
    MIN_CONFIDENCE: 60,
    MAX_CONFIDENCE: 98,

    // Status values
    STATUSES: {
        SHORTLISTED: 'Shortlisted',
        PENDING: 'Pending',
        REJECTED: 'Rejected'
    }
};

module.exports = CONSTANTS;
