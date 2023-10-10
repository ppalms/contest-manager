import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

export async function handler(_: any, __: any): Promise<any> {
  if (!process.env.CONTESTS_TABLE_NAME) {
    throw new Error('CONTESTS_TABLE_NAME not provided');
  }

  const dbClient = new DynamoDBClient();

  const contestItems = {
    [process.env.CONTESTS_TABLE_NAME]: contestSeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
  };
  console.log(JSON.stringify(contestItems, null, 2));

  const writeContests = new BatchWriteItemCommand({
    RequestItems: contestItems as any,
  });

  try {
    await dbClient.send(writeContests);
  } catch (error) {
    console.error('Error writing batch to DynamoDB', error);
    throw error;
  }

  const entryItems = {
    [process.env.CONTESTS_TABLE_NAME]: entrySeedData.map((item) => ({
      PutRequest: { Item: item },
    })),
  };
  console.log(JSON.stringify(entryItems, null, 2));

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

const contestSeedData = [
  {
    PK: { S: 'TENANT#cc690452-cf04-4207-906f-9129ab5179a2' },
    SK: { S: 'CONTEST#646b640c-8bb3-47e4-9925-b09be9cb4698' },
    name: { S: 'Sand Springs' },
    type: { S: 'ORCHESTRA' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-04-01T12:00:00Z' },
    endDate: { S: '2023-04-01T20:00:00Z' },
    signUpStartDate: { S: '2023-03-01T05:00:00Z' },
    signUpEndDate: { S: '2023-03-25T05:00:00Z' },
    managerId: { S: '95d74d08-9001-4c89-8d9f-3219feb89400' },
  },
  {
    PK: { S: 'TENANT#cc690452-cf04-4207-906f-9129ab5179a2' },
    SK: { S: 'CONTEST#6c05f489-c714-4938-bb25-a1c179f81611' },
    name: { S: 'Mustang Invitational Marching Festival' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'DISTRICT' },
    startDate: { S: '2023-10-07T12:00:00Z' },
    endDate: { S: '2023-10-07T20:00:00Z' },
    signUpStartDate: { S: '2023-03-01T05:00:00Z' },
    signUpEndDate: { S: '2023-03-25T05:00:00Z' },
    managerId: { S: '95d74d08-9001-4c89-8d9f-3219feb89400' },
  },
  {
    PK: { S: 'TENANT#cc690452-cf04-4207-906f-9129ab5179a2' },
    SK: { S: 'CONTEST#266a60c0-b6d9-484f-87ea-ac8343b53981' },
    name: { S: 'OBA Class 4A Marching Championships' },
    type: { S: 'MARCHING_BAND' },
    level: { S: 'STATE' },
    startDate: { S: '2023-10-14T12:00:00Z' },
    endDate: { S: '2023-10-14T20:00:00Z' },
    signUpStartDate: { S: '2023-08-01T05:00:00Z' },
    signUpEndDate: { S: '2023-09-25T05:00:00Z' },
    managerId: { S: '95d74d08-9001-4c89-8d9f-3219feb89400' },
  },
];

const entrySeedData = [
  {
    PK: { S: 'TENANT#cc690452-cf04-4207-906f-9129ab5179a2' },
    SK: {
      S: 'CONTEST#266a60c0-b6d9-484f-87ea-ac8343b53981ENTRY#b5277e7b-4e9e-4b86-b7ee-bc3dc97702f3',
    },
    directorId: { S: '5b480f84-da3f-4d5c-abc0-24334a074f1a' },
    musicSelections: {
      L: [
        { M: { title: { S: 'A Joyful Song' }, composer: { S: 'Lightfoot' } } },
        { M: { title: { S: 'Gypsy Rover' } } },
        { M: { title: { S: 'Sweet Kate' }, composer: { S: 'Jones' } } },
      ],
    },
  },
];
