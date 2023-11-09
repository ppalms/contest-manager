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

export const listUsersByRole = /* GraphQL */ `
  query ListUsersByRole($role: UserRole!) {
    listUsersByRole(role: $role) {
      id
      firstName
      lastName
      email
    }
  }
`;

export const getOrgWithMembers = /* GraphQL */ `
  query GetOrgWithMembers($id: ID!) {
    getOrgWithMembers(id: $id) {
      organization {
        id
        name
        type
        class
      }
      members {
        userId
        firstName
        lastName
        email
        role
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
      eligibleClasses
      startDate
      endDate
      signUpStartDate
      signUpEndDate
      managers {
        userId
        firstName
        lastName
        email
      }
    }
  }
`;
