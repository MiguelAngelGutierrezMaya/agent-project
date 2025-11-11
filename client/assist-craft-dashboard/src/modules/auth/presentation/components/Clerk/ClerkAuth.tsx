import { ClerkProvider } from '@clerk/clerk-react';
import React from 'react';

interface ClerkAuthProps {
  children: React.ReactNode;
}

const PUBLISHABLE_KEY: string = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  '') as string;

export const ClerkAuth = ({ children }: ClerkAuthProps) => {
  if (!PUBLISHABLE_KEY) {
    throw new Error('Add your Clerk Publishable Key to the .env file');
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>{children}</ClerkProvider>
  );
};
