import {
  BatchWriteItemCommand,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

// TODO env var
const seedTenantId = 'ec79c2bd-eeae-4891-a05e-22222a351273';

export async function handler(_: any, __: any): Promise<any> {
  if (!process.env.ADMINISTRATION_TABLE_NAME) {
    throw new Error('ADMINISTRATION_TABLE_NAME not provided');
  }

  const dbClient = new DynamoDBClient();

  // Clean the table before seeding
  const getSeedContestsCommand = new QueryCommand({
    TableName: process.env.ADMINISTRATION_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `TENANT#${seedTenantId}` },
    },
  });

  try {
    const result = await dbClient.send(getSeedContestsCommand);
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

  const contestItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: contestSeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
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

const contestSeedData = [
  {
    PK: { S: `TENANT#${seedTenantId}` },
    SK: { S: 'CONTEST#646b640c-8bb3-47e4-9925-b09be9cb4698' },
    entityType: { S: 'CONTEST' },
    name: { S: 'Sand Springs' },
    type: { S: 'ORCHESTRA' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-04-01T12:00:00.000Z' },
    endDate: { S: '2023-04-01T20:00:00.000Z' },
    signUpStartDate: { S: '2023-03-01T05:00:00.000Z' },
    signUpEndDate: { S: '2023-03-25T05:00:00.000Z' },
  },
  {
    PK: { S: `TENANT#${seedTenantId}` },
    SK: { S: 'CONTEST#6c05f489-c714-4938-bb25-a1c179f81611' },
    entityType: { S: 'CONTEST' },
    name: { S: 'Mustang Invitational Marching Festival' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-10-07T12:00:00.000Z' },
    endDate: { S: '2023-10-07T20:00:00.000Z' },
    signUpStartDate: { S: '2023-03-01T05:00:00.000Z' },
    signUpEndDate: { S: '2023-03-25T22:00:00.000Z' },
  },
  {
    PK: { S: `TENANT#${seedTenantId}` },
    SK: { S: 'CONTEST#266a60c0-b6d9-484f-87ea-ac8343b53981' },
    entityType: { S: 'CONTEST' },
    name: { S: 'OBA Class 4A Marching Championships' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'STATE' },
    startDate: { S: '2023-10-14T12:00:00.000Z' },
    endDate: { S: '2023-10-14T20:00:00.000Z' },
    signUpStartDate: { S: '2023-08-01T05:00:00.000Z' },
    signUpEndDate: { S: '2023-09-25T05:00:00.000Z' },
  },
  {
    PK: { S: `TENANT#${seedTenantId}` },
    SK: { S: 'CONTEST#266a60c0-b6d9-484f-87ea-ac8343b53981' },
    entityType: { S: 'CONTEST' },
    name: { S: 'Blue & Grey Marching Classic' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-10-07T12:00:00.000Z' },
    endDate: { S: '2023-10-07T20:30:00.000Z' },
    signUpStartDate: { S: '2023-09-04T05:00:00.000Z' },
    signUpEndDate: { S: '2023-09-30T05:00:00.000Z' },
  },
];

// TODO refactor away the Organization and OrgUserMapping tables and store ORGANIZATION and USER data here
