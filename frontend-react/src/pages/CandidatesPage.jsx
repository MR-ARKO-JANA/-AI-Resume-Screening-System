import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import '../styles/candidates-ultra.css';

const CandidatesPage = () => {
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const data = await api.get('/getallcandidates');
                if (data && !data.error && data.candidates) {
                    setCandidates(data.candidates);
                    setFilteredCandidates(data.candidates);
                } else {
                    setToast({ message: data.error || 'Failed to load candidates', type: 'error' });
                }
            } catch (err) {
                setToast({ message: err.message, type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    useEffect(() => {
        let result = candidates;
        
        if (filter !== 'All') {
            result = result.filter(c => c.status === filter);
        }
        
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c => 
                (c.fileName && c.fileName.toLowerCase().includes(lowerTerm)) ||
                (c.candidateName && c.candidateName.toLowerCase().includes(lowerTerm)) ||
                (c.jobTitle && c.jobTitle.toLowerCase().includes(lowerTerm))
            );
        }
        
        setFilteredCandidates(result);
    }, [filter, searchTerm, candidates]);

    const handleExport = async () => {
        try {
            const response = await fetch('/api/export-csv');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'candidates-export.csv';
                a.click();
            }
        } catch (error) {
            setToast({ message: 'Export failed: ' + error.message, type: 'error' });
        }
    };

    const getScoreColor = (score) => {
        if (score >= 75) return 'var(--success-color, #10b981)';
        if (score >= 50) return 'var(--warning-color, #f59e0b)';
        return 'var(--danger-color, #ef4444)';
    };

    if (loading) return <Loader text="Loading Candidates..." />;

    return (
        <div className="candidates-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            <header className="page-header stagger-1">
                <div>
                    <h1>Candidate Database</h1>
                    <p>Manage and track all screened applicants</p>
                </div>
                <div className="header-actions">
                    <button className="secondary-btn" onClick={handleExport}>
                        <i className="fa-solid fa-file-csv"></i> Export CSV
                    </button>
                    <button className="primary-btn pulse-animation">
                        <i className="fa-solid fa-plus"></i> Invite Candidate
                    </button>
                </div>
            </header>

            <div className="filters-section glass-panel stagger-2">
                <div className="search-box">
                    <i className="fa-solid fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name, file, or job..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-pills">
                    {['All', 'Shortlisted', 'Pending', 'Rejected'].map(status => (
                        <button 
                            key={status}
                            className={`filter-pill ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="candidates-table-container glass-panel stagger-3">
                <table className="candidates-table">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Job Role</th>
                            <th>Match Score</th>
                            <th>Status</th>
                            <th>Experience</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCandidates.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="empty-state">
                                        <i className="fa-solid fa-users-slash"></i>
                                        <p>No candidates found matching your criteria</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCandidates.map((candidate, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="candidate-info">
                                            <div className="avatar">
                                                {candidate.candidateName ? candidate.candidateName.charAt(0) : 'U'}
                                            </div>
                                            <div>
                                                <strong>{candidate.candidateName || candidate.fileName}</strong>
                                                <span>{candidate.fileName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{candidate.jobTitle || 'Unknown Job'}</td>
                                    <td>
                                        <div className="score-badge" style={{ backgroundColor: `${getScoreColor(candidate.matchScore)}20`, color: getScoreColor(candidate.matchScore), border: `1px solid ${getScoreColor(candidate.matchScore)}` }}>
                                            <i className="fa-solid fa-bolt"></i> {candidate.matchScore}%
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${candidate.status.toLowerCase()}`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td>{candidate.experience}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="icon-btn tooltip" data-tooltip="View Details" onClick={() => setSelectedCandidate(candidate)}>
                                                <i className="fa-regular fa-eye"></i>
                                            </button>
                                            <a href={`/uploads/${candidate.fileName}`} target="_blank" rel="noreferrer" className="icon-btn tooltip" data-tooltip="Download Resume">
                                                <i className="fa-solid fa-download"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal for detailed view */}
            {selectedCandidate && (
                <div className="modal-overlay active" onClick={() => setSelectedCandidate(null)}>
                    <div className="modal-content glass-panel active" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header">
                            <h2>Candidate Details</h2>
                            <button className="close-btn" onClick={() => setSelectedCandidate(null)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <h3>Information</h3>
                                    <p><strong>Name:</strong> {selectedCandidate.candidateName || selectedCandidate.fileName}</p>
                                    <p><strong>Job:</strong> {selectedCandidate.jobTitle}</p>
                                    <p><strong>Experience:</strong> {selectedCandidate.experience}</p>
                                    <p><strong>Status:</strong> <span className={`status-badge ${selectedCandidate.status.toLowerCase()}`}>{selectedCandidate.status}</span></p>
                                    <p><strong>Match Score:</strong> {selectedCandidate.matchScore}%</p>
                                </div>
                                <div>
                                    <h3>Social Profiles</h3>
                                    <p>
                                        <i className="fa-brands fa-linkedin"></i> 
                                        {selectedCandidate.linkedinUrl ? <a href={selectedCandidate.linkedinUrl} target="_blank" rel="noreferrer"> View LinkedIn</a> : ' Not found'}
                                    </p>
                                    <p>
                                        <i className="fa-brands fa-github"></i> 
                                        {selectedCandidate.githubUrl ? <a href={selectedCandidate.githubUrl} target="_blank" rel="noreferrer"> View GitHub</a> : ' Not found'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidatesPage;
