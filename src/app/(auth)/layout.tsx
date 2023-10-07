'use client';

import { Amplify } from 'aws-amplify';
import AmplifyConfig from '@/amplify-config';

Amplify.configure(AmplifyConfig);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default AuthLayout;
