import { Auth } from 'aws-amplify';
import { OrganizationType, UserRole } from './graphql/API';

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

export const getAuthHeader = async () => {
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
  [UserRole.TenantAdmin]: 'Administrator',
  [UserRole.ContestManager]: 'Contest Manager',
  [UserRole.Unknown]: 'Unknown',
};
