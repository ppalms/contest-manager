import {
  BatchWriteItemCommand,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

export async function handler(_: any, __: any): Promise<any> {
  if (!process.env.ADMINISTRATION_TABLE_NAME) {
    throw new Error('ADMINISTRATION_TABLE_NAME not provided');
  }

  const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

  // Clean up users
  const getUsersCommand = new QueryCommand({
    TableName: process.env.ADMINISTRATION_TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: 'TENANT#001#USERS' },
    },
  });

  try {
    const result = await dbClient.send(getUsersCommand);
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
          [process.env.ADMINISTRATION_TABLE_NAME]: deleteRequests,
        },
      };

      console.log(JSON.stringify(batchDeleteParams));

      await dbClient.send(new BatchWriteItemCommand(batchDeleteParams));
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Seed users
  const userDetailSeedData = require('./userDetailsSeedData.json');
  const userItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: userDetailSeedData.map(
      (item: any) => ({
        PutRequest: { Item: item },
      })
    ),
  };

  const writeUsers = new BatchWriteItemCommand({
    RequestItems: userItems as any,
  });

  console.log(JSON.stringify(writeUsers));

  try {
    await dbClient.send(writeUsers);
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }

  return {
    message: 'Seed data added successfully',
  };
}
