# Inngest AI-Kit POC Implementation

## Overview

This document outlines the implementation of a proof of concept (POC) for using Inngest AI-Kit to call the OpenAI chat API instead of the current direct calls to OpenAI.

## Implementation Details

The POC has been implemented with the following components:

1. **Inngest AI-Kit Agent**: Created a new agent in `inngest/ai-agent.ts` that will handle chat conversations with RAG enhancement.

2. **Inngest Function for Chat**: Added a new function in `inngest/functions.ts` called `handleChat` that processes chat messages using the Inngest AI-Kit agent.

3. **API Routes**:
   - Updated `app/api/inngest/route.ts` to include the new chat function
   - Created `app/api/chat/inngest/route.ts` to handle chat requests via Inngest
   - Created `app/api/chat/inngest/poll/route.ts` to poll for results from Inngest

4. **Custom Hook**: Created a new hook `hooks/use-inngest-chat.ts` that provides similar functionality to the existing `useChat` hook but uses Inngest for processing.

5. **Toggle Mechanism**: Added a toggle in `utils/constants.ts` and updated the Chat component to support switching between the current implementation and the Inngest AI-Kit implementation.

## Key Features

- **Parallel Implementation**: The POC allows toggling between the current implementation and the Inngest AI-Kit implementation for easy comparison.

- **RAG Integration**: The POC maintains the existing RAG functionality that enhances responses with relevant context.

- **Non-Streaming Responses**: For the POC, we've accepted that the Inngest implementation might not stream responses, with a note that this is a limitation.

- **Simple Polling Mechanism**: The POC uses a simple polling mechanism to retrieve results from Inngest.

## Limitations and Future Improvements

1. **Streaming Responses**: Investigate if Inngest AI-Kit supports streaming responses or implement a client-side simulation of streaming.

2. **Improved RAG Integration**: Fully integrate the RAG functionality with Inngest AI-Kit.

3. **Better Result Retrieval**: Replace polling with a more elegant solution for retrieving results from Inngest.

4. **Error Handling**: Implement more robust error handling and retries.

5. **Monitoring and Analytics**: Add monitoring and analytics to track the performance and usage of both implementations.

## Usage

To use the Inngest AI-Kit implementation:

1. Toggle the "Use Inngest AI-Kit" switch in the chat interface.
2. Interact with the chat as usual.
3. The system will use Inngest AI-Kit to process the messages instead of the direct OpenAI integration.

## Development Setup

To develop and test the Inngest functions locally:

1. Run the Next.js application:
   ```bash
   npm run dev
   ```

2. In a separate terminal, run the Inngest dev server:
   ```bash
   npx inngest-cli@latest dev
   ```

3. Open the Inngest dev dashboard at [http://localhost:8288](http://localhost:8288) to monitor events and function executions.