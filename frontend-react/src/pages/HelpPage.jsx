import React, { useState } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';
import '../styles/help.css';

const HelpPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [activeFaq, setActiveFaq] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "How does the AI matching algorithm work?",
            answer: "Our AI uses Gemini to analyze resumes against your job descriptions. It looks for keyword matches, contextual experience, and skill synonyms to generate a comprehensive score out of 100."
        },
        {
            id: 2,
            question: "What file formats are supported?",
            answer: "Currently, we support PDF (.pdf) and Microsoft Word (.doc, .docx) formats. PDF is highly recommended for the most accurate parsing."
        },
        {
            id: 3,
            question: "How is the 'Experience' level calculated?",
            answer: "The AI looks for specific time-based keywords (e.g., '5 years', '2019-present') and senior titles to estimate whether a candidate is a Fresher, Mid-Level, or Experienced professional."
        },
        {
            id: 4,
            question: "Is my data secure?",
            answer: "Yes. Resumes are processed in memory and essential data is stored securely in our database. We do not use your candidate data to train public AI models."
        }
    ];

    const toggleFaq = (id) => {
        setActiveFaq(activeFaq === id ? null : id);
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.post('/help/contact', formData);
            if (data.error) {
                setToast({ message: data.error, type: 'error' });
            } else if (data.success) {
                setToast({ message: 'Message sent successfully!', type: 'success' });
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            setToast({ message: 'Failed to send message', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="help-container">
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
            
            <header className="page-header stagger-1">
                <div>
                    <h1>Help & Support</h1>
                    <p>Find answers to common questions or reach out to our team</p>
                </div>
            </header>

            <div className="help-grid">
                <div className="faq-section glass-panel stagger-2">
                    <h2><i className="fa-solid fa-circle-question"></i> Frequently Asked Questions</h2>
                    <div className="faq-list">
                        {faqs.map(faq => (
                            <div className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`} key={faq.id}>
                                <div className="faq-question" onClick={() => toggleFaq(faq.id)}>
                                    <h3>{faq.question}</h3>
                                    <i className={`fa-solid fa-chevron-${activeFaq === faq.id ? 'up' : 'down'}`}></i>
                                </div>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="contact-section glass-panel stagger-3">
                    <h2><i className="fa-regular fa-envelope"></i> Contact Support</h2>
                    <p>Can't find what you're looking for? Send us a message.</p>
                    
                    <form className="contact-form" onSubmit={handleContactSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                type="email" 
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <input 
                                type="text" 
                                required
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Message</label>
                            <textarea 
                                required 
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                            ></textarea>
                        </div>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
