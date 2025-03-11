# Technical Context

## Technologies Used

### Frontend
- **Next.js**: React framework for the application
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript
- **Tailwind CSS**: Utility-first CSS framework (based on postcss.config.mjs and tailwind.config.ts)
- **Custom Fonts**: Uses custom fonts (uncut-sans.woff2)

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Drizzle ORM**: Database ORM for SQL databases
- **SQL Database**: Likely uses a SQL database (based on Drizzle usage)

### AI Integration
- **AI SDK**: Custom AI integration in the `ai` directory
- **RAG Middleware**: Retrieval-Augmented Generation middleware for enhanced AI responses

### Authentication
- Authentication system in the `app/(auth)` directory
- Likely uses a standard auth provider or custom implementation

### File Processing
- File upload and processing capabilities
- PDF processing utilities (utils/pdf.ts)

### Development Tools
- **ESLint**: JavaScript linting (based on .eslintrc.json)
- **PostCSS**: CSS processing tool
- **TypeScript**: Static type checking
- **Git**: Version control

## Development Setup

### Environment Configuration
- Uses environment variables for configuration (.env.example)
- Likely includes API keys, database connection strings, etc.

### Build System
- Next.js build system
- TypeScript compilation
- PostCSS processing for Tailwind

### Database
- SQL database with Drizzle ORM
- Migration system for schema changes
- Schema defined in schema.ts

### Package Management
- Uses npm or pnpm (based on package-lock.json and pnpm-lock.yaml)
- Dependencies defined in package.json
- **Important**: Must use `npm install --legacy-peer-deps` for installation due to peer dependency conflicts

## Technical Constraints

### Performance
- Must provide responsive chat interface
- Efficient database queries for conversation history
- Optimized file processing

### Security
- Secure authentication system
- Safe file upload and processing
- Protected API routes

### Scalability
- Database design that can handle growing conversation history
- Efficient AI integration that can scale with usage

## Dependencies
Based on the project structure, likely dependencies include:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Drizzle ORM
- AI libraries (possibly OpenAI, Anthropic, or similar)
- File processing libraries
- Authentication libraries

Specific versions and additional dependencies would be listed in package.json.
