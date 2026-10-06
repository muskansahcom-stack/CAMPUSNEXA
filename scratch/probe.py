
import subprocess
import time
import json
import urllib.request
import os

# Start Chrome in headless mode with debugging port
chrome_proc = subprocess.Popen([
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless",
    "--disable-gpu",
    "--remote-debugging-port=9222",
    "--window-size=1440,960",
    "http://localhost:8080/demo-login?role=HIGHER_AUTHORITY"
])

time.sleep(2.5)

try:
    resp = urllib.request.urlopen("http://127.0.0.1:9222/json/list")
    targets = json.loads(resp.read().decode("utf-8"))
    print(f"Found {len(targets)} targets")
    page = next((t for t in targets if t.get("type") == "page" and "higher-authority" in t.get("url", "")), targets[0])
    ws_url = page["webSocketDebuggerUrl"]
    print("Connecting to ws:", ws_url)
finally:
    chrome_proc.terminate()
