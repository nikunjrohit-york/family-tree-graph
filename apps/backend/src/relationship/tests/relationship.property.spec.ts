import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';

import { PrismaService } from '../../prisma/prisma.service';
import { RelationshipService } from '../relationship.service';
import { RelationshipType } from '@family-tree/shared';

describe('RelationshipService Property Tests', () => {
  let service: RelationshipService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Generators for property-based testing
  const validRelationshipDataGenerator = fc.record({
    fromPersonId: fc.uuid(),
    toPersonId: fc.uuid(),
    relationshipType: fc.constantFrom(...Object.values(RelationshipType)),
    customRelationshipName: fc.option(fc.string({ maxLength: 100 })),
    startDate: fc.option(fc.date()),
    endDate: fc.option(fc.date()),
    treeId: fc.uuid(),
    notes: fc.option(fc.string()),
  });

  // Removed unused mockPersonGenerator

  const mockRelationshipGenerator = fc.record({
    id: fc.uuid(),
    fromPersonId: fc.uuid(),
    toPersonId: fc.uuid(),
    relationshipType: fc.constantFrom(...Object.values(RelationshipType)),
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
        fc.constantFrom(...Object.values(RelationshipType)),
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
          await expect(service.create(selfRelationshipData)).rejects.toThrow(
            BadRequestException,
          );

          // Verify no relationship was created
          expect(mockPrismaService.relationship.create).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should reject relationships when people do not exist', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRelationshipDataGenerator,
        async relationshipData => {
          // Setup mock to return null for non-existent people
          mockPrismaService.person.findUnique
            .mockResolvedValueOnce(null) // fromPerson doesn't exist
            .mockResolvedValueOnce({
              id: relationshipData.toPersonId,
              name: 'Test Person',
            });

          // Act & Assert
          await expect(service.create(relationshipData)).rejects.toThrow(
            BadRequestException,
          );

          // Verify no relationship was created
          expect(mockPrismaService.relationship.create).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should reject duplicate relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        validRelationshipDataGenerator,
        mockRelationshipGenerator,
        async (relationshipData, existingRelationship) => {
          // Setup mocks - people exist
          mockPrismaService.person.findUnique
            .mockResolvedValueOnce({
              id: relationshipData.fromPersonId,
              name: 'Person 1',
            })
            .mockResolvedValueOnce({
              id: relationshipData.toPersonId,
              name: 'Person 2',
            });

          // Mock existing relationship found
          mockPrismaService.relationship.findFirst.mockResolvedValue(
            existingRelationship,
          );

          // Act & Assert
          await expect(service.create(relationshipData)).rejects.toThrow(
            BadRequestException,
          );

          // Verify no new relationship was created
          expect(mockPrismaService.relationship.create).not.toHaveBeenCalled();
        },
      ),
      { numRuns: 100 },
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
            .mockResolvedValueOnce({
              id: relationshipData.fromPersonId,
              name: 'Person 1',
            })
            .mockResolvedValueOnce({
              id: relationshipData.toPersonId,
              name: 'Person 2',
            });

          mockPrismaService.relationship.findFirst.mockResolvedValue(null);
          mockPrismaService.relationship.create.mockResolvedValue(mockResult);

          // Act
          const result = await service.create(relationshipData);

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

          // Check if inverse relationship should be created based on service logic
          const inverseMap: Partial<
            Record<RelationshipType, RelationshipType>
          > = {
            [RelationshipType.PARENT]: RelationshipType.CHILD,
            [RelationshipType.CHILD]: RelationshipType.PARENT,
            [RelationshipType.SIBLING]: RelationshipType.SIBLING,
            [RelationshipType.SPOUSE]: RelationshipType.SPOUSE,
            [RelationshipType.GRANDPARENT]: RelationshipType.GRANDCHILD,
            [RelationshipType.GRANDCHILD]: RelationshipType.GRANDPARENT,
            [RelationshipType.GREAT_GRANDPARENT]:
              RelationshipType.GREAT_GRANDCHILD,
            [RelationshipType.GREAT_GRANDCHILD]:
              RelationshipType.GREAT_GRANDPARENT,
            [RelationshipType.AUNT]: RelationshipType.NIECE,
            [RelationshipType.UNCLE]: RelationshipType.NEPHEW,
            [RelationshipType.NIECE]: RelationshipType.AUNT,
            [RelationshipType.NEPHEW]: RelationshipType.UNCLE,
            [RelationshipType.GREAT_AUNT]: RelationshipType.GREAT_NIECE,
            [RelationshipType.GREAT_UNCLE]: RelationshipType.GREAT_NEPHEW,
            [RelationshipType.GREAT_NIECE]: RelationshipType.GREAT_AUNT,
            [RelationshipType.GREAT_NEPHEW]: RelationshipType.GREAT_UNCLE,
            [RelationshipType.COUSIN]: RelationshipType.COUSIN,
            [RelationshipType.MOTHER_IN_LAW]: RelationshipType.DAUGHTER_IN_LAW,
            [RelationshipType.FATHER_IN_LAW]: RelationshipType.SON_IN_LAW,
            [RelationshipType.DAUGHTER_IN_LAW]: RelationshipType.MOTHER_IN_LAW,
            [RelationshipType.SON_IN_LAW]: RelationshipType.FATHER_IN_LAW,
            [RelationshipType.SISTER_IN_LAW]: RelationshipType.SISTER_IN_LAW,
            [RelationshipType.BROTHER_IN_LAW]: RelationshipType.BROTHER_IN_LAW,
            [RelationshipType.STEPPARENT]: RelationshipType.STEPCHILD,
            [RelationshipType.STEPCHILD]: RelationshipType.STEPPARENT,
            [RelationshipType.STEPSIBLING]: RelationshipType.STEPSIBLING,
            [RelationshipType.HALF_SIBLING]: RelationshipType.HALF_SIBLING,
            [RelationshipType.ADOPTED_PARENT]: RelationshipType.ADOPTED_CHILD,
            [RelationshipType.ADOPTED_CHILD]: RelationshipType.ADOPTED_PARENT,
            [RelationshipType.GODPARENT]: RelationshipType.GODCHILD,
            [RelationshipType.GODCHILD]: RelationshipType.GODPARENT,
            [RelationshipType.CLOSE_FRIEND]: RelationshipType.CLOSE_FRIEND,
            [RelationshipType.FAMILY_FRIEND]: RelationshipType.FAMILY_FRIEND,
            [RelationshipType.MENTOR]: RelationshipType.MENTEE,
            [RelationshipType.MENTEE]: RelationshipType.MENTOR,
          };

          const hasInverse =
            inverseMap[relationshipData.relationshipType] !== undefined;

          if (hasInverse) {
            expect(mockPrismaService.relationship.create).toHaveBeenCalledTimes(
              2,
            );
          } else {
            expect(mockPrismaService.relationship.create).toHaveBeenCalledTimes(
              1,
            );
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
