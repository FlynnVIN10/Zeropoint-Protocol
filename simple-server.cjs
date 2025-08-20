const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 3001;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zeropoint Protocol</title>
</head>
<body>
    <h1>Consensus Proposals</h1>
    <p>Welcome to the Zeropoint Protocol - Dual Consensus Agentic AI Platform</p>
    <nav>
        <a href="/consensus/proposals">Proposals</a>
        <a href="/api/healthz">Health Check</a>
    </nav>
</body>
</html>
    `);
  } else if (req.url === '/consensus/proposals') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consensus Proposals - Zeropoint Protocol</title>
</head>
<body>
    <h1>Consensus Proposals</h1>
    <p>Active proposals for dual consensus validation</p>
</body>
</html>
    `);
  } else if (req.url === '/api/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: "ok",
      commit: "8b5aee16",
      buildTime: new Date().toISOString()
    }));
  } else if (req.url === '/api/readyz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ready: true,
      version: "1.0.0",
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
