export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AWSDate: { input: any; output: any; }
  AWSDateTime: { input: any; output: any; }
  AWSEmail: { input: any; output: any; }
  AWSIPAddress: { input: any; output: any; }
  AWSJSON: { input: any; output: any; }
  AWSPhone: { input: any; output: any; }
  AWSTime: { input: any; output: any; }
  AWSTimestamp: { input: any; output: any; }
  AWSURL: { input: any; output: any; }
};

export type AssignManagerInput = {
  contestId: Scalars['ID']['input'];
  email: Scalars['AWSEmail']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type AssignMemberInput = {
  email: Scalars['AWSEmail']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  orgId: Scalars['String']['input'];
  role: UserRole;
  userId: Scalars['ID']['input'];
};

export type Contest = {
  __typename?: 'Contest';
  eligibleClasses?: Maybe<Array<SchoolClass>>;
  endDate?: Maybe<Scalars['AWSDateTime']['output']>;
  id: Scalars['ID']['output'];
  level: ContestLevel;
  managers?: Maybe<Array<UserReference>>;
  name: Scalars['String']['output'];
  performanceTime?: Maybe<Scalars['Int']['output']>;
  signUpEndDate?: Maybe<Scalars['AWSDateTime']['output']>;
  signUpStartDate?: Maybe<Scalars['AWSDateTime']['output']>;
  startDate?: Maybe<Scalars['AWSDateTime']['output']>;
  type: ContestType;
};

export enum ContestLevel {
  District = 'DISTRICT',
  State = 'STATE',
  Unknown = 'UNKNOWN'
}

export enum ContestType {
  MarchingBand = 'MARCHING_BAND',
  Orchestra = 'ORCHESTRA',
  Unknown = 'UNKNOWN'
}

export type Mutation = {
  __typename?: 'Mutation';
  assignManagers?: Maybe<Array<Maybe<UserReference>>>;
  assignMembers?: Maybe<Array<Maybe<UserReference>>>;
  deleteContest?: Maybe<Scalars['String']['output']>;
  deleteOrganization?: Maybe<Scalars['String']['output']>;
  removeManager?: Maybe<Scalars['Boolean']['output']>;
  removeMember?: Maybe<Scalars['Boolean']['output']>;
  saveContest?: Maybe<Contest>;
  saveOrganization?: Maybe<Organization>;
  saveUser?: Maybe<User>;
};


export type MutationAssignManagersArgs = {
  assignments: Array<InputMaybe<AssignManagerInput>>;
};


export type MutationAssignMembersArgs = {
  assignments: Array<InputMaybe<AssignMemberInput>>;
};


export type MutationDeleteContestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveManagerArgs = {
  contestId: Scalars['ID']['input'];
  managerId: Scalars['ID']['input'];
};


export type MutationRemoveMemberArgs = {
  memberId: Scalars['ID']['input'];
  orgId: Scalars['ID']['input'];
};


export type MutationSaveContestArgs = {
  contest: SaveContestInput;
};


export type MutationSaveOrganizationArgs = {
  organization: OrganizationInput;
};


export type MutationSaveUserArgs = {
  user: SaveUserInput;
};

export type Organization = {
  __typename?: 'Organization';
  class?: Maybe<SchoolClass>;
  id?: Maybe<Scalars['ID']['output']>;
  name: Scalars['String']['output'];
  type: OrganizationType;
};

export type OrganizationInput = {
  class?: InputMaybe<SchoolClass>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  type: OrganizationType;
};

export enum OrganizationType {
  District = 'DISTRICT',
  National = 'NATIONAL',
  School = 'SCHOOL',
  State = 'STATE',
  Unknown = 'UNKNOWN'
}

export type OrganizationWithMembers = {
  __typename?: 'OrganizationWithMembers';
  members?: Maybe<Array<Maybe<UserReference>>>;
  organization: Organization;
};

export type Query = {
  __typename?: 'Query';
  getContest?: Maybe<Contest>;
  getOrgWithMembers?: Maybe<OrganizationWithMembers>;
  listContests?: Maybe<Array<Maybe<Contest>>>;
  listOrganizations?: Maybe<Array<Maybe<Organization>>>;
  listUsers?: Maybe<Array<Maybe<User>>>;
  listUsersByRole: Array<User>;
};


export type QueryGetContestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetOrgWithMembersArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryListContestsArgs = {
  classes?: InputMaybe<Array<InputMaybe<SchoolClass>>>;
  type?: InputMaybe<ContestType>;
};


export type QueryListUsersByRoleArgs = {
  role?: InputMaybe<UserRole>;
};

export type SaveContestInput = {
  endDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  level: ContestLevel;
  name: Scalars['String']['input'];
  performanceTime?: InputMaybe<Scalars['Int']['input']>;
  signUpEndDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  signUpStartDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  startDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  type: ContestType;
};

export type SaveUserInput = {
  email?: InputMaybe<Scalars['AWSEmail']['input']>;
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  role: UserRole;
  username: Scalars['String']['input'];
};

export enum SchoolClass {
  Unknown = 'UNKNOWN',
  '1A' = '_1A',
  '2A' = '_2A',
  '3A' = '_3A',
  '4A' = '_4A',
  '5A' = '_5A',
  '6A' = '_6A'
}

export type User = {
  __typename?: 'User';
  email: Scalars['AWSEmail']['output'];
  enabled: Scalars['Boolean']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  role: UserRole;
  username: Scalars['String']['output'];
};

export type UserReference = {
  __typename?: 'UserReference';
  email: Scalars['AWSEmail']['output'];
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  role?: Maybe<UserRole>;
  userId: Scalars['ID']['output'];
};

export enum UserRole {
  Director = 'DIRECTOR',
  Manager = 'MANAGER',
  TenantAdmin = 'TENANT_ADMIN',
  Unknown = 'UNKNOWN'
}

export type SaveUserMutationVariables = Exact<{
  user: SaveUserInput;
}>;


export type SaveUserMutation = { __typename?: 'Mutation', saveUser?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: any, role: UserRole, username: string, enabled: boolean } | null };

export type SaveOrganizationMutationVariables = Exact<{
  organization: OrganizationInput;
}>;


export type SaveOrganizationMutation = { __typename?: 'Mutation', saveOrganization?: { __typename?: 'Organization', id?: string | null, name: string, type: OrganizationType, class?: SchoolClass | null } | null };

export type DeleteOrganizationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteOrganizationMutation = { __typename?: 'Mutation', deleteOrganization?: string | null };

export type AssignMembersMutationVariables = Exact<{
  assignments: Array<InputMaybe<AssignMemberInput>> | InputMaybe<AssignMemberInput>;
}>;


export type AssignMembersMutation = { __typename?: 'Mutation', assignMembers?: Array<{ __typename?: 'UserReference', userId: string, firstName: string, lastName: string, email: any, role?: UserRole | null } | null> | null };

export type RemoveMemberMutationVariables = Exact<{
  orgId: Scalars['ID']['input'];
  memberId: Scalars['ID']['input'];
}>;


export type RemoveMemberMutation = { __typename?: 'Mutation', removeMember?: boolean | null };

export type SaveContestMutationVariables = Exact<{
  contest: SaveContestInput;
}>;


export type SaveContestMutation = { __typename?: 'Mutation', saveContest?: { __typename?: 'Contest', id: string, name: string, type: ContestType, level: ContestLevel, startDate?: any | null, endDate?: any | null, signUpStartDate?: any | null, signUpEndDate?: any | null, performanceTime?: number | null } | null };

export type DeleteContestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteContestMutation = { __typename?: 'Mutation', deleteContest?: string | null };

export type AssignManagersMutationVariables = Exact<{
  assignments: Array<InputMaybe<AssignManagerInput>> | InputMaybe<AssignManagerInput>;
}>;


export type AssignManagersMutation = { __typename?: 'Mutation', assignManagers?: Array<{ __typename?: 'UserReference', userId: string, firstName: string, lastName: string } | null> | null };

export type RemoveManagerMutationVariables = Exact<{
  contestId: Scalars['ID']['input'];
  managerId: Scalars['ID']['input'];
}>;


export type RemoveManagerMutation = { __typename?: 'Mutation', removeManager?: boolean | null };

export type ListUsersQueryVariables = Exact<{ [key: string]: never; }>;


export type ListUsersQuery = { __typename?: 'Query', listUsers?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, role: UserRole, email: any, username: string, enabled: boolean } | null> | null };

export type ListUsersByRoleQueryVariables = Exact<{
  role: UserRole;
}>;


export type ListUsersByRoleQuery = { __typename?: 'Query', listUsersByRole: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: any }> };

export type GetOrgWithMembersQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOrgWithMembersQuery = { __typename?: 'Query', getOrgWithMembers?: { __typename?: 'OrganizationWithMembers', organization: { __typename?: 'Organization', id?: string | null, name: string, type: OrganizationType, class?: SchoolClass | null }, members?: Array<{ __typename?: 'UserReference', userId: string, firstName: string, lastName: string, email: any, role?: UserRole | null } | null> | null } | null };

export type ListOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListOrganizationsQuery = { __typename?: 'Query', listOrganizations?: Array<{ __typename?: 'Organization', id?: string | null, name: string, type: OrganizationType } | null> | null };

export type ListContestsQueryVariables = Exact<{
  type?: InputMaybe<ContestType>;
  classes?: InputMaybe<Array<InputMaybe<SchoolClass>> | InputMaybe<SchoolClass>>;
}>;


export type ListContestsQuery = { __typename?: 'Query', listContests?: Array<{ __typename?: 'Contest', id: string, name: string, type: ContestType, startDate?: any | null, endDate?: any | null } | null> | null };

export type GetContestQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetContestQuery = { __typename?: 'Query', getContest?: { __typename?: 'Contest', id: string, name: string, type: ContestType, level: ContestLevel, startDate?: any | null, endDate?: any | null, signUpStartDate?: any | null, signUpEndDate?: any | null, managers?: Array<{ __typename?: 'UserReference', userId: string, firstName: string, lastName: string, email: any }> | null } | null };
