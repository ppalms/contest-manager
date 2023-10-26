import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminCreateUserCommandOutput,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminUpdateUserAttributesCommand,
  AttributeType,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { SaveUserInput } from '../../../../src/graphql/API';

export interface SaveUserRequest {
  tenantId: string;
  userPoolId: string;
  user: SaveUserInput;
}

export async function handler(event: SaveUserRequest, _: any): Promise<any> {
  const { id, username, firstName, lastName, email, role } = event.user;

  // Username is always required, but other fields may not be provided
  if (!username || username.length === 0) {
    throw new Error('Username is required');
  }

  const userAttributes = [{ Name: 'custom:tenantId', Value: event.tenantId }];

  if (firstName && firstName.length > 0) {
    userAttributes.push({ Name: 'given_name', Value: firstName });
  }

  if (lastName && lastName.length > 0) {
    userAttributes.push({ Name: 'family_name', Value: lastName });
  }

  if (email && email.length > 0) {
    userAttributes.push({ Name: 'email', Value: email });
  }

  if (role && role.length > 0) {
    userAttributes.push({ Name: 'custom:userRole', Value: role });
  }

  if (userAttributes.length === 0) {
    return event.user;
  }

  const idpClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });

  if (!id || id.length === 0) {
    await createUser(event, userAttributes, idpClient);
  } else {
    await updateUser(event, userAttributes, idpClient);
  }

  const result = await idpClient.send(
    new AdminGetUserCommand({
      UserPoolId: event.userPoolId,
      Username: username,
    })
  );

  const user = {
    id: getUserAttribute(result, 'sub'),
    firstName: getUserAttribute(result, 'given_name'),
    lastName: getUserAttribute(result, 'family_name'),
    email: getUserAttribute(result, 'email'),
    role: getUserAttribute(result, 'custom:userRole'),
    username: result.Username,
    enabled: result.Enabled,
  };

  return user;
}

const getUserAttribute = (
  result: AdminGetUserCommandOutput,
  attrName: string
) => {
  try {
    return result.UserAttributes!.find((attr) => attr.Name === attrName)!
      .Value!;
  } catch (error) {
    console.error(`Error getting attribute ${attrName} for user`, result);
    throw error;
  }
};

const createUser = async (
  event: SaveUserRequest,
  userAttributes: AttributeType[],
  idpClient: CognitoIdentityProviderClient
) => {
  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: event.userPoolId,
    Username: event.user.username,
    UserAttributes: userAttributes,
  });

  const result: AdminCreateUserCommandOutput = await idpClient.send(
    createUserCommand
  );
  if (!result.User) {
    throw new Error('User not created');
  }

  event.user.id = result.User!.Attributes!.find(
    (attr) => attr.Name === 'sub'
  )!.Value!;

  const addUserToGroupCommand = new AdminAddUserToGroupCommand({
    Username: event.user.username,
    GroupName: event.tenantId,
    UserPoolId: event.userPoolId,
  });

  await idpClient.send(addUserToGroupCommand);
};

const updateUser = async (
  event: SaveUserRequest,
  userAttributes: AttributeType[],
  idpClient: CognitoIdentityProviderClient
) => {
  const updateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
    UserPoolId: event.userPoolId,
    Username: event.user.username,
    UserAttributes: userAttributes.filter((x) => x.Name !== 'custom:tenantId'),
  });

  await idpClient.send(updateUserAttributesCommand);
};