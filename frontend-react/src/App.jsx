import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResultPage from './pages/ResultPage';
import CandidatesPage from './pages/CandidatesPage';
import JobsPage from './pages/JobsPage';
import ProfileLookupPage from './pages/ProfileLookupPage';
import SettingsPage from './pages/SettingsPage';
import TemplatesPage from './pages/TemplatesPage';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LoginPage />} />

                    {/* Protected Routes Wrapper */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/result" element={<ResultPage />} />
                            <Route path="/candidates" element={<CandidatesPage />} />
                            <Route path="/jobs" element={<JobsPage />} />
                            <Route path="/profile-lookup" element={<ProfileLookupPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/templates" element={<TemplatesPage />} />
                            <Route path="/help" element={<HelpPage />} />
                        </Route>
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
