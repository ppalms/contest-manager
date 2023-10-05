'use client';

import awsExports from '@/aws-exports';
import { Amplify } from 'aws-amplify';

Amplify.configure(awsExports);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default AuthLayout;
