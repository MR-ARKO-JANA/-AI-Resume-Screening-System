import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import html2pdf from 'html2pdf.js';
import Loader from '../components/Loader';
import '../styles/result-ultra.css';

const ResultPage = () => {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestResult = async () => {
            try {
                const data = await api.get('/getlatestresult');
                if (data && !data.error) {
                    setResult(data);
                } else {
                    setError(data.error || "No results found");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestResult();
    }, []);

    const downloadPDF = () => {
        const element = document.getElementById('report-content');
        if (!element) return;
        
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `AI_Analysis_${result?.fileName || 'Resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    if (loading) return <Loader text="Loading AI Analysis..." />;

    if (error || !result) {
        return (
            <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>No Results Found</h2>
                <p>{error}</p>
                <button className="primary-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    const formatAnalysis = (text) => {
        if (!text) return null;
        const paragraphs = text.split('\n\n').filter(p => p.trim() !== '');
        return paragraphs.map((p, index) => {
            if (p.includes('**')) {
                const formatted = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return <p key={index} dangerouslySetInnerHTML={{ __html: formatted }}></p>;
            }
            if (p.startsWith('-')) {
                return <li key={index}>{p.substring(1).trim()}</li>;
            }
            return <p key={index}>{p}</p>;
        });
    };

    const getScoreColor = (score) => {
        if (score >= 75) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const renderSkillBars = (skills) => {
        if (!skills || skills.length === 0) return <p>No skills found.</p>;
        return skills.map((skill, index) => (
            <div className="skill-item" key={index}>
                <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-match">{skill.match}%</span>
                </div>
                <div className="skill-bar-bg">
                    <div 
                        className="skill-bar-fill" 
                        style={{ 
                            width: `${skill.match}%`, 
                            backgroundColor: getScoreColor(skill.match) 
                        }}
                    ></div>
                </div>
            </div>
        ));
    };

    return (
        <div className="result-container" id="report-content">
            <header className="result-header glass-panel stagger-1">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/dashboard')} data-html2canvas-ignore="true">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1>AI Resume Analysis</h1>
                        <p className="subtitle">
                            File: <strong>{result.fileName}</strong> | 
                            Status: <span className={`status-badge ${result.status.toLowerCase()}`}>{result.status}</span>
                        </p>
                    </div>
                </div>
                <div className="header-actions" data-html2canvas-ignore="true">
                    <button className="secondary-btn" onClick={downloadPDF}>
                        <i className="fa-solid fa-download"></i> Download Report
                    </button>
                    <button className="primary-btn" onClick={() => navigate('/candidates')}>
                        <i className="fa-solid fa-users"></i> View All Candidates
                    </button>
                </div>
            </header>

            <div className="main-content-grid">
                {/* Left Column */}
                <div className="left-column">
                    <div className="score-card glass-panel stagger-2">
                        <h3>Match Score</h3>
                        <div className="score-circle-wrapper">
                            <svg className="score-circle" viewBox="0 0 100 100">
                                <circle className="circle-bg" cx="50" cy="50" r="45"></circle>
                                <circle 
                                    className="circle-progress" 
                                    cx="50" cy="50" r="45" 
                                    style={{ 
                                        strokeDashoffset: 283 - (283 * result.matchScore) / 100,
                                        stroke: getScoreColor(result.matchScore)
                                    }}
                                ></circle>
                            </svg>
                            <div className="score-text">
                                <span className="score-number">{result.matchScore}%</span>
                                <span className="score-label">Match</span>
                            </div>
                        </div>
                        <div className="score-details">
                            <div className="detail-item">
                                <i className="fa-solid fa-robot"></i>
                                <span>AI Confidence: {result.aiConfidence}%</span>
                            </div>
                            <div className="detail-item">
                                <i className="fa-solid fa-briefcase"></i>
                                <span>Experience: {result.experience}</span>
                            </div>
                        </div>
                    </div>

                    <div className="skills-card glass-panel stagger-3">
                        <h3>Skills Match</h3>
                        <div className="skills-list">
                            {renderSkillBars(result.skills)}
                        </div>
                    </div>
                    
                    {/* Scoring Breakdown */}
                    {result.scoringBreakdown && (
                        <div className="breakdown-card glass-panel stagger-4">
                            <h3>Score Breakdown</h3>
                            <div className="breakdown-item">
                                <span>Skills Match (40%):</span>
                                <strong>{result.scoringBreakdown.skillsMatch}/40</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Experience (30%):</span>
                                <strong>{result.scoringBreakdown.experienceRelevance}/30</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Education (20%):</span>
                                <strong>{result.scoringBreakdown.educationMatch}/20</strong>
                            </div>
                            <div className="breakdown-item">
                                <span>Keyword Match (10%):</span>
                                <strong>{result.scoringBreakdown.keywordMatch}/10</strong>
                            </div>
                            {result.explanation && (
                                <div className="breakdown-explanation" style={{marginTop: '15px', fontSize: '14px', color: 'var(--text-muted)'}}>
                                    <p><em>{result.explanation}</em></p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="right-column">
                    <div className="analysis-card glass-panel stagger-4">
                        <div className="card-header">
                            <h3><i className="fa-solid fa-wand-magic-sparkles"></i> Deep AI Analysis</h3>
                            <span className="badge gemini">Powered by Gemini</span>
                        </div>
                        <div className="analysis-content">
                            {formatAnalysis(result.aiAnalysis)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
