import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactElement;
}): React.JSX.Element {
  const { session, loading, user } = useAuth();
  useEffect(() => {
    // Check if user email is not confirmed
    if (user && !user.email_confirmed_at) {
      toast.warn(
        '⚠️ Email Not Confirmed: Please check your email and click the confirmation link to fully activate your account.'
      );
    }
  }, [user]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to='/login' replace />;
  }

  return children;
}
