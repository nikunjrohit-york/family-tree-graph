import axios, { type AxiosResponse } from 'axios';

import { supabase } from '../lib/supabase';
import type {
  FamilyTree,
  CreateFamilyTreeDto,
  UpdateFamilyTreeDto,
  FamilyTreeStats,
  FamilyInsights,
  Person,
  CreatePersonDto,
  UpdatePersonDto,
  Relationship,
  CreateRelationshipDto,
  RelationshipType,
  User,
  UpdateUserProfileDto,
  ApiError,
} from '../types/api';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use(async config => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const axiosError = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    if (axiosError.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }

    // Transform error to our ApiError type
    const apiError: ApiError = {
      message:
        axiosError.response?.data?.message ??
        axiosError.message ??
        'An error occurred',
      statusCode: axiosError.response?.status ?? 500,
      error: axiosError.response?.data?.error,
    };

    return Promise.reject(new Error(JSON.stringify(apiError)));
  }
);

// Helper function to extract data from response
const extractData = <T>(response: AxiosResponse<T>): T => response.data;

export const api = {
  // Family Tree endpoints
  familyTree: {
    getAll: (): Promise<FamilyTree[]> =>
      apiClient.get<FamilyTree[]>('/family-trees').then(extractData),

    getById: (id: string): Promise<FamilyTree> =>
      apiClient.get<FamilyTree>(`/family-trees/${id}`).then(extractData),

    create: (data: CreateFamilyTreeDto): Promise<FamilyTree> =>
      apiClient.post<FamilyTree>('/family-trees', data).then(extractData),

    update: (id: string, data: UpdateFamilyTreeDto): Promise<FamilyTree> =>
      apiClient
        .patch<FamilyTree>(`/family-trees/${id}`, data)
        .then(extractData),

    delete: (id: string): Promise<void> =>
      apiClient.delete(`/family-trees/${id}`).then(() => undefined),

    getStats: (id: string): Promise<FamilyTreeStats> =>
      apiClient
        .get<FamilyTreeStats>(`/family-trees/${id}/stats`)
        .then(extractData),

    getInsights: (id: string): Promise<FamilyInsights> =>
      apiClient
        .get<FamilyInsights>(`/family-trees/${id}/insights`)
        .then(extractData),
  },

  // Person endpoints
  person: {
    getAll: (treeId: string): Promise<Person[]> =>
      apiClient.get<Person[]>(`/people?treeId=${treeId}`).then(extractData),

    getById: (id: string): Promise<Person> =>
      apiClient.get<Person>(`/people/${id}`).then(extractData),

    create: (data: CreatePersonDto): Promise<Person> =>
      apiClient.post<Person>('/people', data).then(extractData),

    update: (id: string, data: UpdatePersonDto): Promise<Person> =>
      apiClient.patch<Person>(`/people/${id}`, data).then(extractData),

    delete: (id: string): Promise<void> =>
      apiClient.delete(`/people/${id}`).then(() => undefined),

    search: (treeId: string, query: string): Promise<Person[]> =>
      apiClient
        .get<
          Person[]
        >(`/people/search?treeId=${treeId}&q=${encodeURIComponent(query)}`)
        .then(extractData),

    addFamilyMember: (
      personId: string,
      relationshipType: RelationshipType,
      newPersonData: CreatePersonDto
    ): Promise<{ person: Person; relationship: Relationship }> =>
      apiClient
        .post<{ person: Person; relationship: Relationship }>(
          `/people/${personId}/family-member`,
          {
            relationshipType,
            newPersonData,
          }
        )
        .then(extractData),
  },

  // Relationship endpoints
  relationship: {
    getAll: (treeId: string): Promise<Relationship[]> =>
      apiClient
        .get<Relationship[]>(`/relationships?treeId=${treeId}`)
        .then(extractData),

    getByPersonId: (personId: string): Promise<Relationship[]> =>
      apiClient
        .get<Relationship[]>(`/relationships/person/${personId}`)
        .then(extractData),

    create: (data: CreateRelationshipDto): Promise<Relationship> =>
      apiClient.post<Relationship>('/relationships', data).then(extractData),

    delete: (id: string): Promise<void> =>
      apiClient.delete(`/relationships/${id}`).then(() => undefined),
  },

  // User endpoints
  user: {
    getProfile: (): Promise<User> =>
      apiClient.get<User>('/user/profile').then(extractData),

    updateProfile: (data: UpdateUserProfileDto): Promise<User> =>
      apiClient.put<User>('/user/profile', data).then(extractData),
  },
};

// Legacy exports for backward compatibility
export const familyTreeApi = api.familyTree;
export const personApi = api.person;
export const relationshipApi = api.relationship;
export const userApi = api.user;

export default apiClient;
