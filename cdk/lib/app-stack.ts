import { Construct } from 'constructs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AdministrationAPI } from '../src/admin/admin-api';
import * as path from 'path';

interface AppStackProps extends StackProps {}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const adminTable = new Table(this, 'AdministrationTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      removalPolicy: RemovalPolicy.RETAIN,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    adminTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    // TODO move seed Lambdas to separate stack and only deploy to non-prod environments
    const seedUsersLambda = new Function(this, 'SeedUsersLambda', {
      code: Code.fromAsset(
        path.join(__dirname, '..', 'esbuild.out', 'seedUsers')
      ),
      handler: 'seedUsers.handler',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        ADMIN_TABLE_NAME: adminTable.tableName,
      },
    });

    adminTable.grantReadData(seedUsersLambda);
    adminTable.grantWriteData(seedUsersLambda);

    const seedOrgsLambda = new Function(this, 'SeedOrgsLambda', {
      code: Code.fromAsset(
        path.join(__dirname, '..', 'esbuild.out', 'seedOrgs')
      ),
      handler: 'seedOrgs.handler',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        ADMIN_TABLE_NAME: adminTable.tableName,
      },
    });

    adminTable.grantReadData(seedOrgsLambda);
    adminTable.grantWriteData(seedOrgsLambda);

    const seedContestsLambda = new Function(this, 'SeedContestsLambda', {
      code: Code.fromAsset(
        path.join(__dirname, '..', 'esbuild.out', 'seedContests')
      ),
      handler: 'seedContests.handler',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        ADMIN_TABLE_NAME: adminTable.tableName,
      },
    });

    adminTable.grantReadData(seedContestsLambda);
    adminTable.grantWriteData(seedContestsLambda);

    new AdministrationAPI(this, 'AdministrationAPI', {
      adminTable: adminTable,
    });
  }
}
