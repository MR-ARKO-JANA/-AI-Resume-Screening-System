import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useContext(AuthContext);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileOpen(false);
                setNotifOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="top-navbar">
            <div className="nav-left">
                <button className="mobile-menu-btn" onClick={onMenuClick}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="search-bar" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
                    <i className="fa-solid fa-search"></i>
                    <span>Search candidates, jobs, etc...</span>
                    <div className="search-shortcut">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    </div>
                </div>
            </div>

            <div className="nav-right" ref={dropdownRef}>
                <div className="nav-item notifications">
                    <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
                        <i className="fa-regular fa-bell"></i>
                        <span className="badge-dot"></span>
                    </button>
                    {notifOpen && (
                        <div className="dropdown-menu notif-dropdown active">
                            <div className="dropdown-header">
                                <h3>Notifications</h3>
                                <button className="text-btn">Mark all read</button>
                            </div>
                            <div className="dropdown-content">
                                <div className="notif-item unread">
                                    <div className="notif-icon success">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <div className="notif-text">
                                        <p><strong>System Update</strong> 10 resumes processed successfully</p>
                                        <span>2 mins ago</span>
                                    </div>
                                </div>
                            </div>
                            <div className="dropdown-footer">
                                <button className="text-btn">View All</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="nav-item profile">
                    <button className="profile-btn" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}>
                        <img src="/user_img.webp" alt="User Profile" className="profile-img" />
                        <div className="profile-info">
                            <span className="profile-name">{user?.name || "Admin"}</span>
                            <span className="profile-role">HR Manager</span>
                        </div>
                        <i className="fa-solid fa-chevron-down"></i>
                    </button>
                    {profileOpen && (
                        <div className="dropdown-menu profile-dropdown active">
                            <div className="dropdown-header">
                                <p className="user-email">{user?.email || "admin@example.com"}</p>
                            </div>
                            <div className="dropdown-content">
                                <a href="/settings" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/settings'); setProfileOpen(false); }}>
                                    <i className="fa-regular fa-user"></i> My Profile
                                </a>
                                <a href="/settings" className="dropdown-item" onClick={(e) => { e.preventDefault(); navigate('/settings'); setProfileOpen(false); }}>
                                    <i className="fa-solid fa-sliders"></i> Preferences
                                </a>
                            </div>
                            <div className="dropdown-footer">
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
