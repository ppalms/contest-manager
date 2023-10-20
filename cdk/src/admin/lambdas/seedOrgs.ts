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

  // Clean up orgs, directors, and org hierarchy
  const getOrgHierarchyCommand = new QueryCommand({
    TableName: process.env.ADMINISTRATION_TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORGS' },
    },
  });

  try {
    const result = await dbClient.send(getOrgHierarchyCommand);
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

      console.log(batchDeleteParams);

      await dbClient.send(new BatchWriteItemCommand(batchDeleteParams));
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  // Seed org hierarchy
  const orgHierarchyItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: orgHierarchySeedData.map(
      (item) => ({
        PutRequest: { Item: item },
      })
    ),
  };

  const writeOrgHierarchyItems = new BatchWriteItemCommand({
    RequestItems: orgHierarchyItems as any,
  });

  try {
    await dbClient.send(writeOrgHierarchyItems);
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }

  // Seed orgs
  const orgItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: orgDetailSeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
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

  // Seed directors
  const directorItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: directorSeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
  };

  const writeDirectors = new BatchWriteItemCommand({
    RequestItems: directorItems as any,
  });

  try {
    await dbClient.send(writeDirectors);
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }

  // Seed users
  const userItems = {
    [process.env.ADMINISTRATION_TABLE_NAME]: userSeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
  };

  const writeUsers = new BatchWriteItemCommand({
    RequestItems: userItems as any,
  });

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

const orgHierarchySeedData = [
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273',
    },
    SK: {
      S: 'ORG#9a0c1fa1-9304-408e-8aec-02082ccac5c3',
    },
    name: { S: 'OSSAA' },
    type: { S: 'STATE' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORGS' },
  },
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273',
    },
    SK: {
      S: 'ORG#9a0c1fa1-9304-408e-8aec-02082ccac5c3#386c0030-3d9b-4933-a914-aa14b79a411a',
    },
    name: { S: 'Edmond Public Schools' },
    type: { S: 'DISTRICT' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORGS' },
  },
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273',
    },
    SK: {
      S: 'ORG#9a0c1fa1-9304-408e-8aec-02082ccac5c3#386c0030-3d9b-4933-a914-aa14b79a411a#f4600e46-83ef-4c18-b279-f8f9012ab4db',
    },
    name: { S: 'Edmond Santa Fe High School' },
    type: { S: 'SCHOOL' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORGS' },
  },
];

const orgDetailSeedData = [
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORG#9a0c1fa1-9304-408e-8aec-02082ccac5c3',
    },
    SK: { S: 'DETAILS' },
    entityType: { S: 'ORGANIZATION' },
    name: { S: 'OSSAA' },
    type: { S: 'STATE' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORGS' },
    GSI1SK: { S: 'STATE' },
  },
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORG#386c0030-3d9b-4933-a914-aa14b79a411a',
    },
    SK: { S: 'DETAILS' },
    entityType: { S: 'ORGANIZATION' },
    name: { S: 'Edmond Public Schools' },
    type: { S: 'DISTRICT' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORGS' },
    GSI1SK: { S: 'DISTRICT' },
  },
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORG#f4600e46-83ef-4c18-b279-f8f9012ab4db',
    },
    SK: { S: 'DETAILS' },
    entityType: { S: 'ORGANIZATION' },
    name: { S: 'Edmond Santa Fe High School' },
    type: { S: 'SCHOOL' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORGS' },
    GSI1SK: { S: 'SCHOOL' },
  },
];

const directorSeedData = [
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORG#f4600e46-83ef-4c18-b279-f8f9012ab4db',
    },
    SK: {
      S: 'DIRECTOR#94680468-80a1-704e-f22c-579f27997d4a',
    },
    entityType: { S: 'USER' },
    firstName: { S: 'Patrick' },
    lastName: { S: 'Palmer' },
    email: { S: 'pjittles+sandboxadmin@gmail.com' },
    GSI1PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#USER#94680468-80a1-704e-f22c-579f27997d4a',
    },
  },
  {
    PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#ORG#f4600e46-83ef-4c18-b279-f8f9012ab4db',
    },
    SK: {
      S: 'DIRECTOR#24a83408-3021-70b2-b58a-af712d067885',
    },
    entityType: { S: 'USER' },
    firstName: { S: 'Testy' },
    lastName: { S: 'McTesterson' },
    email: { S: 'pjittles+testysandbox@gmail.com' },
    GSI1PK: {
      S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#USER#24a83408-3021-70b2-b58a-af712d067885',
    },
  },
];

const userSeedData = [
  {
    PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273' },
    SK: { S: 'USER#94680468-80a1-704e-f22c-579f27997d4a' },
    entityType: { S: 'USER' },
    firstName: { S: 'Patrick' },
    lastName: { S: 'Palmer' },
    email: { S: 'pjittles+sandboxadmin@gmail.com' },
    userRole: { S: 'MANAGER' },
    username: { S: 'pjittles+sandboxadmin@gmail.com' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#USERS' },
    GSI1SK: { S: 'MANAGER' },
  },
  {
    PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273' },
    SK: { S: 'USER#24a83408-3021-70b2-b58a-af712d067885' },
    entityType: { S: 'USER' },
    firstName: { S: 'Testy' },
    lastName: { S: 'McTesterson' },
    email: { S: 'pjittles+testysandbox@gmail.com' },
    userRole: { S: 'DIRECTOR' },
    username: { S: 'pjittles+testysandbox@gmail.com' },
    GSI1PK: { S: 'TENANT#ec79c2bd-eeae-4891-a05e-22222a351273#USERS' },
    GSI1SK: { S: 'DIRECTOR' },
  },
];
