export const createOrganization = /* GraphQL */ `
  mutation CreateOrganization($organization: OrganizationInput!) {
    createOrganization(organization: $organization) {
      id
      name
      type
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
    }
  }
`;

// export const addUserToOrganization = /* GraphQL */ `
//   mutation AddUserToOrganization($organizationId: String!, $userId: String!) {
//     addUserToOrganization(organizationId: $organizationId, userId: $userId) {
//       userId
//     }
//   }
// `;