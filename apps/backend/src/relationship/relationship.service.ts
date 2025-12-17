import { CreateRelationshipDto } from '@family-tree/shared';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  Relationship,
  RelationshipWithPeople,
  RelationshipType,
} from '../types/prisma.types';

@Injectable()
export class RelationshipService {
  constructor(private prisma: PrismaService) {}

  async create(
    createRelationshipDto: CreateRelationshipDto,
  ): Promise<Relationship> {
    // Validate that both people exist
    const [fromPerson, toPerson] = await Promise.all([
      this.prisma.person.findUnique({
        where: { id: createRelationshipDto.fromPersonId },
      }),
      this.prisma.person.findUnique({
        where: { id: createRelationshipDto.toPersonId },
      }),
    ]);

    if (!fromPerson || !toPerson) {
      throw new BadRequestException('One or both people do not exist');
    }

    // Prevent self-relationships
    if (
      createRelationshipDto.fromPersonId === createRelationshipDto.toPersonId
    ) {
      throw new BadRequestException(
        'A person cannot have a relationship with themselves',
      );
    }

    // Check for existing relationship
    const existingRelationship = await this.prisma.relationship.findFirst({
      where: {
        fromPersonId: createRelationshipDto.fromPersonId,
        toPersonId: createRelationshipDto.toPersonId,
        relationshipType: createRelationshipDto.relationshipType,
        treeId: createRelationshipDto.treeId,
      },
    });

    if (existingRelationship) {
      throw new BadRequestException('This relationship already exists');
    }

    try {
      const relationship = await this.prisma.relationship.create({
        data: {
          fromPersonId: createRelationshipDto.fromPersonId,
          toPersonId: createRelationshipDto.toPersonId,
          relationshipType: createRelationshipDto.relationshipType,
          customRelationshipName: createRelationshipDto.customRelationshipName,
          startDate: createRelationshipDto.startDate
            ? new Date(createRelationshipDto.startDate)
            : undefined,
          endDate: createRelationshipDto.endDate
            ? new Date(createRelationshipDto.endDate)
            : undefined,
          treeId: createRelationshipDto.treeId,
          notes: createRelationshipDto.notes,
        },
      });

      // Create inverse relationship automatically
      const inverseType = this.getInverseRelationshipType(
        createRelationshipDto.relationshipType,
      );
      if (inverseType) {
        await this.prisma.relationship.create({
          data: {
            fromPersonId: createRelationshipDto.toPersonId,
            toPersonId: createRelationshipDto.fromPersonId,
            relationshipType: inverseType,
            treeId: createRelationshipDto.treeId,
          },
        });
      }

      return relationship;
    } catch (error) {
      throw new BadRequestException('Failed to create relationship');
    }
  }

  async findAll(treeId: string): Promise<RelationshipWithPeople[]> {
    return this.prisma.relationship.findMany({
      where: { treeId },
      include: {
        fromPerson: true,
        toPerson: true,
      },
    });
  }

  async findPersonRelationships(
    personId: string,
  ): Promise<RelationshipWithPeople[]> {
    return this.prisma.relationship.findMany({
      where: {
        OR: [{ fromPersonId: personId }, { toPersonId: personId }],
      },
      include: {
        fromPerson: true,
        toPerson: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    try {
      const relationship = await this.prisma.relationship.findUnique({
        where: { id },
      });

      if (!relationship) {
        throw new NotFoundException(`Relationship with ID ${id} not found`);
      }

      // Delete the relationship
      await this.prisma.relationship.delete({
        where: { id },
      });

      // Also delete the inverse relationship if it exists
      const inverseType = this.getInverseRelationshipType(
        relationship.relationshipType,
      );
      if (inverseType) {
        await this.prisma.relationship.deleteMany({
          where: {
            fromPersonId: relationship.toPersonId,
            toPersonId: relationship.fromPersonId,
            relationshipType: inverseType,
            treeId: relationship.treeId,
          },
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete relationship');
    }
  }

  private getInverseRelationshipType(
    type: RelationshipType,
  ): RelationshipType | null {
    const inverseMap: Partial<Record<RelationshipType, RelationshipType>> = {
      [RelationshipType.PARENT]: RelationshipType.CHILD,
      [RelationshipType.CHILD]: RelationshipType.PARENT,
      [RelationshipType.SIBLING]: RelationshipType.SIBLING,
      [RelationshipType.SPOUSE]: RelationshipType.SPOUSE,
      [RelationshipType.GRANDPARENT]: RelationshipType.GRANDCHILD,
      [RelationshipType.GRANDCHILD]: RelationshipType.GRANDPARENT,
      [RelationshipType.GREAT_GRANDPARENT]: RelationshipType.GREAT_GRANDCHILD,
      [RelationshipType.GREAT_GRANDCHILD]: RelationshipType.GREAT_GRANDPARENT,
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

    return inverseMap[type] || null;
  }

  async validateRelationshipConsistency(
    fromPersonId: string,
    toPersonId: string,
    relationshipType: RelationshipType,
  ): Promise<boolean> {
    // Check for circular relationships (e.g., A is parent of B, B is parent of A)
    const existingRelationships =
      await this.findPersonRelationships(fromPersonId);

    // Check for conflicting relationships
    const conflictingRelationship = existingRelationships.find(rel => {
      const otherPersonId =
        rel.fromPersonId === fromPersonId ? rel.toPersonId : rel.fromPersonId;
      return (
        otherPersonId === toPersonId &&
        this.areRelationshipsConflicting(rel.relationshipType, relationshipType)
      );
    });

    if (conflictingRelationship) {
      return false;
    }

    return true;
  }

  private areRelationshipsConflicting(
    existing: RelationshipType,
    proposed: RelationshipType,
  ): boolean {
    // Define conflicting relationship rules
    const conflicts: Record<RelationshipType, RelationshipType[]> = {
      [RelationshipType.PARENT]: [
        RelationshipType.CHILD,
        RelationshipType.SIBLING,
        RelationshipType.SPOUSE,
      ],
      [RelationshipType.CHILD]: [
        RelationshipType.PARENT,
        RelationshipType.SIBLING,
        RelationshipType.SPOUSE,
      ],
      [RelationshipType.SPOUSE]: [
        RelationshipType.PARENT,
        RelationshipType.CHILD,
        RelationshipType.SIBLING,
      ],
      [RelationshipType.SIBLING]: [
        RelationshipType.PARENT,
        RelationshipType.CHILD,
        RelationshipType.SPOUSE,
      ],
      // Add more conflict rules as needed
    } as Record<RelationshipType, RelationshipType[]>;

    return conflicts[existing]?.includes(proposed) || false;
  }
}
