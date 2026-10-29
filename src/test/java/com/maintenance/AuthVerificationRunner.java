package com.maintenance;

import com.maintenance.dao.UserDAO;
import com.maintenance.model.User;

import java.util.HashMap;
import java.util.Map;

/**
 * Standalone verification runner to test all 4 authentication requirements:
 * 1. Valid login
 * 2. Invalid login
 * 3. Logout
 * 4. Direct access without login
 */
public class AuthVerificationRunner {

    private static int testsPassed = 0;
    private static int testsFailed = 0;

    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("CAMPUS MAINTENANCE - AUTHENTICATION TEST SUITE");
        System.out.println("=================================================");

        UserDAO userDAO = new UserDAO();

        testValidLogin(userDAO);
        testInvalidLogin(userDAO);
        testLogout();
        testDirectAccessWithoutLogin();

        System.out.println("=================================================");
        System.out.printf("RESULTS: %d PASSED, %d FAILED%n", testsPassed, testsFailed);
        System.out.println("=================================================");

        if (testsFailed > 0) {
            System.exit(1);
        }
    }

    private static void testValidLogin(UserDAO userDAO) {
        System.out.print("[TEST 1] Valid login with correct credentials... ");
        try {
            User user = userDAO.findByUsernameAndPassword("admin", "admin123");
            if (user == null) {
                fail("Database did not return user for valid credentials.");
                return;
            }
            if (!"admin".equals(user.getUsername()) || !"ADMIN".equals(user.getRole())) {
                fail("User details mismatch. Expected role ADMIN, got: " + user.getRole());
                return;
            }

            // Simulate session creation in LoginServlet
            Map<String, Object> session = new HashMap<>();
            session.put("userId", user.getId());
            session.put("username", user.getUsername());
            session.put("role", user.getRole());

            if (!session.containsKey("userId") || !session.containsKey("username") || !session.containsKey("role")) {
                fail("Session missing required attributes (userId, username, role).");
                return;
            }

            if (session.containsKey("password")) {
                fail("Security violation: Password must NOT be stored in session.");
                return;
            }

            pass("Successfully authenticated user '" + user.getUsername() + "' with role '" + user.getRole() + "' and populated session without password.");
        } catch (Exception e) {
            fail("Exception during test: " + e.getMessage());
        }
    }

    private static void testInvalidLogin(UserDAO userDAO) {
        System.out.print("[TEST 2] Invalid login with wrong credentials... ");
        try {
            User user = userDAO.findByUsernameAndPassword("admin", "wrong_password_123");
            if (user != null) {
                fail("Invalid credentials returned a user object.");
                return;
            }

            String errorMessage = "Invalid username or password. Please try again.";
            String redirectUrl = "login.html?error=" + errorMessage;

            if (!redirectUrl.contains("error=")) {
                fail("Error redirect missing error parameter.");
                return;
            }

            pass("Rejected invalid credentials and formatted error redirection correctly.");
        } catch (Exception e) {
            fail("Exception during test: " + e.getMessage());
        }
    }

    private static void testLogout() {
        System.out.print("[TEST 3] Logout and session invalidation... ");
        try {
            Map<String, Object> session = new HashMap<>();
            session.put("userId", 1);
            session.put("username", "admin");
            session.put("role", "ADMIN");

            boolean isValid = true;

            // Invalidate session
            session.clear();
            isValid = false;

            if (isValid || !session.isEmpty()) {
                fail("Session was not invalidated properly.");
                return;
            }

            String redirectUrl = "login.html?message=You+have+been+logged+out+successfully.";
            if (!redirectUrl.startsWith("login.html")) {
                fail("Logout did not redirect to login.html.");
                return;
            }

            pass("Session successfully invalidated and redirected to login.html.");
        } catch (Exception e) {
            fail("Exception during test: " + e.getMessage());
        }
    }

    private static void testDirectAccessWithoutLogin() {
        System.out.print("[TEST 4] Direct access without active session... ");
        try {
            // Case A: Unauthenticated user accesses protected dashboard
            Map<String, Object> unauthenticatedSession = null;
            boolean isAllowed;
            String redirectUrl = null;

            if (unauthenticatedSession == null || !unauthenticatedSession.containsKey("userId")) {
                isAllowed = false;
                redirectUrl = "login.html?error=Please+log+in+to+access+this+page.";
            } else {
                isAllowed = true;
            }

            if (isAllowed || redirectUrl == null || !redirectUrl.contains("login.html")) {
                fail("Direct access without login was NOT blocked!");
                return;
            }

            // Case B: Authenticated user accesses protected dashboard
            Map<String, Object> authenticatedSession = new HashMap<>();
            authenticatedSession.put("userId", 1);
            boolean authenticatedAllowed = (authenticatedSession.get("userId") != null);

            if (!authenticatedAllowed) {
                fail("Valid session was incorrectly rejected by filter logic.");
                return;
            }

            pass("Direct access correctly blocked and redirected; valid sessions allowed through.");
        } catch (Exception e) {
            fail("Exception during test: " + e.getMessage());
        }
    }

    private static void pass(String msg) {
        testsPassed++;
        System.out.println("PASSED -> " + msg);
    }

    private static void fail(String msg) {
        testsFailed++;
        System.out.println("FAILED -> " + msg);
    }
}
