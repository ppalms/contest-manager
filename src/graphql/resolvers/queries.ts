export const getOrganizationWithUsers = /* GraphQL */ `
  query GetOrganizationWithUsers($id: String!) {
    getOrganizationWithUsers(id: $id) {
      organization {
        id
        name
        type
      }
      users {
        id
        firstName
        lastName
        email
        role
        username
        enabled
      }
    }
  }
`;

export const listOrganizations = /* GraphQL */ `
  query ListOrganizations {
    listOrganizations {
      id
      name
      type
    }
  }
`;
