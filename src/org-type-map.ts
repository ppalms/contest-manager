import { OrganizationType } from '@/graphql/API';

export const orgTypeMap = {
  [OrganizationType.District]: 'District',
  [OrganizationType.National]: 'National',
  [OrganizationType.School]: 'School',
  [OrganizationType.State]: 'State',
  [OrganizationType.Unknown]: 'Unknown',
};
