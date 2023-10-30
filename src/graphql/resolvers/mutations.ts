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

export const saveOrganization = /* GraphQL */ `
  mutation SaveOrganization($organization: OrganizationInput!) {
    saveOrganization(organization: $organization) {
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
      performanceTime
    }
  }
`;

export const deleteContest = /* GraphQL */ `
  mutation DeleteContest($id: ID!) {
    deleteContest(id: $id)
  }
`;

export const assignManagers = /* GraphQL */ `
  mutation AssignManagers($assignments: [AssignManagerInput]!) {
    assignManagers(assignments: $assignments) {
      userId
      firstName
      lastName
    }
  }
`;

export const removeManager = /* GraphQL */ `
  mutation RemoveManager($contestId: ID!, $managerId: ID!) {
    removeManager(contestId: $contestId, managerId: $managerId)
  }
`;
