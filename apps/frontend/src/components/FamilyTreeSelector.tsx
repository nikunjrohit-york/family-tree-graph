import { PlusIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { familyTreeApi } from '../services/api';

interface FamilyTreeWithUser {
  id: string;
  name: string;
  description?: string;
  treeType: string;
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  _count: {
    people: number;
    relationships: number;
  };
  createdAt: string;
}

interface FamilyTreeSelectorProps {
  selectedTreeId?: string;
  onTreeSelect: (treeId: string) => void;
  onCreateNew: () => void;
}

export default function FamilyTreeSelector({
  selectedTreeId,
  onTreeSelect,
  onCreateNew,
}: FamilyTreeSelectorProps) {
  const [trees, setTrees] = useState<FamilyTreeWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamilyTrees();
  }, []);

  const loadFamilyTrees = async () => {
    try {
      setLoading(true);
      const data = await familyTreeApi.getAll();
      setTrees(data as unknown as FamilyTreeWithUser[]);
    } catch (error) {
      console.error('Failed to load family trees:', error);
      toast.error('Failed to load family trees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='p-4'>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white shadow-sm border-b'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between py-4'>
          <div className='flex items-center space-x-4'>
            <HomeIcon className='h-6 w-6 text-green-600' />
            <div>
              <label
                htmlFor='family-tree-select'
                className='block text-sm font-medium text-gray-700'
              >
                Family Tree
              </label>
              <select
                id='family-tree-select'
                value={selectedTreeId || ''}
                onChange={e => e.target.value && onTreeSelect(e.target.value)}
                className='mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
              >
                <option value=''>Select a family tree...</option>
                {trees.map(tree => (
                  <option key={tree.id} value={tree.id}>
                    {tree.name} ({tree._count.people} people)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={onCreateNew}
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            <PlusIcon className='h-4 w-4 mr-2' />
            New Tree
          </button>
        </div>

        {selectedTreeId && (
          <div className='pb-4'>
            {trees.find(t => t.id === selectedTreeId) && (
              <div className='text-sm text-gray-600'>
                <p>
                  {trees.find(t => t.id === selectedTreeId)?.description ||
                    'No description'}
                </p>
                <p className='mt-1'>
                  Created by{' '}
                  {trees.find(t => t.id === selectedTreeId)?.user.firstName}{' '}
                  {trees.find(t => t.id === selectedTreeId)?.user.lastName}•{' '}
                  {trees.find(t => t.id === selectedTreeId)?._count.people}{' '}
                  people •{' '}
                  {
                    trees.find(t => t.id === selectedTreeId)?._count
                      .relationships
                  }{' '}
                  relationships
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
