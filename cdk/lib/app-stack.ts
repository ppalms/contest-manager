import { Construct } from 'constructs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { AdministrationAPI } from '../src/admin/admin-api';
import * as path from 'path';

interface AppStackProps extends StackProps {}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // TODO refactor to single table
    const organizationTable = new Table(this, 'OrganizationTable', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    const organizationUserMappingTable = new Table(
      this,
      'OrganizationUserMappingTable',
      {
        removalPolicy: RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST,
        partitionKey: { name: 'organizationId', type: AttributeType.STRING },
        sortKey: { name: 'userId', type: AttributeType.STRING },
      }
    );

    // Single table backing the admin module (orgs, users, contests, etc.)
    const adminTable = new Table(this, 'AdministrationTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    const seedContestsLambda = new Function(this, 'SeedContestsLambda', {
      code: Code.fromAsset(
        path.join(__dirname, '..', 'esbuild.out', 'seedContests')
      ),
      handler: 'seedContests.handler',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        ADMINISTRATION_TABLE_NAME: adminTable.tableName,
      },
    });

    adminTable.grantReadData(seedContestsLambda);
    adminTable.grantWriteData(seedContestsLambda);

    new AdministrationAPI(this, 'AdministrationAPI', {
      organizationTable: organizationTable,
      organizationUserMappingTable: organizationUserMappingTable,
      adminTable: adminTable,
    });
  }
}
