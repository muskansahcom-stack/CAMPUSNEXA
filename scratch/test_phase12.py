import urllib.request
import urllib.parse
import json
import http.cookiejar
import sys

BASE_URL = "http://localhost:8080"

def run_tests():
    print("=== PHASE 12: HIGHER AUTHORITY / COE AUTOMATED VERIFICATION ===")

    # Test 1: Unauthenticated access to /api/higher-authority/stats
    print("\n[Test 1] Unauthenticated request to /api/higher-authority/stats")
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/higher-authority/stats")
        urllib.request.urlopen(req)
        print("FAILED: Expected 401 Unauthorized")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 401, f"Expected 401, got {e.code}"
        print(f"PASSED: Received expected HTTP {e.code} Unauthorized")

    # Test 2: Role Authorization: Student access to /api/higher-authority/stats
    print("\n[Test 2] Student role access to /api/higher-authority/stats")
    cj_student = http.cookiejar.CookieJar()
    opener_student = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_student))
    opener_student.open(f"{BASE_URL}/demo-login?role=STUDENT")
    try:
        opener_student.open(f"{BASE_URL}/api/higher-authority/stats")
        print("FAILED: Student should receive 403 Forbidden")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Expected 403, got {e.code}"
        print(f"PASSED: Student correctly rejected with HTTP {e.code} Forbidden")

    # Test 3: Role Authorization: Warden access to /api/higher-authority/stats
    print("\n[Test 3] Warden role access to /api/higher-authority/stats")
    cj_warden = http.cookiejar.CookieJar()
    opener_warden = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_warden))
    opener_warden.open(f"{BASE_URL}/demo-login?role=WARDEN")
    try:
        opener_warden.open(f"{BASE_URL}/api/higher-authority/stats")
        print("FAILED: Warden should receive 403 Forbidden")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 403, f"Expected 403, got {e.code}"
        print(f"PASSED: Warden correctly rejected with HTTP {e.code} Forbidden")

    # Test 4: Higher Authority login & Stats KPI retrieval
    print("\n[Test 4] Higher Authority login (coe_admin) & KPI Cards")
    cj_coe = http.cookiejar.CookieJar()
    opener_coe = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj_coe))
    login_resp = opener_coe.open(f"{BASE_URL}/demo-login?role=HIGHER_AUTHORITY")

    stats_resp = opener_coe.open(f"{BASE_URL}/api/higher-authority/stats")
    assert stats_resp.status == 200
    stats_data = json.loads(stats_resp.read().decode("utf-8"))
    print("Stats response:", json.dumps(stats_data, indent=2))
    assert stats_data["success"] == True
    s = stats_data["stats"]
    assert "totalEscalations" in s
    assert "pendingReview" in s
    assert "criticalIssues" in s
    assert "protectedComplaints" in s
    assert "overdue" in s
    assert "resolved" in s
    print(f"PASSED: All 6 KPI cards verified: Escalations={s["totalEscalations"]}, Pending={s["pendingReview"]}, Critical={s["criticalIssues"]}, Protected={s["protectedComplaints"]}, Overdue={s["overdue"]}, Resolved={s["resolved"]}")

    # Test 5: Strict Identity Protection for Protected Complaints
    print("\n[Test 5] Strict Anonymization on Protected Complaints")
    comp_resp = opener_coe.open(f"{BASE_URL}/api/higher-authority/complaints?filter=PROTECTED")
    comp_data = json.loads(comp_resp.read().decode("utf-8"))
    assert comp_data["success"] == True
    print(f"Protected complaints count: {comp_data["count"]}")
    assert comp_data["count"] >= 2, "Expected at least 2 protected complaints"
    for c in comp_data["complaints"]:
        print(f"Checking {c["complaintNumber"]} - studentFullName={c.get("studentFullName")}, studentUsername={c.get("studentUsername")}")
        assert c["studentFullName"] == "Identity: 🔒 PROTECTED", f"Leaked full name: {c.get("studentFullName")}"
        assert c["studentUsername"] == "PROTECTED_COMPLAINANT", f"Leaked username: {c.get("studentUsername")}"
        assert c["userId"] == 0, f"Leaked userId: {c.get("userId")}"
    print("PASSED: Complainant identity strictly masked across protected records!")

    # Test 6: Escalations review endpoint
    print("\n[Test 6] Escalations list endpoint")
    esc_resp = opener_coe.open(f"{BASE_URL}/api/higher-authority/escalations")
    esc_data = json.loads(esc_resp.read().decode("utf-8"))
    assert esc_data["success"] == True
    print(f"Escalations count: {esc_data["count"]}")
    assert esc_data["count"] >= 1, "Expected at least 1 escalation record"
    e1 = esc_data["escalations"][0]
    print(f"Escalation #1: {e1["escalationNumber"]}, Reason: {e1["reason"][:50]}..., Status: {e1["status"]}")
    print("PASSED: Escalations successfully retrieved with details.")

    # Test 7: Full Dossier Detail for Protected Complaint #8
    print("\n[Test 7] Complaint Detail Investigation Dossier (Complaint #8)")
    det_resp = opener_coe.open(f"{BASE_URL}/api/higher-authority/detail?id=8")
    det_data = json.loads(det_resp.read().decode("utf-8"))
    assert det_data["success"] == True
    c8 = det_data["complaint"]
    assert c8["studentFullName"] == "Identity: 🔒 PROTECTED"
    timeline = det_data.get("timeline", [])
    print(f"Timeline entries for #8: {len(timeline)}")
    for item in timeline:
        print(f"  Step: {item["status"]} - remarks: {item.get("remarks")} - actor: {item.get("changedByName")}")
        assert "student1" not in item.get("changedByName", "").lower(), "Leaked student username in timeline"
    print("PASSED: Complaint dossier successfully retrieved and identity protected.")

    # Test 8: Higher Authority Records Action Taken & Resolves Escalation
    print("\n[Test 8] Record Action Taken & Resolve Escalation for Complaint #2")
    action_data = urllib.parse.urlencode({
        "complaintId": 2,
        "escalationId": 1,
        "actionType": "CONTRACTOR_PENALTY",
        "actionDetails": "Higher Authority penalized contractor Rs 10,000 for safety hazard breach and ordered immediate fan motor replacement.",
        "newStatus": "RESOLVED"
    }).encode("utf-8")
    action_req = urllib.request.Request(f"{BASE_URL}/api/higher-authority/action", data=action_data, method="POST")
    action_resp = opener_coe.open(action_req)
    act_res = json.loads(action_resp.read().decode("utf-8"))
    print("Action response:", act_res)
    assert act_res["success"] == True
    print("PASSED: Action taken and directive recorded successfully.")

    # Test 9: Add Official Remarks
    print("\n[Test 9] Add Official Executive Remarks on Complaint #6")
    remarks_data = urllib.parse.urlencode({
        "complaintId": 6,
        "remarks": "Higher Authority / COE formally summoned Deputy Warden and facilities supervisor regarding repeated 5th floor sanitation neglect."
    }).encode("utf-8")
    remarks_req = urllib.request.Request(f"{BASE_URL}/api/higher-authority/remarks", data=remarks_data, method="POST")
    remarks_resp = opener_coe.open(remarks_req)
    rem_res = json.loads(remarks_resp.read().decode("utf-8"))
    print("Remarks response:", rem_res)
    assert rem_res["success"] == True
    print("PASSED: Official remarks appended.")

    # Test 10: Dispatch Official Executive Message
    print("\n[Test 10] Dispatch Official Executive Directive via Message")
    msg_data = urllib.parse.urlencode({
        "complaintId": 6,
        "messageText": "Official Order from COE Office: Inspection report with photographic evidence must be submitted by 17:00 hrs today."
    }).encode("utf-8")
    msg_req = urllib.request.Request(f"{BASE_URL}/api/higher-authority/message", data=msg_data, method="POST")
    msg_resp = opener_coe.open(msg_req)
    msg_res = json.loads(msg_resp.read().decode("utf-8"))
    print("Message response:", msg_res)
    assert msg_res["success"] == True
    print("PASSED: Executive message dispatched.")

    print("\n=== ALL 10 PHASE 12 AUTOMATED TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
