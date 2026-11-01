# -*- coding: utf-8 -*-
"""
НАХИА (Mobile & Desktop Launcher)
Компьютер болон гар утаснаас нээх зориулалттай локал сервер
"""
import http.server
import socketserver
import webbrowser
import os
import socket
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    local_url = f"http://localhost:{PORT}/index.html"
    phone_url = f"http://{local_ip}:{PORT}/index.html"
    
    print("=" * 65)
    print("  🏮 НАХИА (HSK 1-9) — Аппликейшн ажиллаж байна!")
    print("=" * 65)
    print(f"  💻 Компьютер дээр нээх хаяг:  {local_url}")
    print(f"  📱 Утсан дээрээ нээх хаяг:     {phone_url}")
    print("  (Утсаараа нээхдээ компьютертэйгээ нэг Wi-Fi сүлжээнд холбогдоно)")
    print("  (Серверийг зогсоох бол: Ctrl + C дарна уу)")
    print("=" * 65)
    
    # Bind before opening the browser so the first request cannot race startup.
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
        webbrowser.open(local_url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер амжилттай зогслоо.")

if __name__ == '__main__':
    run()
