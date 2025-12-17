# Family Tree Frontend Application

A modern React application built with TypeScript, Vite, and Tailwind CSS for managing family trees and relationships.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Query (TanStack Query) for server state
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios with custom API layer
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier with pre-commit hooks

## Architecture & Best Practices

### Design Principles

We follow these core principles:

- **KISS (Keep It Simple, Stupid)**: Simple, readable code over clever solutions
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion
- **YAGNI (You Aren't Gonna Need It)**: Build features when needed, not anticipated
- **DRY (Don't Repeat Yourself)**: Reusable components and utilities

### Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Route-level components
├── hooks/              # Custom React hooks (including API hooks)
├── services/           # API layer and external services
├── utils/              # Utility functions and helpers
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── __tests__/          # Test files
```

### Code Standards

#### TypeScript

- **Strict Type Safety**: No `any` types allowed
- **Interface over Type**: Use interfaces for object shapes
- **Explicit Return Types**: All functions must have return types
- **Null Safety**: Handle null/undefined explicitly

#### Component Guidelines

- **Functional Components**: Use function components with hooks
- **Props Interface**: Define explicit props interfaces
- **Default Props**: Use default parameters instead of defaultProps
- **Component Naming**: PascalCase for components, camelCase for functions

#### API Integration

- **Custom Hooks**: All API calls through custom hooks (useApi pattern)
- **Type Safety**: Fully typed API responses and requests
- **Error Handling**: Consistent error handling across all API calls
- **Loading States**: Proper loading and error states for all async operations

#### State Management

- **React Query**: Server state management with caching
- **Local State**: useState for component-level state
- **Context**: Only for truly global state (auth, theme)

## Development Guidelines

### Adding New Features

1. **Create Types**: Define TypeScript interfaces in `src/types/`
2. **API Integration**: Create custom hooks in `src/hooks/api/`
3. **Components**: Build reusable components in `src/components/`
4. **Pages**: Create page components in `src/pages/`
5. **Tests**: Write tests for all new functionality

### API Integration Pattern

```typescript
// Custom hook for API calls
export const useFamilyTrees = () => {
  return useQuery({
    queryKey: ['familyTrees'],
    queryFn: () => api.familyTree.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage in components
const { data: familyTrees, isLoading, error } = useFamilyTrees();
```

### Component Pattern

```typescript
interface ComponentProps {
  title: string;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  onAction,
  isLoading = false,
}) => {
  // Component implementation
};
```

## Setup & Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_API_URL=http://localhost:3000
```

#### Supabase Configuration

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Your Credentials**:
   - Project URL: Found in Settings > API
   - Anon Key: Found in Settings > API (public anon key)
3. **Update .env**: Replace the placeholder values with your actual Supabase credentials

**Note**: The app will run with mock Supabase configuration if credentials are missing, but authentication features won't work until properly configured.

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## Code Quality & Standards

### Pre-commit Hooks

- **Lint-staged**: Runs linting and formatting on staged files
- **Type checking**: Ensures no TypeScript errors
- **Test validation**: Runs affected tests

### ESLint Configuration

- Strict TypeScript rules
- React best practices
- Accessibility rules
- Import/export organization

### Prettier Configuration

- Consistent code formatting
- Automatic formatting on save
- Pre-commit formatting

## Testing Strategy

### Unit Tests

- All utility functions
- Custom hooks
- Component logic

### Integration Tests

- API integration
- User workflows
- Component interactions

### Test Patterns

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    render(<Component title="Test" onAction={vi.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Security Considerations

- **API Security**: No direct API endpoints exposed to frontend
- **Authentication**: Secure token handling with Supabase
- **Input Validation**: Client-side validation with server-side verification
- **XSS Prevention**: Proper data sanitization

## Performance Optimization

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Query Optimization**: React Query caching and background updates

## Deployment

### Build Process

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set in production:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`

## Contributing

1. Follow the established patterns and conventions
2. Write tests for new functionality
3. Ensure type safety (no `any` types)
4. Run linting and formatting before committing
5. Update documentation for significant changes
