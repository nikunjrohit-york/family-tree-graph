import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { RelationshipService } from '../relationship.service';
import * as fc from 'fast-check';
import { CreateRelationshipDto } from '@family-tree/shared';
import { RelationshipType } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('RelationshipService Property Tests', () => {
  let service: RelationshipService;
  let prisma: PrismaService;

  // Mock Prisma service
  const mockPrismaService = {
    person: {
      findUnique: jest.fn(),
    },
    relationship: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelationshipService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RelationshipService>(RelationshipService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Generators for property-based testing
  const validRelationshipDataGenerator = fc.record({
    fromPersonId: fc.uuid(),
    toPersonId: fc.uuid(),
    relationshipType: fc.constantFrom(
      RelationshipType.PARENT,
      RelationshipType.CHILD,
      RelationshipType.SIBLING,
      RelationshipType.SPOUSE,
      RelationshipType.COUSIN
    ),
    customRelationshipName: fc.option(fc.string({ maxLength: 100 })),
    startDate: fc.option(fc.date().map(d => d.toISOString())),
    endDate: fc.option(fc.date().map(d => d.toISOString())),
    treeId: fc.uuid(),
    notes: fc.option(fc.string()),
  });

  const mockPersonGenerator = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1 }),
    treeId: fc.uuid(),
  });

  const mockRelationshipGenerator = fc.record({
    id: fc.uuid(),
    fromPersonId: fc.uuid(),
    toPersonId: fc.uuid(),
    relationshipType: fc.constantFrom(
      RelationshipType.PARENT,
      RelationshipType.CHILD,
      RelationshipType.SIBLING,
      RelationshipType.SPOUSE,
      RelationshipType.COUSIN
    ),
    customRelationshipName: fc.option(fc.string()),
    startDate: fc.option(fc.date()),
    endDate: fc.option(fc.date()),
    treeId: fc.uuid(),
    notes: fc.option(fc.string()),
    createdAt: fc.date(),
  });

  /**
   * Feature: wedding-guest-graph, Property 12: Relationship consistency enforcement
   * For any relationship that violates consistency rules (e.g., circular parent-child relationships), 
   * the system should reject the creation and maintain the current state
   * Validates: Requirements 3.5
   */
  it('should reject self-relationships and maintain database state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom(
          RelationshipType.PARENT,
          RelationshipType.CHILD,
          RelationshipType.SIBLING,
          RelationshipType.SPOUSE,
          RelationshipType.COUSIN
        ),
        fc.uuid(),
        async (personId, relationshipType, treeId) => {
          // Create relationship data where person relates to themselves
          const selfRelationshipData = {
            fromPersonId: personId,
            toPersonId: personId, // Same person - should be rejected
            relationshipType,
            treeId,
          };

          // Setup mocks - people exist but relationship is invalid
          mockPrismaService.person.findUnique
            .mockResolvedValueOnce({ id: personId, name: 'Test Person' })
            .mockResolvedValueOnce({ id: personId, name: 'Test Person' });

          // Act & Assert
          await expect(service.create(selfRelationshipData as any)).rejects.toThrow(BadRequestException);
          
          // Verify no relationship was created
          expect(mockPrismaService.relationship.create).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject relationships when people do not exist', async () => {
    await fc.assert(
      fc.asyncProperty(validRelationshipDataGenerator, async (relationshipData) => {
        // Setup mock to return null for non-existent people
        mockPrismaService.person.findUnique
          .mockResolvedValueOnce(null) // fromPerson doesn't exist
          .mockResolvedValueOnce({ id: relationshipData.toPersonId, name: 'Test Person' });

        // Act & Assert
        await expect(service.create(relationshipData as any)).rejects.toThrow(BadRequestException);
        
        // Verify no relationship was created
        expect(mockPrismaService.relationship.create).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it('should reject duplicate relationships', async () => {
    await fc.assert(
      fc.asyncProperty(validRelationshipDataGenerator, mockRelationshipGenerator, async (relationshipData, existingRelationship) => {
        // Setup mocks - people exist
        mockPrismaService.person.findUnique
          .mockResolvedValueOnce({ id: relationshipData.fromPersonId, name: 'Person 1' })
          .mockResolvedValueOnce({ id: relationshipData.toPersonId, name: 'Person 2' });

        // Mock existing relationship found
        mockPrismaService.relationship.findFirst.mockResolvedValue(existingRelationship);

        // Act & Assert
        await expect(service.create(relationshipData as any)).rejects.toThrow(BadRequestException);
        
        // Verify no new relationship was created
        expect(mockPrismaService.relationship.create).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it('should create valid relationships with automatic inverse relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRelationshipDataGenerator,
        mockRelationshipGenerator,
        async (relationshipData, mockResult) => {
          // Clear mocks for each test iteration
          jest.clearAllMocks();
          
          // Ensure different people
          if (relationshipData.fromPersonId === relationshipData.toPersonId) {
            return; // Skip this test case
          }

          // Setup mocks - people exist, no existing relationship
          mockPrismaService.person.findUnique
            .mockResolvedValueOnce({ id: relationshipData.fromPersonId, name: 'Person 1' })
            .mockResolvedValueOnce({ id: relationshipData.toPersonId, name: 'Person 2' });
          
          mockPrismaService.relationship.findFirst.mockResolvedValue(null);
          mockPrismaService.relationship.create.mockResolvedValue(mockResult);

          // Act
          const result = await service.create(relationshipData as any);

          // Assert
          expect(mockPrismaService.relationship.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
              fromPersonId: relationshipData.fromPersonId,
              toPersonId: relationshipData.toPersonId,
              relationshipType: relationshipData.relationshipType,
              treeId: relationshipData.treeId,
            }),
          });

          expect(result).toEqual(mockResult);

          // Check if inverse relationship should be created
          const hasInverse = [
            RelationshipType.PARENT,
            RelationshipType.CHILD,
            RelationshipType.SIBLING,
            RelationshipType.SPOUSE,
            RelationshipType.COUSIN,
          ].includes(relationshipData.relationshipType);

          if (hasInverse) {
            expect(mockPrismaService.relationship.create).toHaveBeenCalledTimes(2);
          } else {
            expect(mockPrismaService.relationship.create).toHaveBeenCalledTimes(1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});