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

  // Clean up orgs
  const getOrgsCommand = new QueryCommand({
    TableName: process.env.ADMINISTRATION_TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: 'TENANT#001#ORGS' },
    },
  });

  try {
    const result = await dbClient.send(getOrgsCommand);
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

      await dbClient.send(new BatchWriteItemCommand(batchDeleteParams));
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Seed orgs
  const orgDetailSeedData = require('./orgDetailsSeedData.json');
  const orgItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: orgDetailSeedData.map(
      (item: any) => ({
        PutRequest: { Item: item },
      })
    ),
  };

  const writeOrgs = new BatchWriteItemCommand({
    RequestItems: orgItems as any,
  });

  try {
    await dbClient.send(writeOrgs);
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }

  return {
    message: 'Seed data added successfully',
  };
}
