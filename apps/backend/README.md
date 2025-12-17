# Family Tree Backend API

A robust NestJS backend application for managing family trees, relationships, and user data with PostgreSQL and Prisma ORM.

## Tech Stack

- **Framework**: NestJS (Node.js framework)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth integration
- **Validation**: class-validator with DTOs
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest with property-based testing
- **Code Quality**: ESLint + Prettier with pre-commit hooks

## Architecture & Best Practices

### Design Principles

We strictly follow these principles:

- **KISS (Keep It Simple, Stupid)**: Simple, maintainable code
- **SOLID Principles**:
  - Single Responsibility: Each class has one reason to change
  - Open/Closed: Open for extension, closed for modification
  - Liskov Substitution: Subtypes must be substitutable for base types
  - Interface Segregation: Many specific interfaces over one general
  - Dependency Inversion: Depend on abstractions, not concretions
- **YAGNI (You Aren't Gonna Need It)**: Build features when needed
- **DRY (Don't Repeat Yourself)**: Reusable services and utilities

### Project Structure

```
src/
├── auth/               # Authentication module
├── user/               # User management
├── family-tree/        # Family tree operations
├── person/             # Person entity management
├── relationship/       # Relationship management
├── prisma/             # Database service
├── common/             # Shared utilities, guards, decorators
├── config/             # Configuration files
└── main.ts             # Application entry point
```

### Module Architecture Pattern

Each feature follows this structure:

```
feature/
├── dto/                # Data Transfer Objects
├── entities/           # TypeScript interfaces/types
├── tests/              # Unit and integration tests
├── feature.controller.ts
├── feature.service.ts
├── feature.module.ts
└── index.ts
```

## Development Guidelines

### Adding New Entities/Features

#### 1. Database Schema (Prisma)

```prisma
model NewEntity {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("new_entities")
}
```

#### 2. Generate Prisma Client

```bash
npx prisma generate
npx prisma db push  # For development
# OR
npx prisma migrate dev --name add_new_entity  # For production
```

#### 3. Create DTOs

```typescript
// create-new-entity.dto.ts
export class CreateNewEntityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

// update-new-entity.dto.ts
export class UpdateNewEntityDto extends PartialType(CreateNewEntityDto) {}
```

#### 4. Create Service

```typescript
@Injectable()
export class NewEntityService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateNewEntityDto): Promise<NewEntity> {
    return this.prisma.newEntity.create({
      data: createDto,
    });
  }

  async findAll(): Promise<NewEntity[]> {
    return this.prisma.newEntity.findMany();
  }

  async findOne(id: string): Promise<NewEntity> {
    const entity = await this.prisma.newEntity.findUnique({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  async update(id: string, updateDto: UpdateNewEntityDto): Promise<NewEntity> {
    await this.findOne(id); // Ensure exists

    return this.prisma.newEntity.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Ensure exists

    await this.prisma.newEntity.delete({
      where: { id },
    });
  }
}
```

#### 5. Create Controller

```typescript
@ApiTags('new-entity')
@Controller('new-entity')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NewEntityController {
  constructor(private readonly service: NewEntityService) {}

  @Post()
  @ApiOperation({ summary: 'Create new entity' })
  @ApiResponse({ status: 201, description: 'Entity created successfully' })
  create(@Body() createDto: CreateNewEntityDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all entities' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entity by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update entity' })
  update(@Param('id') id: string, @Body() updateDto: UpdateNewEntityDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete entity' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
```

#### 6. Create Module

```typescript
@Module({
  controllers: [NewEntityController],
  providers: [NewEntityService],
  exports: [NewEntityService],
})
export class NewEntityModule {}
```

#### 7. Add Tests

```typescript
describe('NewEntityService', () => {
  let service: NewEntityService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NewEntityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NewEntityService>(NewEntityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new entity', async () => {
      const createDto = { name: 'Test Entity' };
      const expectedResult = { id: '1', ...createDto };

      jest.spyOn(prisma.newEntity, 'create').mockResolvedValue(expectedResult);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
```

## Database Management

### Safe Database Updates

#### Development Environment

```bash
# Make schema changes in schema.prisma
npx prisma db push
```

#### Production Environment - Zero Downtime Migrations

1. **Create Migration**

```bash
npx prisma migrate dev --name descriptive_migration_name
```

2. **Review Migration SQL**
   Check `prisma/migrations/` for generated SQL

3. **Test Migration**

```bash
# On staging environment
npx prisma migrate deploy
```

4. **Deploy to Production**

```bash
npx prisma migrate deploy
```

#### Critical Migration Patterns

**Adding Non-Nullable Columns**

```sql
-- Step 1: Add nullable column
ALTER TABLE "users" ADD COLUMN "new_field" VARCHAR(255);

-- Step 2: Populate with default values
UPDATE "users" SET "new_field" = 'default_value' WHERE "new_field" IS NULL;

-- Step 3: Make non-nullable
ALTER TABLE "users" ALTER COLUMN "new_field" SET NOT NULL;
```

**Renaming Columns**

```sql
-- Use multiple migrations for zero downtime
-- Migration 1: Add new column
ALTER TABLE "users" ADD COLUMN "new_name" VARCHAR(255);

-- Migration 2: Copy data
UPDATE "users" SET "new_name" = "old_name";

-- Migration 3: Drop old column (after code deployment)
ALTER TABLE "users" DROP COLUMN "old_name";
```

**Adding Indexes**

```sql
-- Create index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY "idx_users_email" ON "users"("email");
```

### Data Seeding

```typescript
// prisma/seed.ts
async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
    },
  });
}
```

## Code Quality Standards

### TypeScript Configuration

- Strict mode enabled
- No implicit any
- Explicit return types for all functions
- Proper null/undefined handling

### Validation & DTOs

- All inputs validated with class-validator
- Proper error messages
- Type-safe transformations

### Error Handling

```typescript
// Custom exception filters
@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002':
        response.status(409).json({
          statusCode: 409,
          message: 'Unique constraint violation',
        });
        break;
      default:
        response.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
        });
    }
  }
}
```

### Security Best Practices

- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- Authentication guards on protected routes
- Rate limiting implementation
- CORS configuration
- Helmet for security headers

## Testing Strategy

### Unit Tests

- Service layer testing with mocked dependencies
- Controller testing with mocked services
- Utility function testing

### Integration Tests

- Database integration tests
- API endpoint tests
- Authentication flow tests

### Property-Based Testing

```typescript
// Example property test
describe('Person validation', () => {
  it('should validate person properties', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 255 }),
          email: fc.emailAddress(),
        }),
        person => {
          const dto = new CreatePersonDto();
          Object.assign(dto, person);
          const errors = validateSync(dto);
          expect(errors).toHaveLength(0);
        },
      ),
    );
  });
});
```

## API Documentation

### Swagger Configuration

- Automatic OpenAPI generation
- Comprehensive endpoint documentation
- Request/response examples
- Authentication documentation

### API Versioning

```typescript
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {}
```

## Environment Configuration

### Development

```env
DATABASE_URL="postgresql://user:password@localhost:5432/familytree_dev"
SUPABASE_URL="your_supabase_url"
SUPABASE_ANON_KEY="your_anon_key"
JWT_SECRET="your_jwt_secret"
```

### Production

- Use environment-specific configurations
- Secure secret management
- Database connection pooling
- Logging configuration

## Development Commands

```bash
npm run start:dev      # Development with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run test           # Run unit tests
npm run test:e2e       # Run integration tests
npm run test:cov       # Test coverage report
npm run lint           # Run ESLint
npm run format         # Format with Prettier
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] Monitoring and logging setup
- [ ] Health checks implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled

## Performance Considerations

- Database query optimization
- Connection pooling
- Caching strategies
- Response compression
- Request rate limiting
- Database indexing

## Monitoring & Logging

- Structured logging with Winston
- Error tracking and alerting
- Performance monitoring
- Database query monitoring
- Health check endpoints
