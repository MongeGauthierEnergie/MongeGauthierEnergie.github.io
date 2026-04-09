import http.server

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/Users/gauthiermonge/Documents/MGE/SITE_MGE', **kwargs)

with http.server.HTTPServer(('', 3000), Handler) as httpd:
    print('Serving MGE on http://localhost:3000')
    httpd.serve_forever()
