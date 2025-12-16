# Contributing to Family Tree Graph Management System

Thank you for your interest in contributing to the Family Tree Graph Management System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database or Supabase account
- Git
- Basic knowledge of TypeScript, React, and NestJS

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/family-tree-graph.git
   cd family-tree-graph
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your database credentials
   ```

4. **Set up the database**

   ```bash
   cd apps/backend
   npx prisma migrate dev --name init
   npx prisma generate
   cd ../..
   ```

5. **Build and start development servers**
   ```bash
   npm run build
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript with proper type annotations
- **Formatting**: Code is automatically formatted with Prettier
- **Linting**: Follow ESLint rules configured in the project
- **Naming**: Use descriptive names for variables, functions, and components

### Project Structure

```
apps/
├── backend/src/
│   ├── [module]/
│   │   ├── [module].controller.ts    # REST endpoints
│   │   ├── [module].service.ts       # Business logic
│   │   ├── [module].module.ts        # NestJS module
│   │   └── tests/
│   │       └── [module].property.spec.ts  # Property-based tests
│   └── main.ts
├── frontend/src/
│   ├── components/                   # React components
│   ├── stores/                       # Zustand stores
│   ├── services/                     # API services
│   └── __tests__/                    # Component tests
└── packages/shared/src/
    ├── types.ts                      # Shared interfaces
    ├── validation.ts                 # Zod schemas
    └── api.ts                        # API interfaces
```

### Testing Requirements

All contributions must include appropriate tests:

#### Backend Testing

- **Property-Based Tests**: For core business logic using fast-check
- **Unit Tests**: For individual services and controllers
- **Integration Tests**: For API endpoints

Example property-based test:

```typescript
/**
 * Feature: wedding-guest-graph, Property X: Description
 * Validates: Requirements X.X
 */
it("should maintain data consistency", async () => {
  await fc.assert(
    fc.asyncProperty(dataGenerator, async (data) => {
      // Test implementation
    }),
    { numRuns: 100 }
  );
});
```

#### Frontend Testing

- **Component Tests**: Using React Testing Library
- **Integration Tests**: For user workflows
- **Visual Tests**: For canvas components (when implemented)

### Database Changes

When modifying the database schema:

1. **Create a migration**

   ```bash
   cd apps/backend
   npx prisma migrate dev --name descriptive_migration_name
   ```

2. **Update shared types**
   - Modify `packages/shared/src/types.ts` if needed
   - Update validation schemas in `packages/shared/src/validation.ts`

3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

## 🔄 Contribution Workflow

### 1. Create an Issue

Before starting work, create an issue describing:

- The problem you're solving
- Your proposed solution
- Any breaking changes

### 2. Create a Feature Branch

```bash
git checkout -b feature/descriptive-feature-name
# or
git checkout -b fix/descriptive-bug-fix
```

### 3. Make Your Changes

- Write clean, well-documented code
- Follow the existing code style
- Add appropriate tests
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run specific tests
cd apps/backend && npm test -- --testPathPattern=your-test
cd apps/frontend && npm test

# Build to ensure no compilation errors
npm run build
```

### 5. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add relationship path calculation"
git commit -m "fix: resolve circular relationship validation"
git commit -m "docs: update API documentation"
git commit -m "test: add property tests for person service"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Create a pull request with:

- Clear title and description
- Reference to related issues
- Screenshots for UI changes
- Test results

## 🧪 Testing Guidelines

### Property-Based Testing

For core business logic, use property-based tests:

```typescript
import * as fc from "fast-check";

// Generate test data
const personGenerator = fc.record({
  name: fc.string({ minLength: 1, maxLength: 255 }),
  email: fc.option(fc.emailAddress()),
  // ... other fields
});

// Test properties
it("should preserve data integrity", async () => {
  await fc.assert(
    fc.asyncProperty(personGenerator, async (person) => {
      const created = await service.create(person);
      const retrieved = await service.findOne(created.id);
      expect(retrieved).toEqual(created);
    }),
    { numRuns: 100 }
  );
});
```

### Component Testing

For React components:

```typescript
import { render, screen } from '@testing-library/react';
import { PersonNode } from '../PersonNode';

describe('PersonNode', () => {
  it('renders person information', () => {
    const person = { name: 'John Doe', email: 'john@example.com' };
    render(<PersonNode person={person} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

## 📚 Documentation

### Code Documentation

- Use JSDoc comments for public APIs
- Include examples in complex functions
- Document business logic and algorithms

### API Documentation

- Update Swagger decorators for new endpoints
- Include request/response examples
- Document error cases

### README Updates

Update the README.md when adding:

- New features
- Configuration options
- Dependencies
- Breaking changes

## 🐛 Bug Reports

When reporting bugs, include:

1. **Environment**: OS, Node.js version, browser
2. **Steps to reproduce**: Clear, numbered steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Error logs**: Console errors or server logs

## 💡 Feature Requests

For new features, provide:

1. **Use case**: Why is this needed?
2. **Proposed solution**: How should it work?
3. **Alternatives**: Other approaches considered
4. **Breaking changes**: Any compatibility issues

## 🔍 Code Review Process

All contributions go through code review:

1. **Automated checks**: Tests, linting, build
2. **Manual review**: Code quality, design, documentation
3. **Feedback**: Constructive suggestions for improvement
4. **Approval**: At least one maintainer approval required

### Review Criteria

- **Functionality**: Does it work as intended?
- **Tests**: Adequate test coverage
- **Performance**: No significant performance regressions
- **Security**: No security vulnerabilities
- **Documentation**: Clear and up-to-date docs

## 🏷️ Release Process

Releases follow semantic versioning:

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

## 📞 Getting Help

- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the README and API docs

## 🙏 Recognition

Contributors are recognized in:

- GitHub contributors list
- Release notes for significant contributions
- Project documentation

Thank you for contributing to the Family Tree Graph Management System! 🌳
