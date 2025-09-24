#!/usr/bin/env python3
"""
Simple HTTP server for testing the Morning Routine Tracker PWA
Run this to test the app locally with proper HTTPS and PWA features
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8000

class MorningRoutineHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Add PWA-friendly headers
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Service Worker headers
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
        elif self.path.endswith('.png'):
            self.send_header('Content-Type', 'image/png')
            
        super().end_headers()
    
    def do_GET(self):
        # Handle root path
        if self.path == '/':
            self.path = '/index.html'
        
        # Handle service worker
        if self.path == '/sw.js':
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript')
            self.send_header('Service-Worker-Allowed', '/')
            self.end_headers()
            
            try:
                with open('sw.js', 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_error(404)
            return
        
        # Handle manifest
        if self.path == '/manifest.json':
            self.send_response(200)
            self.send_header('Content-Type', 'application/manifest+json')
            self.end_headers()
            
            try:
                with open('manifest.json', 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_error(404)
            return
        
        # Default handling
        super().do_GET()

def main():
    """Start the development server"""
    
    # Check if required files exist
    required_files = ['index.html', 'styles.css', 'app.js', 'manifest.json', 'sw.js']
    missing_files = [f for f in required_files if not Path(f).exists()]
    
    if missing_files:
        print("❌ Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure all files are in the current directory.")
        return
    
    # Check for icons directory
    if not Path('icons').exists():
        print("⚠️  Warning: 'icons' directory not found. PWA icons may not load properly.")
    
    print("🌅 Morning Routine Tracker - Development Server")
    print("=" * 50)
    print(f"Starting server on port {PORT}...")
    print(f"Access your app at: http://localhost:{PORT}")
    print("\n📱 PWA Features:")
    print("   ✅ Service Worker for offline functionality")
    print("   ✅ Web App Manifest for installation")
    print("   ✅ Responsive design for mobile/desktop")
    print("   ✅ Local data storage")
    print("\n🧠 Neuroscience Features:")
    print("   ✅ 5-4-3-2-1 Activation Counter")
    print("   ✅ Circadian Rhythm Optimization")
    print("   ✅ Dopamine Reward System")
    print("   ✅ Habit Formation Tracking")
    print("\n💡 Usage Tips:")
    print("   - Use Chrome/Edge for best PWA experience")
    print("   - Click 'Install App' in browser for native feel")
    print("   - Enable notifications for routine reminders")
    print("   - Works offline after first visit")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        with socketserver.TCPServer(("", PORT), MorningRoutineHandler) as httpd:
            print(f"✅ Server started successfully!")
            print(f"🌐 Open http://localhost:{PORT} in your browser")
            
            # Auto-open browser
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🚀 Opening browser automatically...")
            except:
                print("🔍 Please manually open http://localhost:{PORT} in your browser")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
        print("Thanks for using Morning Routine Tracker! 🌅")
    except OSError as e:
        if e.errno == 48:  # Port already in use
            print(f"❌ Port {PORT} is already in use.")
            print("Try closing other applications or use a different port.")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()
