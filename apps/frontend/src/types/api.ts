// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Enums
export enum TreeType {
  FAMILY_TREE = 'FAMILY_TREE',
  WEDDING_GUESTS = 'WEDDING_GUESTS',
  SOCIAL_NETWORK = 'SOCIAL_NETWORK',
  CUSTOM = 'CUSTOM',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum RelationshipType {
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SPOUSE = 'SPOUSE',
  SIBLING = 'SIBLING',
  GRANDPARENT = 'GRANDPARENT',
  GRANDCHILD = 'GRANDCHILD',
  AUNT_UNCLE = 'AUNT_UNCLE',
  NIECE_NEPHEW = 'NIECE_NEPHEW',
  COUSIN = 'COUSIN',
  IN_LAW = 'IN_LAW',
  STEP_RELATION = 'STEP_RELATION',
  ADOPTED = 'ADOPTED',
  GUARDIAN = 'GUARDIAN',
  FRIEND = 'FRIEND',
  COLLEAGUE = 'COLLEAGUE',
  CUSTOM = 'CUSTOM',
}

export enum FamilyTreePermission {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

// User types
export interface User extends BaseEntity {
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  profilePicture?: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
}

// Family Tree types
export interface FamilyTree extends BaseEntity {
  name: string;
  description?: string;
  ownerName?: string;
  treeType: TreeType;
  userId: string;
  isPublic: boolean;
  people: Person[];
  relationships: Relationship[];
  sharedWith: FamilyTreeShare[];
}

export interface CreateFamilyTreeDto {
  name: string;
  description?: string;
  ownerName?: string;
  treeType?: TreeType;
  isPublic?: boolean;
}

export interface UpdateFamilyTreeDto {
  name?: string;
  description?: string;
  ownerName?: string;
  treeType?: TreeType;
  isPublic?: boolean;
}

export interface FamilyTreeShare extends BaseEntity {
  treeId: string;
  userId: string;
  permission: FamilyTreePermission;
  sharedAt: string;
  sharedBy: string;
  familyTree: FamilyTree;
  user: User;
}

// Person types
export interface Person extends BaseEntity {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: string;
  gender?: Gender;
  occupation?: string;
  notes?: string;
  relationshipToBride?: string;
  relationshipToGroom?: string;
  relationshipToOwner?: string;
  positionX: number;
  positionY: number;
  treeId: string;
  isAlive: boolean;
  profilePicture?: string;
  familyTree: FamilyTree;
  relationshipsFrom: Relationship[];
  relationshipsTo: Relationship[];
}

export interface CreatePersonDto {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: Date;
  gender?: Gender;
  occupation?: string;
  notes?: string;
  relationshipToBride?: string;
  relationshipToGroom?: string;
  relationshipToOwner?: string;
  positionX?: number;
  positionY?: number;
  treeId: string;
  isAlive?: boolean;
  profilePicture?: string;
}

export interface UpdatePersonDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  birthDate?: Date;
  gender?: Gender;
  occupation?: string;
  notes?: string;
  relationshipToBride?: string;
  relationshipToGroom?: string;
  relationshipToOwner?: string;
  positionX?: number;
  positionY?: number;
  isAlive?: boolean;
  profilePicture?: string;
}

// Relationship types
export interface Relationship extends BaseEntity {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  customRelationshipName?: string;
  cousinDegree?: number;
  generationRemoval?: number;
  generationDistance?: number;
  startDate?: string;
  endDate?: string;
  treeId: string;
  notes?: string;
  fromPerson: Person;
  toPerson: Person;
  familyTree: FamilyTree;
}

export interface CreateRelationshipDto {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  customRelationshipName?: string;
  cousinDegree?: number;
  generationRemoval?: number;
  generationDistance?: number;
  startDate?: Date;
  endDate?: Date;
  treeId: string;
  notes?: string;
}

// Statistics and Insights types
export interface FamilyTreeStats {
  totalPeople: number;
  totalRelationships: number;
  generations: number;
  averageAge?: number;
  oldestPerson?: Person;
  youngestPerson?: Person;
  mostConnectedPerson?: Person;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  relationshipTypeDistribution: Record<RelationshipType, number>;
}

export interface FamilyInsights {
  largestFamily: {
    rootPerson: Person;
    size: number;
  };
  commonNames: {
    name: string;
    count: number;
  }[];
  ageDistribution: {
    ageRange: string;
    count: number;
  }[];
  occupationDistribution: {
    occupation: string;
    count: number;
  }[];
  geographicalDistribution: {
    location: string;
    count: number;
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Query and Mutation result types
export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export interface MutationResult<T> {
  mutate: (variables: T) => void;
  mutateAsync: (variables: T) => Promise<unknown>;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  isSuccess: boolean;
}

// Form types
export interface PersonFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  gender: Gender | '';
  occupation: string;
  notes: string;
  relationshipToBride: string;
  relationshipToGroom: string;
  relationshipToOwner: string;
  isAlive: boolean;
  profilePicture: string;
}

export interface FamilyTreeFormData {
  name: string;
  description: string;
  ownerName: string;
  treeType: TreeType;
  isPublic: boolean;
}

export interface RelationshipFormData {
  fromPersonId: string;
  toPersonId: string;
  relationshipType: RelationshipType;
  customRelationshipName: string;
  cousinDegree: number | '';
  generationRemoval: number | '';
  generationDistance: number | '';
  startDate: string;
  endDate: string;
  notes: string;
}
