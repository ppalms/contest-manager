// import { Context } from '@aws-appsync/utils';
// import {
//   CognitoIdentityProviderClient,
//   ListUsersInGroupCommand,
//   ResourceNotFoundException,
//   UserType,
// } from '@aws-sdk/client-cognito-identity-provider';
// import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
// import { unmarshall } from '@aws-sdk/util-dynamodb';
// import { QueryListUsersByTenantArgs, Tenant, User } from '../../src/graphql/API';

// export async function handler(
//   event: Context<QueryListUsersByTenantArgs>,
//   _context: any
// ): Promise<User[]> {
//   // TODO create logging layer
//   console.log(event);

//   if (!event.arguments.tenantId) {
//     throw new Error('tenantId is required');
//   }

//   const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

//   const getTenantCommand = new GetItemCommand({
//     TableName: process.env.TENANT_TABLE_NAME,
//     Key: {
//       tenantId: { S: event.arguments.tenantId },
//     },
//   });

//   const result = await dbClient.send(getTenantCommand);
//   if (!result.Item) {
//     throw new Error(`Tenant ${event.arguments.tenantId} not found`);
//   }

//   const tenant = unmarshall(result.Item) as Tenant;
//   if (!tenant) {
//     throw new Error(`Error casting ${result.Item} to Tenant`);
//   }

//   if (!tenant.userPoolId) {
//     throw new Error(`Failed to find user pool for Tenant ${tenant.tenantId}`);
//   }

//   try {
//     // TODO add support for siloed user pools instead of tenant groups
//     const listUsersCommand = new ListUsersInGroupCommand({
//       UserPoolId: tenant.userPoolId,
//       GroupName: event.arguments.tenantId,
//     });

//     const idpClient = new CognitoIdentityProviderClient({
//       region: process.env.AWS_REGION,
//     });
//     const response = await idpClient.send(listUsersCommand);
//     const getUserAttribute = (user: UserType, attrName: string) => {
//       return user.Attributes!.find((attr) => attr.Name === attrName)!.Value!;
//     };

//     const users =
//       response.Users?.map((user) => {
//         return {
//           userId: getUserAttribute(user, 'sub'),
//           firstName: getUserAttribute(user, 'given_name'),
//           lastName: getUserAttribute(user, 'family_name'),
//           email: getUserAttribute(user, 'email'),
//           tenantId: getUserAttribute(user, 'custom:tenantId'),
//         };
//       }) || [];

//     return users;
//   } catch (error) {
//     if (error instanceof ResourceNotFoundException) {
//       return []; // no user group for this tenant, return empty list
//     }

//     console.error('Error getting users', error);
//     throw error;
//   }
// }
