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

    // AdministrationTable entities/partitions:

    // - Users: TENANT#<TenantId>#USER#<UserId>
    //    User details under SK: DETAILS
    //    Look up all users for a tenant in GSI1 under
    //      GSI1PK: TENANT#<TenantId>#USERS
    //      GSI1SK: <RoleName>
    //    Look up all references to a user in GSI1 under
    //      GSI1PK: TENANT#<TenantId>#USER#<UserId>

    // - Organizations: TENANT#<TenantId>#ORG#<OrgId>
    //    Org details under SK: DETAILS
    //    Org users under SK: USER#<UserId>
    //    Look up all orgs for a tenant in GSI1 under
    //      GSI1PK: TENANT#<TenantId>#ORGS
    //      GSI1SK: <OrgType>

    // - Contests: TENANT#<TenantId>#CONTEST#<ContestId>
    //    Contest details under SK: DETAILS
    //    Contest managers under SK: MANAGER#<UserId>
    //    Look up all contests for a tenant in GSI1 under
    //      GSI1PK: TENANT#<TenantId>#CONTESTS
    //      GSI1SK: <ContestType>

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

    const seedUsersLambda = new Function(this, 'SeedUsersLambda', {
      code: Code.fromAsset(
        path.join(__dirname, '..', 'esbuild.out', 'seedUsers')
      ),
      handler: 'seedUsers.handler',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      environment: {
        ADMINISTRATION_TABLE_NAME: adminTable.tableName,
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
        ADMINISTRATION_TABLE_NAME: adminTable.tableName,
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
        ADMINISTRATION_TABLE_NAME: adminTable.tableName,
      },
    });

    adminTable.grantReadData(seedContestsLambda);
    adminTable.grantWriteData(seedContestsLambda);

    new AdministrationAPI(this, 'AdministrationAPI', {
      adminTable: adminTable,
    });
  }
}
