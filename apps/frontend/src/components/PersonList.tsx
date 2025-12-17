import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { useState, useMemo } from 'react';

import { usePeople, useCreatePerson, useDeletePerson } from '../hooks/api';
import type { Person, CreatePersonDto } from '../types/api';

interface PersonListProps {
  treeId: string;
  onPersonSelect?: (person: Person) => void;
  onPersonEdit?: (person: Person) => void;
}

export const PersonList: React.FC<PersonListProps> = ({
  treeId,
  onPersonSelect,
  onPersonEdit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Use custom hooks for API operations
  const { data: people = [], isLoading, error, refetch } = usePeople(treeId);
  const createPersonMutation = useCreatePerson();
  const deletePersonMutation = useDeletePerson();

  // Memoized filtered people for performance
  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return people;

    const query = searchQuery.toLowerCase();
    return people.filter(
      person =>
        person.name.toLowerCase().includes(query) ||
        person.email?.toLowerCase().includes(query) ||
        person.occupation?.toLowerCase().includes(query)
    );
  }, [people, searchQuery]);

  const handleCreatePerson = async (
    personData: CreatePersonDto
  ): Promise<void> => {
    try {
      await createPersonMutation.mutateAsync(personData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create person:', error);
    }
  };

  const handleDeletePerson = async (personId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this person?')) {
      return;
    }

    try {
      await deletePersonMutation.mutateAsync(personId);
    } catch (error) {
      console.error('Failed to delete person:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600'></div>
        <span className='ml-2 text-gray-600'>Loading people...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-md p-4'>
        <div className='flex'>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-red-800'>
              Error loading people
            </h3>
            <div className='mt-2 text-sm text-red-700'>
              <p>{error.message}</p>
            </div>
            <div className='mt-4'>
              <button
                onClick={() => refetch()}
                className='bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200'
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow rounded-lg'>
      <div className='px-4 py-5 sm:p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-medium text-gray-900'>
            People ({people.length})
          </h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className='inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'
          >
            <PlusIcon className='h-4 w-4 mr-1' />
            Add Person
          </button>
        </div>

        {/* Search */}
        <div className='relative mb-4'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
          </div>
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
            placeholder='Search people...'
          />
        </div>

        {/* People List */}
        <div className='space-y-3'>
          {filteredPeople.length === 0 ? (
            <div className='text-center py-6'>
              <p className='text-gray-500'>
                {searchQuery
                  ? 'No people found matching your search.'
                  : 'No people in this family tree yet.'}
              </p>
            </div>
          ) : (
            filteredPeople.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                onSelect={onPersonSelect}
                onEdit={onPersonEdit}
                onDelete={handleDeletePerson}
                isDeleting={deletePersonMutation.isPending}
              />
            ))
          )}
        </div>
      </div>

      {showCreateForm && (
        <CreatePersonModal
          treeId={treeId}
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreatePerson}
          isLoading={createPersonMutation.isPending}
        />
      )}
    </div>
  );
};

interface PersonCardProps {
  person: Person;
  onSelect?: (person: Person) => void;
  onEdit?: (person: Person) => void;
  onDelete: (personId: string) => void;
  isDeleting: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onSelect,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              {person.profilePicture ? (
                <img
                  className='h-10 w-10 rounded-full'
                  src={person.profilePicture}
                  alt={person.name}
                />
              ) : (
                <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                  <span className='text-sm font-medium text-gray-700'>
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className='ml-4'>
              <div className='text-sm font-medium text-gray-900'>
                {person.name}
              </div>
              {person.email && (
                <div className='text-sm text-gray-500'>{person.email}</div>
              )}
              {person.occupation && (
                <div className='text-xs text-gray-400'>{person.occupation}</div>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          {onSelect && (
            <button
              onClick={() => onSelect(person)}
              className='text-indigo-600 hover:text-indigo-900 text-sm font-medium'
            >
              Select
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(person)}
              className='text-gray-600 hover:text-gray-900 text-sm font-medium'
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(person.id)}
            disabled={isDeleting}
            className='text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50'
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CreatePersonModalProps {
  treeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonDto) => Promise<void>;
  isLoading: boolean;
}

const CreatePersonModal: React.FC<CreatePersonModalProps> = ({
  treeId,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreatePersonDto>({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    treeId,
    positionX: 0,
    positionY: 0,
    isAlive: true,
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
      <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
        <div className='mt-3'>
          <h3 className='text-lg font-medium text-gray-900 mb-4'>
            Add New Person
          </h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Name *
              </label>
              <input
                type='text'
                required
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Email
              </label>
              <input
                type='email'
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Phone
              </label>
              <input
                type='tel'
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Occupation
              </label>
              <input
                type='text'
                value={formData.occupation}
                onChange={e =>
                  setFormData({ ...formData, occupation: e.target.value })
                }
                className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              />
            </div>
            <div className='flex items-center justify-end space-x-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50'
              >
                {isLoading ? 'Creating...' : 'Create Person'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
