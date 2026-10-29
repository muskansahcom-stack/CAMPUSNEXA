<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<%@ page import="com.maintenance.model.MaintenanceIssue" %>
<%
    // Ensure session validity
    if (session == null || session.getAttribute("userId") == null) {
        response.sendRedirect("login.html?error=Please+log+in+first");
        return;
    }

    // If accessed directly without ViewIssuesServlet attribute binding, redirect to servlet
    if (request.getAttribute("issues") == null) {
        response.sendRedirect("myIssues");
        return;
    }

    @SuppressWarnings("unchecked")
    List<MaintenanceIssue> issues = (List<MaintenanceIssue>) request.getAttribute("issues");
    String username = (String) session.getAttribute("username");
    String role = (String) session.getAttribute("role");
    String initial = (username != null && !username.isEmpty()) ? username.substring(0, 1).toUpperCase() : "S";
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Reported Issues — CampusNexa</title>
    <link rel="icon" type="image/png" href="images/campusnexa-logo.png">
    <link rel="stylesheet" href="css/style.css">
</head>
<body class="portal-body">

    <!-- Mobile Top Navigation Bar -->
    <header class="mobile-topbar">
        <button id="sidebarToggle" class="menu-toggle-btn" aria-label="Toggle Navigation">☰</button>
        <div class="mobile-brand-wrap">
            <img src="images/campusnexa-logo.png" alt="CampusNexa Logo" class="mobile-logo-img">
            <span class="mobile-brand">CampusNexa</span>
        </div>
        <a href="logout" class="mobile-logout">Logout</a>
    </header>

    <div class="portal-layout">
        <!-- Sidebar Navigation Area -->
        <aside class="portal-sidebar" id="portalSidebar">
            <div class="sidebar-brand">
                <img src="images/campusnexa-logo.png" alt="CampusNexa 3D Logo" class="brand-img-logo">
                <div class="brand-text-wrap">
                    <h2>CampusNexa</h2>
                    <span class="brand-tagline">Report. Track. Resolve.</span>
                </div>
            </div>

            <!-- Current Logged-In User Information -->
            <div class="user-profile-widget">
                <div class="avatar-circle"><%= initial %></div>
                <div class="user-info">
                    <span class="user-name"><%= username != null ? escapeXml(username) : "Student" %></span>
                    <span class="user-role"><%= role != null ? escapeXml(role) : "STUDENT" %></span>
                </div>
            </div>

            <nav class="sidebar-menu">
                <a href="dashboard.html" class="menu-item" id="navOverview">
                    <span class="menu-icon">📊</span>
                    <span class="menu-label">Dashboard</span>
                </a>
                <a href="report.html" class="menu-item" id="navReportIssue">
                    <span class="menu-icon">📝</span>
                    <span class="menu-label">Report Issue</span>
                </a>
                <a href="myIssues" class="menu-item active" id="navMyIssues">
                    <span class="menu-icon">📋</span>
                    <span class="menu-label">My Reported Issues</span>
                </a>
                <a href="logout" class="menu-item logout-item" id="navLogout">
                    <span class="menu-icon">🚪</span>
                    <span class="menu-label">Logout</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <p>CampusNexa v2.0</p>
                <small>Connected to MySQL</small>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="portal-main">
            <div class="section-heading" style="margin-bottom: 1.5rem;">
                <div class="heading-row">
                    <div>
                        <h2>My Reported Issues</h2>
                        <p>Displaying maintenance tickets submitted exclusively by <strong><%= escapeXml(username) %></strong>.</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                        <span class="stat-badge blue" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                            <%= issues != null ? issues.size() : 0 %> Total Tickets
                        </span>
                        <a href="report.html" class="btn btn-primary" id="btnReportNewIssue">+ Report New Issue</a>
                    </div>
                </div>
            </div>

            <div class="card table-card">
                <% if (issues == null || issues.isEmpty()) { %>
                    <!-- Empty-State Message -->
                    <div class="empty-state" id="emptyStateContainer" style="padding: 3rem 1.5rem; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📋</div>
                        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No Maintenance Issues Reported Yet</h3>
                        <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.25rem;">
                            You have not submitted any repair or maintenance requests under this account.
                        </p>
                        <a href="report.html" class="btn btn-primary">Submit Your First Request</a>
                    </div>
                <% } else { %>
                    <!-- Live Issues Table from MySQL -->
                    <div class="table-responsive">
                        <table class="data-table" id="issuesListTable">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Location</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created Date</th>
                                    <th>Updated Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <% for (MaintenanceIssue issue : issues) {
                                    String priority = issue.getPriority() != null ? issue.getPriority().toUpperCase() : "MEDIUM";
                                    String status = issue.getStatus() != null ? issue.getStatus().toUpperCase() : "REPORTED";

                                    String priorityClass = "badge-medium";
                                    if ("LOW".equals(priority)) priorityClass = "badge-low";
                                    else if ("HIGH".equals(priority)) priorityClass = "badge-high";
                                    else if ("URGENT".equals(priority)) priorityClass = "badge-urgent";

                                    String statusClass = "status-reported";
                                    if ("IN_PROGRESS".equals(status)) statusClass = "status-in_progress";
                                    else if ("RESOLVED".equals(status)) statusClass = "status-resolved";
                                    else if ("REJECTED".equals(status)) statusClass = "status-rejected";
                                %>
                                <tr>
                                    <td><strong>#<%= issue.getId() %></strong></td>
                                    <td>
                                        <div class="table-issue-title"><%= escapeXml(issue.getTitle()) %></div>
                                    </td>
                                    <td>
                                        <div class="table-issue-desc" style="max-width: 320px; line-height: 1.4;">
                                            <%= escapeXml(issue.getDescription()) %>
                                        </div>
                                    </td>
                                    <td>
                                        <span style="font-size: 0.875rem;">📍 <%= escapeXml(issue.getLocation()) %></span>
                                    </td>
                                    <td>
                                        <span class="badge <%= priorityClass %>"><%= priority %></span>
                                    </td>
                                    <td>
                                        <span class="status-pill <%= statusClass %>"><%= status %></span>
                                    </td>
                                    <td>
                                        <small style="color: var(--text-secondary); white-space: nowrap;">
                                            <%= issue.getCreatedAt() != null ? issue.getCreatedAt().toString() : "-" %>
                                        </small>
                                    </td>
                                    <td>
                                        <small style="color: var(--text-secondary); white-space: nowrap;">
                                            <%= issue.getUpdatedAt() != null ? issue.getUpdatedAt().toString() : "-" %>
                                        </small>
                                    </td>
                                </tr>
                                <% } %>
                            </tbody>
                        </table>
                    </div>
                <% } %>
            </div>
        </main>
    </div>

    <script>
        // Mobile sidebar drawer toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('portalSidebar').classList.toggle('open');
        });
    </script>

<%!
    // Helper function for XML/HTML escaping to safeguard against XSS
    private String escapeXml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
%>
</body>
</html>
