'use client';

import { Amplify } from 'aws-amplify';
import AmplifyConfig from '@/amplify-config';

Amplify.configure(AmplifyConfig);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  console.log(Amplify.Auth);

  return <>{children}</>;
};

export default AuthLayout;
