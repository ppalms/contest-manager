import {
  DynamoDBClient,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { AssignManagerInput } from '../../../../../src/graphql/API';

export interface AssignManagersInput {
  tenantId: string;
  assignments: AssignManagerInput[];
}

export async function handler(
  input: AssignManagersInput,
  _: any
): Promise<any> {
  console.log(input);

  if (!process.env.ADMIN_TABLE_NAME) {
    throw new Error('ADMIN_TABLE_NAME not provided');
  }

  const { tenantId, assignments } = input;

  const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  const requestItems = {
    [process.env.ADMIN_TABLE_NAME]: assignments.map((assignment) => {
      return {
        PutRequest: {
          Item: marshall({
            PK: `TENANT#${tenantId}#CONTEST#${assignment.contestId}`,
            SK: `USER#${assignment.userId}`,
            entityType: 'USER',
            firstName: assignment.firstName,
            lastName: assignment.lastName,
            email: assignment.email,
            GSI1PK: `TENANT#${tenantId}#USER#${assignment.userId}`,
            GSI1SK: 'REFERENCE',
          }),
        },
      };
    }),
  };

  const putManagers = new BatchWriteItemCommand({ RequestItems: requestItems });

  try {
    await dbClient.send(putManagers);
    return input.assignments;
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }
}
