// A simple HTTP server that responds to agent requests
const http = require('http');

// Create a server that responds to all requests with a simple AI response
const server = http.createServer((req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Only handle POST requests to /agents/Chat%20Agent/run
  if (req.method === 'POST' && req.url === '/agents/Chat%20Agent/run') {
    let body = '';
    
    // Collect the request body
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    // Process the request when the body is fully received
    req.on('end', () => {
      console.log('Received request:', body);
      
      try {
        const data = JSON.parse(body);
        const input = data.input || '';
        
        // Generate a simple response
        const output = `I'm a simple AI agent responding to your message: "${input}"
        
This is a simulated response from the agent-kit server. In a production environment, this would be processed by a real AI model.`;
        
        // Send the response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ output }));
      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
  } else {
    // Handle all other requests
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the server on port 3001
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Simple agent server running on http://localhost:${PORT}`);
});