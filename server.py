#!/usr/bin/env python3
import http.server
import socketserver
import os
from pathlib import Path

os.chdir(Path(__file__).parent)

PORT = 5000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

with socketserver.TCPServer(("0.0.0.0", PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"Serwer uruchomiony na http://0.0.0.0:{PORT}")
    httpd.serve_forever()
