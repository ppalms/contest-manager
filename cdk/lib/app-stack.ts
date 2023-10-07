import { Construct } from 'constructs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { AdministrationAPI } from '../src/admin/admin-api';

interface AppStackProps extends StackProps {}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // TODO partition by tenantId
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

    new AdministrationAPI(this, 'AdministrationAPI', {
      organizationTable: organizationTable,
      organizationUserMappingTable: organizationUserMappingTable,
    });
  }
}
