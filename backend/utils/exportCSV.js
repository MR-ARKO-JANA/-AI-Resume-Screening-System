/**
 * Export candidates data to CSV format
 */
function exportToCSV(candidates) {
    // CSV Headers
    const headers = ['#', 'Resume Name', 'Match Score', 'Status', 'Experience', 'AI Confidence', 'Upload Date', 'Job Title'];
    
    // Convert candidates to CSV rows
    const rows = candidates.map((candidate, index) => [
        index + 1,
        `"${candidate.fileName}"`,
        candidate.matchScore + '%',
        candidate.status,
        candidate.experience || 'N/A',
        candidate.aiConfidence + '%',
        new Date(candidate.uploadDate).toLocaleDateString(),
        `"${candidate.jobTitle || 'N/A'}"`
    ]);
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
}

module.exports = { exportToCSV };
