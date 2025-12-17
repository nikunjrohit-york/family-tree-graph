import {
  Gender as SharedGender,
  Person as SharedPerson,
} from '@family-tree/shared';
import { Gender as PrismaGender } from '@prisma/client';

import { Person as PrismaPerson } from '../types/prisma.types';

// Map Prisma Gender to Shared Gender
export function mapPrismaGenderToShared(
  gender: PrismaGender | null,
): SharedGender | undefined {
  if (!gender) return undefined;

  switch (gender) {
    case PrismaGender.MALE:
      return SharedGender.MALE;
    case PrismaGender.FEMALE:
      return SharedGender.FEMALE;
    case PrismaGender.OTHER:
      return SharedGender.OTHER;
    case PrismaGender.PREFER_NOT_TO_SAY:
      return SharedGender.PREFER_NOT_TO_SAY;
    default:
      return undefined;
  }
}

// Map Prisma Person to Shared Person
export function mapPrismaPersonToShared(person: PrismaPerson): SharedPerson {
  return {
    id: person.id,
    name: person.name,
    phone: person.phone,
    email: person.email,
    address: person.address,
    birthDate: person.birthDate,
    gender: mapPrismaGenderToShared(person.gender),
    occupation: person.occupation,
    notes: person.notes,
    relationshipToBride: person.relationshipToBride,
    relationshipToGroom: person.relationshipToGroom,
    relationshipToOwner: person.relationshipToOwner,
    positionX: person.positionX,
    positionY: person.positionY,
    treeId: person.treeId,
    isAlive: person.isAlive,
    profilePicture: person.profilePicture,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
  };
}
