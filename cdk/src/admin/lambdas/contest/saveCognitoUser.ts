import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminCreateUserCommandOutput,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  UserNotFoundException,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { SaveUserInput } from '../../../../../src/graphql/API';

/*
example event:
2023-10-27T21:40:28.693Z	29d881d0-6db7-485a-b6b0-2d5a2e3491cc	INFO	{
  version: '0',
  id: '05287194-570f-9ccb-97e6-2ff4c498a150',
  'detail-type': 'User Updated',
  source: 'contest-manager.admin.users',
  account: '275316640779',
  time: '2023-10-27T21:40:28Z',
  region: 'us-east-1',
  resources: [],
  detail: {
    tenantId: '001',
    userPoolId: 'us-east-1_xxxxxxxxx',
    user: {
      id: 'fcaf98cc-d1e9-46b6-a2c0-e7fc3696bd86',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jdoe@school.org',
      role: 'MANAGER',
      username: 'jdoe@school.org',
      enabled: true
    }
  }
}
 */
export interface UserSavedEvent {
  detail: {
    tenantId: string;
    userPoolId: string;
    user: SaveUserInput;
  };
  detailType: string;
}

export async function handler(event: UserSavedEvent, _: any): Promise<any> {
  console.log(event);

  const tenantId = event.detail.tenantId;
  if (!tenantId || tenantId.length === 0) {
    throw new Error('tenantId is required');
  }

  const userAttributes = [{ Name: 'custom:tenantId', Value: tenantId }];

  const { username, firstName, lastName, email, role } = event.detail.user;

  // Username is always required, but other fields may not be provided
  if (!username || username.length === 0) {
    throw new Error('username is required');
  }

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

  if (userAttributes.length === 1) {
    // ¯\_(ツ)_/¯
    return null;
  }

  const idpClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });

  try {
    console.log('Saving user');
    console.log(JSON.stringify(userAttributes));

    let savedUser;
    if (event.detailType === 'User Created') {
      savedUser = await createUser();
    } else {
      savedUser = await updateUser();
    }

    if (!savedUser) {
      throw new Error('Failed to save user');
    }

    return parseResponse(savedUser);
  } catch (error) {
    console.error(error);
    if (error instanceof UserNotFoundException) {
      const savedUser = await createUser();
      if (savedUser) {
        return parseResponse(savedUser);
      }
    } else {
      throw error;
    }
  }

  // Local functions
  async function createUser(): Promise<UserType | undefined> {
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: event.detail.userPoolId,
      Username: event.detail.user.username,
      UserAttributes: userAttributes,
    });

    const result: AdminCreateUserCommandOutput = await idpClient.send(
      createUserCommand
    );
    if (!result.User) {
      throw new Error('User creation failed');
    }

    const addUserToGroupCommand = new AdminAddUserToGroupCommand({
      Username: event.detail.user.username,
      GroupName: event.detail.tenantId,
      UserPoolId: event.detail.userPoolId,
    });

    await idpClient.send(addUserToGroupCommand);

    return result.User;
  }

  async function updateUser() {
    const updateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: event.detail.userPoolId,
      Username: event.detail.user.username,
      UserAttributes: userAttributes.filter(
        (attr) => attr.Name !== 'custom:tenantId'
      ),
    });

    await idpClient.send(updateUserAttributesCommand);
  }

  function parseResponse(savedUser: UserType) {
    return {
      id: event.detail.user.id,
      firstName: getUserAttribute(savedUser, 'given_name'),
      lastName: getUserAttribute(savedUser, 'family_name'),
      email: getUserAttribute(savedUser, 'email'),
      role: getUserAttribute(savedUser, 'custom:userRole'),
      username: savedUser.Username,
      enabled: savedUser.Enabled,
    };
  }
}

const getUserAttribute = (user: UserType, attrName: string) => {
  try {
    return user.Attributes!.find((attr) => attr.Name === attrName)!.Value!;
  } catch (error) {
    console.error(`Error getting attribute ${attrName} for user`, user);
    throw error;
  }
};
