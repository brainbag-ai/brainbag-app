import { createAgent, openai } from '@inngest/agent-kit';

/**
 * Create an Inngest AI-Kit agent for handling chat conversations
 * This agent will be used to process chat messages with OpenAI
 */
export const chatAgent = createAgent({
  name: 'Chat Agent',
  description: 'Handles chat conversations with RAG enhancement',
  system: 'You are a helpful assistant that provides accurate and relevant information.',
  model: openai({
    model: 'gpt-4o',
    // Note: Removed maxTokens property due to TypeScript error
    // Will need to check Inngest AI-Kit documentation for the correct property
  }),
});