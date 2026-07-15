import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/log_regi.css';
import Toast from '../components/Toast';

const LoginPage = () => {
    const [isLoginActive, setIsLoginActive] = useState(true);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToast({ message: '', type: '' });

        try {
            const endpoint = isLoginActive ? '/login' : '/register';
            const data = await api.post(endpoint, formData);

            if (data.error) {
                showToast(data.error);
            } else if (data.success) {
                login(data.user);
                navigate('/dashboard');
            }
        } catch (error) {
            showToast(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-body">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            <div className="auth-container glass-panel">
                <div className="auth-header">
                    <div className="logo-icon-auth">
                        <i className="fa-solid fa-brain"></i>
                    </div>
                    <h2>{isLoginActive ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLoginActive ? 'Login to access your AI Recruiter dashboard' : 'Join AI Recruiter and streamline your hiring'}</p>
                </div>

                <div className="auth-tabs">
                    <button 
                        className={`tab-btn ${isLoginActive ? 'active' : ''}`} 
                        onClick={() => setIsLoginActive(true)}
                        type="button"
                    >
                        Login
                    </button>
                    <button 
                        className={`tab-btn ${!isLoginActive ? 'active' : ''}`} 
                        onClick={() => setIsLoginActive(false)}
                        type="button"
                    >
                        Register
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLoginActive && (
                        <div className="form-group">
                            <label><i className="fa-regular fa-user"></i> Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Enter your full name" 
                                required={!isLoginActive} 
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label><i className="fa-regular fa-envelope"></i> Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Enter your email" 
                            required 
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label><i className="fa-solid fa-lock"></i> Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Enter your password" 
                            required 
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isLoginActive ? 'Login to Dashboard' : 'Create Account')}
                        {!loading && <i className="fa-solid fa-arrow-right"></i>}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
                </div>
            </div>

            <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
        </div>
    );
};

export default LoginPage;
