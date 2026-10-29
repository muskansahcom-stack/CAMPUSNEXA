/**
 * CampusNexa - Database-Backed Notification & Alert Client Controller
 * Target: Phase 19 Unified Notifications across Portals
 */
const CampusNexaNotifications = (function () {
    'use strict';

    let currentNotifications = [];
    let currentUnreadCount = 0;
    let activeFilter = 'ALL';
    let dropdownOpen = false;
    let pollInterval = null;

    const TYPE_CONFIG = {
        'COMPLAINT_SUBMITTED': { icon: '📋', label: 'Submitted', cssClass: 'submitted' },
        'COMPLAINT_ASSIGNED':  { icon: '🔧', label: 'Assigned', cssClass: 'assigned' },
        'STATUS_UPDATED':      { icon: '🔄', label: 'Status Update', cssClass: 'status' },
        'COMPLAINT_RESOLVED':  { icon: '✅', label: 'Resolved', cssClass: 'resolved' },
        'COMPLAINT_REOPENED':  { icon: '⚠️', label: 'Reopened', cssClass: 'reopened' },
        'COMPLAINT_ESCALATED': { icon: '🚨', label: 'Escalated', cssClass: 'escalated' },
        'ADMIN_MESSAGE':       { icon: '🏛️', label: 'Admin Message', cssClass: 'message' },
        'AUTHORITY_MESSAGE':   { icon: '💬', label: 'Message', cssClass: 'message' },
        'PROTECTED_RESPONSE':  { icon: '🔒', label: 'Confidential', cssClass: 'protected' },
        'SYSTEM_ALERT':        { icon: '📢', label: 'System Alert', cssClass: 'alert' }
    };

    /**
     * Initializes notifications for a dashboard.
     * @param {Object} options { bellBtnId, fullContainerId, viewAllHash }
     */
    function init(options = {}) {
        const bellBtn = document.getElementById(options.bellBtnId || 'topbarNotifBtn');
        if (bellBtn) {
            setupBellAndDropdown(bellBtn, options.viewAllHash || '#notifications');
        }

        // Initial fetch
        refresh();

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('cnxNotificationDropdown');
            if (dropdown && dropdownOpen && !dropdown.contains(e.target) && !bellBtn?.contains(e.target)) {
                closeDropdown();
            }
        });

        // Periodic light polling (every 25 seconds)
        if (!pollInterval) {
            pollInterval = setInterval(fetchUnreadCount, 25000);
        }
    }

    function setupBellAndDropdown(bellBtn, viewAllHash) {
        // Ensure bell button has badge element
        let badge = bellBtn.querySelector('.cnx-notif-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cnx-notif-badge';
            badge.id = 'topbarNotifBadge';
            badge.style.display = 'none';
            bellBtn.appendChild(badge);
        }

        // Inject dropdown if not present
        if (!document.getElementById('cnxNotificationDropdown')) {
            const dropdown = document.createElement('div');
            dropdown.className = 'cnx-notif-dropdown';
            dropdown.id = 'cnxNotificationDropdown';
            dropdown.style.display = 'none';

            dropdown.innerHTML = `
                <div class="cnx-notif-dropdown-header">
                    <h4>
                        <span>🔔 Notifications</span>
                        <span class="cnx-notif-unread-pill" id="cnxDropdownUnreadPill" style="display:none;">0 new</span>
                    </h4>
                    <div class="cnx-notif-actions">
                        <button type="button" class="cnx-notif-action-btn" onclick="CampusNexaNotifications.markAllRead()">Mark all read</button>
                    </div>
                </div>
                <div class="cnx-notif-dropdown-list" id="cnxDropdownList">
                    <p style="color:#94a3b8; text-align:center; padding:2rem; font-size:0.85rem;">Loading notifications...</p>
                </div>
                <div class="cnx-notif-dropdown-footer">
                    <a href="${viewAllHash}" onclick="CampusNexaNotifications.closeDropdown(); if(window.switchSection) switchSection('notifications'); if(window.navigateTo) navigateTo('${viewAllHash}');">
                        View All Notifications &rarr;
                    </a>
                </div>
            `;

            // Insert dropdown right next to bell or in parent
            bellBtn.parentElement.style.position = 'relative';
            bellBtn.parentElement.appendChild(dropdown);
        }

        bellBtn.onclick = function (e) {
            e.stopPropagation();
            toggleDropdown();
        };
    }

    function toggleDropdown() {
        const dropdown = document.getElementById('cnxNotificationDropdown');
        if (!dropdown) return;
        dropdownOpen = !dropdownOpen;
        dropdown.style.display = dropdownOpen ? 'block' : 'none';
        if (dropdownOpen) {
            refresh();
        }
    }

    function closeDropdown() {
        const dropdown = document.getElementById('cnxNotificationDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
            dropdownOpen = false;
        }
    }

    function refresh() {
        fetch('api/notifications')
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data.notifications || []);
                currentNotifications = list;
                currentUnreadCount = typeof data.unreadCount === 'number'
                    ? data.unreadCount
                    : list.filter(n => !n.isRead).length;

                updateBadges();
                renderDropdownList();
                renderFullPageList();
            })
            .catch(err => console.error('Error fetching notifications:', err));
    }

    function fetchUnreadCount() {
        fetch('api/notifications/count')
            .then(res => res.json())
            .then(data => {
                if (typeof data.unreadCount === 'number') {
                    if (data.unreadCount !== currentUnreadCount) {
                        currentUnreadCount = data.unreadCount;
                        updateBadges();
                        // If count changed and dropdown is open, refresh full list
                        if (dropdownOpen) refresh();
                    }
                }
            })
            .catch(() => {});
    }

    function updateBadges() {
        const badges = [
            document.getElementById('topbarNotifBadge'),
            document.getElementById('sidebarNotifBadge'),
            document.getElementById('overviewNotifBadge')
        ];

        badges.forEach(b => {
            if (b) {
                if (currentUnreadCount > 0) {
                    b.textContent = currentUnreadCount > 99 ? '99+' : currentUnreadCount;
                    b.style.display = 'inline-flex';
                } else {
                    b.style.display = 'none';
                }
            }
        });

        // Topbar red dot if present
        const topbarDot = document.getElementById('topbarNotifDot');
        if (topbarDot) {
            topbarDot.style.display = currentUnreadCount > 0 ? 'block' : 'none';
        }

        // Dropdown unread pill
        const dropdownPill = document.getElementById('cnxDropdownUnreadPill');
        if (dropdownPill) {
            if (currentUnreadCount > 0) {
                dropdownPill.textContent = `${currentUnreadCount} new`;
                dropdownPill.style.display = 'inline-block';
            } else {
                dropdownPill.style.display = 'none';
            }
        }
    }

    function renderDropdownList() {
        const listEl = document.getElementById('cnxDropdownList');
        if (!listEl) return;

        if (currentNotifications.length === 0) {
            listEl.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:2rem; font-size:0.85rem;">No notifications found.</p>';
            return;
        }

        const previewList = currentNotifications.slice(0, 7);
        listEl.innerHTML = previewList.map(n => renderItemHtml(n, true)).join('');
    }

    function renderFullPageList() {
        const container = document.getElementById('fullNotificationsContainer') ||
                          document.getElementById('adminNotificationsContainer');
        if (!container) return;

        let filtered = currentNotifications;
        if (activeFilter === 'UNREAD') {
            filtered = currentNotifications.filter(n => !n.isRead);
        } else if (activeFilter === 'COMPLAINTS') {
            filtered = currentNotifications.filter(n => n.notificationType && n.notificationType.startsWith('COMPLAINT'));
        } else if (activeFilter === 'MESSAGES') {
            filtered = currentNotifications.filter(n => n.notificationType && (n.notificationType.includes('MESSAGE') || n.notificationType.includes('RESPONSE')));
        } else if (activeFilter === 'ALERTS') {
            filtered = currentNotifications.filter(n => n.notificationType === 'SYSTEM_ALERT');
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:3rem; color:#94a3b8;">
                    <div style="font-size:2.5rem; margin-bottom:0.5rem;">📭</div>
                    <div style="font-weight:600; font-size:1rem; color:#f1f5f9;">No notifications in this view</div>
                    <p style="font-size:0.85rem; margin-top:0.25rem;">You are completely caught up!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(n => renderItemHtml(n, false)).join('');
    }

    function renderItemHtml(n, isCompact) {
        const typeInfo = TYPE_CONFIG[n.notificationType] || { icon: '🔔', label: 'Notice', cssClass: 'status' };
        const timeAgo = formatTimeAgo(n.createdAt);
        const compRef = n.complaintId ? `<a href="javascript:void(0)" onclick="CampusNexaNotifications.handleComplaintClick(${n.complaintId}, event)" class="cnx-notif-ticket-link">#Ticket ${n.complaintId}</a>` : '';

        return `
            <div class="cnx-notif-item ${!n.isRead ? 'unread' : ''}" onclick="CampusNexaNotifications.handleClick(${n.id}, ${n.complaintId || 'null'}, '${escapeAttr(n.linkUrl || '')}')">
                <div class="cnx-notif-icon-circle ${typeInfo.cssClass}">
                    ${typeInfo.icon}
                </div>
                <div class="cnx-notif-content">
                    <div class="cnx-notif-topline">
                        <span class="cnx-notif-title">${escapeHtml(n.title)}</span>
                        <span class="cnx-notif-type-tag">${typeInfo.label}</span>
                    </div>
                    <div class="cnx-notif-body">${escapeHtml(n.message)}</div>
                    <div class="cnx-notif-meta">
                        <span>${timeAgo}</span>
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                            ${compRef}
                            ${!n.isRead ? `
                                <button type="button" class="cnx-notif-action-btn" title="Mark as read" onclick="CampusNexaNotifications.markRead(${n.id}, event)">
                                    ✓ Read
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function markRead(id, event) {
        if (event) event.stopPropagation();

        const params = new URLSearchParams();
        params.append('action', 'markRead');
        params.append('id', id);

        fetch('api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        .then(r => r.json())
        .then(() => {
            // Local update for instant responsive feel
            const item = currentNotifications.find(n => n.id === id);
            if (item && !item.isRead) {
                item.isRead = true;
                currentUnreadCount = Math.max(0, currentUnreadCount - 1);
                updateBadges();
                renderDropdownList();
                renderFullPageList();
            }
        })
        .catch(err => console.error('Error marking notification read:', err));
    }

    function markAllRead() {
        const params = new URLSearchParams();
        params.append('action', 'markAllRead');

        fetch('api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        })
        .then(r => r.json())
        .then(() => {
            currentNotifications.forEach(n => n.isRead = true);
            currentUnreadCount = 0;
            updateBadges();
            renderDropdownList();
            renderFullPageList();
            if (window.CampusNexa?.toast) {
                window.CampusNexa.toast('Notifications', 'All notifications marked as read', 'success');
            }
        })
        .catch(err => console.error('Error marking all notifications read:', err));
    }

    function handleClick(id, complaintId, linkUrl) {
        markRead(id);
        closeDropdown();

        if (linkUrl && linkUrl.trim().length > 0) {
            if (linkUrl.startsWith('#')) {
                if (window.navigateTo) window.navigateTo(linkUrl);
                else if (window.switchSection) window.switchSection(linkUrl.replace('#', ''));
                else window.location.hash = linkUrl;
            } else if (linkUrl.startsWith('/')) {
                window.location.href = linkUrl;
            }
            return;
        }

        if (complaintId) {
            handleComplaintClick(complaintId);
        }
    }

    function handleComplaintClick(complaintId, event) {
        if (event) event.stopPropagation();
        closeDropdown();

        if (window.navigateTo) {
            window.navigateTo('#track-complaint');
            const searchInput = document.getElementById('trackSearchInput');
            if (searchInput) {
                searchInput.value = complaintId;
                if (window.searchComplaintLifecycle) window.searchComplaintLifecycle();
            }
        }
    }

    function setFilter(filterType) {
        activeFilter = filterType;
        const filterBtns = document.querySelectorAll('.cnx-notif-filter-btn');
        filterBtns.forEach(btn => {
            if (btn.dataset.filter === filterType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        renderFullPageList();
    }

    function formatTimeAgo(timestampStr) {
        if (!timestampStr) return 'Recently';
        const d = new Date(timestampStr);
        if (isNaN(d.getTime())) return timestampStr;

        const now = new Date();
        const diffSecs = Math.floor((now - d) / 1000);

        if (diffSecs < 60) return 'Just now';
        if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
        if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
        if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;

        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttr(str) {
        if (!str) return '';
        return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    return {
        init: init,
        refresh: refresh,
        markRead: markRead,
        markAllRead: markAllRead,
        toggleDropdown: toggleDropdown,
        closeDropdown: closeDropdown,
        handleClick: handleClick,
        handleComplaintClick: handleComplaintClick,
        setFilter: setFilter
    };
})();
