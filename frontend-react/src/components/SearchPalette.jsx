import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const navigateTo = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <div className="search-palette-overlay active" onClick={() => setIsOpen(false)}>
            <div className="search-palette active" onClick={e => e.stopPropagation()}>
                <div className="palette-header">
                    <i className="fa-solid fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Search for candidates, jobs, or type a command..." 
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <kbd>ESC</kbd>
                </div>
                <div className="palette-content">
                    <div className="palette-group">
                        <h3>Quick Actions</h3>
                        <div className="palette-item" onClick={() => navigateTo('/dashboard')}>
                            <i className="fa-solid fa-file-arrow-up"></i>
                            <div className="item-details">
                                <span>Upload Resumes</span>
                                <small>Screen new candidates</small>
                            </div>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                        <div className="palette-item" onClick={() => navigateTo('/candidates')}>
                            <i className="fa-solid fa-users-viewfinder"></i>
                            <div className="item-details">
                                <span>View Shortlisted</span>
                                <small>See top candidates</small>
                            </div>
                            <i className="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                    <div className="palette-group">
                        <h3>Navigation</h3>
                        <div className="palette-item" onClick={() => navigateTo('/settings')}>
                            <i className="fa-solid fa-gear"></i>
                            <div className="item-details">
                                <span>Settings</span>
                                <small>Manage your preferences</small>
                            </div>
                        </div>
                        <div className="palette-item" onClick={() => navigateTo('/help')}>
                            <i className="fa-solid fa-circle-question"></i>
                            <div className="item-details">
                                <span>Help Center</span>
                                <small>Get support</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPalette;
