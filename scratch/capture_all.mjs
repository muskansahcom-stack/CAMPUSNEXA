import { spawn } from "child_process";
import fs from "fs";

async function run() {
    const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
        "--headless",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        "--window-size=1440,960",
        "http://localhost:8080/demo-login?role=HIGHER_AUTHORITY"
    ]);

    await new Promise(r => setTimeout(r, 2500));

    try {
        const listResp = await fetch("http://127.0.0.1:9222/json/list");
        const pages = await listResp.json();
        const page = pages.find(p => p.type === "page" && p.url.includes("higher-authority")) || pages[0];
        const wsUrl = page.webSocketDebuggerUrl;
        console.log("Target page:", page.url);

        const ws = new WebSocket(wsUrl);
        await new Promise((res, rej) => {
            ws.onopen = res;
            ws.onerror = rej;
        });

        let id = 1;
        function send(method, params = {}) {
            return new Promise((resolve) => {
                const reqId = id++;
                const handler = (evt) => {
                    const msg = JSON.parse(evt.data);
                    if (msg.id === reqId) {
                        ws.removeEventListener("message", handler);
                        resolve(msg.result);
                    }
                };
                ws.addEventListener("message", handler);
                ws.send(JSON.stringify({ id: reqId, method, params }));
            });
        }

        await send("Page.enable");
        await send("Runtime.enable");

        // Wait for page to initialize
        await new Promise(r => setTimeout(r, 2500));

        // 1. Capture Detail Modal for Protected Complaint #8
        console.log("1. Opening Complaint #8 Investigation Dossier...");
        await send("Runtime.evaluate", { expression: "openComplaintDetails(8)" });
        await new Promise(r => setTimeout(r, 1500));
        let shot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync("/Users/muskansah/.gemini/antigravity/brain/a3e5ac0a-ff0f-49b7-af95-499c3924bdb5/higher_authority_investigation_dossier_modal.png", Buffer.from(shot.data, "base64"));
        console.log("Saved higher_authority_investigation_dossier_modal.png");

        // Close modal
        await send("Runtime.evaluate", { expression: "CampusNexa.modal.close(\x27modalViewDetails\x27)" });
        await new Promise(r => setTimeout(r, 500));

        // 2. Open Record Action Modal
        console.log("2. Opening Action Modal for Complaint #6...");
        await send("Runtime.evaluate", { expression: "openActionModal(6, \x27CNX-2026-000006\x27, 2)" });
        await new Promise(r => setTimeout(r, 1000));
        shot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync("/Users/muskansah/.gemini/antigravity/brain/a3e5ac0a-ff0f-49b7-af95-499c3924bdb5/higher_authority_directive_action_modal.png", Buffer.from(shot.data, "base64"));
        console.log("Saved higher_authority_directive_action_modal.png");

        // Close action modal
        await send("Runtime.evaluate", { expression: "CampusNexa.modal.close(\x27modalRecordAction\x27)" });
        await new Promise(r => setTimeout(r, 500));

        // 3. Switch to Escalated Complaints Section
        console.log("3. Switching to Escalated Complaints...");
        await send("Runtime.evaluate", { expression: "switchSection(\x27escalated\x27)" });
        await new Promise(r => setTimeout(r, 1000));
        shot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync("/Users/muskansah/.gemini/antigravity/brain/a3e5ac0a-ff0f-49b7-af95-499c3924bdb5/higher_authority_escalations_queue_verified.png", Buffer.from(shot.data, "base64"));
        console.log("Saved higher_authority_escalations_queue_verified.png");

        // 4. Switch to Authority Communication
        console.log("4. Switching to Communication Hub...");
        await send("Runtime.evaluate", { expression: "switchSection(\x27communication\x27)" });
        await new Promise(r => setTimeout(r, 1500));
        shot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync("/Users/muskansah/.gemini/antigravity/brain/a3e5ac0a-ff0f-49b7-af95-499c3924bdb5/higher_authority_communication_verified.png", Buffer.from(shot.data, "base64"));
        console.log("Saved higher_authority_communication_verified.png");

        // 5. Switch to Resolution Monitoring
        console.log("5. Switching to Resolution Monitoring...");
        await send("Runtime.evaluate", { expression: "switchSection(\x27monitoring\x27)" });
        await new Promise(r => setTimeout(r, 1000));
        shot = await send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync("/Users/muskansah/.gemini/antigravity/brain/a3e5ac0a-ff0f-49b7-af95-499c3924bdb5/higher_authority_monitoring_verified.png", Buffer.from(shot.data, "base64"));
        console.log("Saved higher_authority_monitoring_verified.png");

        ws.close();
        console.log("ALL SCREENSHOTS CAPTURED SUCCESSFULLY!");
    } finally {
        chrome.kill();
    }
}

run().catch(console.error);