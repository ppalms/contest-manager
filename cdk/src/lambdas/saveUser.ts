import {
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { SaveUserInput } from '../../../src/graphql/API';

export interface SaveUserRequest {
  userPoolId: string;
  user: SaveUserInput;
}

export async function handler(event: SaveUserRequest, _: any): Promise<any> {
  const { username, firstName, lastName, email } = event.user;

  const userAttributes = [];

  if (username?.length === 0) {
    throw new Error('Username is required');
  }

  if (firstName?.length === 0) {
    throw new Error('First name is required');
  } else if (firstName) {
    userAttributes.push({ Name: 'given_name', Value: firstName });
  }

  if (lastName?.length === 0) {
    throw new Error('Last name is required');
  } else if (lastName) {
    userAttributes.push({ Name: 'family_name', Value: lastName });
  }

  if (email?.length === 0) {
    throw new Error('Email is required');
  } else if (email) {
    userAttributes.push({ Name: 'email', Value: email });
  }

  const updateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
    UserPoolId: event.userPoolId,
    Username: username,
    UserAttributes: userAttributes,
  });

  const idpClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });

  await idpClient.send(updateUserAttributesCommand);

  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: event.userPoolId,
    Username: username,
  });

  const response = await idpClient.send(getUserCommand);

  const getUserAttribute = (
    response: AdminGetUserCommandOutput,
    attrName: string
  ) => {
    return response.UserAttributes!.find((attr) => attr.Name === attrName)!
      .Value!;
  };

  const user = {
    id: getUserAttribute(response, 'sub'),
    firstName: getUserAttribute(response, 'given_name'),
    lastName: getUserAttribute(response, 'family_name'),
    email: getUserAttribute(response, 'email'),
    role: getUserAttribute(response, 'custom:userRole'),
    enabled: response.Enabled,
  };

  return user;
}
