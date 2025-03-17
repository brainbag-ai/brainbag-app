import { createAgent, openai } from '@inngest/agent-kit';

/**
 * Create an Inngest AI-Kit agent for handling chat conversations
 * This agent will be used to process chat messages with OpenAI
 */
export const chatAgent = createAgent({
  name: 'Chat Agent',
  description: 'Handles chat conversations with RAG enhancement',
  system: 'You are a helpful assistant that provides accurate and relevant information. All user messages are being recorded and can be retrieved for context. You can confidently refer to information from previous conversations when it is relevant.',
  model: openai({
    model: 'gpt-4o',
    apiKey: process.env.OPENAI_API_KEY,
  }),
});
