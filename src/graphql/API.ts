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

export type Mutation = {
  __typename?: 'Mutation';
  createOrganization?: Maybe<Organization>;
  deleteOrganization?: Maybe<Scalars['String']['output']>;
  updateOrganization?: Maybe<Organization>;
};


export type MutationCreateOrganizationArgs = {
  organization: OrganizationInput;
};


export type MutationDeleteOrganizationArgs = {
  id: Scalars['String']['input'];
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
  getOrganizationWithUsers?: Maybe<OrganizationWithUsers>;
  listOrganizations?: Maybe<Array<Maybe<Organization>>>;
};


export type QueryGetOrganizationWithUsersArgs = {
  id: Scalars['String']['input'];
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
  role: Scalars['String']['output'];
};

export type CreateOrganizationMutationVariables = Exact<{
  organization: OrganizationInput;
}>;


export type CreateOrganizationMutation = { __typename?: 'Mutation', createOrganization?: { __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null } | null };

export type DeleteOrganizationMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteOrganizationMutation = { __typename?: 'Mutation', deleteOrganization?: string | null };

export type UpdateOrganizationMutationVariables = Exact<{
  organization: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization?: { __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null } | null };

export type GetOrganizationWithUsersQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetOrganizationWithUsersQuery = { __typename?: 'Query', getOrganizationWithUsers?: { __typename?: 'OrganizationWithUsers', organization: { __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null }, users?: Array<{ __typename?: 'User', id: string, firstName: string, lastName: string, email: any, role: string } | null> | null } | null };

export type ListOrganizationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListOrganizationsQuery = { __typename?: 'Query', listOrganizations?: Array<{ __typename?: 'Organization', id: string, name: string, type?: OrganizationType | null } | null> | null };
