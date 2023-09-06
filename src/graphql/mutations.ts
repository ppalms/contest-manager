/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createOrganization = /* GraphQL */ `
  mutation CreateOrganization($organization: OrganizationInput!) {
    createOrganization(organization: $organization) {
      id
      name
      type
      __typename
    }
  }
`;
export const deleteOrganization = /* GraphQL */ `
  mutation DeleteOrganization($id: String!) {
    deleteOrganization(id: $id)
  }
`;
export const updateOrganization = /* GraphQL */ `
  mutation UpdateOrganization($organization: UpdateOrganizationInput!) {
    updateOrganization(organization: $organization) {
      id
      name
      type
      __typename
    }
  }
`;
