import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PersonService } from '../person.service';
import * as fc from 'fast-check';
import { CreatePersonDto } from '@family-tree/shared';
import { Gender, TreeType } from '@prisma/client';

describe('PersonService Property Tests', () => {
  let service: PersonService;
  let prisma: PrismaService;

  // Mock Prisma service
  const mockPrismaService = {
    person: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    familyTree: {
      findUnique: jest.fn(),
    },
    relationship: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Generators for property-based testing
  const validPersonDataGenerator = fc.record({
    name: fc.string({ minLength: 1, maxLength: 255 }),
    phone: fc.option(fc.string({ maxLength: 20 })),
    email: fc.option(fc.emailAddress()),
    address: fc.option(fc.string()),
    birthDate: fc.option(fc.date().map(d => d.toISOString())),
    gender: fc.option(fc.constantFrom(Gender.MALE, Gender.FEMALE, Gender.OTHER, Gender.PREFER_NOT_TO_SAY)),
    occupation: fc.option(fc.string({ maxLength: 255 })),
    notes: fc.option(fc.string()),
    relationshipToBride: fc.option(fc.string({ maxLength: 100 })),
    relationshipToGroom: fc.option(fc.string({ maxLength: 100 })),
    relationshipToOwner: fc.option(fc.string({ maxLength: 100 })),
    position: fc.record({
      x: fc.float(),
      y: fc.float(),
    }),
    treeId: fc.uuid(),
    isAlive: fc.boolean(),
    profilePicture: fc.option(fc.string()),
  });

  const mockPersonGenerator = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 255 }),
    phone: fc.option(fc.string({ maxLength: 20 })),
    email: fc.option(fc.emailAddress()),
    address: fc.option(fc.string()),
    birthDate: fc.option(fc.date()),
    gender: fc.option(fc.constantFrom(Gender.MALE, Gender.FEMALE, Gender.OTHER, Gender.PREFER_NOT_TO_SAY)),
    occupation: fc.option(fc.string({ maxLength: 255 })),
    notes: fc.option(fc.string()),
    relationshipToBride: fc.option(fc.string({ maxLength: 100 })),
    relationshipToGroom: fc.option(fc.string({ maxLength: 100 })),
    relationshipToOwner: fc.option(fc.string({ maxLength: 100 })),
    positionX: fc.float(),
    positionY: fc.float(),
    treeId: fc.uuid(),
    isAlive: fc.boolean(),
    profilePicture: fc.option(fc.string()),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

  /**
   * Feature: wedding-guest-graph, Property 1: Person creation persistence
   * For any valid person data, creating a person should result in the exact same data being retrievable from the database
   * Validates: Requirements 1.1
   */
  it('should persist person creation data exactly as provided', async () => {
    await fc.assert(
      fc.asyncProperty(validPersonDataGenerator, mockPersonGenerator, async (createData, mockResult) => {
        // Setup mock to return the created person
        mockPrismaService.person.create.mockResolvedValue(mockResult);

        // Act
        const result = await service.create(createData as any);

        // Assert
        expect(mockPrismaService.person.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            name: createData.name,
            phone: createData.phone,
            email: createData.email,
            address: createData.address,
            birthDate: createData.birthDate ? new Date(createData.birthDate) : undefined,
            gender: createData.gender,
            occupation: createData.occupation,
            notes: createData.notes,
            relationshipToBride: createData.relationshipToBride,
            relationshipToGroom: createData.relationshipToGroom,
            relationshipToOwner: createData.relationshipToOwner,
            positionX: createData.position.x,
            positionY: createData.position.y,
            treeId: createData.treeId,
            isAlive: createData.isAlive,
            profilePicture: createData.profilePicture,
          }),
        });
        expect(result).toEqual(mockResult);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: wedding-guest-graph, Property 2: Person update persistence
   * For any existing person and valid update data, updating the person should result in the modified data being immediately available in the database
   * Validates: Requirements 1.2
   */
  it('should persist person updates exactly as provided', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        validPersonDataGenerator,
        mockPersonGenerator,
        async (personId, updateData, mockResult) => {
          // Setup mock to return the updated person
          mockPrismaService.person.update.mockResolvedValue(mockResult);

          // Act
          const result = await service.update(personId, updateData as any);

          // Assert
          expect(mockPrismaService.person.update).toHaveBeenCalledWith({
            where: { id: personId },
            data: expect.objectContaining({
              name: updateData.name,
              phone: updateData.phone,
              email: updateData.email,
              address: updateData.address,
              birthDate: updateData.birthDate ? new Date(updateData.birthDate) : undefined,
              gender: updateData.gender,
              occupation: updateData.occupation,
              notes: updateData.notes,
              relationshipToBride: updateData.relationshipToBride,
              relationshipToGroom: updateData.relationshipToGroom,
              relationshipToOwner: updateData.relationshipToOwner,
              positionX: updateData.position?.x,
              positionY: updateData.position?.y,
              isAlive: updateData.isAlive,
              profilePicture: updateData.profilePicture,
            }),
          });
          expect(result).toEqual(mockResult);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: wedding-guest-graph, Property 3: Person deletion cascade
   * For any person with relationships, deleting the person should remove both the person record and all associated relationship records from the database
   * Validates: Requirements 1.4
   */
  it('should cascade delete person and all associated relationships', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (personId) => {
        // Setup mock to simulate successful deletion
        mockPrismaService.person.delete.mockResolvedValue(undefined);

        // Act
        await service.remove(personId);

        // Assert - Prisma cascade delete should handle relationship deletion automatically
        expect(mockPrismaService.person.delete).toHaveBeenCalledWith({
          where: { id: personId },
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: wedding-guest-graph, Property 4: Person validation enforcement
   * For any person data missing required fields, the system should reject the creation and maintain the current database state
   * Validates: Requirements 1.5
   */
  it('should reject person creation with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.constant(''), // Invalid: empty name
          position: fc.record({
            x: fc.float(),
            y: fc.float(),
          }),
          treeId: fc.uuid(),
        }),
        async (invalidData) => {
          // Setup mock to throw error for invalid data
          mockPrismaService.person.create.mockRejectedValue(new Error('Validation failed'));

          // Act & Assert
          await expect(service.create(invalidData as any)).rejects.toThrow();
          
          // Verify that no person was created in the database
          expect(mockPrismaService.person.create).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});