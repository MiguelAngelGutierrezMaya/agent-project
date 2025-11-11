//
// Clerk
//
import { SignInButton, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
//
// React
//
import React, { useEffect } from 'react';
//
// Components
//
import { useNavigate } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';
import { LoginHeader } from '@/modules/auth/presentation/components/Login/Header';
import { ROUTES } from '@/modules/shared/presentation/router';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      navigate(ROUTES.dashboard.main);
    }
  }, [isSignedIn, navigate]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <LoginHeader />

        <CardContent>
          <SignedIn>
            <button
              onClick={() => navigate(ROUTES.dashboard.main)}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            >
              Go to Dashboard
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button
                type='submit'
                className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >
                Sign In with Google
              </button>
            </SignInButton>
          </SignedOut>
        </CardContent>
      </Card>
    </div>
  );
};
