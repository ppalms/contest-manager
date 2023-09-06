/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type OrganizationInput = {
  id: string,
  name: string,
  type: OrganizationType,
};

export enum OrganizationType {
  DISTRICT = "DISTRICT",
  NATIONAL = "NATIONAL",
  SCHOOL = "SCHOOL",
  STATE = "STATE",
  UNKNOWN = "UNKNOWN",
}


export type Organization = {
  __typename: "Organization",
  id: string,
  name: string,
  type?: OrganizationType | null,
};

export type UpdateOrganizationInput = {
  id: string,
  name: string,
  type: OrganizationType,
};

export type CreateOrganizationMutationVariables = {
  organization: OrganizationInput,
};

export type CreateOrganizationMutation = {
  createOrganization?:  {
    __typename: "Organization",
    id: string,
    name: string,
    type?: OrganizationType | null,
  } | null,
};

export type DeleteOrganizationMutationVariables = {
  id: string,
};

export type DeleteOrganizationMutation = {
  deleteOrganization?: string | null,
};

export type UpdateOrganizationMutationVariables = {
  organization: UpdateOrganizationInput,
};

export type UpdateOrganizationMutation = {
  updateOrganization?:  {
    __typename: "Organization",
    id: string,
    name: string,
    type?: OrganizationType | null,
  } | null,
};

export type GetOrganizationByIdQueryVariables = {
  id: string,
};

export type GetOrganizationByIdQuery = {
  getOrganizationById?:  {
    __typename: "Organization",
    id: string,
    name: string,
    type?: OrganizationType | null,
  } | null,
};

export type ListOrganizationsQuery = {
  listOrganizations?:  Array< {
    __typename: "Organization",
    id: string,
    name: string,
    type?: OrganizationType | null,
  } | null > | null,
};
