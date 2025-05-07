/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { UserContext, UserContextType } from '@/contexts/user-context';
import { useContext } from 'react';

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
