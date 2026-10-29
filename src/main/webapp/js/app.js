/**
 * CampusNexa - SaaS Enterprise Frontend Toolkit
 * Brand: CampusNexa
 * Motto: Report. Track. Resolve.
 */

const CampusNexa = (function () {
    'use strict';

    // Global Toast Container Singleton
    let toastContainer = null;

    function getOrCreateToastContainer() {
        if (!toastContainer) {
            toastContainer = document.querySelector('.cnx-toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.className = 'cnx-toast-container';
                document.body.appendChild(toastContainer);
            }
        }
        return toastContainer;
    }

    /**
     * Show a modern floating toast notification
     * @param {string} title 
     * @param {string} message 
     * @param {'success'|'danger'|'warning'|'info'} type 
     * @param {number} duration 
     */
    function toast(title, message, type = 'info', duration = 4000) {
        const container = getOrCreateToastContainer();
        const toastEl = document.createElement('div');
        toastEl.className = `cnx-toast ${type}`;

        const iconMap = {
            success: '✅',
            danger: '⚠️',
            warning: '⚡',
            info: 'ℹ️'
        };

        toastEl.innerHTML = `
            <div style="font-size: 1.25rem; line-height: 1; flex-shrink: 0;">${iconMap[type] || 'ℹ️'}</div>
            <div class="cnx-toast-content">
                <div class="cnx-toast-title">${escapeHtml(title)}</div>
                <div class="cnx-toast-body">${escapeHtml(message || '')}</div>
            </div>
            <button type="button" class="cnx-modal-close" style="font-size: 1.1rem; line-height: 1; padding: 0 4px;" aria-label="Dismiss">&times;</button>
        `;

        const closeBtn = toastEl.querySelector('button');
        closeBtn.addEventListener('click', () => dismissToast(toastEl));

        container.appendChild(toastEl);

        // Animate entrance
        requestAnimationFrame(() => {
            toastEl.classList.add('show');
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                dismissToast(toastEl);
            }, duration);
        }
    }

    function dismissToast(toastEl) {
        toastEl.classList.remove('show');
        setTimeout(() => {
            if (toastEl.parentNode) {
                toastEl.parentNode.removeChild(toastEl);
            }
        }, 350);
    }

    /**
     * Modal Controller
     */
    const modal = {
        open: function (modalId) {
            const el = document.getElementById(modalId);
            if (!el) return;
            el.classList.add('open');
            document.body.style.overflow = 'hidden';

            const onKeyDown = (e) => {
                if (e.key === 'Escape') {
                    modal.close(modalId);
                    document.removeEventListener('keydown', onKeyDown);
                }
            };
            document.addEventListener('keydown', onKeyDown);
        },
        close: function (modalId) {
            const el = document.getElementById(modalId);
            if (!el) return;
            el.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    /**
     * Generate HTML status badge
     * @param {string} status 
     */
    function badge(status) {
        if (!status) return '<span class="cnx-badge cnx-badge-submitted"><span class="cnx-badge-dot"></span>UNKNOWN</span>';
        const s = status.toUpperCase().replace(/\s+/g, '_');

        const map = {
            'SUBMITTED': { cls: 'cnx-badge-submitted', label: 'Submitted' },
            'REPORTED': { cls: 'cnx-badge-submitted', label: 'Reported' },
            'UNDER_REVIEW': { cls: 'cnx-badge-under-review', label: 'Under Review' },
            'ASSIGNED': { cls: 'cnx-badge-assigned', label: 'Assigned' },
            'IN_PROGRESS': { cls: 'cnx-badge-in-progress', label: 'In Progress' },
            'RESOLVED': { cls: 'cnx-badge-resolved', label: 'Resolved' },
            'CLOSED': { cls: 'cnx-badge-closed', label: 'Closed' },
            'ESCALATED': { cls: 'cnx-badge-escalated', label: 'Escalated' },
            'REOPENED': { cls: 'cnx-badge-reopened', label: 'Reopened' },
            'REJECTED': { cls: 'cnx-badge-reopened', label: 'Rejected' }
        };

        const config = map[s] || { cls: 'cnx-badge-submitted', label: status };
        return `<span class="cnx-badge ${config.cls}"><span class="cnx-badge-dot"></span>${config.label}</span>`;
    }

    /**
     * Generate HTML priority pill
     * @param {string} priority 
     */
    function priorityBadge(priority) {
        if (!priority) return '<span class="cnx-priority-pill cnx-priority-medium">MEDIUM</span>';
        const p = priority.toUpperCase();
        let cls = 'cnx-priority-medium';
        if (p === 'LOW') cls = 'cnx-priority-low';
        else if (p === 'HIGH') cls = 'cnx-priority-high';
        else if (p === 'CRITICAL') cls = 'cnx-priority-critical';

        return `<span class="cnx-priority-pill ${cls}">${escapeHtml(p)}</span>`;
    }

    /**
     * 5-Stage Stepper Tracker HTML
     * @param {string} currentStatus 
     */
    function renderStepper(currentStatus) {
        const stages = [
            { key: 'SUBMITTED', label: 'Submitted', icon: '1' },
            { key: 'UNDER_REVIEW', label: 'Review', icon: '2' },
            { key: 'ASSIGNED', label: 'Assigned', icon: '3' },
            { key: 'IN_PROGRESS', label: 'In Progress', icon: '4' },
            { key: 'RESOLVED', label: 'Resolved', icon: '✓' }
        ];

        const s = (currentStatus || 'SUBMITTED').toUpperCase();
        let activeIdx = 0;
        if (s === 'UNDER_REVIEW') activeIdx = 1;
        else if (s === 'ASSIGNED') activeIdx = 2;
        else if (s === 'IN_PROGRESS') activeIdx = 3;
        else if (s === 'RESOLVED' || s === 'CLOSED') activeIdx = 4;
        else if (s === 'ESCALATED') activeIdx = 3;

        let html = '<div class="cnx-stepper">';
        stages.forEach((stage, idx) => {
            let stateClass = '';
            let iconContent = stage.icon;

            if (idx < activeIdx) {
                stateClass = 'completed';
                iconContent = '✓';
            } else if (idx === activeIdx) {
                stateClass = 'active';
            }

            html += `
                <div class="cnx-step ${stateClass}">
                    <div class="cnx-step-circle">${iconContent}</div>
                    <div class="cnx-step-label">${stage.label}</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    /**
     * Empty State Renderer
     * @param {HTMLElement|string} container 
     * @param {object} options 
     */
    function renderEmptyState(container, options = {}) {
        const target = typeof container === 'string' ? document.querySelector(container) : container;
        if (!target) return;

        const icon = options.icon || '📂';
        const title = options.title || 'No records found';
        const desc = options.desc || 'There are no active items available in this category.';
        const actionHtml = options.actionText && options.actionHref ? 
            `<a href="${options.actionHref}" class="cnx-btn cnx-btn-primary cnx-btn-sm" style="margin-top: 1rem;">${escapeHtml(options.actionText)}</a>` : '';

        target.innerHTML = `
            <div class="cnx-empty-state">
                <div class="cnx-empty-icon">${icon}</div>
                <div class="cnx-empty-title">${escapeHtml(title)}</div>
                <div class="cnx-empty-desc">${escapeHtml(desc)}</div>
                ${actionHtml}
            </div>
        `;
    }

    /**
     * Skeleton Shimmer Renderer
     * @param {HTMLElement|string} container 
     * @param {'cards'|'table'|'text'} type 
     * @param {number} count 
     */
    function renderSkeleton(container, type = 'table', count = 4) {
        const target = typeof container === 'string' ? document.querySelector(container) : container;
        if (!target) return;

        let html = '';
        if (type === 'table') {
            for (let i = 0; i < count; i++) {
                html += `
                    <tr>
                        <td><div class="cnx-skeleton" style="height: 18px; width: 120px;"></div></td>
                        <td><div class="cnx-skeleton" style="height: 18px; width: 220px;"></div></td>
                        <td><div class="cnx-skeleton" style="height: 18px; width: 90px;"></div></td>
                        <td><div class="cnx-skeleton" style="height: 18px; width: 80px;"></div></td>
                        <td><div class="cnx-skeleton" style="height: 18px; width: 100px;"></div></td>
                    </tr>
                `;
            }
        } else if (type === 'cards') {
            for (let i = 0; i < count; i++) {
                html += `
                    <div class="cnx-card" style="min-height: 140px;">
                        <div class="cnx-skeleton" style="height: 16px; width: 40%; margin-bottom: 1rem;"></div>
                        <div class="cnx-skeleton" style="height: 38px; width: 70%; margin-bottom: 0.75rem;"></div>
                        <div class="cnx-skeleton" style="height: 14px; width: 50%;"></div>
                    </div>
                `;
            }
        }
        target.innerHTML = html;
    }

    /**
     * Client-side Table Pagination Helper
     */
    function setupPagination(items, page, pageSize, renderPageFn, paginationContainerEl) {
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;
        const currentPage = Math.min(Math.max(1, page), totalPages);

        const startIdx = (currentPage - 1) * pageSize;
        const endIdx = Math.min(startIdx + pageSize, totalItems);
        const pageItems = items.slice(startIdx, endIdx);

        renderPageFn(pageItems, startIdx, endIdx, totalItems);

        if (!paginationContainerEl) return;

        let btnsHtml = '';
        btnsHtml += `<button class="cnx-page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">&larr;</button>`;

        for (let p = 1; p <= totalPages; p++) {
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                btnsHtml += `<button class="cnx-page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
            } else if (p === currentPage - 2 || p === currentPage + 2) {
                btnsHtml += `<span style="padding: 0 4px; color: var(--cnx-text-muted);">...</span>`;
            }
        }

        btnsHtml += `<button class="cnx-page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">&rarr;</button>`;

        paginationContainerEl.innerHTML = `
            <div class="cnx-pagination-text">
                Showing <strong>${totalItems === 0 ? 0 : startIdx + 1}&ndash;${endIdx}</strong> of <strong>${totalItems}</strong> entries
            </div>
            <div class="cnx-pagination-btns">${btnsHtml}</div>
        `;

        const buttons = paginationContainerEl.querySelectorAll('button[data-page]');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
                if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
                    setupPagination(items, targetPage, pageSize, renderPageFn, paginationContainerEl);
                }
            });
        });
    }

    /**
     * Session Checker & Auto-Binder
     */
    async function fetchSession() {
        try {
            const resp = await fetch('api/session');
            if (resp.ok) {
                const data = await resp.json();
                if (data.authenticated) {
                    bindUserUI(data);
                    return data;
                }
            }
        } catch (e) {
            console.warn('CampusNexa session check error:', e);
        }
        return null;
    }

    function bindUserUI(sessionData) {
        const username = sessionData.username || 'User';
        const role = sessionData.role || 'GUEST';

        // Update elements with conventional IDs
        const nameEls = document.querySelectorAll('#topbarUsername, #sidebarUsername, .cnx-user-name');
        nameEls.forEach(el => el.textContent = username);

        const roleEls = document.querySelectorAll('#topbarRole, #sidebarRole, .cnx-user-role-label');
        roleEls.forEach(el => el.textContent = role.replace(/_/g, ' '));

        const initialEls = document.querySelectorAll('#userInitial, .cnx-avatar');
        initialEls.forEach(el => {
            if (el.tagName !== 'IMG') {
                el.textContent = username.charAt(0).toUpperCase();
            }
        });
    }

    /**
     * Mobile Sidebar & Modal Auto-Initializer
     */
    function init() {
        // Sidebar Toggle
        const toggleBtn = document.getElementById('sidebarToggle') || document.querySelector('.cnx-menu-toggle');
        const sidebar = document.getElementById('portalSidebar') || document.querySelector('.cnx-sidebar');
        let backdrop = document.querySelector('.cnx-sidebar-backdrop');

        if (toggleBtn && sidebar) {
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'cnx-sidebar-backdrop';
                document.body.appendChild(backdrop);
            }

            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                backdrop.classList.toggle('open');
            });

            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('open');
            });
        }

        // Global Modal Triggers (data-cnx-modal-target & data-cnx-modal-close)
        document.addEventListener('click', (e) => {
            const openTarget = e.target.closest('[data-cnx-modal-target]');
            if (openTarget) {
                const targetId = openTarget.getAttribute('data-cnx-modal-target');
                modal.open(targetId);
            }

            const closeTarget = e.target.closest('[data-cnx-modal-close]');
            if (closeTarget) {
                const targetId = closeTarget.getAttribute('data-cnx-modal-close');
                modal.close(targetId);
            }

            // Outside click modal backdrop close
            if (e.target.classList.contains('cnx-modal-backdrop')) {
                e.target.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Auto initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        toast,
        modal,
        badge,
        priorityBadge,
        renderStepper,
        renderEmptyState,
        renderSkeleton,
        setupPagination,
        fetchSession,
        init
    };
})();

window.CampusNexa = CampusNexa;
