import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import SearchPalette from './SearchPalette';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="layout-container" style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="content-wrapper" style={{ padding: '24px', flex: 1, position: 'relative' }}>
                    <Outlet />
                </div>
            </main>
            <SearchPalette />
        </div>
    );
};

export default Layout;
