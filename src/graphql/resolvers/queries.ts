export const listUsers = /* GraphQL */ `
  query ListUsers {
    listUsers {
      id
      firstName
      lastName
      role
      email
      username
      enabled
    }
  }
`;

export const getOrganizationWithUsers = /* GraphQL */ `
  query GetOrganizationWithUsers($id: ID!) {
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

export const listContests = /* GraphQL */ `
  query ListContests {
    listContests {
      id
      name
      type
      startDate
      endDate
    }
  }
`;

export const getContest = /* GraphQL */ `
  query GetContest($id: ID!) {
    getContest(id: $id) {
      id
      name
      type
      level
      startDate
      endDate
      signUpStartDate
      signUpEndDate
      managers {
        id
        firstName
        lastName
        email
      }
    }
  }
`;
