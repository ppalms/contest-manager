import {
  BatchWriteItemCommand,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

export async function handler(_: any, __: any): Promise<any> {
  if (!process.env.ADMIN_TABLE_NAME) {
    throw new Error('ADMIN_TABLE_NAME not provided');
  }

  const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

  // Clean up contests
  const getContestsCommand = new QueryCommand({
    TableName: process.env.ADMIN_TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: 'TENANT#001#CONTESTS' },
    },
  });

  try {
    const result = await dbClient.send(getContestsCommand);
    const items = result.Items;
    if (items && items.length > 0) {
      const deleteRequests = items.map((item) => {
        return {
          DeleteRequest: {
            Key: {
              PK: item.PK,
              SK: item.SK,
            },
          },
        };
      });

      const batchDeleteParams = {
        RequestItems: {
          [process.env.ADMIN_TABLE_NAME]: deleteRequests,
        },
      };

      await dbClient.send(new BatchWriteItemCommand(batchDeleteParams));
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Seed contests
  const contestSeedData = require('./contestSeedData.json');
  const contestItems = {
    [process.env.ADMIN_TABLE_NAME]: contestSeedData.map(
      (item: any) => ({
        PutRequest: { Item: item },
      })
    ),
  };

  const writeContests = new BatchWriteItemCommand({
    RequestItems: contestItems as any,
  });

  try {
    await dbClient.send(writeContests);
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }

  return {
    message: 'Seed data added successfully',
  };
}
