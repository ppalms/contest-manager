'use client';

import { Amplify } from 'aws-amplify';
import { CognitoUser } from '@aws-amplify/auth';
import AmplifyConfig from '@/amplify-config';
import React from 'react';

Amplify.configure(AmplifyConfig);

type UserContext = {
  user: CognitoUser | null;
  setUser: React.Dispatch<React.SetStateAction<CognitoUser | null>>;
};
export const AuthContext = React.createContext<UserContext | null>(null);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<CognitoUser | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthLayout;
