# BrainBag - AI-Powered Knowledge Base

BrainBag is a modern, AI-powered knowledge base application built with Next.js and the Vercel AI SDK. It enables users to upload documents, chat with an AI about their content, and leverage RAG (Retrieval Augmented Generation) for more accurate and contextual responses.

## Features

- **AI-Powered Chat Interface**: Interact with your documents using natural language
- **Document Upload & Management**: Upload PDF files that are automatically processed and indexed
- **RAG Implementation**: Enhances AI responses with relevant context from your documents
- **User Authentication**: Secure access to your personal knowledge base
- **File Selection**: Choose which documents to include in your conversation context
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS
- **AI Integration**: Vercel AI SDK with OpenAI GPT-4o
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom authentication system
- **File Storage**: Vercel Blob Storage
- **Vector Embeddings**: OpenAI text-embedding-3-small for semantic search
- **PDF Processing**: PDF parsing and chunking for knowledge extraction

## Project Structure

- **`/app`**: Next.js App Router pages and layouts
  - **`/(auth)`**: Authentication system
  - **`/(chat)`**: Chat functionality and API routes
- **`/ai`**: AI integration with RAG middleware
- **`/components`**: UI components
- **`/utils`**: Utility functions
- **`/drizzle`**: Database migrations and schema

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/brainbag.git
   cd brainbag
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   # or
   pnpm install --legacy-peer-deps
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values:
   ```
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Database
   DATABASE_URL=your_postgres_connection_string

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   # Auth
   AUTH_SECRET=your_auth_secret
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   # or
   pnpm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### RAG Implementation

The application uses a Retrieval Augmented Generation (RAG) approach to enhance AI responses:

1. Documents are uploaded, parsed, and split into chunks
2. Each chunk is embedded using OpenAI's text-embedding-3-small model
3. When a user asks a question, the system:
   - Embeds the question
   - Finds the most relevant document chunks using cosine similarity
   - Includes these chunks as context for the AI model
   - Returns a response that incorporates knowledge from the documents

### Database Schema

The application uses three main tables:
- `User`: Stores user authentication information
- `Chat`: Stores chat history and metadata
- `Chunk`: Stores document chunks with embeddings for retrieval

## Development

### Creating Database Migrations

To create a new migration after schema changes:

```bash
npm run generate-migration
# or
pnpm run generate-migration
```

### Running Migrations

To apply migrations to your database:

```bash
npm run migrate
# or
pnpm run migrate
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
