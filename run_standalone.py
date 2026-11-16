#!/usr/bin/env python3
"""
Convenience launcher for the standalone Plant Disease Detection module.

Usage:
  python run_standalone.py            # Starts backend service on port 5001
  python run_standalone.py --test     # Runs verification test suite against backend
  python run_standalone.py --all      # Starts both backend and frontend concurrently
"""

import os
import sys
import time
import shutil
import subprocess

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def get_python_executable():
    """Finds a compatible Python interpreter that has the required ML packages."""
    if "PYTHON_EXEC" in os.environ and os.path.exists(os.environ["PYTHON_EXEC"]):
        return os.environ["PYTHON_EXEC"]
    
    try:
        res = subprocess.run([sys.executable, "-c", "import tensorflow, keras, flask; print('ok')"], capture_output=True, text=True, timeout=15)
        if res.returncode == 0:
            return sys.executable
    except Exception:
        pass

    candidates = [
        "/Users/Kartikkk/Documents/Projects/AGRO/ai/venv/bin/python",
        os.path.join(ROOT_DIR, ".venv", "bin", "python"),
        os.path.join(ROOT_DIR, "venv", "bin", "python"),
        os.path.join(BACKEND_DIR, "venv", "bin", "python"),
        "/usr/local/bin/python3.13",
        "/usr/local/bin/python3",
    ]
    for cand in candidates:
        if os.path.exists(cand):
            try:
                res = subprocess.run([cand, "-c", "import tensorflow, keras, flask; print('ok')"], capture_output=True, text=True, timeout=15)
                if res.returncode == 0:
                    return cand
            except Exception:
                continue

    return sys.executable

def free_ports(ports):
    """Ensures ports are clean and free before starting services."""
    for port in ports:
        try:
            res = subprocess.run(["lsof", "-ti", f":{port}"], capture_output=True, text=True)
            pids = [p.strip() for p in res.stdout.split() if p.strip()]
            for pid in pids:
                if int(pid) != os.getpid():
                    os.kill(int(pid), 9)
        except Exception:
            pass
    time.sleep(0.5)

def run_backend():
    free_ports([5001])
    py = get_python_executable()
    print(f"🌾 Starting Plant Disease Detection Backend on http://localhost:5001 (using {py})...")
    env = os.environ.copy()
    env["PYTHONPATH"] = BACKEND_DIR
    subprocess.run([py, os.path.join(BACKEND_DIR, "app.py")], cwd=BACKEND_DIR, env=env)

def run_tests():
    py = get_python_executable()
    print(f"🧪 Running Standalone Verification Tests (using {py})...")
    test_script = os.path.join(BACKEND_DIR, "test_api.py")
    res = subprocess.run([py, test_script], cwd=BACKEND_DIR)
    sys.exit(res.returncode)

import http.server
import socketserver
import threading

class PortRedirectHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(302)
        self.send_header('Location', f'http://localhost:5174{self.path}')
        self.end_headers()
    def do_HEAD(self):
        self.do_GET()
    def log_message(self, format, *args):
        pass

def start_redirector(port=5175):
    try:
        class ReusableTCPServer(socketserver.TCPServer):
            allow_reuse_address = True
        httpd = ReusableTCPServer(("", port), PortRedirectHandler)
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
    except Exception:
        pass

def run_all():
    free_ports([5001, 5174, 5175])
    start_redirector(5175)
    py = get_python_executable()
    print(f"🌾 Starting Plant Disease AI (Backend + Frontend) using {py}...")
    env = os.environ.copy()
    env["PYTHONPATH"] = BACKEND_DIR
    backend_proc = subprocess.Popen([py, os.path.join(BACKEND_DIR, "app.py")], cwd=BACKEND_DIR, env=env)
    time.sleep(2)
    npm_cmd = shutil.which("npm") or "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=FRONTEND_DIR)

    print("\n✅ Services running:")
    print("   📡 Backend API:  http://localhost:5001")
    print("   💻 Frontend Web: http://localhost:5174 (or configured Vite port)")
    print("   Press Ctrl+C to stop.\n")

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None or frontend_proc.poll() is not None:
                break
    except KeyboardInterrupt:
        pass
    finally:
        print("\n🛑 Shutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()
        print("Done.")

if __name__ == "__main__":
    if "--test" in sys.argv:
        run_tests()
    elif "--all" in sys.argv:
        run_all()
    else:
        run_backend()
