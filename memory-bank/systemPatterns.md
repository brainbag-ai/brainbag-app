# System Patterns

## Architecture
This project appears to follow a modern Next.js application architecture with the following key components:

- **App Router**: Uses Next.js App Router for routing and page structure
- **API Routes**: Likely uses Next.js API routes for backend functionality
- **Database Layer**: Uses Drizzle ORM for database interactions
- **Authentication**: Dedicated authentication system in the `app/(auth)` directory
- **Chat Interface**: Main application functionality in the `app/(chat)` directory
- **AI Integration**: AI functionality with RAG middleware in the `ai` directory

## Design Patterns

### Frontend Patterns
- **Component-Based Architecture**: UI is broken down into reusable components
- **Custom Hooks**: Uses custom React hooks (e.g., `use-scroll-to-bottom.ts`)
- **Server Components**: Likely uses Next.js Server Components for improved performance
- **Client Components**: Interactive elements using client-side React
- **Layout System**: Uses Next.js layouts for consistent UI structure

### Backend Patterns
- **Middleware**: Uses middleware for request processing (middleware.ts, rag-middleware.ts)
  - Middleware matcher configured to exclude authentication routes from Edge Runtime to avoid compatibility issues with Node.js-specific libraries
  - Pattern: `matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']`
- **ORM**: Uses Drizzle ORM for database interactions
- **Migration System**: Database schema migrations with Drizzle
- **Environment Configuration**: Uses environment variables for configuration (.env.example)

### Data Flow
- User interactions in the chat interface
- Client components send requests to API routes
- API routes interact with the database and AI services
- AI middleware processes requests with RAG capabilities
- Responses are rendered in the chat interface

## Component Relationships
- **Layout**: Provides the overall application structure
- **Navbar**: Navigation component for the application
- **Chat**: Main chat interface component
- **Message**: Individual message component within the chat
- **Markdown**: Renders markdown content in messages
- **Files**: Handles file uploads and attachments
- **History**: Manages and displays chat history
- **Form**: Input form for user messages
- **Submit Button**: Button component for form submission

## State Management
- Likely uses React's built-in state management (useState, useContext)
- Database for persistent storage of conversations and user data
- File state management for uploads and processing

## Authentication Flow
- Authentication routes and components in `app/(auth)`
- Custom authentication implementation that avoids Edge Runtime compatibility issues
- Key components:
  - Simplified auth() function that checks for session cookies
  - Custom middleware that skips authentication routes
  - Proper handling of async cookies() API in Next.js 15
- Protected routes for authenticated users
- Authentication routes excluded from Edge Runtime middleware processing

## Database Schema
- Uses Drizzle ORM with SQL (based on drizzle directory)
- Schema defined in schema.ts
- Migrations managed through Drizzle's migration system
