import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { supabase } from '../lib/supabase';

export default function EmailConfirmation() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        toast.error(`Resend Failed: ${error.message}`);
      } else {
        toast.success(
          "📧 Email Sent! We've sent you a new confirmation email. Please check your inbox."
        );
      }
    } catch {
      toast.error('Resend Failed: An unexpected error occurred');
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100'>
            <EnvelopeIcon className='h-6 w-6 text-blue-600' />
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Check Your Email
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            We've sent you a confirmation link. Please check your email and
            click the link to verify your account.
          </p>
        </div>

        <div className='mt-8 space-y-6'>
          <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
            <div className='flex'>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-blue-800'>
                  Didn't receive the email?
                </h3>
                <div className='mt-2 text-sm text-blue-700'>
                  <ul className='list-disc pl-5 space-y-1'>
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Wait a few minutes for the email to arrive</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleResendConfirmation} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Resend confirmation email
              </label>
              <input
                type='email'
                name='email'
                id='email'
                required
                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm'
                placeholder='Enter your email address'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button
              type='submit'
              disabled={loading}
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Sending...' : 'Resend Confirmation Email'}
            </button>
          </form>

          <div className='text-center'>
            <Link
              to='/login'
              className='font-medium text-indigo-600 hover:text-indigo-500'
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
