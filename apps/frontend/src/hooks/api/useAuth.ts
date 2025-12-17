import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

import { api } from '../../services/api';
import type { User, UpdateUserProfileDto } from '../../types/api';

export const useUserProfile = (): UseQueryResult<User, Error> => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: (): Promise<User> => api.user.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount: number, error: Error): boolean => {
      // Don't retry on 401 errors (unauthorized)
      if (
        Boolean(error) &&
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        error.status === 401
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUpdateUserProfile = (): UseMutationResult<
  User,
  Error,
  UpdateUserProfileDto
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserProfileDto): Promise<User> =>
      api.user.updateProfile(data),
    onSuccess: updatedUser => {
      queryClient.setQueryData(['userProfile'], updatedUser);
    },
  });
};
