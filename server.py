#!/usr/bin/env python3
import http.server
import socketserver
import os
from pathlib import Path

os.chdir(Path(__file__).parent)

PORT = 5000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serwer uruchomiony na http://0.0.0.0:{PORT}")
    httpd.serve_forever()
