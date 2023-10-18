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

export const getAuthHeader = async () => {
  const session = await Auth.currentSession();
  const idToken = session.getIdToken().getJwtToken();
  return {
    Authorization: idToken,
  };
};

export const getDatePickerValue = (value: string) => {
  if (!value || value.length === 0) {
    return '';
  }

  const localDate = new Date(value);
  const year = localDate.getFullYear();

  // Months are zero-indexed, so need to add 1 to get the human friendly month number
  // padStart() ensures it's always 2 characters, so 3 becomes 03
  const month = String(localDate.getMonth() + 1).padStart(2, '0');

  // padStart() ensures the day is always 2 characters
  const day = String(localDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
