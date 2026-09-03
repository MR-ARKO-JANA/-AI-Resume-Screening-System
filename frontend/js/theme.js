// Global Theme Manager

(function() {
    // Inject Light Mode CSS globally
    const lightModeStyle = document.createElement('style');
    lightModeStyle.id = 'light-mode-styles';
    lightModeStyle.textContent = `
        body.light-mode {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
        }
        .light-mode .glass-card, 
        .light-mode .glass-sidebar, 
        .light-mode .glass-header {
            background: rgba(255, 255, 255, 0.7) !important;
            border-color: rgba(0, 0, 0, 0.1) !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            color: #111827 !important;
        }
        .light-mode .text-white { color: #111827 !important; }
        .light-mode .text-gray-400 { color: #4b5563 !important; }
        .light-mode .text-gray-300 { color: #374151 !important; }
        .light-mode .text-gray-200 { color: #1f2937 !important; }
        
        .light-mode .bg-gray-900\\/50, 
        .light-mode .bg-black\\/20, 
        .light-mode .bg-black\\/40 {
            background-color: rgba(255, 255, 255, 0.6) !important;
            border-color: rgba(0, 0, 0, 0.2) !important;
            color: #111827 !important;
        }
        
        .light-mode input, 
        .light-mode textarea {
            color: #111827 !important;
            background-color: rgba(255, 255, 255, 0.8) !important;
        }
        .light-mode input::placeholder, 
        .light-mode textarea::placeholder {
            color: #6b7280 !important;
        }
        
        .light-mode .border-white\\/10 { border-color: rgba(0, 0, 0, 0.1) !important; }
        .light-mode .bg-white\\/5 { background-color: rgba(0, 0, 0, 0.05) !important; }
        .light-mode .hover\\:bg-white\\/5:hover { background-color: rgba(0, 0, 0, 0.08) !important; }
        .light-mode .hover\\:bg-white\\/10:hover { background-color: rgba(0, 0, 0, 0.12) !important; }
        
        .light-mode .orb-1, .light-mode .orb-2 { opacity: 0.15 !important; filter: blur(80px) !important; }
        
        .light-mode .bg-gradient-to-r.from-indigo-500\\/20 {
            background: rgba(99, 102, 241, 0.15) !important;
            border-color: rgba(99, 102, 241, 0.3) !important;
            color: #4f46e5 !important;
        }
        .light-mode .text-indigo-400 { color: #4f46e5 !important; }
        .light-mode .text-purple-400 { color: #7e22ce !important; }
        .light-mode .text-emerald-400 { color: #059669 !important; }
        .light-mode .text-amber-400 { color: #d97706 !important; }
        .light-mode .text-teal-400 { color: #0d9488 !important; }
        
        .light-mode .border-indigo-500\\/30 { border-color: rgba(99, 102, 241, 0.4) !important; }
        .light-mode .border-emerald-500\\/30 { border-color: rgba(16, 185, 129, 0.4) !important; }
        
        .light-mode .chart-segment.skills { background-color: #6366f1 !important; color: white !important; }
        .light-mode .chart-segment.keywords { background-color: #a855f7 !important; color: white !important; }
        .light-mode .chart-segment.experience { background-color: #14b8a6 !important; color: white !important; }
    `;
    
    // Only append if it doesn't exist
    if (!document.getElementById('light-mode-styles')) {
        document.head.appendChild(lightModeStyle);
    }

    function applyTheme() {
        let prefs = localStorage.getItem('preferences');
        if (prefs) {
            prefs = JSON.parse(prefs);
            if (prefs.darkMode === false) {
                document.body.classList.add('light-mode');
                document.documentElement.classList.remove('dark');
            } else {
                document.body.classList.remove('light-mode');
                document.documentElement.classList.add('dark');
            }
        } else {
            // Default to dark mode
            document.body.classList.remove('light-mode');
            document.documentElement.classList.add('dark');
        }
    }
    
    // Run on DOM load to ensure body exists
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTheme);
    } else {
        applyTheme();
    }

    window.addEventListener('preferencesUpdated', applyTheme);
})();
