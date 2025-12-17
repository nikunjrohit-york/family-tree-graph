import { FamilyTree, Person } from '@family-tree/shared';
import { useState, useEffect } from 'react';

import { familyTreeApi, personApi } from '../services/api';
import { TreeType } from '../types/api';
import {
  mapApiFamilyTreeToShared,
  mapApiPeopleToShared,
} from '../utils/type-mappers';

interface FamilyTreeDemoProps {
  treeId: string;
}

export default function FamilyTreeDemo({
  treeId,
}: FamilyTreeDemoProps): React.JSX.Element {
  const [selectedTree, setSelectedTree] = useState<FamilyTree | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (treeId) {
      void loadFamilyTree(treeId);
      void loadPeople(treeId);
    }
  }, [treeId]);

  const loadFamilyTree = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const tree = await familyTreeApi.getById(id);
      setSelectedTree(mapApiFamilyTreeToShared(tree));
    } catch (err) {
      setError('Failed to load family tree');
      // Log error for debugging
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPeople = async (treeId: string): Promise<void> => {
    try {
      setLoading(true);
      const peopleData = await personApi.getAll(treeId);
      setPeople(mapApiPeopleToShared(peopleData));
    } catch (err) {
      setError('Failed to load people');
      // Log error for debugging
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSampleTree = async (): Promise<void> => {
    try {
      setLoading(true);
      const newTree = await familyTreeApi.create({
        name: 'My Family Tree',
        description: 'A sample family tree',
        ownerName: 'John Doe',
        treeType: TreeType.FAMILY_TREE,
      });

      // Add a sample person
      await personApi.create({
        name: 'John Doe',
        email: 'john@example.com',
        positionX: 0,
        positionY: 0,
        treeId: newTree.id,
        isAlive: true,
      });

      // Tree will be reloaded by parent component
      setSelectedTree(mapApiFamilyTreeToShared(newTree));
      await loadPeople(newTree.id);
    } catch (err) {
      setError('Failed to create sample tree');
      // Log error for debugging
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-lg'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold mb-4'>Family Tree Demo</h2>

        {Boolean(error) && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        <div className='flex gap-4 mb-6'>
          <button
            onClick={(): void => {
              void createSampleTree();
            }}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          >
            Create Sample Tree
          </button>
          <button
            onClick={() => window.location.reload()}
            className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded'
          >
            Refresh Trees
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Current Family Tree */}
        <div>
          <h3 className='text-xl font-semibold mb-3'>Current Family Tree</h3>
          {selectedTree ? (
            <div className='p-3 border border-blue-500 bg-blue-50 rounded'>
              <div className='font-medium'>{selectedTree.name}</div>
              <div className='text-sm text-gray-600'>
                {selectedTree.description}
              </div>
              <div className='text-xs text-gray-500'>
                Owner: {selectedTree.ownerName ?? 'Unknown'}
              </div>
            </div>
          ) : (
            <div className='text-gray-500 text-center py-4'>
              Loading family tree...
            </div>
          )}
        </div>

        {/* People */}
        <div>
          <h3 className='text-xl font-semibold mb-3'>
            People {selectedTree ? `in ${selectedTree.name}` : ''} (
            {people.length})
          </h3>
          <div className='space-y-2'>
            {people.map(person => (
              <div
                key={person.id}
                className='p-3 border border-gray-300 rounded'
              >
                <div className='font-medium'>{person.name}</div>
                {Boolean(person.email) && (
                  <div className='text-sm text-gray-600'>{person.email}</div>
                )}
                {Boolean(person.occupation) && (
                  <div className='text-xs text-gray-500'>
                    {person.occupation}
                  </div>
                )}
              </div>
            ))}
            {people.length === 0 && selectedTree && (
              <div className='text-gray-500 text-center py-4'>
                No people found in this tree.
              </div>
            )}
            {!selectedTree && (
              <div className='text-gray-500 text-center py-4'>
                Select a family tree to view people.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
