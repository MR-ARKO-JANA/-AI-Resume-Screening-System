import React, { useState, useEffect } from 'react';
import '../styles/navbar.css'; // Toast styles are in navbar.css

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-circle-exclamation',
        info: 'fa-circle-info',
        warning: 'fa-triangle-exclamation'
    };

    return (
        <div className={`toast-notification ${type} active`} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
            <div className="toast-icon">
                <i className={`fa-solid ${iconMap[type] || iconMap.info}`}></i>
            </div>
            <div className="toast-content">
                <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                <p>{message}</p>
            </div>
            <button className="toast-close" onClick={onClose}>
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    );
};

export default Toast;
