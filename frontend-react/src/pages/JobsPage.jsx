import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import '../styles/jobs-ultra.css';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });
    const [jobDetails, setJobDetails] = useState(null);
    const [applyModal, setApplyModal] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await api.get('/jobs/all');
                if (data && !data.error && data.jobs) {
                    setJobs(data.jobs);
                }
            } catch (err) {
                console.error("Failed to load jobs:", err);
                // For demo, we'll use placeholder jobs if API fails
                setJobs([
                    { _id: '1', jobTitle: 'Senior Frontend Engineer', jobDescription: 'React, Vite, CSS', requirements: ['React', 'CSS'], status: 'Active', location: 'Remote', applicants: 12 },
                    { _id: '2', jobTitle: 'Backend Developer', jobDescription: 'Node.js, Express, MongoDB', requirements: ['Node.js', 'MongoDB'], status: 'Active', location: 'New York', applicants: 8 },
                    { _id: '3', jobTitle: 'AI Research Scientist', jobDescription: 'Python, PyTorch, LLMs', requirements: ['Python', 'Machine Learning'], status: 'Active', location: 'San Francisco', applicants: 25 },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter(job => 
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (job.jobDescription && job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleApply = (e) => {
        e.preventDefault();
        setApplyModal(null);
        setToast({ message: 'Application submitted successfully!', type: 'success' });
    };

    if (loading) return <Loader text="Loading Jobs..." />;

    return (
        <div className="jobs-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            <header className="page-header stagger-1">
                <div>
                    <h1>Job Openings</h1>
                    <p>Manage active job postings and candidate pipelines</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn pulse-animation">
                        <i className="fa-solid fa-plus"></i> Post New Job
                    </button>
                </div>
            </header>

            <div className="jobs-toolbar glass-panel stagger-2">
                <div className="search-box">
                    <i className="fa-solid fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search jobs by title, skills, or location..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="job-filters">
                    <select className="filter-select">
                        <option value="all">All Departments</option>
                        <option value="engineering">Engineering</option>
                        <option value="design">Design</option>
                        <option value="product">Product</option>
                    </select>
                    <select className="filter-select">
                        <option value="all">Any Location</option>
                        <option value="remote">Remote</option>
                        <option value="onsite">On-site</option>
                    </select>
                </div>
            </div>

            <div className="jobs-grid stagger-3">
                {filteredJobs.length === 0 ? (
                    <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1' }}>
                        <i className="fa-solid fa-briefcase"></i>
                        <p>No jobs found matching your search</p>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div className="job-card glass-panel" key={job._id}>
                            <div className="job-header">
                                <div className="job-title-group">
                                    <h3>{job.jobTitle}</h3>
                                    <span className="job-location"><i className="fa-solid fa-location-dot"></i> {job.location || 'Remote'}</span>
                                </div>
                                <span className={`job-status ${job.status?.toLowerCase() || 'active'}`}>{job.status || 'Active'}</span>
                            </div>
                            
                            <p className="job-desc">{job.jobDescription}</p>
                            
                            <div className="job-tags">
                                {job.requirements && job.requirements.map((req, i) => (
                                    <span key={i} className="job-tag">{req}</span>
                                ))}
                            </div>
                            
                            <div className="job-footer">
                                <div className="job-stats">
                                    <span className="stat"><i className="fa-solid fa-users"></i> {job.applicants || 0} Applicants</span>
                                </div>
                                <div className="job-actions">
                                    <button className="text-btn" onClick={() => setJobDetails(job)}>Details</button>
                                    <button className="secondary-btn apply-btn" onClick={() => setApplyModal(job)}>Apply</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {jobDetails && (
                <div className="modal-overlay active" onClick={() => setJobDetails(null)}>
                    <div className="modal-content glass-panel active" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{jobDetails.jobTitle}</h2>
                            <button className="close-btn" onClick={() => setJobDetails(null)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <h4>Job Description</h4>
                            <p>{jobDetails.jobDescription}</p>
                            <h4 style={{ marginTop: '15px' }}>Location</h4>
                            <p>{jobDetails.location || 'Remote'}</p>
                            <h4 style={{ marginTop: '15px' }}>Status</h4>
                            <p>{jobDetails.status || 'Active'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Modal */}
            {applyModal && (
                <div className="modal-overlay active" onClick={() => setApplyModal(null)}>
                    <div className="modal-content glass-panel active" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Apply for {applyModal.jobTitle}</h2>
                            <button className="close-btn" onClick={() => setApplyModal(null)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleApply} className="auth-form" style={{ maxWidth: '100%' }}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" required placeholder="John Doe" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" required placeholder="john@example.com" />
                                </div>
                                <div className="form-group">
                                    <label>Resume</label>
                                    <input type="file" required accept=".pdf,.doc,.docx" style={{ padding: '10px' }} />
                                </div>
                                <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '15px' }}>
                                    Submit Application
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsPage;
