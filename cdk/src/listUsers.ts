import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  ResourceNotFoundException,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';

export interface ListUsersRequest {
  userPoolId: string;
  tenantId: string;
}

export async function handler(event: ListUsersRequest, _: any): Promise<any[]> {
  const { userPoolId, tenantId } = event;

  try {
    const listUsersCommand = new ListUsersInGroupCommand({
      UserPoolId: userPoolId,
      GroupName: tenantId,
    });

    const idpClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
    });
    const response = await idpClient.send(listUsersCommand);
    const getUserAttribute = (user: UserType, attrName: string) => {
      try {
        return user.Attributes!.find((attr) => attr.Name === attrName)!.Value!;
      } catch (e) {
        console.error(`Error getting attribute ${attrName} for user`, user);
        throw e;
      }
    };

    const users =
      response.Users?.map((user) => {
        return {
          id: getUserAttribute(user, 'sub'),
          firstName: getUserAttribute(user, 'given_name'),
          lastName: getUserAttribute(user, 'family_name'),
          email: getUserAttribute(user, 'email'),
          role: getUserAttribute(user, 'custom:userRole'),
          username: user.Username,
          enabled: user.Enabled,
        };
      }) || [];

    return users;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return []; // no user group for this tenant, return empty list
    }

    throw error;
  }
}
