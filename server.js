// server.js – Lightweight static file server for Turup
// ─────────────────────────────────────────────────────

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.mp3':  'audio/mpeg',
    '.wav':  'audio/wav',
    '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
    // Strip query strings and decode URI
    let urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Default to index.html
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(__dirname, urlPath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 – File not found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 – Internal server error');
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🃏  Turup is running!\n`);
    console.log(`     Local:  http://localhost:${PORT}`);
    console.log(`     Press Ctrl+C to stop.\n`);
});
