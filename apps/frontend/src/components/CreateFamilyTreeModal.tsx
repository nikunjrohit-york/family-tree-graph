import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { familyTreeApi } from '../services/api';
import type { CreateFamilyTreeDto } from '../types/api';

interface CreateFamilyTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (treeId: string) => void;
}

export default function CreateFamilyTreeModal({
  isOpen,
  onClose,
  onCreated,
}: CreateFamilyTreeModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ownerName: '',
    treeType: 'FAMILY_TREE',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a name for your family tree');
      return;
    }

    try {
      setLoading(true);
      const newTree = await familyTreeApi.create(
        formData as CreateFamilyTreeDto
      );
      toast.success('🌳 Family tree created successfully!');
      onCreated(newTree.id);
      onClose();
      setFormData({
        name: '',
        description: '',
        ownerName: '',
        treeType: 'FAMILY_TREE',
      });
    } catch (error) {
      // Log error for debugging
      console.error('Failed to create family tree:', error);
      toast.error('Failed to create family tree');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={onClose}
          onKeyDown={(e): void => {
            if (e.key === 'Escape') {
              onClose();
            }
          }}
          role='button'
          tabIndex={0}
          aria-label='Close modal'
        ></div>

        <span className='hidden sm:inline-block sm:align-middle sm:h-screen'>
          &#8203;
        </span>

        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg leading-6 font-medium text-gray-900'>
                Create New Family Tree
              </h3>
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-500'
              >
                <XMarkIcon className='h-6 w-6' />
              </button>
            </div>

            <form
              onSubmit={(e): void => {
                void handleSubmit(e);
              }}
              className='space-y-4'
            >
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-gray-700'
                >
                  Family Tree Name *
                </label>
                <input
                  type='text'
                  name='name'
                  id='name'
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  placeholder='e.g., Smith Family Tree'
                />
              </div>

              <div>
                <label
                  htmlFor='description'
                  className='block text-sm font-medium text-gray-700'
                >
                  Description
                </label>
                <textarea
                  name='description'
                  id='description'
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  placeholder='Describe your family tree...'
                />
              </div>

              <div>
                <label
                  htmlFor='ownerName'
                  className='block text-sm font-medium text-gray-700'
                >
                  Main Person (Optional)
                </label>
                <input
                  type='text'
                  name='ownerName'
                  id='ownerName'
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  placeholder='e.g., John Smith'
                />
              </div>

              <div>
                <label
                  htmlFor='treeType'
                  className='block text-sm font-medium text-gray-700'
                >
                  Tree Type
                </label>
                <select
                  name='treeType'
                  id='treeType'
                  value={formData.treeType}
                  onChange={handleInputChange}
                  className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                >
                  <option value='FAMILY_TREE'>Family Tree</option>
                  <option value='WEDDING_GUESTS'>Wedding Guests</option>
                  <option value='SOCIAL_NETWORK'>Social Network</option>
                  <option value='CUSTOM'>Custom</option>
                </select>
              </div>

              <div className='flex justify-end space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? 'Creating...' : 'Create Tree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
