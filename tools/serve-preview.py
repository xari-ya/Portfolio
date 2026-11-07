"""Loopback-only static preview with enough backlog for parallel browser loads."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class PreviewServer(ThreadingHTTPServer):
    request_queue_size = 128
    daemon_threads = True

root=Path(__file__).resolve().parents[1]
server=PreviewServer(('127.0.0.1',4173),partial(SimpleHTTPRequestHandler,directory=str(root)))
print(f'Serving {root} at http://127.0.0.1:4173/',flush=True)
server.serve_forever()
