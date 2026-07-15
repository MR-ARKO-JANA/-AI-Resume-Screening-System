import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} id="sidebarOverlay"></div>
            <nav className={`sidebar ${isOpen ? 'active' : ''}`} id="sidebar">
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <i className="fa-solid fa-brain"></i>
                        </div>
                        <h2>AI Recruiter</h2>
                    </div>
                </div>

                <div className="sidebar-menu">
                    <p className="menu-label">Main Menu</p>
                    <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                        <i className="fa-solid fa-chart-line"></i>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/candidates" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                        <i className="fa-solid fa-users"></i>
                        <span>Candidates</span>
                    </NavLink>
                    <NavLink to="/jobs" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                        <i className="fa-solid fa-briefcase"></i>
                        <span>Jobs</span>
                    </NavLink>
                    
                    <p className="menu-label">Tools</p>
                    <NavLink to="/profile-lookup" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                        <i className="fa-brands fa-github"></i>
                        <span>Profile Lookup</span>
                        <span className="badge new">New</span>
                    </NavLink>
                    <NavLink to="/templates" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                        <i className="fa-solid fa-file-contract"></i>
                        <span>Templates</span>
                    </NavLink>

                    <p className="menu-label">Settings</p>
                    <NavLink to="/settings" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                        <i className="fa-solid fa-gear"></i>
                        <span>Preferences</span>
                    </NavLink>
                    <NavLink to="/help" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                        <i className="fa-solid fa-circle-question"></i>
                        <span>Help Center</span>
                    </NavLink>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
