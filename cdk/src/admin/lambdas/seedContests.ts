import {
  BatchWriteItemCommand,
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';

const seedTenantId = process.env.TEST_TENANT_ID;
const contestIds = [
  '646b640c-8bb3-47e4-9925-b09be9cb4698',
  '6c05f489-c714-4938-bb25-a1c179f81611',
  '266a60c0-b6d9-484f-87ea-ac8343b53981',
  '13e5eb3d-e73c-4786-8e5b-b3041f1bf4bf',
];

export async function handler(_: any, __: any): Promise<any> {
  if (!process.env.ADMINISTRATION_TABLE_NAME) {
    throw new Error('ADMINISTRATION_TABLE_NAME not provided');
  }

  const dbClient = new DynamoDBClient();

  // Clean up users
  const getUsersCommand = new QueryCommand({
    TableName: process.env.ADMINISTRATION_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `TENANT#${seedTenantId}` },
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

      await dbClient.send(new BatchWriteItemCommand(batchDeleteParams));
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Clean up contests
  for (const contestPK of contestIds) {
    const getContestsCommand = new QueryCommand({
      TableName: process.env.ADMINISTRATION_TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `TENANT#${seedTenantId}#CONTEST#${contestPK}` },
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
            [process.env.ADMINISTRATION_TABLE_NAME]: deleteRequests,
          },
        };

        await dbClient.send(new BatchWriteItemCommand(batchDeleteParams));
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Seed contests
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

  // Seed managers
  const managerItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: managerSeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
  };

  const writeManagers = new BatchWriteItemCommand({
    RequestItems: managerItems as any,
  });

  try {
    await dbClient.send(writeManagers);
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
    PK: {
      S: `TENANT#${seedTenantId}#CONTEST#646b640c-8bb3-47e4-9925-b09be9cb4698`,
    },
    SK: { S: 'DETAILS' },
    entityType: { S: 'CONTEST' },
    name: { S: 'Sand Springs' },
    type: { S: 'ORCHESTRA' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-04-01T12:00:00.000Z' },
    endDate: { S: '2023-04-01T20:00:00.000Z' },
    signUpStartDate: { S: '2023-03-01T05:00:00.000Z' },
    signUpEndDate: { S: '2023-03-25T05:00:00.000Z' },
    GSI1PK: { S: `TENANT#${seedTenantId}#CONTESTS` },
    GSI1SK: { S: 'ORCHESTRA' },
  },
  {
    PK: {
      S: `TENANT#${seedTenantId}#CONTEST#6c05f489-c714-4938-bb25-a1c179f81611`,
    },
    SK: { S: 'DETAILS' },
    entityType: { S: 'CONTEST' },
    name: { S: 'Mustang Invitational Marching Festival' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-10-07T12:00:00.000Z' },
    endDate: { S: '2023-10-07T20:00:00.000Z' },
    signUpStartDate: { S: '2023-03-01T05:00:00.000Z' },
    signUpEndDate: { S: '2023-03-25T22:00:00.000Z' },
    GSI1PK: { S: `TENANT#${seedTenantId}#CONTESTS` },
    GSI1SK: { S: 'MARCHING_BAND' },
  },
  {
    PK: {
      S: `TENANT#${seedTenantId}#CONTEST#266a60c0-b6d9-484f-87ea-ac8343b53981`,
    },
    SK: { S: 'DETAILS' },
    entityType: { S: 'CONTEST' },
    name: { S: 'OBA Class 4A Marching Championships' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'STATE' },
    startDate: { S: '2023-10-14T12:00:00.000Z' },
    endDate: { S: '2023-10-14T20:00:00.000Z' },
    signUpStartDate: { S: '2023-08-01T05:00:00.000Z' },
    signUpEndDate: { S: '2023-09-25T05:00:00.000Z' },
    GSI1PK: { S: `TENANT#${seedTenantId}#CONTESTS` },
    GSI1SK: { S: 'MARCHING_BAND' },
  },
  {
    PK: {
      S: `TENANT#${seedTenantId}#CONTEST#13e5eb3d-e73c-4786-8e5b-b3041f1bf4bf`,
    },
    SK: { S: 'DETAILS' },
    entityType: { S: 'CONTEST' },
    name: { S: 'Blue & Grey Marching Classic' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-10-07T12:00:00.000Z' },
    endDate: { S: '2023-10-07T20:30:00.000Z' },
    signUpStartDate: { S: '2023-09-04T05:00:00.000Z' },
    signUpEndDate: { S: '2023-09-30T05:00:00.000Z' },
    GSI1PK: { S: `TENANT#${seedTenantId}#CONTESTS` },
    GSI1SK: { S: 'MARCHING_BAND' },
  },
];

const managerSeedData = [
  // Patrick Palmer
  {
    PK: { S: `TENANT#${seedTenantId}` },
    SK: { S: 'USER#94680468-80a1-704e-f22c-579f27997d4a' },
    firstName: { S: 'Patrick' },
    lastName: { S: 'Palmer' },
    email: { S: 'pjittles+sandboxtest@gmail.com' },
    userRole: { S: 'MANAGER' },
    username: { S: 'pjittles+sandboxadmin@gmail.com' },
    GSI1PK: { S: `TENANT#${seedTenantId}#USERS` },
    GSI1SK: { S: 'MANAGER' },
  },
  {
    PK: {
      S: `TENANT#${seedTenantId}#CONTEST#646b640c-8bb3-47e4-9925-b09be9cb4698`,
    },
    SK: { S: 'MANAGER#94680468-80a1-704e-f22c-579f27997d4a' },
    entityType: { S: 'MANAGER' },
    firstName: { S: 'Patrick' },
    lastName: { S: 'Palmer' },
    email: { S: 'pjittles+sandboxtest@gmail.com' },
    GSI1PK: { S: 'USER#94680468-80a1-704e-f22c-579f27997d4a' },
    GSI1SK: { S: 'REFERENCES' },
  },
  // Turd Ferguson
  {
    PK: { S: `TENANT#${seedTenantId}` },
    SK: { S: 'USER#24a83408-3021-70b2-b58a-af712d067885' },
    firstName: { S: 'Testy' },
    lastName: { S: 'McTesterson' },
    email: { S: 'pjittles+testysandbox@gmail.com' },
    userRole: { S: 'MANAGER' },
    username: { S: 'pjittles+testysandbox@gmail.com' },
    GSI1PK: { S: `TENANT#${seedTenantId}#USERS` },
    GSI1SK: { S: 'MANAGER' },
  },
  {
    PK: {
      S: `TENANT#${seedTenantId}#CONTEST#13e5eb3d-e73c-4786-8e5b-b3041f1bf4bf`,
    },
    SK: { S: 'MANAGER#24a83408-3021-70b2-b58a-af712d067885' },
    entityType: { S: 'MANAGER' },
    firstName: { S: 'Testy' },
    lastName: { S: 'McTesterson' },
    email: { S: 'pjittles+testysandbox@gmail.com' },
    GSI1PK: { S: 'USER#24a83408-3021-70b2-b58a-af712d067885' },
    GSI1SK: { S: 'REFERENCES' },
  },
];
