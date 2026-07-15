import React, { useState } from 'react';
import '../styles/templates.css';

const TemplatesPage = () => {
    const [activeTab, setActiveTab] = useState('all');

    const templates = [
        { id: 1, title: 'Software Engineer', category: 'engineering', desc: 'Standard technical template with GitHub focus' },
        { id: 2, title: 'Product Manager', category: 'product', desc: 'Leadership and product strategy focused' },
        { id: 3, title: 'UI/UX Designer', category: 'design', desc: 'Portfolio and visual skills emphasis' },
        { id: 4, title: 'Data Scientist', category: 'engineering', desc: 'Analytics and ML models experience' },
        { id: 5, title: 'Marketing Director', category: 'marketing', desc: 'Campaign and ROI focused layout' }
    ];

    const filteredTemplates = activeTab === 'all' 
        ? templates 
        : templates.filter(t => t.category === activeTab);

    return (
        <div className="templates-container">
            <header className="page-header stagger-1">
                <div>
                    <h1>Template Library</h1>
                    <p>Pre-built job description templates for better AI matching</p>
                </div>
                <div className="header-actions">
                    <button className="primary-btn pulse-animation">
                        <i className="fa-solid fa-plus"></i> Create Template
                    </button>
                </div>
            </header>

            <div className="templates-content">
                <div className="templates-sidebar glass-panel stagger-2">
                    <h3>Categories</h3>
                    <ul className="category-list">
                        <li>
                            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                                All Templates
                            </button>
                        </li>
                        <li>
                            <button className={`tab-btn ${activeTab === 'engineering' ? 'active' : ''}`} onClick={() => setActiveTab('engineering')}>
                                Engineering
                            </button>
                        </li>
                        <li>
                            <button className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>
                                Design
                            </button>
                        </li>
                        <li>
                            <button className={`tab-btn ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')}>
                                Product
                            </button>
                        </li>
                        <li>
                            <button className={`tab-btn ${activeTab === 'marketing' ? 'active' : ''}`} onClick={() => setActiveTab('marketing')}>
                                Marketing
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="templates-grid stagger-3">
                    {filteredTemplates.map(template => (
                        <div className="template-card glass-panel" key={template.id}>
                            <div className="template-icon">
                                <i className="fa-solid fa-file-lines"></i>
                            </div>
                            <h3>{template.title}</h3>
                            <p>{template.desc}</p>
                            <div className="template-actions">
                                <button className="secondary-btn">Preview</button>
                                <button className="primary-btn">Use Template</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplatesPage;
