import { PlusIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import CreateFamilyTreeModal from './components/CreateFamilyTreeModal';
import FamilyTreeDemo from './components/FamilyTreeDemo';
import FamilyTreeSelector from './components/FamilyTreeSelector';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import EmailConfirmation from './pages/EmailConfirmation';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Signup from './pages/Signup';
import { QueryProvider } from './providers/QueryProvider';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function MainLayout(): React.JSX.Element {
  const { signOut, user } = useAuth();
  const [selectedTreeId, setSelectedTreeId] = useState<string | undefined>();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className='min-h-screen bg-gray-100'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Family Tree Graph Management System
            </h1>
            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-600'>
                <div className='font-medium'>
                  {user?.user_metadata?.full_name ??
                    user?.user_metadata?.first_name ??
                    user?.email}
                </div>
                {Boolean(user?.user_metadata?.username) && (
                  <div className='text-xs text-gray-500'>
                    @{user?.user_metadata?.username}
                  </div>
                )}
              </div>
              <button
                onClick={(): void => {
                  void signOut();
                }}
                className='text-sm font-medium text-red-600 hover:text-red-500'
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <FamilyTreeSelector
        selectedTreeId={selectedTreeId}
        onTreeSelect={setSelectedTreeId}
        onCreateNew={() => setShowCreateModal(true)}
      />

      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {selectedTreeId ? (
          <FamilyTreeDemo treeId={selectedTreeId} />
        ) : (
          <div className='text-center py-12'>
            <HomeIcon className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No family tree selected
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Get started by selecting an existing family tree or creating a new
              one.
            </p>
            <div className='mt-6'>
              <button
                onClick={() => setShowCreateModal(true)}
                className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              >
                <PlusIcon className='h-4 w-4 mr-2' />
                Create New Family Tree
              </button>
            </div>
          </div>
        )}
      </main>

      <CreateFamilyTreeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(treeId: string): void => {
          setSelectedTreeId(treeId);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <QueryProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/email-confirmation' element={<EmailConfirmation />} />
            <Route
              path='/'
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
          <ToastContainer
            position='top-right'
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
            className='mt-16'
            toastClassName='bg-white shadow-lg border border-gray-200 rounded-lg'
          />
        </AuthProvider>
      </Router>
    </QueryProvider>
  );
}

export default App;
