import { Auth } from 'aws-amplify';
import {
  ContestLevel,
  ContestType,
  OrganizationType,
  UserRole,
} from './graphql/API';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const APPSYNC_AUTH_TYPE = 'AWS_LAMBDA';

export interface AuthHeader {
  Authorization: string;
}

export const getAuthHeader: () => Promise<{
  [key: string]: string;
}> = async () => {
  const session = await Auth.currentSession();
  const idToken = session.getIdToken().getJwtToken();
  return {
    Authorization: idToken,
  };
};

export const orgTypeMap = {
  [OrganizationType.District]: 'District',
  [OrganizationType.National]: 'National',
  [OrganizationType.School]: 'School',
  [OrganizationType.State]: 'State',
  [OrganizationType.Unknown]: 'Unknown',
};

export const userRoleMap = {
  [UserRole.Director]: 'Director',
  [UserRole.Manager]: 'Contest Manager',
  [UserRole.TenantAdmin]: 'Administrator',
  [UserRole.Unknown]: 'Unknown',
};

export const contestTypeMap = {
  [ContestType.Orchestra]: 'Orchestra',
  [ContestType.MarchingBand]: 'Marching Band',
  [ContestType.Unknown]: 'Unknown',
};

export const contestLevelMap = {
  [ContestLevel.State]: 'State',
  [ContestLevel.District]: 'District',
  [ContestLevel.Unknown]: 'Unknown',
};
