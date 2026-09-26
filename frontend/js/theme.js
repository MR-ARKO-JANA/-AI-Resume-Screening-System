// Global Theme Manager - Classical Black & White Theme Engine
// Handles dark/light mode toggle across all pages
(function() {

    // ─── 1. Reconfigure Tailwind CDN palette ──────────────────────────────────
    if (typeof tailwind !== 'undefined' && tailwind.config) {
        tailwind.config.theme = tailwind.config.theme || {};
        tailwind.config.theme.extend = tailwind.config.theme.extend || {};
        tailwind.config.theme.extend.colors = Object.assign(tailwind.config.theme.extend.colors || {}, {
            primary: "#ffffff",
            secondary: "#a1a1aa",
            surface: "#09090b",
            "surface-light": "#18181b",
            "border-subtle": "rgba(255,255,255,0.12)",
            indigo: { 50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#ffffff',500:'#ffffff',600:'#e4e4e7',700:'#27272a',800:'#18181b',900:'#09090b' },
            purple: { 50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#e4e4e7',500:'#a1a1aa',600:'#27272a',700:'#18181b',800:'#121214',900:'#09090b' },
            blue:   { 50:'#fafafa',100:'#f4f4f5',200:'#e4e4e7',300:'#d4d4d8',400:'#ffffff',500:'#e4e4e7',600:'#27272a',700:'#18181b',800:'#121214',900:'#09090b' }
        });
    }

    // ─── 2. Inject Theme Toggle Button CSS ───────────────────────────────────
    const toggleBtnStyle = document.createElement('style');
    toggleBtnStyle.id = 'theme-toggle-btn-styles';
    toggleBtnStyle.textContent = `
        /* ── Theme Toggle — Fixed Floating Pill ── */
        #global-theme-toggle {
            position: fixed;
            top: 14px;
            right: 16px;
            z-index: 9999;
            display: inline-flex;
            align-items: center;
            background: rgba(30,30,35,0.85);
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 50px;
            padding: 4px;
            cursor: pointer;
            width: 72px;
            height: 36px;
            flex-shrink: 0;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        #global-theme-toggle:hover {
            border-color: rgba(255,255,255,0.35);
            box-shadow: 0 6px 22px rgba(0,0,0,0.5);
            transform: translateY(-1px);
        }
        #global-theme-toggle:active { transform: translateY(0px); }

        /* Sliding knob */
        #global-theme-toggle .toggle-knob {
            position: absolute;
            top: 4px;
            left: 4px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            font-size: 13px;
            color: #09090b;
            z-index: 2;
        }

        /* Track icons */
        #global-theme-toggle .toggle-track {
            position: absolute;
            inset: 0;
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 8px;
            pointer-events: none;
        }
        #global-theme-toggle .icon-moon {
            font-size: 12px;
            color: rgba(255,255,255,0.4);
            transition: color 0.3s, opacity 0.3s;
            margin-left: 2px;
        }
        #global-theme-toggle .icon-sun {
            font-size: 12px;
            color: rgba(255,255,255,0.25);
            transition: color 0.3s, opacity 0.3s;
            margin-right: 2px;
        }

        /* Dark mode state: knob left, moon visible */
        #global-theme-toggle[data-mode="dark"] .toggle-knob {
            transform: translateX(0px);
            background: #e4e4e7;
            color: #09090b;
        }
        #global-theme-toggle[data-mode="dark"] .icon-moon { color: rgba(255,255,255,0.75); }
        #global-theme-toggle[data-mode="dark"] .icon-sun  { color: rgba(255,255,255,0.2); }
        #global-theme-toggle[data-mode="dark"] { background: rgba(20,20,24,0.88); }

        /* Light mode state: knob right, sun visible */
        #global-theme-toggle[data-mode="light"] .toggle-knob {
            transform: translateX(36px);
            background: #0d9488;
            color: #ffffff;
        }
        #global-theme-toggle[data-mode="light"] .icon-sun  { color: rgba(13,148,136,0.9); }
        #global-theme-toggle[data-mode="light"] .icon-moon { color: rgba(255,255,255,0.3); }
        #global-theme-toggle[data-mode="light"] {
            background: rgba(255,255,255,0.92);
            border-color: rgba(13,148,136,0.35);
            box-shadow: 0 4px 16px rgba(13,148,136,0.2), 0 1px 4px rgba(0,0,0,0.08);
        }
        #global-theme-toggle[data-mode="light"]:hover {
            border-color: rgba(13,148,136,0.6);
            box-shadow: 0 6px 22px rgba(13,148,136,0.3);
        }

        /* Tooltip */
        #global-theme-toggle::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: #18181b;
            color: #f4f4f5;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.02em;
        }
        #global-theme-toggle:hover::after { opacity: 1; }

        body.light-mode #global-theme-toggle::after {
            background: #ffffff;
            color: #09090b;
            border-color: rgba(0,0,0,0.12);
        }
    `;
    document.head.appendChild(toggleBtnStyle);

    // ─── 3. Inject Classical B&W Master CSS ──────────────────────────────────
    const classicalBwStyle = document.createElement('style');
    classicalBwStyle.id = 'classical-bw-theme-styles';
    classicalBwStyle.textContent = `
        /* ═══════════════════════════════════════════════════════════
           DARK MODE  — Obsidian Black & White Monochrome
        ═══════════════════════════════════════════════════════════ */
        :root {
            --primary: #ffffff !important;
            --primary-dark: #e4e4e7 !important;
            --secondary: #71717a !important;
            --dark: #09090b !important;
            --light: #18181b !important;
            --border: #27272a !important;
            --border-subtle: rgba(255,255,255,0.12) !important;
        }

        body, html, .bg-\\[\\#0B0F19\\], .bg-gray-900 {
            background-color: #09090b !important;
            color: #f4f4f5 !important;
        }

        .orb-1, .orb-2 {
            background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(200,200,200,0.01) 50%, transparent 70%) !important;
            filter: blur(100px) !important;
            opacity: 0.6 !important;
        }

        .glass-card {
            background: rgba(18,18,20,0.75) !important;
            backdrop-filter: blur(24px) !important;
            -webkit-backdrop-filter: blur(24px) !important;
            border: 1px solid rgba(255,255,255,0.12) !important;
            box-shadow: 0 12px 36px 0 rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06) !important;
        }
        .glass-sidebar {
            background: rgba(12,12,14,0.88) !important;
            backdrop-filter: blur(28px) !important;
            border-right: 1px solid rgba(255,255,255,0.1) !important;
        }
        .glass-header {
            background: rgba(12,12,14,0.88) !important;
            backdrop-filter: blur(28px) !important;
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }

        .w-10.h-10.bg-gradient-to-br,
        .w-12.h-12.bg-gradient-to-br,
        .w-20.h-20.bg-gradient-to-br,
        .logo-icon {
            background: linear-gradient(135deg,#27272a 0%,#121214 100%) !important;
            border: 1px solid rgba(255,255,255,0.22) !important;
            color: #ffffff !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2) !important;
        }

        .text-indigo-400,.text-indigo-300,.text-indigo-500,
        .text-purple-400,.text-purple-300,.text-purple-500,
        .text-blue-400,.text-blue-500,.text-blue-600,.text-blue-700 { color:#ffffff !important; }

        a.bg-gradient-to-r, a[class*="from-zinc-7"], .nav-menu li.active {
            background: rgba(255,255,255,0.1) !important;
            border: 1px solid rgba(255,255,255,0.24) !important;
            color: #ffffff !important;
        }
        .glass-sidebar a:hover, .nav-menu li:hover {
            background: rgba(255,255,255,0.06) !important;
            color: #ffffff !important;
        }

        button.bg-gradient-to-r, .btn-primary,
        button[class*="bg-zinc-8"], a.btn-primary {
            background: #ffffff !important;
            color: #09090b !important;
            font-weight: 700 !important;
            border: 1px solid #ffffff !important;
            box-shadow: 0 4px 15px rgba(255,255,255,0.15) !important;
        }
        button.bg-gradient-to-r:hover, .btn-primary:hover { background:#e4e4e7 !important; }

        .btn-secondary, button[class*="border-zinc"] {
            background: rgba(255,255,255,0.06) !important;
            border: 1px solid rgba(255,255,255,0.22) !important;
            color: #ffffff !important;
        }

        input:focus, textarea:focus, select:focus {
            box-shadow: 0 0 0 2px rgba(255,255,255,0.8), 0 0 16px rgba(255,255,255,0.15) !important;
            border-color: #ffffff !important;
            outline: none !important;
        }

        .bg-indigo-500\\/10,.bg-indigo-500\\/20,.bg-purple-500\\/10,.bg-purple-500\\/20,.bg-blue-500\\/10 {
            background: rgba(255,255,255,0.08) !important;
            color: #e4e4e7 !important;
        }

        .tab-btn.bg-indigo-500, .settings-nav-btn.active, .modal-tab.active {
            background: #ffffff !important;
            color: #09090b !important;
        }

        input[type="checkbox"], input[type="radio"], input[type="range"] { accent-color:#ffffff !important; }

        tr:hover { background-color: rgba(255,255,255,0.04) !important; }

        /* ═══════════════════════════════════════════════════════════
           LIGHT MODE  — Warm White + Deep Teal Accent
           Accent: #0d9488 (teal-600) | Hover: #0f766e (teal-700)
        ═══════════════════════════════════════════════════════════ */

        /* CSS accent variable for light mode */
        body.light-mode {
            --lm-accent:       #0d9488;
            --lm-accent-dark:  #0f766e;
            --lm-accent-light: rgba(13,148,136,0.1);
            --lm-accent-glow:  rgba(13,148,136,0.25);
            --lm-bg:           #f8fafc;
            --lm-surface:      #ffffff;
            --lm-surface2:     #f1f5f9;
            --lm-border:       #e2e8f0;
            --lm-text:         #0f172a;
            --lm-text-muted:   #64748b;
            background-color: var(--lm-bg) !important;
            color: var(--lm-text) !important;
        }

        body.light-mode, body.light-mode html,
        body.light-mode .bg-\\[\\#0B0F19\\],
        body.light-mode .bg-gray-900 {
            background-color: #f8fafc !important;
            color: #0f172a !important;
        }

        /* Cards & Panels */
        .light-mode .glass-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04) !important;
            color: #0f172a !important;
        }

        /* Sidebar */
        .light-mode .glass-sidebar {
            background: #ffffff !important;
            border-right: 1px solid #e2e8f0 !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.06) !important;
        }

        /* Header bar */
        .light-mode .glass-header,
        .light-mode .navbar,
        .light-mode header {
            background: rgba(255,255,255,0.95) !important;
            border-bottom: 1px solid #e2e8f0 !important;
            backdrop-filter: blur(20px) !important;
            box-shadow: 0 1px 8px rgba(0,0,0,0.06) !important;
        }

        .light-mode .sidebar {
            background: #ffffff !important;
            border-right: 1px solid #e2e8f0 !important;
        }

        /* Orbs — subtle teal tint */
        .light-mode .orb-1 {
            background: radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%) !important;
            opacity: 0.8 !important;
        }
        .light-mode .orb-2 {
            background: radial-gradient(circle, rgba(13,148,136,0.05) 0%, transparent 70%) !important;
            opacity: 0.6 !important;
        }

        /* ── TEXT COLOURS ── */
        .light-mode .text-white     { color: #0f172a !important; }
        .light-mode .text-gray-200  { color: #1e293b !important; }
        .light-mode .text-gray-300  { color: #334155 !important; }
        .light-mode .text-gray-400  { color: #64748b !important; }
        .light-mode .text-gray-500  { color: #94a3b8 !important; }
        .light-mode .text-zinc-200  { color: #1e293b !important; }
        .light-mode .text-zinc-300  { color: #334155 !important; }
        .light-mode .text-zinc-400  { color: #64748b !important; }
        .light-mode .text-zinc-200.font-semibold { color: #0f172a !important; }
        .light-mode .text-indigo-400,.light-mode .text-indigo-300,
        .light-mode .text-purple-400,.light-mode .text-blue-500 { color: #0d9488 !important; }

        /* ── LOGO / ICON BADGES — teal accent ── */
        .light-mode .w-10.h-10.bg-gradient-to-br,
        .light-mode .w-12.h-12.bg-gradient-to-br,
        .light-mode .w-20.h-20.bg-gradient-to-br,
        .light-mode .logo-icon {
            background: linear-gradient(135deg, #0d9488, #0f766e) !important;
            border: 1px solid #0f766e !important;
            color: #ffffff !important;
            box-shadow: 0 4px 14px rgba(13,148,136,0.3) !important;
        }

        /* ── SIDEBAR NAVIGATION ── */
        .light-mode nav a, .light-mode .nav-menu li {
            color: #475569 !important;
        }
        .light-mode nav a:hover, .light-mode .nav-menu li:hover {
            background: rgba(13,148,136,0.08) !important;
            color: #0d9488 !important;
        }
        /* Active nav link — teal accent */
        .light-mode a.bg-gradient-to-r,
        .light-mode a[class*="from-zinc"],
        .light-mode .nav-menu li.active {
            background: linear-gradient(135deg, #0d9488, #0f766e) !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(13,148,136,0.3) !important;
        }
        .light-mode a.bg-gradient-to-r i,
        .light-mode a.bg-gradient-to-r span,
        .light-mode a[class*="from-zinc"] i,
        .light-mode a[class*="from-zinc"] span,
        .light-mode .nav-menu li.active i,
        .light-mode .nav-menu li.active span { color: #ffffff !important; }

        /* ── PRIMARY BUTTONS — teal ── */
        .light-mode .btn-primary,
        .light-mode button.bg-gradient-to-r,
        .light-mode a.btn-primary,
        .light-mode button[class*="bg-zinc-8"],
        .light-mode .btn-browse {
            background: linear-gradient(135deg, #0d9488, #0f766e) !important;
            color: #ffffff !important;
            border: none !important;
            box-shadow: 0 4px 14px rgba(13,148,136,0.35) !important;
        }
        .light-mode .btn-primary:hover,
        .light-mode button.bg-gradient-to-r:hover,
        .light-mode .btn-browse:hover {
            background: linear-gradient(135deg, #0f766e, #0d9488) !important;
            box-shadow: 0 6px 20px rgba(13,148,136,0.45) !important;
            transform: translateY(-1px) !important;
        }
        .light-mode .btn-primary *, .light-mode button.bg-gradient-to-r * { color: #ffffff !important; }

        /* ── SECONDARY BUTTONS ── */
        .light-mode .btn-secondary,
        .light-mode button[class*="border-zinc"] {
            background: #ffffff !important;
            border: 1.5px solid #cbd5e1 !important;
            color: #334155 !important;
        }
        .light-mode .btn-secondary:hover {
            border-color: #0d9488 !important;
            color: #0d9488 !important;
            background: rgba(13,148,136,0.05) !important;
        }

        /* Export / sync buttons */
        .light-mode .btn-export {
            background: linear-gradient(135deg, #0d9488, #0f766e) !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(13,148,136,0.3) !important;
        }

        /* ── INPUTS ── */
        .light-mode input,
        .light-mode textarea,
        .light-mode select {
            color: #0f172a !important;
            background-color: #ffffff !important;
            border-color: #cbd5e1 !important;
        }
        .light-mode input::placeholder,
        .light-mode textarea::placeholder { color: #94a3b8 !important; }
        .light-mode input:focus,
        .light-mode textarea:focus,
        .light-mode select:focus {
            box-shadow: 0 0 0 2px rgba(13,148,136,0.5), 0 0 10px rgba(13,148,136,0.12) !important;
            border-color: #0d9488 !important;
        }
        .light-mode .input-focus-glow:focus-within {
            box-shadow: 0 0 15px rgba(13,148,136,0.2) !important;
            border-color: rgba(13,148,136,0.6) !important;
        }

        /* ── BACKGROUND UTILITIES ── */
        .light-mode .bg-gray-900\\/50, .light-mode .bg-gray-900 {
            background-color: #f1f5f9 !important;
        }
        .light-mode .border-gray-700\\/50, .light-mode .border-gray-700 { border-color: #e2e8f0 !important; }
        .light-mode .border-zinc-600\\/50, .light-mode .border-zinc-600 { border-color: #e2e8f0 !important; }

        /* ── STAT CARDS ── */
        .light-mode .stat-card,
        .light-mode .upload-section,
        .light-mode .activity-section,
        .light-mode .section-header { color: #0f172a !important; }
        .light-mode .stat-value { color: #0f172a !important; }
        .light-mode .stat-label { color: #64748b !important; }
        .light-mode .stat-change.positive { color: #0d9488 !important; }

        /* Stat icon gradients — teal shades */
        .light-mode .stat-icon.purple,
        .light-mode .stat-icon { background: linear-gradient(135deg, #0d9488, #0f766e) !important; box-shadow: 0 6px 16px rgba(13,148,136,0.3) !important; }
        .light-mode .stat-icon.green  { background: linear-gradient(135deg, #059669, #047857) !important; box-shadow: 0 6px 16px rgba(5,150,105,0.3) !important; }
        .light-mode .stat-icon.orange { background: linear-gradient(135deg, #d97706, #b45309) !important; box-shadow: 0 6px 16px rgba(217,119,6,0.3) !important; }
        .light-mode .stat-icon.blue   { background: linear-gradient(135deg, #0284c7, #0369a1) !important; box-shadow: 0 6px 16px rgba(2,132,199,0.3) !important; }

        /* ── UPLOAD AREA ── */
        .light-mode .upload-area {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
        }
        .light-mode .upload-area.drag-over {
            border-color: #0d9488 !important;
            background: rgba(13,148,136,0.04) !important;
        }
        .light-mode .upload-icon {
            background: linear-gradient(135deg, #0d9488, #0f766e) !important;
            box-shadow: 0 10px 24px rgba(13,148,136,0.3) !important;
        }

        /* ── TABLES ── */
        .light-mode table th { color: #334155 !important; background: #f1f5f9 !important; }
        .light-mode table td { color: #475569 !important; }
        .light-mode tr:hover { background-color: rgba(13,148,136,0.04) !important; }
        .light-mode thead { border-bottom: 1px solid #e2e8f0 !important; }

        /* ── TABS & ACTIVE STATES ── */
        .light-mode .tab-btn.bg-indigo-500,
        .light-mode .settings-nav-btn.active,
        .light-mode .modal-tab.active,
        .light-mode .filter-btn.active {
            background: #0d9488 !important;
            color: #ffffff !important;
            border-color: #0d9488 !important;
            box-shadow: 0 4px 12px rgba(13,148,136,0.3) !important;
        }
        .light-mode .tab-btn:hover {
            border-color: #0d9488 !important;
            color: #0d9488 !important;
            background: rgba(13,148,136,0.06) !important;
        }

        /* ── FILTER BUTTONS ── */
        .light-mode .filter-btn {
            background: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #475569 !important;
        }
        .light-mode .filter-btn:hover {
            border-color: #0d9488 !important;
            color: #0d9488 !important;
        }

        /* Storage bar fill */
        .light-mode .storage-fill { background: linear-gradient(90deg, #0d9488, #0f766e) !important; }
        .light-mode .storage-bar, .light-mode .bg-\\[\\#27272a\\] { background: #e2e8f0 !important; }

        /* Score / progress rings */
        .light-mode .score-ring, .light-mode [class*="score"] {
            border-color: #0d9488 !important;
            color: #0d9488 !important;
        }

        /* ── CHECKBOXES / RADIOS ── */
        .light-mode input[type="checkbox"],
        .light-mode input[type="radio"],
        .light-mode input[type="range"] { accent-color: #0d9488 !important; }

        /* ── BADGE / PILL ── */
        .light-mode .badge, .light-mode [class*="badge"] {
            border: 1px solid #e2e8f0 !important;
        }
        .light-mode .badge.success { background: rgba(13,148,136,0.1) !important; color: #0f766e !important; }

        /* ── VERSION LABEL ── */
        .light-mode .version { color: #0d9488 !important; background: rgba(13,148,136,0.1) !important; }

        /* ── NAV LABEL ── */
        .light-mode .nav-label { color: #94a3b8 !important; }

        /* Page headings */
        .light-mode .page-header h1 { color: #0f172a !important; }
        .light-mode .page-subtitle   { color: #64748b !important; }

        /* ── COMMAND PALETTE ── */
        .light-mode .command-palette { background: #ffffff !important; box-shadow: 0 25px 60px rgba(0,0,0,0.12) !important; }
        .light-mode .command-palette-header { border-bottom-color: #e2e8f0 !important; }
        .light-mode .command-palette-header input { color: #0f172a !important; }
        .light-mode .command-item:hover { background: rgba(13,148,136,0.06) !important; }
        .light-mode .command-item-title { color: #0f172a !important; }

        /* ── NOTIFICATION DOT ── */
        .light-mode .notification-dot,
        .light-mode .w-2.h-2.bg-zinc-800 {
            background: #0d9488 !important;
            box-shadow: 0 0 6px rgba(13,148,136,0.7) !important;
        }

        /* ── SCROLLBARS ── */
        .light-mode ::-webkit-scrollbar-track { background: #f1f5f9; }
        .light-mode ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .light-mode ::-webkit-scrollbar-thumb:hover { background: #0d9488; }

        /* ── ICON BUTTONS (header) ── */
        .light-mode .icon-btn { background: #f1f5f9 !important; color: #475569 !important; }
        .light-mode .icon-btn:hover { background: #0d9488 !important; color: #ffffff !important; }

        /* ── USER PROFILE ── */
        .light-mode .user-profile { background: #f1f5f9 !important; }
        .light-mode .user-profile img { border-color: #0d9488 !important; }
        .light-mode .user-profile:hover { background: #ffffff !important; box-shadow: 0 4px 16px rgba(13,148,136,0.15) !important; }

        /* ── UPGRADE BTN ── */
        .light-mode .upgrade-btn {
            background: linear-gradient(135deg, #0d9488, #0f766e) !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(13,148,136,0.3) !important;
        }

        /* ── SEARCH BAR ── */
        .light-mode .search-bar { background: #f1f5f9 !important; border-color: transparent !important; }
        .light-mode .search-bar:focus-within {
            background: #ffffff !important;
            border-color: #0d9488 !important;
            box-shadow: 0 0 0 3px rgba(13,148,136,0.15) !important;
        }
    `;

    // ─── 4. Typography Enhancement CSS ─────────────────────────────────────
    const typographyStyle = document.createElement('style');
    typographyStyle.id = 'typography-enhancement-styles';
    typographyStyle.textContent = `
        html { font-size:16.5px !important; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
        body { font-size:1rem !important; line-height:1.55 !important; letter-spacing:0.01em; }
        .text-xs  { font-size:0.88rem !important; line-height:1.35rem !important; }
        .text-sm  { font-size:0.98rem !important; line-height:1.45rem !important; }
        .text-base{ font-size:1.08rem !important; line-height:1.6rem  !important; }
        .text-lg  { font-size:1.25rem !important; line-height:1.65rem !important; }
        .text-xl  { font-size:1.4rem  !important; line-height:1.7rem  !important; }
        .text-2xl { font-size:1.7rem  !important; line-height:2rem   !important; }
        .text-3xl { font-size:2.15rem !important; line-height:2.4rem  !important; }
        input, select, textarea, button { font-size:15px !important; }
        table th { font-size:13.5px !important; font-weight:600 !important; letter-spacing:0.03em !important; }
        table td { font-size:15px !important; }
    `;

    function injectStyles() {
        if (!document.getElementById('classical-bw-theme-styles'))   document.head.appendChild(classicalBwStyle);
        if (!document.getElementById('typography-enhancement-styles')) document.head.appendChild(typographyStyle);
        if (!document.getElementById('theme-toggle-btn-styles'))      document.head.appendChild(toggleBtnStyle);
    }
    injectStyles();

    // ─── 5. Theme Toggle Button — Fixed Floating Pill ────────────────────────
    function createToggleButton() {
        // Don't add if already exists (login page has it hardcoded)
        if (document.getElementById('global-theme-toggle')) return;

        const btn = document.createElement('button');
        btn.id = 'global-theme-toggle';
        btn.setAttribute('aria-label', 'Toggle light/dark mode');
        btn.innerHTML = `
            <div class="toggle-track">
                <i class="fas fa-moon icon-moon"></i>
                <i class="fas fa-sun icon-sun"></i>
            </div>
            <div class="toggle-knob">
                <i class="fas fa-moon knob-icon-moon"></i>
                <i class="fas fa-sun knob-icon-sun" style="display:none"></i>
            </div>
        `;

        btn.addEventListener('click', toggleTheme);

        // Always append to body as a fixed floating pill — never inside header
        document.body.appendChild(btn);
    }

    // ─── 6. Apply Theme ──────────────────────────────────────────────────────
    function isDarkMode() {
        try {
            const prefs = JSON.parse(localStorage.getItem('preferences') || '{}');
            return prefs.darkMode !== false; // default dark
        } catch(e) { return true; }
    }

    function applyTheme() {
        injectStyles();
        const dark = isDarkMode();

        if (dark) {
            document.body.classList.remove('light-mode');
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.body.classList.add('light-mode');
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }

        // Update toggle button appearance
        const btn = document.getElementById('global-theme-toggle');
        if (btn) {
            btn.setAttribute('data-mode', dark ? 'dark' : 'light');
            btn.setAttribute('data-tooltip', dark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

            const knob = btn.querySelector('.toggle-knob');
            const moonKnob = btn.querySelector('.knob-icon-moon');
            const sunKnob  = btn.querySelector('.knob-icon-sun');
            if (moonKnob) moonKnob.style.display = dark ? 'inline' : 'none';
            if (sunKnob)  sunKnob.style.display  = dark ? 'none'   : 'inline';
        }
    }

    function toggleTheme() {
        const currentlyDark = isDarkMode();
        try {
            const prefs = JSON.parse(localStorage.getItem('preferences') || '{}');
            prefs.darkMode = !currentlyDark;
            localStorage.setItem('preferences', JSON.stringify(prefs));
        } catch(e) {
            localStorage.setItem('preferences', JSON.stringify({ darkMode: !currentlyDark }));
        }
        applyTheme();
        window.dispatchEvent(new Event('preferencesUpdated'));
    }

    // Expose toggle function globally for settings page
    window.toggleAppTheme = toggleTheme;

    // ─── 7. Init ─────────────────────────────────────────────────────────────
    function init() {
        applyTheme();
        createToggleButton();
        applyTheme(); // re-apply after button is created to style it
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('preferencesUpdated', function() {
        applyTheme();
    });

})();
