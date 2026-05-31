/**
 * Shared Navbar Interactive Components
 * Handles: Search Command Palette, Notifications, Settings, Profile Dropdown
 * Include this script on every page after the page-specific JS.
 */

(function () {
    'use strict';

    // =========================
    // SEARCH COMMAND PALETTE
    // =========================
    const searchCommands = [
        { icon: 'fas fa-home', color: 'purple', title: 'Dashboard', desc: 'Go to main dashboard', url: '/dashboard', group: 'Pages' },
        { icon: 'fas fa-chart-line', color: 'blue', title: 'Results', desc: 'View screening results', url: '/result', group: 'Pages' },
        { icon: 'fas fa-users', color: 'green', title: 'Candidates', desc: 'All screened candidates', url: '/candidates', group: 'Pages' },
        { icon: 'fas fa-search-plus', color: 'orange', title: 'Profile Lookup', desc: 'GitHub & LinkedIn analysis', url: '/profile-lookup', group: 'Pages' },
        { icon: 'fas fa-briefcase', color: 'indigo', title: 'Jobs', desc: 'Browse job openings', url: '/jobs', group: 'Pages' },
        { icon: 'fas fa-file-alt', color: 'blue', title: 'Templates', desc: 'Email & JD templates', url: '/templates', group: 'Pages' },
        { icon: 'fas fa-cog', color: 'purple', title: 'Settings', desc: 'Account & preferences', url: '/settings', group: 'Pages' },
        { icon: 'fas fa-question-circle', color: 'blue', title: 'Help & Support', desc: 'FAQ, guides, and support details', url: '/help', group: 'Pages' },
        { icon: 'fas fa-cloud-upload-alt', color: 'green', title: 'Upload Resume', desc: 'Upload and screen a new resume', url: '/dashboard', group: 'Actions' },
        { icon: 'fas fa-file-csv', color: 'blue', title: 'Export CSV', desc: 'Download candidate data', url: '/export-csv', group: 'Actions' },
        { icon: 'fas fa-sign-out-alt', color: 'red', title: 'Logout', desc: 'Sign out of your account', url: '/logout', group: 'Actions' },
    ];

    function createSearchOverlay() {
        if (document.getElementById('searchOverlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'search-overlay';
        overlay.id = 'searchOverlay';
        overlay.innerHTML = `
            <div class="command-palette" id="commandPalette">
                <div class="command-palette-header">
                    <i class="fas fa-search"></i>
                    <input type="text" id="commandSearchInput" placeholder="Search pages, actions, candidates..." autocomplete="off" />
                    <kbd>Esc</kbd>
                </div>
                <div class="command-palette-body" id="commandPaletteBody"></div>
                <div class="command-palette-footer">
                    <span><kbd>↑↓</kbd> Navigate</span>
                    <span><kbd>↵</kbd> Open</span>
                    <span><kbd>Esc</kbd> Close</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('commandSearchInput');
        const body = document.getElementById('commandPaletteBody');

        // Render results
        function renderResults(query) {
            const q = (query || '').toLowerCase().trim();
            let filtered = searchCommands;
            if (q) {
                filtered = searchCommands.filter(cmd =>
                    cmd.title.toLowerCase().includes(q) ||
                    cmd.desc.toLowerCase().includes(q) ||
                    cmd.group.toLowerCase().includes(q)
                );
            }

            if (filtered.length === 0) {
                body.innerHTML = `
                    <div class="command-no-results">
                        <i class="fas fa-search"></i>
                        <p>No results for "${query}"</p>
                    </div>
                `;
                return;
            }

            // Group by category
            const groups = {};
            filtered.forEach(cmd => {
                if (!groups[cmd.group]) groups[cmd.group] = [];
                groups[cmd.group].push(cmd);
            });

            let html = '';
            Object.keys(groups).forEach(group => {
                html += `<div class="command-group-label">${group}</div>`;
                groups[group].forEach((cmd, i) => {
                    html += `
                        <a class="command-item" href="${cmd.url}" data-index="${i}">
                            <div class="command-item-icon ${cmd.color}">
                                <i class="${cmd.icon}"></i>
                            </div>
                            <div class="command-item-text">
                                <h4>${cmd.title}</h4>
                                <p>${cmd.desc}</p>
                            </div>
                        </a>
                    `;
                });
            });

            body.innerHTML = html;
        }

        input.addEventListener('input', () => renderResults(input.value));

        // Open/Close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSearch();
        });

        renderResults('');
    }

    function openSearch() {
        createSearchOverlay();
        const overlay = document.getElementById('searchOverlay');
        const input = document.getElementById('commandSearchInput');
        overlay.classList.add('active');
        setTimeout(() => input.focus(), 50);
        input.value = '';
        // Re-render
        const body = document.getElementById('commandPaletteBody');
        if (body) {
            const q = input.value;
            const filtered = searchCommands.filter(cmd =>
                cmd.title.toLowerCase().includes(q) ||
                cmd.desc.toLowerCase().includes(q)
            );
            // just re-render all
            renderSearchResults('');
        }
    }

    function renderSearchResults(query) {
        const body = document.getElementById('commandPaletteBody');
        if (!body) return;
        const q = (query || '').toLowerCase().trim();
        let filtered = searchCommands;
        if (q) {
            filtered = searchCommands.filter(cmd =>
                cmd.title.toLowerCase().includes(q) ||
                cmd.desc.toLowerCase().includes(q) ||
                cmd.group.toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            body.innerHTML = `
                <div class="command-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results for "${query}"</p>
                </div>
            `;
            return;
        }

        const groups = {};
        filtered.forEach(cmd => {
            if (!groups[cmd.group]) groups[cmd.group] = [];
            groups[cmd.group].push(cmd);
        });

        let html = '';
        Object.keys(groups).forEach(group => {
            html += `<div class="command-group-label">${group}</div>`;
            groups[group].forEach(cmd => {
                html += `
                    <a class="command-item" href="${cmd.url}">
                        <div class="command-item-icon ${cmd.color}">
                            <i class="${cmd.icon}"></i>
                        </div>
                        <div class="command-item-text">
                            <h4>${cmd.title}</h4>
                            <p>${cmd.desc}</p>
                        </div>
                    </a>
                `;
            });
        });

        body.innerHTML = html;
    }

    function closeSearch() {
        const overlay = document.getElementById('searchOverlay');
        if (overlay) overlay.classList.remove('active');
    }

    // Ctrl+K or click search bar
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        if (e.key === 'Escape') {
            closeSearch();
            closeAllDropdowns();
        }
    });

    // Click the search bar to open command palette
    document.addEventListener('DOMContentLoaded', () => {
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            searchBar.style.cursor = 'pointer';
            searchBar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openSearch();
            });
            // Prevent the input from focusing normally
            const searchInput = searchBar.querySelector('input');
            if (searchInput) {
                searchInput.style.cursor = 'pointer';
                searchInput.addEventListener('focus', (e) => {
                    e.target.blur();
                    openSearch();
                });
            }
        }

        // Initialize navbar components
        initNotifications();
        initSettingsButton();
        initProfileDropdown();
        initMobileSidebar();
    });

    // =========================
    // MOBILE SIDEBAR TOGGLE
    // =========================
    function initMobileSidebar() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (mobileMenuBtn && sidebar && sidebarOverlay) {
            // Remove existing listeners by cloning (prevents duplicates if page already had inline script)
            const newBtn = mobileMenuBtn.cloneNode(true);
            mobileMenuBtn.parentNode.replaceChild(newBtn, mobileMenuBtn);

            newBtn.addEventListener('click', () => {
                sidebar.classList.add('active');
                sidebarOverlay.classList.add('active');
            });

            // Only add overlay click if not already handled
            if (!sidebarOverlay.dataset.navbarInit) {
                sidebarOverlay.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    sidebarOverlay.classList.remove('active');
                });
                sidebarOverlay.dataset.navbarInit = 'true';
            }
        }
    }

    // =========================
    // NOTIFICATIONS DROPDOWN
    // =========================
    const notifications = [
        { icon: 'fas fa-check-circle', iconClass: 'success', title: 'Resume Screened', desc: 'John_Doe_Resume.pdf scored 87% match', time: '2 min ago', unread: true },
        { icon: 'fas fa-user-check', iconClass: 'purple', title: 'Candidate Shortlisted', desc: 'Emma Wilson has been shortlisted', time: '15 min ago', unread: true },
        { icon: 'fas fa-clock', iconClass: 'warning', title: 'Pending Review', desc: '3 resumes are awaiting your review', time: '1 hour ago', unread: true },
        { icon: 'fas fa-briefcase', iconClass: 'info', title: 'New Job Posted', desc: 'Senior Frontend Developer position is live', time: '3 hours ago', unread: false },
        { icon: 'fas fa-times-circle', iconClass: 'danger', title: 'Resume Rejected', desc: 'Mike_Johnson.pdf scored 42% match', time: '5 hours ago', unread: false },
    ];

    function initNotifications() {
        const bellBtns = document.querySelectorAll('.icon-btn');
        let notifBtn = null;

        bellBtns.forEach(btn => {
            if (btn.querySelector('.fa-bell')) {
                notifBtn = btn;
            }
        });

        if (!notifBtn) return;

        // Wrap in notification-wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'notification-wrapper';
        notifBtn.parentNode.insertBefore(wrapper, notifBtn);
        wrapper.appendChild(notifBtn);

        // Add unique ID
        notifBtn.id = 'notifBtn';

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.id = 'notifDropdown';

        const unreadCount = notifications.filter(n => n.unread).length;

        dropdown.innerHTML = `
            <div class="notif-header">
                <h3>Notifications <span class="notif-count">${unreadCount}</span></h3>
                <button class="notif-mark-read" id="markAllRead">Mark all read</button>
            </div>
            <div class="notif-body" id="notifBody">
                ${notifications.map(n => `
                    <div class="notif-item ${n.unread ? 'unread' : ''}">
                        <div class="notif-icon ${n.iconClass}">
                            <i class="${n.icon}"></i>
                        </div>
                        <div class="notif-content">
                            <h4>${n.title}</h4>
                            <p>${n.desc}</p>
                        </div>
                        <span class="notif-time">${n.time}</span>
                    </div>
                `).join('')}
            </div>
            <div class="notif-footer">
                <a href="/candidates">View all notifications</a>
            </div>
        `;

        wrapper.appendChild(dropdown);

        // Toggle
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            dropdown.classList.toggle('active');
        });

        // Mark all read
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.id === 'markAllRead' || e.target.closest('#markAllRead')) {
                dropdown.querySelectorAll('.notif-item.unread').forEach(item => {
                    item.classList.remove('unread');
                });
                const badge = dropdown.querySelector('.notif-count');
                if (badge) badge.textContent = '0';
                const dot = notifBtn.querySelector('.notification-dot');
                if (dot) dot.style.display = 'none';
            }
        });
    }

    // =========================
    // SETTINGS BUTTON
    // =========================
    function initSettingsButton() {
        const iconBtns = document.querySelectorAll('.icon-btn');
        iconBtns.forEach(btn => {
            if (btn.querySelector('.fa-cog')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '/settings';
                });
                btn.title = 'Settings';
            }
            // Also handle envelope / messages button
            if (btn.querySelector('.fa-envelope')) {
                btn.title = 'Messages';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = '/candidates';
                });
            }
        });
    }

    // =========================
    // PROFILE DROPDOWN
    // =========================
    function initProfileDropdown() {
        const profileEl = document.querySelector('.user-profile');
        if (!profileEl) return;

        // Wrap
        const wrapper = document.createElement('div');
        wrapper.className = 'profile-wrapper';
        profileEl.parentNode.insertBefore(wrapper, profileEl);
        wrapper.appendChild(profileEl);

        // Get user info from the profile section
        const nameEl = profileEl.querySelector('.user-name');
        const roleEl = profileEl.querySelector('.user-role');
        const imgEl = profileEl.querySelector('img');

        const userName = nameEl ? nameEl.textContent : 'User';
        const userRole = roleEl ? roleEl.textContent : 'Admin';
        const userImg = imgEl ? imgEl.src : '../images/user_img.webp';

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'profile-dropdown';
        dropdown.id = 'profileDropdown';
        dropdown.innerHTML = `
            <div class="profile-dropdown-header">
                <img src="${userImg}" alt="${userName}" />
                <h4>${userName}</h4>
                <p>${userRole}</p>
            </div>
            <div class="profile-dropdown-body">
                <a class="profile-menu-item" href="/settings">
                    <i class="fas fa-user-circle"></i>
                    My Profile
                </a>
                <a class="profile-menu-item" href="/settings">
                    <i class="fas fa-cog"></i>
                    Settings
                </a>
                <a class="profile-menu-item" href="/candidates">
                    <i class="fas fa-bell"></i>
                    Notifications
                </a>
                <div class="profile-menu-divider"></div>
                <a class="profile-menu-item" href="/dashboard">
                    <i class="fas fa-th-large"></i>
                    Dashboard
                </a>
                <a class="profile-menu-item" href="/jobs">
                    <i class="fas fa-briefcase"></i>
                    Job Postings
                </a>
                <div class="profile-menu-divider"></div>
                <a class="profile-menu-item danger" href="/logout">
                    <i class="fas fa-sign-out-alt"></i>
                    Sign Out
                </a>
            </div>
        `;

        wrapper.appendChild(dropdown);

        // Toggle chevron animation
        const chevron = profileEl.querySelector('.fa-chevron-down');

        profileEl.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            const isActive = dropdown.classList.toggle('active');
            if (chevron) {
                chevron.style.transition = 'transform 0.2s ease';
                chevron.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0)';
            }
        });

        // Prevent dropdown clicks from closing
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // =========================
    // CLOSE ALL DROPDOWNS
    // =========================
    function closeAllDropdowns() {
        document.querySelectorAll('.notification-dropdown.active, .profile-dropdown.active').forEach(d => {
            d.classList.remove('active');
        });
        // Reset chevron
        const chevron = document.querySelector('.user-profile .fa-chevron-down');
        if (chevron) {
            chevron.style.transform = 'rotate(0)';
        }
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-wrapper') && !e.target.closest('.profile-wrapper')) {
            closeAllDropdowns();
        }
    });

})();
