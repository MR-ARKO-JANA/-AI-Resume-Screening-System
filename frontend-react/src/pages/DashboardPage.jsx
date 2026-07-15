import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import Toast from '../components/Toast';
import '../styles/dashboard-ultra.css';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalResumes: 0,
        shortlisted: 0,
        rejected: 0,
        avgScore: 0
    });
    const [recentCandidates, setRecentCandidates] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [jobDesc, setJobDesc] = useState('');
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await api.get('/dashboard-stats');
                if (data && !data.error) {
                    setStats({
                        totalResumes: data.totalResumes || 0,
                        shortlisted: data.shortlisted || 0,
                        rejected: data.rejected || 0,
                        avgScore: data.avgScore || 0
                    });
                }

                const candidatesData = await api.get('/getallcandidates');
                if (candidatesData && !candidatesData.error && candidatesData.candidates) {
                    // Show only top 5 recent candidates
                    setRecentCandidates(candidatesData.candidates.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoadingStats(false);
            }
        };

        fetchDashboardData();
    }, []);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
    };

    const handleUpload = async (files) => {
        if (!jobDesc.trim()) {
            showToast("Please enter a job description first.", "warning");
            return;
        }

        const formData = new FormData();
        formData.append('jobDesc', jobDesc);
        files.forEach(file => {
            formData.append('doc', file);
        });

        setUploading(true);
        try {
            const result = await api.postFormData('/resumedata', formData);
            if (result.error) {
                showToast(result.error);
            } else if (result.success) {
                navigate(result.redirectTo);
            }
        } catch (error) {
            showToast("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="dashboard-content">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            <header className="page-header">
                <div>
                    <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
                    <p>Here's what's happening with your hiring process today.</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn pulse-animation" onClick={() => document.getElementById('jobDescInput').focus()}>
                        <i className="fa-solid fa-plus"></i> New Screening
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card glass-panel stagger-1">
                    <div className="stat-icon primary">
                        <i className="fa-solid fa-file-lines"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Resumes</h3>
                        <h2>{loadingStats ? '...' : stats.totalResumes}</h2>
                        <span className="trend positive"><i className="fa-solid fa-arrow-trend-up"></i> +12% this week</span>
                    </div>
                </div>
                <div className="stat-card glass-panel stagger-2">
                    <div className="stat-icon success">
                        <i className="fa-solid fa-user-check"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Shortlisted</h3>
                        <h2>{loadingStats ? '...' : stats.shortlisted}</h2>
                        <span className="trend positive"><i className="fa-solid fa-arrow-trend-up"></i> +5% this week</span>
                    </div>
                </div>
                <div className="stat-card glass-panel stagger-3">
                    <div className="stat-icon warning">
                        <i className="fa-solid fa-star-half-stroke"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Avg Match Score</h3>
                        <h2>{loadingStats ? '...' : `${stats.avgScore}%`}</h2>
                        <span className="trend neutral"><i className="fa-solid fa-minus"></i> Stable</span>
                    </div>
                </div>
                <div className="stat-card glass-panel stagger-4">
                    <div className="stat-icon danger">
                        <i className="fa-solid fa-user-xmark"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Rejected</h3>
                        <h2>{loadingStats ? '...' : stats.rejected}</h2>
                        <span className="trend negative"><i className="fa-solid fa-arrow-trend-down"></i> -2% this week</span>
                    </div>
                </div>
            </div>

            <div className="main-grid">
                {/* Upload Section */}
                <div className="upload-section glass-panel stagger-1">
                    <div className="section-header">
                        <h2>New Candidate Screening</h2>
                        <span className="badge new">Powered by Gemini AI</span>
                    </div>
                    
                    <div className="job-desc-input">
                        <label>Job Description / Requirements <span className="required">*</span></label>
                        <textarea 
                            id="jobDescInput"
                            placeholder="Paste the job description here. The AI will evaluate resumes against these requirements..."
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                        ></textarea>
                        <div className="textarea-footer">
                            <small><i className="fa-solid fa-circle-info"></i> Be specific for better AI accuracy</small>
                            <button className="text-btn">Use Template</button>
                        </div>
                    </div>

                    <FileUpload onUpload={handleUpload} />

                    {uploading && (
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <div className="hexagon-loader" style={{ transform: 'scale(0.5)' }}>
                                <div className="hexagon"></div>
                                <div className="hexagon"></div>
                                <div className="hexagon"></div>
                            </div>
                            <p>Analyzing resumes with AI...</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="recent-activity glass-panel stagger-2">
                    <div className="section-header">
                        <h2>Recent Screenings</h2>
                        <button className="text-btn" onClick={() => navigate('/candidates')}>View All</button>
                    </div>
                    
                    <div className="activity-list">
                        {loadingStats ? (
                            <p>Loading...</p>
                        ) : recentCandidates.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa-solid fa-folder-open"></i>
                                <p>No recent screenings</p>
                            </div>
                        ) : (
                            recentCandidates.map((candidate, index) => (
                                <div className="activity-item" key={index}>
                                    <div className="activity-icon">
                                        <i className="fa-regular fa-file-pdf"></i>
                                    </div>
                                    <div className="activity-details">
                                        <h4>{candidate.fileName}</h4>
                                        <p>{candidate.jobTitle || 'Unknown Job'}</p>
                                    </div>
                                    <div className="activity-status">
                                        <span className={`status-badge ${candidate.status.toLowerCase()}`}>
                                            {candidate.status}
                                        </span>
                                        <span className="score">{candidate.matchScore}%</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
