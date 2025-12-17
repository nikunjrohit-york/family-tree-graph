import { Prisma } from '@prisma/client';

// Prisma model types
export type Person = Prisma.PersonGetPayload<{}>;
export type FamilyTree = Prisma.FamilyTreeGetPayload<{}>;
export type Relationship = Prisma.RelationshipGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;

// Prisma enums
export { Gender, RelationshipType, TreeType } from '@prisma/client';

// Extended types with relations
export type PersonWithRelationships = Prisma.PersonGetPayload<{
  include: {
    relationshipsFrom: true;
    relationshipsTo: true;
  };
}>;

export type FamilyTreeWithPeople = Prisma.FamilyTreeGetPayload<{
  include: {
    people: true;
    relationships: true;
  };
}>;

export type RelationshipWithPeople = Prisma.RelationshipGetPayload<{
  include: {
    fromPerson: true;
    toPerson: true;
  };
}>;
