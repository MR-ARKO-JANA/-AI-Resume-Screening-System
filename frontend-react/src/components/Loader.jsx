import React from 'react';
import '../styles/loader.css';

const Loader = ({ show = true, text = "Processing..." }) => {
    if (!show) return null;

    return (
        <div className="loader-container active" id="globalLoader">
            <div className="loader-content">
                <div className="hexagon-loader">
                    <div className="hexagon"></div>
                    <div className="hexagon"></div>
                    <div className="hexagon"></div>
                </div>
                <div className="loader-text">
                    <h2>{text}</h2>
                    <p>AI Recruiter is analyzing the data</p>
                    <div className="loading-progress">
                        <div className="progress-bar"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
