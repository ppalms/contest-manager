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
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import { SaveUserInput } from '../../../src/graphql/API';

export interface SaveUserRequest {
  tenantId: string;
  user: SaveUserInput;
}

export async function handler(event: SaveUserRequest, _: any): Promise<any> {
  const { id, username, firstName, lastName, email, role, organizationId } =
    event.user;

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

  if (role?.length === 0) {
    throw new Error('Role is required');
  } else if (role) {
    userAttributes.push({ Name: 'custom:userRole', Value: role });
  }

  userAttributes.push({ Name: 'custom:tenantId', Value: event.tenantId });

  if (userAttributes.length === 0) {
    return event.user;
  }

  // TODO add pooled tenant to tenant table
  const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  // const tenantDetails = await dbClient.send(
  //   new GetItemCommand({
  //     TableName: process.env.TENANT_TABLE,
  //     Key: {
  //       tenantId: { S: event.tenantId },
  //     },
  //   })
  // );
  // const userPoolId = tenantDetails.Item!.userPoolId.S!;

  const ssmClient = new SSMClient({ region: process.env.AWS_REGION });

  const ssmResult = await ssmClient.send(
    new GetParametersCommand({
      Names: ['/shared/user-pool-id'],
    })
  );
  const userPoolId = ssmResult.Parameters![0].Value!;

  const idpClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
  });

  if (!id || id.length === 0) {
    await createUser(event, userAttributes, userPoolId, idpClient);
  } else {
    await updateUser(event, userAttributes, userPoolId, idpClient);
  }

  await dbClient.send(
    new PutItemCommand({
      TableName: process.env.ORGUSERS_TABLE_NAME,
      Item: {
        organizationId: { S: organizationId },
        userId: { S: event.user.id! },
      },
    })
  );

  const result = await idpClient.send(
    new AdminGetUserCommand({
      UserPoolId: userPoolId,
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
  userPoolId: string,
  idpClient: CognitoIdentityProviderClient
) => {
  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
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
    UserPoolId: userPoolId,
  });

  await idpClient.send(addUserToGroupCommand);
};

const updateUser = async (
  event: SaveUserRequest,
  userAttributes: AttributeType[],
  userPoolId: string,
  idpClient: CognitoIdentityProviderClient
) => {
  const updateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
    UserPoolId: userPoolId,
    Username: event.user.username,
    UserAttributes: userAttributes.filter((x) => x.Name !== 'custom:tenantId'),
  });

  await idpClient.send(updateUserAttributesCommand);
};
