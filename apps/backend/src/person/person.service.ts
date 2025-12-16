import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto, UpdatePersonDto } from '@family-tree/shared';
import { Person, Relationship, RelationshipType } from '@prisma/client';

@Injectable()
export class PersonService {
  constructor(private prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    try {
      const person = await this.prisma.person.create({
        data: {
          name: createPersonDto.name,
          phone: createPersonDto.phone,
          email: createPersonDto.email,
          address: createPersonDto.address,
          birthDate: createPersonDto.birthDate ? new Date(createPersonDto.birthDate) : undefined,
          gender: createPersonDto.gender,
          occupation: createPersonDto.occupation,
          notes: createPersonDto.notes,
          relationshipToBride: createPersonDto.relationshipToBride,
          relationshipToGroom: createPersonDto.relationshipToGroom,
          relationshipToOwner: createPersonDto.relationshipToOwner,
          positionX: createPersonDto.position.x,
          positionY: createPersonDto.position.y,
          treeId: createPersonDto.treeId,
          isAlive: createPersonDto.isAlive,
          profilePicture: createPersonDto.profilePicture,
        },
      });

      return person;
    } catch (error) {
      throw new BadRequestException('Failed to create person');
    }
  }

  async findAll(treeId: string): Promise<Person[]> {
    return this.prisma.person.findMany({
      where: { treeId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }

    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    try {
      const person = await this.prisma.person.update({
        where: { id },
        data: {
          name: updatePersonDto.name,
          phone: updatePersonDto.phone,
          email: updatePersonDto.email,
          address: updatePersonDto.address,
          birthDate: updatePersonDto.birthDate ? new Date(updatePersonDto.birthDate) : undefined,
          gender: updatePersonDto.gender,
          occupation: updatePersonDto.occupation,
          notes: updatePersonDto.notes,
          relationshipToBride: updatePersonDto.relationshipToBride,
          relationshipToGroom: updatePersonDto.relationshipToGroom,
          relationshipToOwner: updatePersonDto.relationshipToOwner,
          positionX: updatePersonDto.position?.x,
          positionY: updatePersonDto.position?.y,
          isAlive: updatePersonDto.isAlive,
          profilePicture: updatePersonDto.profilePicture,
        },
      });

      return person;
    } catch (error) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.person.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Person with ID ${id} not found`);
    }
  }

  async addFamilyMemberFromNode(
    personId: string,
    relationshipType: RelationshipType,
    newPersonData: CreatePersonDto,
  ): Promise<{ person: Person; relationship: Relationship }> {
    const existingPerson = await this.findOne(personId);
    
    // Create the new person
    const newPerson = await this.create(newPersonData);

    // Create the relationship
    const relationship = await this.prisma.relationship.create({
      data: {
        fromPersonId: personId,
        toPersonId: newPerson.id,
        relationshipType,
        treeId: existingPerson.treeId,
      },
    });

    // Create inverse relationship automatically
    const inverseType = this.getInverseRelationshipType(relationshipType);
    if (inverseType) {
      await this.prisma.relationship.create({
        data: {
          fromPersonId: newPerson.id,
          toPersonId: personId,
          relationshipType: inverseType,
          treeId: existingPerson.treeId,
        },
      });
    }

    return { person: newPerson, relationship };
  }

  private getInverseRelationshipType(type: RelationshipType): RelationshipType | null {
    const inverseMap: Record<RelationshipType, RelationshipType> = {
      [RelationshipType.PARENT]: RelationshipType.CHILD,
      [RelationshipType.CHILD]: RelationshipType.PARENT,
      [RelationshipType.SIBLING]: RelationshipType.SIBLING,
      [RelationshipType.SPOUSE]: RelationshipType.SPOUSE,
      [RelationshipType.GRANDPARENT]: RelationshipType.GRANDCHILD,
      [RelationshipType.GRANDCHILD]: RelationshipType.GRANDPARENT,
      [RelationshipType.AUNT]: RelationshipType.NIECE, // Assuming female
      [RelationshipType.UNCLE]: RelationshipType.NEPHEW, // Assuming male
      [RelationshipType.NIECE]: RelationshipType.AUNT, // Assuming aunt
      [RelationshipType.NEPHEW]: RelationshipType.UNCLE, // Assuming uncle
      [RelationshipType.COUSIN]: RelationshipType.COUSIN,
      // Add more mappings as needed
    } as any;

    return inverseMap[type] || null;
  }

  async searchPeople(treeId: string, query: string): Promise<Person[]> {
    return this.prisma.person.findMany({
      where: {
        treeId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { occupation: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }
}