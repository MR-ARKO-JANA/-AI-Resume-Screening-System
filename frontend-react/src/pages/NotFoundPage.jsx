import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center',
            backgroundColor: 'var(--bg-color)'
        }}>
            <h1 style={{ fontSize: '6rem', marginBottom: '10px', color: 'var(--primary-color)' }}>404</h1>
            <h2 style={{ marginBottom: '20px' }}>Page Not Found</h2>
            <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>The page you are looking for doesn't exist or has been moved.</p>
            <button className="primary-btn pulse-animation" onClick={() => navigate('/')}>
                <i className="fa-solid fa-home"></i> Return Home
            </button>
        </div>
    );
};

export default NotFoundPage;
