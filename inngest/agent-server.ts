import { createServer } from '@inngest/agent-kit/server';
import { chatAgent } from './ai-agent';

/**
 * Create and start the Inngest Agent-Kit server
 * This server will handle requests to the AI agents
 */
export const startAgentServer = (port = 3001) => {
  const server = createServer({
    agents: [chatAgent],
  });

  server.listen(port, () => {
    console.log(`Inngest Agent-Kit server running on port ${port}!`);
  });

  return server;
};

// Start the server when this file is run directly
function main() {
  startAgentServer();
}

// Check if this file is being run directly
if (typeof require !== 'undefined' && require.main === module) {
  main();
}