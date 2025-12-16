export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum TreeType {
  FAMILY_TREE = "FAMILY_TREE",
  WEDDING_GUESTS = "WEDDING_GUESTS",
  SOCIAL_NETWORK = "SOCIAL_NETWORK",
  CUSTOM = "CUSTOM",
}

export enum RelationshipType {
  // Direct family
  PARENT = "PARENT",
  CHILD = "CHILD",
  SIBLING = "SIBLING",
  SPOUSE = "SPOUSE",

  // Extended family - Grandparents/Grandchildren
  GRANDPARENT = "GRANDPARENT",
  GRANDCHILD = "GRANDCHILD",
  GREAT_GRANDPARENT = "GREAT_GRANDPARENT",
  GREAT_GRANDCHILD = "GREAT_GRANDCHILD",

  // Aunts/Uncles and Nieces/Nephews
  AUNT = "AUNT",
  UNCLE = "UNCLE",
  NIECE = "NIECE",
  NEPHEW = "NEPHEW",
  GREAT_AUNT = "GREAT_AUNT",
  GREAT_UNCLE = "GREAT_UNCLE",
  GREAT_NIECE = "GREAT_NIECE",
  GREAT_NEPHEW = "GREAT_NEPHEW",

  // Cousins (dynamic calculation)
  COUSIN = "COUSIN",

  // In-laws
  MOTHER_IN_LAW = "MOTHER_IN_LAW",
  FATHER_IN_LAW = "FATHER_IN_LAW",
  DAUGHTER_IN_LAW = "DAUGHTER_IN_LAW",
  SON_IN_LAW = "SON_IN_LAW",
  SISTER_IN_LAW = "SISTER_IN_LAW",
  BROTHER_IN_LAW = "BROTHER_IN_LAW",

  // Step relationships
  STEPPARENT = "STEPPARENT",
  STEPCHILD = "STEPCHILD",
  STEPSIBLING = "STEPSIBLING",

  // Half relationships
  HALF_SIBLING = "HALF_SIBLING",

  // Adopted relationships
  ADOPTED_PARENT = "ADOPTED_PARENT",
  ADOPTED_CHILD = "ADOPTED_CHILD",

  // Godparents/Godchildren
  GODPARENT = "GODPARENT",
  GODCHILD = "GODCHILD",

  // Friends and other relationships
  CLOSE_FRIEND = "CLOSE_FRIEND",
  FAMILY_FRIEND = "FAMILY_FRIEND",
  MENTOR = "MENTOR",
  MENTEE = "MENTEE",

  // Custom relationship
  CUSTOM = "CUSTOM",
}

export interface Person {
  id: string;
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
  position: { x: number; y: number };
  treeId: string;
  isAlive: boolean;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Relationship {
  id: string;
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
  createdAt: Date;
}

export interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  ownerName?: string;
  treeType: TreeType;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyTreeStats {
  totalPeople: number;
  totalRelationships: number;
  generations: number;
  averageRelationshipsPerPerson: number;
  relationshipTypeBreakdown: Record<RelationshipType, number>;
}

export interface FamilyInsights {
  largestGeneration: number;
  oldestPerson?: Person;
  youngestPerson?: Person;
  mostConnectedPerson?: Person;
  familySize: number;
  averageAge?: number;
}

export interface RelationshipPath {
  fromPerson: Person;
  toPerson: Person;
  path: Array<{
    person: Person;
    relationship: Relationship;
  }>;
  description: string;
}