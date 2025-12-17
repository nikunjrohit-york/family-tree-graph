import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyTreeDto, UpdateFamilyTreeDto, FamilyTreeStats, FamilyInsights } from '@family-tree/shared';
import { FamilyTree } from '@prisma/client';

@Injectable()
export class FamilyTreeService {
  constructor(private prisma: PrismaService) {}

  async create(createFamilyTreeDto: CreateFamilyTreeDto, userId: string): Promise<any> {
    try {
      const familyTree = await this.prisma.familyTree.create({
        data: {
          name: createFamilyTreeDto.name,
          description: createFamilyTreeDto.description,
          ownerName: createFamilyTreeDto.ownerName,
          treeType: createFamilyTreeDto.treeType,
          userId: userId,
        },
      });

      return familyTree;
    } catch (error) {
      throw new BadRequestException('Failed to create family tree');
    }
  }

  async findAll(userId: string): Promise<any[]> {
    return this.prisma.familyTree.findMany({
      where: {
        OR: [
          { userId: userId }, // Trees owned by user
          { sharedWith: { some: { userId: userId } } }, // Trees shared with user
          { isPublic: true }, // Public trees
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            people: true,
            relationships: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<any> {
    const familyTree = await this.prisma.familyTree.findFirst({
      where: {
        id,
        OR: [
          { userId: userId }, // User owns the tree
          { sharedWith: { some: { userId: userId } } }, // Tree is shared with user
          { isPublic: true }, // Tree is public
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        people: true,
        relationships: true,
        sharedWith: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!familyTree) {
      throw new NotFoundException(`Family tree with ID ${id} not found or access denied`);
    }

    return familyTree;
  }

  async update(id: string, updateFamilyTreeDto: UpdateFamilyTreeDto): Promise<FamilyTree> {
    try {
      const familyTree = await this.prisma.familyTree.update({
        where: { id },
        data: {
          name: updateFamilyTreeDto.name,
          description: updateFamilyTreeDto.description,
          ownerName: updateFamilyTreeDto.ownerName,
          treeType: updateFamilyTreeDto.treeType,
        },
      });

      return familyTree;
    } catch (error) {
      throw new NotFoundException(`Family tree with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.familyTree.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Family tree with ID ${id} not found`);
    }
  }

  async getStats(id: string): Promise<FamilyTreeStats> {
    const familyTree = await this.prisma.familyTree.findUnique({
      where: { id },
      include: {
        people: true,
        relationships: true,
      },
    });

    if (!familyTree) {
      throw new NotFoundException(`Family tree with ID ${id} not found`);
    }
    
    const totalPeople = familyTree.people.length;
    const totalRelationships = familyTree.relationships.length;
    
    // Calculate relationship type breakdown
    const relationshipTypeBreakdown = familyTree.relationships.reduce((acc, rel) => {
      acc[rel.relationshipType] = (acc[rel.relationshipType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average relationships per person
    const averageRelationshipsPerPerson = totalPeople > 0 ? totalRelationships / totalPeople : 0;

    // Calculate generations (simplified - could be more sophisticated)
    const generations = this.calculateGenerations(familyTree.relationships);

    return {
      totalPeople,
      totalRelationships,
      generations,
      averageRelationshipsPerPerson,
      relationshipTypeBreakdown: relationshipTypeBreakdown as any,
    };
  }

  async getFamilyInsights(id: string): Promise<FamilyInsights> {
    const familyTree = await this.prisma.familyTree.findUnique({
      where: { id },
      include: {
        people: true,
        relationships: true,
      },
    });

    if (!familyTree) {
      throw new NotFoundException(`Family tree with ID ${id} not found`);
    }
    
    const people = familyTree.people;
    const familySize = people.length;

    // Find oldest and youngest people
    const peopleWithBirthDates = people.filter(p => p.birthDate);
    const oldestPerson = peopleWithBirthDates.reduce((oldest, person) => 
      !oldest || (person.birthDate && person.birthDate < oldest.birthDate) ? person : oldest
    , null);
    
    const youngestPerson = peopleWithBirthDates.reduce((youngest, person) => 
      !youngest || (person.birthDate && person.birthDate > youngest.birthDate) ? person : youngest
    , null);

    // Calculate average age
    const currentDate = new Date();
    const ages = peopleWithBirthDates.map(person => {
      const birthDate = new Date(person.birthDate);
      return currentDate.getFullYear() - birthDate.getFullYear();
    });
    const averageAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : undefined;

    // Find most connected person
    const connectionCounts = people.map(person => {
      const connections = familyTree.relationships.filter(rel => 
        rel.fromPersonId === person.id || rel.toPersonId === person.id
      ).length;
      return { person, connections };
    });
    
    const mostConnectedPerson = connectionCounts.reduce((most, current) => 
      !most || current.connections > most.connections ? current : most
    , null)?.person;

    return {
      largestGeneration: 1, // Simplified
      oldestPerson: oldestPerson as any,
      youngestPerson: youngestPerson as any,
      mostConnectedPerson: mostConnectedPerson as any,
      familySize,
      averageAge,
    };
  }

  private calculateGenerations(relationships: any[]): number {
    // Simplified generation calculation
    // In a real implementation, this would use graph traversal to find the longest path
    const parentChildRelationships = relationships.filter(rel => 
      rel.relationshipType === 'PARENT' || rel.relationshipType === 'CHILD'
    );
    
    // For now, return a simple estimate
    return Math.max(1, Math.ceil(parentChildRelationships.length / 2));
  }
}