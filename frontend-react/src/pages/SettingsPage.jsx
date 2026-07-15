import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';
import '../styles/settings-ultra.css';

const SettingsPage = () => {
    const { user, login } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({ name: '', company: '', jobTitle: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                company: user.company || '',
                jobTitle: user.jobTitle || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.post('/update-profile', profileData);
            if (data.error) {
                setToast({ message: data.error, type: 'error' });
            } else if (data.success) {
                setToast({ message: 'Profile updated successfully!', type: 'success' });
                login({ ...user, ...data.user });
            }
        } catch (error) {
            setToast({ message: 'Failed to update profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToast({ message: 'New passwords do not match', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const data = await api.post('/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (data.error) {
                setToast({ message: data.error, type: 'error' });
            } else if (data.success) {
                setToast({ message: 'Password changed successfully!', type: 'success' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            setToast({ message: 'Failed to change password', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            <header className="page-header stagger-1">
                <div>
                    <h1>Settings & Preferences</h1>
                    <p>Manage your account settings and application preferences</p>
                </div>
            </header>

            <div className="settings-grid">
                <div className="settings-card glass-panel stagger-2">
                    <div className="card-header">
                        <h3><i className="fa-regular fa-user"></i> Profile Information</h3>
                    </div>
                    <form className="settings-form" onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                value={profileData.name}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input 
                                type="text" 
                                value={profileData.company}
                                onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                        <div className="form-group">
                            <label>Job Title</label>
                            <input 
                                type="text" 
                                value={profileData.jobTitle}
                                onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                                placeholder="e.g. HR Manager"
                            />
                        </div>
                        <button type="submit" className="primary-btn" disabled={loading}>Save Changes</button>
                    </form>
                </div>

                <div className="settings-card glass-panel stagger-3">
                    <div className="card-header">
                        <h3><i className="fa-solid fa-lock"></i> Security</h3>
                    </div>
                    <form className="settings-form" onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input 
                                type="password" 
                                required
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input 
                                type="password" 
                                required
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input 
                                type="password" 
                                required
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="secondary-btn" disabled={loading}>Update Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
