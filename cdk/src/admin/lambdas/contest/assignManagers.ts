import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { Manager } from '../../../../../src/graphql/API';

export interface AssignManagersInput {
  tenantId: string;
  contestId: string;
  managers: Manager[];
}

export async function handler(
  input: AssignManagersInput,
  _: any
): Promise<any> {
  console.log(input);

  if (!process.env.ADMIN_TABLE_NAME) {
    throw new Error('ADMIN_TABLE_NAME not provided');
  }

  const { tenantId, contestId, managers } = input;

  const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  const requestItems = {
    [process.env.ADMIN_TABLE_NAME]: managers.map((manager) => {
      return {
        PutRequest: {
          Item: marshall({
            PK: `TENANT#${tenantId}#CONTEST#${contestId}`,
            SK: `USER#${manager.id}`,
            entityType: 'USER',
            firstName: manager.firstName,
            lastName: manager.lastName,
            email: manager.email,
            GSI1PK: `TENANT#${tenantId}#USER#${manager.id}`,
            GSI1SK: 'REFERENCE',
          }),
        },
      };
    }),
  };

  const putManagers = new BatchWriteItemCommand({ RequestItems: requestItems });

  try {
    await dbClient.send(putManagers);
    return input.managers;
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }
}
