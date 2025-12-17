import { Gender, TreeType, RelationshipType } from "./types";

// Base DTO interfaces
export interface BaseCreateDto {
  // Common fields for creation
}

export interface BaseUpdateDto {
  // Common fields for updates
}

// Person DTOs
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

// Family Tree DTOs
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

// Relationship DTOs
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

export interface UpdateRelationshipDto {
  relationshipType?: RelationshipType;
  customRelationshipName?: string;
  cousinDegree?: number;
  generationRemoval?: number;
  generationDistance?: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

// User DTOs
export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  dateOfBirth?: Date;
  profilePicture?: string;
}

// Search DTOs
export interface SearchPersonDto {
  treeId: string;
  query: string;
  filters?: {
    gender?: Gender;
    isAlive?: boolean;
    hasEmail?: boolean;
    hasPhone?: boolean;
  };
}

// Bulk operation DTOs
export interface BulkCreatePersonDto {
  people: CreatePersonDto[];
  relationships?: CreateRelationshipDto[];
}

export interface BulkUpdatePersonDto {
  updates: Array<{
    id: string;
    data: UpdatePersonDto;
  }>;
}
