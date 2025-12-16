import { z } from 'zod';
import { Gender, TreeType, RelationshipType } from './types';

export const CreatePersonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.nativeEnum(Gender).optional(),
  occupation: z.string().optional(),
  notes: z.string().optional(),
  relationshipToBride: z.string().optional(),
  relationshipToGroom: z.string().optional(),
  relationshipToOwner: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  treeId: z.string().uuid(),
  isAlive: z.boolean().default(true),
  profilePicture: z.string().optional(),
});

export const UpdatePersonSchema = CreatePersonSchema.partial().omit({ treeId: true });

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
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  ownerName: z.string().optional(),
  treeType: z.nativeEnum(TreeType).default(TreeType.FAMILY_TREE),
});

export const UpdateFamilyTreeSchema = CreateFamilyTreeSchema.partial();

export type CreatePersonDto = z.infer<typeof CreatePersonSchema>;
export type UpdatePersonDto = z.infer<typeof UpdatePersonSchema>;
export type CreateRelationshipDto = z.infer<typeof CreateRelationshipSchema>;
export type CreateFamilyTreeDto = z.infer<typeof CreateFamilyTreeSchema>;
export type UpdateFamilyTreeDto = z.infer<typeof UpdateFamilyTreeSchema>;