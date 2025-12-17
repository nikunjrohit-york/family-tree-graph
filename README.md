# Family Tree Graph Management System

A comprehensive visual relationship management application designed to help users build, visualize, and manage their complete family networks and social connections. While supporting wedding planning use cases, the system serves as a universal family tree builder where users can map their entire extended family, track relationships across generations, and easily expand family branches from any person's node.

## 🌟 Features

- **Interactive Canvas-Based Interface**: Visual family tree builder with drag-and-drop functionality
- **Comprehensive Relationship Management**: Support for all family relationships, in-laws, friends, and custom connections
- **Dynamic Relationship Calculation**: Automatic calculation of cousin degrees, generation distances, and relationship paths
- **Real-time Collaboration**: Multi-user support with live updates
- **Family Analytics**: Statistics, insights, and relationship counting
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Wedding Planning Support**: Specialized features for managing wedding guest lists
- **Data Export/Import**: Support for GEDCOM and other family tree formats

## 🏗️ Architecture

This project uses a modern monorepo architecture with the following structure:

```
family-tree-graph/
├── apps/
│   ├── frontend/          # React + Vite + TypeScript
│   └── backend/           # NestJS + Prisma + PostgreSQL
├── packages/
│   └── shared/            # Shared types and utilities
└── turbo.json             # Monorepo configuration
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Canvas**: Konva.js for high-performance 2D rendering
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library

### Backend

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest with Property-Based Testing (fast-check)
- **Validation**: Zod schemas

### DevOps & Tools

- **Monorepo**: Turbo for build orchestration
- **Database Hosting**: Supabase
- **Type Safety**: End-to-end TypeScript
- **Code Quality**: ESLint + Prettier
- **Testing Strategy**: Unit + Property-Based + Integration tests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd family-tree-graph
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   **Backend Environment:**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Update `apps/backend/.env` with your Supabase credentials:

   ```env
   # Database - Supabase
   DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

   # Application settings
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173

   # Supabase
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   **Frontend Environment:**

   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   ```

   Update `apps/frontend/.env` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:3000
   ```

4. **Set up the database**

   ```bash
   cd apps/backend
   npx prisma migrate dev --name init
   npx prisma generate
   cd ../..
   ```

5. **Build the project**

   ```bash
   npm run build
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api

## 📋 Available Scripts

### Root Level Commands

```bash
# Start both frontend and backend in development mode
npm run dev

# Build all packages
npm run build

# Run all tests
npm test

# Lint all packages
npm run lint

# Clean build artifacts
npm run clean
```

### Backend Commands

```bash
cd apps/backend

# Development with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run property-based tests
npm test -- --testPathPattern=property

# Database operations
npm run prisma:migrate    # Run migrations
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open Prisma Studio
```

### Frontend Commands

```bash
cd apps/frontend

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🗄️ Database Schema

The system uses a flexible PostgreSQL schema with three main entities:

- **FamilyTree**: Container for family/social networks
- **Person**: Individual people with comprehensive profile information
- **Relationship**: Connections between people with dynamic calculation fields

Key features:

- Support for all relationship types (family, in-laws, friends, custom)
- Dynamic cousin degree and generation distance calculation
- Automatic inverse relationship creation
- Cascade deletion for data integrity

## 🧪 Testing

The project includes comprehensive testing:

- **Property-Based Tests**: 100+ iterations per test using fast-check
- **Unit Tests**: Component and service-level testing
- **Integration Tests**: End-to-end API testing

Run tests:

```bash
# All tests
npm test

# Backend tests only
cd apps/backend && npm test

# Frontend tests only
cd apps/frontend && npm test
```

## 📚 API Documentation

Once the backend is running, visit http://localhost:3000/api for interactive Swagger documentation.

### Key Endpoints

- `GET /family-trees` - List all family trees
- `POST /family-trees` - Create a new family tree
- `GET /people?treeId=<id>` - Get all people in a tree
- `POST /people` - Add a new person
- `POST /relationships` - Create a relationship
- `GET /family-trees/:id/stats` - Get family tree statistics

## 🔧 Development

### Project Structure

```
apps/backend/src/
├── person/              # Person management
├── relationship/        # Relationship management
├── family-tree/         # Family tree operations
├── prisma/             # Database service
└── main.ts             # Application entry point

apps/frontend/src/
├── components/         # React components (to be implemented)
├── stores/            # Zustand stores (to be implemented)
├── services/          # API services (to be implemented)
└── App.tsx            # Main application component

packages/shared/src/
├── types.ts           # Shared TypeScript interfaces
├── validation.ts      # Zod validation schemas
└── api.ts            # API interface definitions
```

### Adding New Features

1. **Backend**: Add new modules in `apps/backend/src/`
2. **Frontend**: Add new components in `apps/frontend/src/components/`
3. **Shared**: Update types in `packages/shared/src/`
4. **Tests**: Add property-based tests for core business logic

### Code Quality

The project enforces code quality through:

- TypeScript strict mode with `--noEmit` checking
- ESLint configuration (frontend)
- Prettier formatting
- Property-based testing for critical paths
- Automated testing in CI/CD pipeline

## 🚀 Deployment

### Backend Deployment

1. Set production environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build the application: `npm run build`
4. Start the server: `npm run start:prod`

### Frontend Deployment

1. Build the application: `npm run build`
2. Serve the `dist` folder using any static hosting service

### Recommended Hosting

- **Backend**: Railway, Render, or Heroku
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Database**: Supabase or Railway PostgreSQL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Review the API documentation at http://localhost:3000/api
3. Ensure your database connection is properly configured
4. Verify all environment variables are set correctly

## 🗺️ Roadmap

- [ ] Canvas-based family tree visualization
- [ ] Real-time collaborative editing
- [ ] Mobile app (React Native)
- [ ] GEDCOM import/export
- [ ] Advanced analytics and reporting
- [ ] AI-powered relationship suggestions
- [ ] Multi-language support

---

Built with ❤️ using modern web technologies
