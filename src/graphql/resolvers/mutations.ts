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
  mutation DeleteOrganization($id: ID!) {
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

export const saveUser = /* GraphQL */ `
  mutation SaveUser($user: SaveUserInput!) {
    saveUser(user: $user) {
      id
      firstName
      lastName
      email
      role
      username
      enabled
    }
  }
`;

export const saveContest = /* GraphQL */ `
  mutation SaveContest($contest: SaveContestInput!) {
    saveContest(contest: $contest) {
      id
      name
      type
      level
      startDate
      endDate
      signUpStartDate
      signUpEndDate
    }
  }
`;

export const deleteContest = /* GraphQL */ `
  mutation DeleteContest($id: ID!) {
    deleteContest(id: $id)
  }
`;
