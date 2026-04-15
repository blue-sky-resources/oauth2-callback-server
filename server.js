#!/usr/bin/env node

const http = require('https');
const fs = require('fs');
const path = require('path');

const { parseArgs } = require('util');

const SSL_KEY = process.env.SSL_KEY || path.resolve(__dirname, 'server.key');
const SSL_CERT = process.env.SSL_CERT || path.resolve(__dirname, 'server.crt');


// Help message
const showHelp = () => {
  console.log(`
OAuth2 Callback Server for Bruno

Usage:
  npx @usebruno/oauth2-callback-server [options]

Options:
  -p, --port <number>    Port number (default: 8090, or next available)
  -h, --help            Show this help message

Examples:
  npx @usebruno/oauth2-callback-server
  npx @usebruno/oauth2-callback-server --port 8090
  npx @usebruno/oauth2-callback-server -p 8090
  `);
};

// Parse command-line arguments
let values;
try {
  ({ values } = parseArgs({
    options: {
      port: {
        type: 'string',
        short: 'p'
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false
      }
    },
    strict: true
  }));
} catch (err) {
  console.error(`Error: ${err.message}\n`);
  showHelp();
  process.exit(1);
}

// Show help
if (values.help) {
  showHelp();
  process.exit(0);
}

// Get user-specified port or null
let requestedPort = null;

if (values.port) {
  requestedPort = parseInt(values.port, 10);
  // Validate port
  if (isNaN(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
    console.error('Error: Invalid port number. Port must be between 1 and 65535.');
    process.exit(1);
  }
}

const htmlContent = `<!doctype html>
<html>
  <head>
    <title>Bruno OAuth2 Redirect</title>
    <script>
      (function() {
        var url = 'bruno://app/oauth2/callback';
        url += window.location.search || '';
        url += window.location.hash || '';
        window.open(url);
      })();
    </script>
  </head>
  <body>
    Redirecting to Bruno...
  </body>
</html>`;

// Start server
async function startServer() {
  try {
    // Dynamically import get-port (ESM module)
    const getPort = (await import('get-port')).default;

    let PORT;

    if (requestedPort) {
      // User specified a port - try to use it exactly
      PORT = await getPort({ port: requestedPort });
      if (PORT !== requestedPort) {
        console.error(`Error: Port ${requestedPort} is already in use. Please try a different port.`);
        process.exit(1);
      }
    } else {
      // No port specified - find an available port starting from 8090
      PORT = await getPort({ port: 8090 });
    }

    let sslOptions;
    try {
      sslOptions = {
        key: fs.readFileSync(SSL_KEY),
        cert: fs.readFileSync(SSL_CERT),
      };
    } catch (err) {
      console.error(`Failed to load SSL certificates: ${err.message}`);
      console.error(`  key  path: ${SSL_KEY}`);
      console.error(`  cert path: ${SSL_CERT}`);
      console.error(
        'Generate self-signed certs with:\n  openssl req -nodes -new -x509 -keyout server.key -out server.cert'
      );
      process.exit(1);
    }

    const server = http.createServer(sslOptions, (req, res) => {
      if (req.url.startsWith('/auth/callback')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
      } else if (req.url.startsWith("/test")) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end("test response");
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    // Attach error handler
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });

    // Start listening
    server.listen(PORT, () => {
      console.log(`OAuth2 callback server running at https://127.0.0.1:${PORT}/auth/callback`);
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

startServer();
