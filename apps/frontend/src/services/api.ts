import axios from 'axios';
import { Person, Relationship, FamilyTree, CreatePersonDto, CreateRelationshipDto, CreateFamilyTreeDto } from '@family-tree/shared';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Family Tree API
export const familyTreeApi = {
  async getAll(): Promise<FamilyTree[]> {
    const response = await api.get('/family-trees');
    return response.data;
  },

  async getById(id: string): Promise<FamilyTree> {
    const response = await api.get(`/family-trees/${id}`);
    return response.data;
  },

  async create(data: CreateFamilyTreeDto): Promise<FamilyTree> {
    const response = await api.post('/family-trees', data);
    return response.data;
  },

  async getStats(id: string) {
    const response = await api.get(`/family-trees/${id}/stats`);
    return response.data;
  },

  async getInsights(id: string) {
    const response = await api.get(`/family-trees/${id}/insights`);
    return response.data;
  },
};

// Person API
export const personApi = {
  async getAll(treeId: string): Promise<Person[]> {
    const response = await api.get(`/people?treeId=${treeId}`);
    return response.data;
  },

  async getById(id: string): Promise<Person> {
    const response = await api.get(`/people/${id}`);
    return response.data;
  },

  async create(data: CreatePersonDto): Promise<Person> {
    const response = await api.post('/people', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreatePersonDto>): Promise<Person> {
    const response = await api.patch(`/people/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/people/${id}`);
  },

  async search(treeId: string, query: string): Promise<Person[]> {
    const response = await api.get(`/people/search?treeId=${treeId}&q=${query}`);
    return response.data;
  },

  async addFamilyMember(personId: string, relationshipType: string, newPersonData: CreatePersonDto) {
    const response = await api.post(`/people/${personId}/family-member`, {
      relationshipType,
      newPersonData,
    });
    return response.data;
  },
};

// Relationship API
export const relationshipApi = {
  async getAll(treeId: string): Promise<Relationship[]> {
    const response = await api.get(`/relationships?treeId=${treeId}`);
    return response.data;
  },

  async getByPersonId(personId: string): Promise<Relationship[]> {
    const response = await api.get(`/relationships/person/${personId}`);
    return response.data;
  },

  async create(data: CreateRelationshipDto): Promise<Relationship> {
    const response = await api.post('/relationships', data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/relationships/${id}`);
  },
};

// Auth API
export const authApi = {
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// User API
export const userApi = {
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
};

export default api;