import { OrganizationType } from '@/graphql/API';

export const orgTypeMap = {
  [OrganizationType.DISTRICT]: 'District',
  [OrganizationType.NATIONAL]: 'National',
  [OrganizationType.SCHOOL]: 'School',
  [OrganizationType.STATE]: 'State',
  [OrganizationType.UNKNOWN]: 'Unknown',
};
