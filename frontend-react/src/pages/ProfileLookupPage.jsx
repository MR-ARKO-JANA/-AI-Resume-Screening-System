import React, { useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import '../styles/profile-lookup.css';

const ProfileLookupPage = () => {
    const [lookupType, setLookupType] = useState('github');
    const [username, setUsername] = useState('');
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            setToast({ message: 'Please enter a username', type: 'warning' });
            return;
        }

        setLoading(true);
        setProfileData(null);
        setToast({ message: '', type: '' });

        try {
            const data = await api.post('/profile-lookup', {
                type: lookupType,
                username: username.trim()
            });

            if (data.error) {
                setToast({ message: data.error, type: 'error' });
            } else if (data.success && data.data) {
                setProfileData(data.data);
            }
        } catch (error) {
            setToast({ message: 'Lookup failed: ' + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-lookup-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            <header className="page-header stagger-1">
                <div>
                    <h1>Developer Profile Analyzer</h1>
                    <p>Deep dive into GitHub & LinkedIn profiles to evaluate candidate skills and impact.</p>
                </div>
            </header>

            <div className="lookup-controls glass-panel stagger-2">
                <div className="platform-toggle">
                    <button 
                        className={`toggle-btn ${lookupType === 'github' ? 'active' : ''}`}
                        onClick={() => setLookupType('github')}
                    >
                        <i className="fa-brands fa-github"></i> GitHub
                    </button>
                    <button 
                        className={`toggle-btn ${lookupType === 'linkedin' ? 'active' : ''}`}
                        onClick={() => setLookupType('linkedin')}
                    >
                        <i className="fa-brands fa-linkedin"></i> LinkedIn
                    </button>
                </div>

                <form className="search-form" onSubmit={handleLookup}>
                    <div className="input-group">
                        <span className="input-prefix">
                            {lookupType === 'github' ? 'github.com/' : 'linkedin.com/in/'}
                        </span>
                        <input 
                            type="text" 
                            placeholder={`Enter ${lookupType} username`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="primary-btn" disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze Profile'}
                    </button>
                </form>
            </div>

            {loading && (
                <div className="loading-state glass-panel stagger-3" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="hexagon-loader" style={{ transform: 'scale(0.5)' }}>
                        <div className="hexagon"></div>
                        <div className="hexagon"></div>
                        <div className="hexagon"></div>
                    </div>
                    <p>Fetching and analyzing {lookupType} data...</p>
                </div>
            )}

            {profileData && lookupType === 'github' && (
                <div className="github-results glass-panel stagger-3">
                    <div className="profile-header">
                        <img src={profileData.avatar_url || '/user_img.webp'} alt="Avatar" className="profile-avatar" />
                        <div className="profile-info">
                            <h2>{profileData.name || profileData.login}</h2>
                            <a href={profileData.html_url} target="_blank" rel="noreferrer">@{profileData.login}</a>
                            <p>{profileData.bio}</p>
                        </div>
                        <div className="profile-stats-mini">
                            <div className="stat">
                                <strong>{profileData.public_repos}</strong>
                                <span>Repos</span>
                            </div>
                            <div className="stat">
                                <strong>{profileData.followers}</strong>
                                <span>Followers</span>
                            </div>
                        </div>
                    </div>
                    {profileData.aiAnalysis && (
                        <div className="ai-summary" style={{ marginTop: '20px' }}>
                            <h3><i className="fa-solid fa-wand-magic-sparkles"></i> AI Summary</h3>
                            <p>{profileData.aiAnalysis}</p>
                        </div>
                    )}
                </div>
            )}

            {profileData && lookupType === 'linkedin' && (
                <div className="linkedin-results glass-panel stagger-3">
                    <div className="profile-header">
                        <div className="profile-info">
                            <h2>{profileData.fullName}</h2>
                            <p>{profileData.headline}</p>
                            {profileData.location && <p><i className="fa-solid fa-location-dot"></i> {profileData.location}</p>}
                        </div>
                    </div>
                    {profileData.about && (
                        <div className="profile-section">
                            <h3>About</h3>
                            <p>{profileData.about}</p>
                        </div>
                    )}
                    {profileData.aiAnalysis && (
                        <div className="ai-summary" style={{ marginTop: '20px' }}>
                            <h3><i className="fa-solid fa-wand-magic-sparkles"></i> AI Summary</h3>
                            <p>{profileData.aiAnalysis}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileLookupPage;
