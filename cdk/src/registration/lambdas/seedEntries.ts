import {
  BatchWriteItemCommand,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

// TODO env var
const seedTenantId = 'ec79c2bd-eeae-4891-a05e-22222a351273';

export async function handler(_: any, __: any): Promise<any> {
  if (!process.env.REGISTRATION_TABLE_NAME) {
    throw new Error('REGISTRATION_TABLE_NAME not provided');
  }

  const dbClient = new DynamoDBClient();

  // Clean the table before seeding
  const getSeedEntriesCommand = new QueryCommand({
    TableName: process.env.REGISTRATION_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: `TENANT#${seedTenantId}` },
    },
  });

  try {
    const result = await dbClient.send(getSeedEntriesCommand);
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
          [process.env.REGISTRATION_TABLE_NAME]: deleteRequests,
        },
      };

      await dbClient.send(new BatchWriteItemCommand(batchDeleteParams));
    }
  } catch (error) {
    console.error(error);
    throw error;
  }

  const entryItems = {
    [process.env.REGISTRATION_TABLE_NAME]: entrySeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
  };

  const writeEntries = new BatchWriteItemCommand({
    RequestItems: entryItems as any,
  });

  try {
    await dbClient.send(writeEntries);
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }

  return {
    message: 'Seed data added successfully',
  };
}

// TODO this is copy pasta and will need to be revisited when building out the registration module
const entrySeedData = [
  {
    PK: {
      S: `TENANT#${seedTenantId}CONTEST#266a60c0-b6d9-484f-87ea-ac8343b53981`,
    },
    SK: { S: 'ENTRY#b5277e7b-4e9e-4b86-b7ee-bc3dc97702f3' },
    entityType: { S: 'ENTRY' },
    directorId: { S: '5b480f84-da3f-4d5c-abc0-24334a074f1a' },
    musicSelections: {
      L: [
        {
          M: {
            title: { S: 'A Joyful Song' },
            composerLastName: { S: 'Lightfoot' },
          },
        },
        { M: { title: { S: 'Gypsy Rover' } } },
        { M: { title: { S: 'Sweet Kate' }, composerLastName: { S: 'Jones' } } },
      ],
    },
  },
  {
    PK: {
      S: `TENANT#${seedTenantId}CONTEST#266a60c0-b6d9-484f-87ea-ac8343b53981`,
    },
    SK: { S: 'ENTRY#c0eff1fa-d81c-4b56-b3f3-c53b84c2d95d' },
    entityType: { S: 'ENTRY' },
    directorId: { S: 'dc19705c-363b-492d-a504-9994ec071647' },
    musicSelections: {
      L: [
        {
          M: {
            title: { S: 'Song Of The River (with descant)' },
            composerLastName: { S: 'Patterson' },
          },
        },
        {
          M: {
            title: { S: 'Non Nobis Domine (Rounds For Everyone)' },
            composerLastName: { S: 'Terri' },
          },
        },
        { M: { title: { S: 'Candu' } } },
      ],
    },
  },
];
