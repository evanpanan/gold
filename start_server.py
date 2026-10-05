import http.server
import socketserver

PORT = 9090
DIRECTORY = '/Users/evan/Desktop/技术/gold'


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', PORT), MyHTTPRequestHandler) as httpd:
    print(f'Serving GoldenRock website at http://127.0.0.1:{PORT}')
    print(f'Website directory: {DIRECTORY}')
    print('Press Ctrl+C to stop the server')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServer stopped.')
