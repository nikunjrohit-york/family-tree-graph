import type {
  FamilyTree as SharedFamilyTree,
  Person as SharedPerson,
} from '@family-tree/shared';

import type {
  FamilyTree as ApiFamilyTree,
  Person as ApiPerson,
} from '../types/api';

export function mapApiFamilyTreeToShared(
  apiTree: ApiFamilyTree
): SharedFamilyTree {
  return {
    ...apiTree,
    createdAt: new Date(apiTree.createdAt),
    updatedAt: new Date(apiTree.updatedAt),
  };
}

export function mapApiPersonToShared(apiPerson: ApiPerson): SharedPerson {
  return {
    ...apiPerson,
    birthDate: apiPerson.birthDate ? new Date(apiPerson.birthDate) : undefined,
    createdAt: new Date(apiPerson.createdAt),
    updatedAt: new Date(apiPerson.updatedAt),
  };
}

export function mapApiPeopleToShared(apiPeople: ApiPerson[]): SharedPerson[] {
  return apiPeople.map(mapApiPersonToShared);
}
