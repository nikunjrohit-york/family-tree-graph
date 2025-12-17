import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

import { api } from '../../services/api';
import type {
  Person,
  CreatePersonDto,
  UpdatePersonDto,
  RelationshipType,
  Relationship,
} from '../../types/api';

export const usePeople = (treeId: string): UseQueryResult<Person[], Error> => {
  return useQuery({
    queryKey: ['people', treeId],
    queryFn: (): Promise<Person[]> => api.person.getAll(treeId),
    enabled: Boolean(treeId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const usePerson = (id: string): UseQueryResult<Person, Error> => {
  return useQuery({
    queryKey: ['person', id],
    queryFn: (): Promise<Person> => api.person.getById(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePerson = (): UseMutationResult<
  Person,
  Error,
  CreatePersonDto
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonDto): Promise<Person> =>
      api.person.create(data),
    onSuccess: newPerson => {
      void queryClient.invalidateQueries({
        queryKey: ['people', newPerson.treeId],
      });
    },
  });
};

export const useUpdatePerson = (): UseMutationResult<
  Person,
  Error,
  { id: string; data: UpdatePersonDto }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePersonDto;
    }): Promise<Person> => api.person.update(id, data),
    onSuccess: updatedPerson => {
      void queryClient.invalidateQueries({
        queryKey: ['people', updatedPerson.treeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['person', updatedPerson.id],
      });
    },
  });
};

export const useDeletePerson = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<void> => api.person.delete(id),
    onSuccess: (_, deletedId) => {
      void queryClient.invalidateQueries({ queryKey: ['people'] });
      void queryClient.removeQueries({ queryKey: ['person', deletedId] });
    },
  });
};

export const useSearchPeople = (
  treeId: string,
  query: string
): UseQueryResult<Person[], Error> => {
  return useQuery({
    queryKey: ['searchPeople', treeId, query],
    queryFn: (): Promise<Person[]> => api.person.search(treeId, query),
    enabled: Boolean(treeId) && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAddFamilyMember = (): UseMutationResult<
  { person: Person; relationship: Relationship },
  Error,
  {
    personId: string;
    relationshipType: RelationshipType;
    newPersonData: CreatePersonDto;
  }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      personId,
      relationshipType,
      newPersonData,
    }: {
      personId: string;
      relationshipType: RelationshipType;
      newPersonData: CreatePersonDto;
    }) => api.person.addFamilyMember(personId, relationshipType, newPersonData),
    onSuccess: result => {
      void queryClient.invalidateQueries({
        queryKey: ['people', result.person.treeId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['relationships', result.person.treeId],
      });
    },
  });
};
