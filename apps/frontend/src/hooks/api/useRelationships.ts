import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

import { api } from '../../services/api';
import type { Relationship, CreateRelationshipDto } from '../../types/api';

export const useRelationships = (
  treeId: string
): UseQueryResult<Relationship[], Error> => {
  return useQuery({
    queryKey: ['relationships', treeId],
    queryFn: (): Promise<Relationship[]> => api.relationship.getAll(treeId),
    enabled: Boolean(treeId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const usePersonRelationships = (
  personId: string
): UseQueryResult<Relationship[], Error> => {
  return useQuery({
    queryKey: ['personRelationships', personId],
    queryFn: (): Promise<Relationship[]> =>
      api.relationship.getByPersonId(personId),
    enabled: Boolean(personId),
    staleTime: 3 * 60 * 1000,
  });
};

export const useCreateRelationship = (): UseMutationResult<
  Relationship,
  Error,
  CreateRelationshipDto
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRelationshipDto): Promise<Relationship> =>
      api.relationship.create(data),
    onSuccess: newRelationship => {
      void queryClient.invalidateQueries({
        queryKey: ['relationships', newRelationship.treeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['personRelationships', newRelationship.fromPersonId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['personRelationships', newRelationship.toPersonId],
      });
    },
  });
};

export const useDeleteRelationship = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<void> => api.relationship.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['relationships'] });
      void queryClient.invalidateQueries({ queryKey: ['personRelationships'] });
    },
  });
};
