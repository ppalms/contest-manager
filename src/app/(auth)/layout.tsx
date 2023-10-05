'use client';

import awsExports from '@/aws-exports';
import { Amplify } from 'aws-amplify';

console.log(awsExports);
Amplify.configure(awsExports);

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  console.log(Amplify.Auth);
  
  return <>{children}</>;
};

export default AuthLayout;
