import { Person, Relationship, FamilyTree, FamilyTreeStats, FamilyInsights, RelationshipPath } from './types';
import { CreatePersonDto, UpdatePersonDto, CreateRelationshipDto, CreateFamilyTreeDto, UpdateFamilyTreeDto } from './validation';

// Person Management API
export interface PersonAPI {
  createPerson(data: CreatePersonDto): Promise<Person>;
  updatePerson(id: string, data: UpdatePersonDto): Promise<Person>;
  deletePerson(id: string): Promise<void>;
  getPerson(id: string): Promise<Person>;
  getAllPeople(treeId: string): Promise<Person[]>;
  addFamilyMemberFromNode(
    personId: string,
    relationshipType: string,
    newPersonData: CreatePersonDto
  ): Promise<{ person: Person; relationship: Relationship }>;
}

// Relationship Management API
export interface RelationshipAPI {
  createRelationship(data: CreateRelationshipDto): Promise<Relationship>;
  deleteRelationship(id: string): Promise<void>;
  getRelationships(treeId: string): Promise<Relationship[]>;
  getPersonRelationships(personId: string): Promise<Relationship[]>;
}

// Family Tree Management API
export interface FamilyTreeAPI {
  createFamilyTree(data: CreateFamilyTreeDto): Promise<FamilyTree>;
  updateFamilyTree(id: string, data: UpdateFamilyTreeDto): Promise<FamilyTree>;
  deleteFamilyTree(id: string): Promise<void>;
  getFamilyTree(id: string): Promise<FamilyTree>;
  getFamilyTreeStats(id: string): Promise<FamilyTreeStats>;
}

// Family Analytics API
export interface FamilyAnalyticsAPI {
  getCloseRelationshipsCount(personId: string): Promise<number>;
  getFamilyInsights(treeId: string): Promise<FamilyInsights>;
  getRelationshipPath(
    fromPersonId: string,
    toPersonId: string
  ): Promise<RelationshipPath>;
}