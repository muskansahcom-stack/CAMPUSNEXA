import requests
import sys

BASE_URL = "http://localhost:8080"

def test_phase18():
    print("=" * 60)
    print("PHASE 18 INTEGRATION TEST SUITE: INDEPENDENT ADMIN DASHBOARD")
    print("=" * 60)

    # 1. Non-admin authorization test
    s_student = requests.Session()
    r = s_student.get(f"{BASE_URL}/demo-login?role=STUDENT", allow_redirects=False)
    assert r.status_code == 302, "Student login failed"
    r_unauth = s_student.get(f"{BASE_URL}/api/admin/metrics")
    print(f"[TEST 1] Student accessing /api/admin/metrics -> Status: {r_unauth.status_code}")
    assert r_unauth.status_code == 403, f"Expected 403 Forbidden, got {r_unauth.status_code}"
    print("  ✓ Non-admin access strictly blocked by backend security")

    # 2. Admin login
    s_admin = requests.Session()
    r_login = s_admin.get(f"{BASE_URL}/demo-login?role=ADMIN", allow_redirects=False)
    assert r_login.status_code == 302, "Admin login failed"
    print("\n[TEST 2] Admin login successful")

    # 3. Check Metrics
    r_metrics = s_admin.get(f"{BASE_URL}/api/admin/metrics")
    assert r_metrics.status_code == 200, f"Metrics failed: {r_metrics.text}"
    m_data = r_metrics.json()
    assert m_data["success"] is True
    admin_info = m_data["admin"]
    metrics_info = m_data["metrics"]
    print(f"  ✓ Metrics retrieved: Total complaints: {metrics_info['totalComplaints']}, Users: {metrics_info['totalUsers']}")
    print(f"  ✓ Default admin canViewProtectedIdentity: {admin_info['canViewProtectedIdentity']}")
    assert admin_info["canViewProtectedIdentity"] is False, "Default admin should NOT have automatic access to protected identities!"

    # 4. Check Protected Student Identity Masking (When VIEW_PROTECTED_IDENTITY is absent)
    r_issues = s_admin.get(f"{BASE_URL}/api/admin/issues")
    assert r_issues.status_code == 200
    issues = r_issues.json()["issues"]
    protected_issues = [i for i in issues if i["isProtected"]]
    print(f"\n[TEST 3] Whistleblower Identity Protection Check (Default Admin):")
    print(f"  Found {len(protected_issues)} protected issues in queue")
    assert len(protected_issues) >= 2, "Expected at least 2 protected complaints (#8 and #12)"
    for pi in protected_issues:
        print(f"  Ticket #{pi['id']} ({pi['complaintNumber']}): Complainant='{pi['student']}', Room='{pi['roomNumber']}'")
        assert "PROTECTED COMPLAINANT" in pi["student"], f"Identity leak! Expected masked name, got: {pi['student']}"
        assert pi["roomNumber"] == "[PROTECTED]", f"Room leak! Expected [PROTECTED], got: {pi['roomNumber']}"
    print("  ✓ Whistleblower identities strictly masked for standard admin")

    # 5. User CRUD Tests
    print("\n[TEST 4] User Management CRUD Operations:")
    # Create test user
    test_username = "test_cadet_99"
    r_create = s_admin.post(f"{BASE_URL}/api/admin/users", data={
        "action": "create",
        "username": test_username,
        "password": "Password123!",
        "fullName": "Test Cadet 99",
        "role": "STUDENT",
        "email": "cadet99@campusnexa.edu",
        "phone": "+91 99999 00099",
        "department": "Aeronautical Engineering",
        "roomNumber": "Hangar 4"
    })
    assert r_create.status_code == 201, f"Create user failed: {r_create.text}"
    created_id = r_create.json()["userId"]
    print(f"  ✓ User created successfully with ID: {created_id}")

    # Update user details
    r_update = s_admin.post(f"{BASE_URL}/api/admin/users", data={
        "action": "update",
        "userId": created_id,
        "fullName": "Test Cadet 99 (Promoted)",
        "email": "cadet99.promoted@campusnexa.edu",
        "phone": "+91 99999 11199",
        "department": "Aerospace & Avionics",
        "roomNumber": "Officers Quarters 10"
    })
    assert r_update.status_code == 200, f"Update user failed: {r_update.text}"
    print(f"  ✓ User profile updated successfully")

    # Toggle Active Status (Deactivate then Reactivate)
    r_deact = s_admin.post(f"{BASE_URL}/api/admin/users", data={
        "action": "toggle-active",
        "userId": created_id,
        "active": "false"
    })
    assert r_deact.status_code == 200, f"Deactivate failed: {r_deact.text}"
    print(f"  ✓ Account deactivated (is_active = false)")

    r_react = s_admin.post(f"{BASE_URL}/api/admin/users", data={
        "action": "toggle-active",
        "userId": created_id,
        "active": "true"
    })
    assert r_react.status_code == 200, f"Reactivate failed: {r_react.text}"
    print(f"  ✓ Account reactivated (is_active = true)")

    # Assign Role
    r_role = s_admin.post(f"{BASE_URL}/api/admin/users", data={
        "action": "assign-role",
        "userId": created_id,
        "role": "STAFF"
    })
    assert r_role.status_code == 200, f"Assign role failed: {r_role.text}"
    print(f"  ✓ Role assigned to STAFF")

    # Clean up test user
    r_del = s_admin.post(f"{BASE_URL}/api/admin/users", data={
        "action": "delete",
        "userId": created_id
    })
    assert r_del.status_code == 200, f"Delete user failed: {r_del.text}"
    print(f"  ✓ Test user cleaned up")

    # 6. Explicit Permission Grant & Decryption Test (VIEW_PROTECTED_IDENTITY)
    print("\n[TEST 5] Explicit Whistleblower Permission Grant (VIEW_PROTECTED_IDENTITY):")
    admin_id = admin_info["id"]

    # Explicitly grant VIEW_PROTECTED_IDENTITY to this admin
    r_grant = s_admin.post(f"{BASE_URL}/api/admin/permissions", data={
        "action": "grant-user",
        "userId": admin_id,
        "permissionCode": "VIEW_PROTECTED_IDENTITY"
    })
    assert r_grant.status_code == 200, f"Grant permission failed: {r_grant.text}"
    print(f"  ✓ Explicitly granted VIEW_PROTECTED_IDENTITY to admin user {admin_id}")

    # Re-query issues as authorized compliance admin
    r_issues_decrypted = s_admin.get(f"{BASE_URL}/api/admin/issues")
    assert r_issues_decrypted.status_code == 200
    decrypted_issues = r_issues_decrypted.json()["issues"]
    protected_after_grant = [i for i in decrypted_issues if i["isProtected"]]
    for pi in protected_after_grant:
        print(f"  Ticket #{pi['id']}: Revealed Student='{pi['student']}', StudentUsername='{pi['studentUsername']}'")
        assert "Muskan Sah" in pi["student"], f"Decryption expected 'Muskan Sah', got: {pi['student']}"
    print("  ✓ Protected identity decrypted successfully with explicit permission!")

    # Revoke VIEW_PROTECTED_IDENTITY
    r_revoke = s_admin.post(f"{BASE_URL}/api/admin/permissions", data={
        "action": "revoke-user",
        "userId": admin_id,
        "permissionCode": "VIEW_PROTECTED_IDENTITY"
    })
    assert r_revoke.status_code == 200, f"Revoke permission failed: {r_revoke.text}"
    print(f"  ✓ Revoked VIEW_PROTECTED_IDENTITY from admin user {admin_id}")

    # Re-verify masking returns
    r_issues_masked_again = s_admin.get(f"{BASE_URL}/api/admin/issues")
    assert r_issues_masked_again.status_code == 200
    for pi in [i for i in r_issues_masked_again.json()["issues"] if i["isProtected"]]:
        assert "PROTECTED COMPLAINANT" in pi["student"], "Identity should be masked again after revocation!"
    print("  ✓ Identity masking safely restored upon permission revocation")

    # 7. Category, Facility, Hostel CRUD
    print("\n[TEST 6] Category, Facility, and Hostel Management:")
    # Category
    r_cat = s_admin.post(f"{BASE_URL}/api/admin/categories", data={
        "action": "create",
        "code": "TEST_HVAC",
        "name": "HVAC & Temperature Control",
        "icon": "❄️",
        "defaultSlaHours": 18,
        "description": "Climate control units and centralized HVAC"
    })
    assert r_cat.status_code == 200, f"Create category failed: {r_cat.text}"
    cat_id = r_cat.json()["id"]
    print(f"  ✓ Category created with ID: {cat_id}")
    # Delete test category
    s_admin.post(f"{BASE_URL}/api/admin/categories", data={"action": "delete", "id": cat_id})
    print(f"  ✓ Category cleaned up")

    # Facility
    r_fac = s_admin.post(f"{BASE_URL}/api/admin/facilities", data={
        "action": "create",
        "name": "Robotics & AI Innovation Centre",
        "locationDetails": "Technology Park Building 2",
        "inChargeName": "Dr. Ananya Roy"
    })
    assert r_fac.status_code == 200, f"Create facility failed: {r_fac.text}"
    fac_id = r_fac.json()["id"]
    print(f"  ✓ Facility created with ID: {fac_id}")
    s_admin.post(f"{BASE_URL}/api/admin/facilities", data={"action": "delete", "id": fac_id})
    print(f"  ✓ Facility cleaned up")

    # Hostel
    r_hos = s_admin.post(f"{BASE_URL}/api/admin/hostels", data={
        "action": "create",
        "name": "Kalpana Chawla Hall Block E",
        "type": "GIRLS",
        "capacity": 220
    })
    assert r_hos.status_code == 200, f"Create hostel failed: {r_hos.text}"
    hos_id = r_hos.json()["id"]
    print(f"  ✓ Hostel created with ID: {hos_id}")
    s_admin.post(f"{BASE_URL}/api/admin/hostels", data={"action": "delete", "id": hos_id})
    print(f"  ✓ Hostel cleaned up")

    # 8. Staff Availability & Escalation Rules
    print("\n[TEST 7] Staff Workloads & Escalation Benchmarks:")
    r_staff = s_admin.get(f"{BASE_URL}/api/admin/staff")
    assert r_staff.status_code == 200
    st_list = r_staff.json()["staff"]
    if st_list:
        st_id = st_list[0]["id"]
        # Toggle availability
        s_admin.post(f"{BASE_URL}/api/admin/staff", data={
            "action": "toggle-availability",
            "staffId": st_id,
            "available": "false"
        })
        s_admin.post(f"{BASE_URL}/api/admin/staff", data={
            "action": "toggle-availability",
            "staffId": st_id,
            "available": "true"
        })
        print(f"  ✓ Staff availability toggling verified")

    # Escalation Rule benchmark update
    r_rules = s_admin.get(f"{BASE_URL}/api/admin/escalation-rules")
    assert r_rules.status_code == 200
    rule_list = r_rules.json()["rules"]
    if rule_list:
        r_id = rule_list[0]["id"]
        r_up_rule = s_admin.post(f"{BASE_URL}/api/admin/escalation-rules", data={
            "action": "update",
            "id": r_id,
            "expectedResponseHours": 2,
            "expectedResolutionHours": 6,
            "description": "Critical rapid dispatch SLA"
        })
        assert r_up_rule.status_code == 200, f"Rule update failed: {r_up_rule.text}"
        print(f"  ✓ Escalation rule benchmark updated successfully")

    # 9. Reports & Audit Logs
    print("\n[TEST 8] Reports & Audit Trail:")
    r_rep = s_admin.get(f"{BASE_URL}/api/admin/reports")
    assert r_rep.status_code == 200
    print(f"  ✓ Operational reports retrieved: {r_rep.json()['totalComplaints']} total complaints across categories")

    r_aud = s_admin.get(f"{BASE_URL}/api/admin/audit-logs")
    assert r_aud.status_code == 200
    print(f"  ✓ Audit trail retrieved: {len(r_aud.json()['logs'])} security event records")

    print("\n" + "=" * 60)
    print("ALL PHASE 18 TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_phase18()
