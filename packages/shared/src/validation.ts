import { z } from "zod";
import { Gender, TreeType, RelationshipType } from "./types";

export const CreatePersonSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.nativeEnum(Gender).optional(),
  occupation: z.string().optional(),
  notes: z.string().optional(),
  relationshipToBride: z.string().optional(),
  relationshipToGroom: z.string().optional(),
  relationshipToOwner: z.string().optional(),
  positionX: z.number().optional(),
  positionY: z.number().optional(),
  treeId: z.string().uuid(),
  isAlive: z.boolean().default(true),
  profilePicture: z.string().optional(),
});

export const UpdatePersonSchema = CreatePersonSchema.partial().omit({
  treeId: true,
});

export const CreateRelationshipSchema = z.object({
  fromPersonId: z.string().uuid(),
  toPersonId: z.string().uuid(),
  relationshipType: z.nativeEnum(RelationshipType),
  customRelationshipName: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  treeId: z.string().uuid(),
  notes: z.string().optional(),
});

export const CreateFamilyTreeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  treeType: z.nativeEnum(TreeType).default(TreeType.FAMILY_TREE),
});

export const UpdateFamilyTreeSchema = CreateFamilyTreeSchema.partial();

// Zod inferred types (for internal validation use)
export type CreatePersonValidation = z.infer<typeof CreatePersonSchema>;
export type UpdatePersonValidation = z.infer<typeof UpdatePersonSchema>;
export type CreateRelationshipValidation = z.infer<
  typeof CreateRelationshipSchema
>;
export type CreateFamilyTreeValidation = z.infer<typeof CreateFamilyTreeSchema>;
export type UpdateFamilyTreeValidation = z.infer<typeof UpdateFamilyTreeSchema>;
