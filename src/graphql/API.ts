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

export type Contest = {
  __typename?: 'Contest';
  endDate?: Maybe<Scalars['AWSDateTime']['output']>;
  entries?: Maybe<Array<Maybe<Entry>>>;
  id: Scalars['ID']['output'];
  level?: Maybe<ContestLevel>;
  manager?: Maybe<User>;
  name: Scalars['String']['output'];
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

export type Entry = {
  __typename?: 'Entry';
  directorId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  musicSelections?: Maybe<Array<Maybe<MusicSelection>>>;
};

export type MusicSelection = {
  __typename?: 'MusicSelection';
  composerFirstName?: Maybe<Scalars['String']['output']>;
  composerLastName?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createOrganization?: Maybe<Organization>;
  deleteContest?: Maybe<Scalars['String']['output']>;
  deleteOrganization?: Maybe<Scalars['String']['output']>;
  saveContest?: Maybe<Contest>;
  saveUser?: Maybe<User>;
  updateOrganization?: Maybe<Organization>;
};


export type MutationCreateOrganizationArgs = {
  organization: OrganizationInput;
};


export type MutationDeleteContestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSaveContestArgs = {
  contest: SaveContestInput;
};


export type MutationSaveUserArgs = {
  user: SaveUserInput;
};


export type MutationUpdateOrganizationArgs = {
  organization: UpdateOrganizationInput;
};

export type Organization = {
  __typename?: 'Organization';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type?: Maybe<OrganizationType>;
};

export type OrganizationInput = {
  id: Scalars['ID']['input'];
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

export type OrganizationWithUsers = {
  __typename?: 'OrganizationWithUsers';
  organization: Organization;
  users?: Maybe<Array<Maybe<User>>>;
};

export type Query = {
  __typename?: 'Query';
  getContest?: Maybe<Contest>;
  getOrganizationWithUsers?: Maybe<OrganizationWithUsers>;
  listContests?: Maybe<Array<Maybe<Contest>>>;
  listOrganizations?: Maybe<Array<Maybe<Organization>>>;
};


export type QueryGetContestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetOrganizationWithUsersArgs = {
  id: Scalars['ID']['input'];
};

export type SaveContestInput = {
  endDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  level?: InputMaybe<ContestLevel>;
  name: Scalars['String']['input'];
  signUpEndDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  signUpStartDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  startDate?: InputMaybe<Scalars['AWSDateTime']['input']>;
  type: ContestType;
};

export type SaveUserInput = {
  email?: InputMaybe<Scalars['AWSEmail']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  organizationId: Scalars['ID']['input'];
  role?: InputMaybe<UserRole>;
  username: Scalars['String']['input'];
};

export type UpdateOrganizationInput = {
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  type: OrganizationType;
};

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

export enum UserRole {
  ContestManager = 'MANAGER',
  Director = 'DIRECTOR',
  TenantAdmin = 'TENANT_ADMIN',
  Unknown = 'UNKNOWN'
}

export type CreateOrganizationMutationVariables = Exact<{
  organization: OrganizationInput;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization?: { __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null } | null };

export type DeleteOrganizationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteOrganizationMutation = { __typename?: 'Mutation', deleteOrganization?: string | null };

export type UpdateOrganizationMutationVariables = Exact<{
  organization: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization?: { __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null } | null };

export type SaveUserMutationVariables = Exact<{
  user: SaveUserInput;
}>;


export type SaveUserMutation = { __typename?: 'Mutation', saveUser?: { __typename?: 'User', id: string, firstName: string, lastName: string, email: any, role: UserRole, username: string, enabled: boolean } | null };

export type SaveContestMutationVariables = Exact<{
  contest: SaveContestInput;
}>;


export type SaveContestMutation = { __typename?: 'Mutation', saveContest?: { __typename?: 'Contest', id: string, name: string, type: ContestType, level?: ContestLevel | null, startDate?: any | null, endDate?: any | null, signUpStartDate?: any | null, signUpEndDate?: any | null } | null };

export type DeleteContestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteContestMutation = { __typename?: 'Mutation', deleteContest?: string | null };

export type GetOrganizationWithUsersQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetOrganizationWithUsersQuery = { __typename?: 'Query', getOrganizationWithUsers?: { __typename?: 'OrganizationWithUsers', organization: { __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null }, users?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: any, role: UserRole, username: string, enabled: boolean } | null> | null } | null };

export type ListOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListOrganizationsQuery = { __typename?: 'Query', listOrganizations?: Array<{ __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null } | null> | null };

export type ListContestsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListContestsQuery = { __typename?: 'Query', listContests?: Array<{ __typename?: 'Contest', id: string, name: string, type: ContestType, startDate?: any | null, endDate?: any | null } | null> | null };

export type GetContestQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetContestQuery = { __typename?: 'Query', getContest?: { __typename?: 'Contest', id: string, name: string, type: ContestType, level?: ContestLevel | null, startDate?: any | null, endDate?: any | null, signUpStartDate?: any | null, signUpEndDate?: any | null } | null };
