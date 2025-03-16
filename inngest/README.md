# Inngest Integration

This directory contains the Inngest integration for background job processing in the application.

## Overview

Inngest is a platform for building and running background jobs, workflows, and event-driven functions. It provides a way to handle asynchronous tasks reliably with features like retries, scheduling, and monitoring.

## Files

- `client.ts`: Initializes the Inngest client with the application ID "brainbag"
- `functions.ts`: Defines the Inngest functions that process events

## Available Functions

### Hello World Function

A simple example function that responds to the "test/hello.world" event.

```typescript
// Event structure
{
  name: "test/hello.world",
  data: {
    email: string
  }
}

// Response
{
  message: string
}
```

### Process Data Function

A more complex example function that processes data in steps.

```typescript
// Event structure
{
  name: "data/process",
  data: {
    value: any
  }
}

// Response
{
  status: "success" | "error",
  result: any,
  processedAt: string
}
```

## Testing

You can test the Inngest functions using the following methods:

1. **Test UI**: Visit `/inngest-test` in the application to access a user interface for triggering test events.

2. **API Endpoints**:
   - `GET /api/test-inngest?email=test@example.com`: Triggers the Hello World function
   - `GET /api/test-process-data?value=test-data`: Triggers the Process Data function

## Development Setup

To develop and test Inngest functions locally:

1. Install the Inngest CLI:
   ```
   npm install -g inngest-cli
   ```

2. Run your Next.js application:
   ```
   npm run dev
   ```

3. In a separate terminal, run the Inngest dev server:
   ```
   npx inngest-cli@latest dev
   ```

4. Open the Inngest dev dashboard at [http://localhost:8288](http://localhost:8288) to view events and function executions.

## Adding New Functions

To add a new function:

1. Define the function in `functions.ts`
2. Add the function to the `functions` array in `app/api/inngest/route.ts`
3. Create a way to trigger the function (API endpoint, UI, etc.)

## Production Deployment

For production deployment, you'll need to:

1. Create an Inngest account at [https://www.inngest.com/](https://www.inngest.com/)
2. Set up your production environment with the appropriate Inngest credentials
3. Deploy your application with the Inngest webhook route (`/api/inngest`)

## Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest Next.js Integration](https://www.inngest.com/docs/sdk/serve-and-deploy/nextjs)