import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

import { api } from '../../services/api';
import type {
  FamilyTree,
  CreateFamilyTreeDto,
  UpdateFamilyTreeDto,
  FamilyTreeStats,
  FamilyInsights,
} from '../../types/api';

export const useFamilyTrees = (): UseQueryResult<FamilyTree[], Error> => {
  return useQuery({
    queryKey: ['familyTrees'],
    queryFn: (): Promise<FamilyTree[]> => api.familyTree.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFamilyTree = (
  id: string
): UseQueryResult<FamilyTree, Error> => {
  return useQuery({
    queryKey: ['familyTree', id],
    queryFn: (): Promise<FamilyTree> => api.familyTree.getById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFamilyTree = (): UseMutationResult<
  FamilyTree,
  Error,
  CreateFamilyTreeDto
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFamilyTreeDto): Promise<FamilyTree> =>
      api.familyTree.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['familyTrees'] });
    },
  });
};

export const useUpdateFamilyTree = (): UseMutationResult<
  FamilyTree,
  Error,
  { id: string; data: UpdateFamilyTreeDto }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFamilyTreeDto;
    }): Promise<FamilyTree> => api.familyTree.update(id, data),
    onSuccess: updatedTree => {
      void queryClient.invalidateQueries({ queryKey: ['familyTrees'] });
      void queryClient.invalidateQueries({
        queryKey: ['familyTree', updatedTree.id],
      });
    },
  });
};

export const useDeleteFamilyTree = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<void> => api.familyTree.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['familyTrees'] });
    },
  });
};

export const useFamilyTreeStats = (
  id: string
): UseQueryResult<FamilyTreeStats, Error> => {
  return useQuery({
    queryKey: ['familyTreeStats', id],
    queryFn: (): Promise<FamilyTreeStats> => api.familyTree.getStats(id),
    enabled: Boolean(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFamilyTreeInsights = (
  id: string
): UseQueryResult<FamilyInsights, Error> => {
  return useQuery({
    queryKey: ['familyTreeInsights', id],
    queryFn: (): Promise<FamilyInsights> => api.familyTree.getInsights(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};
