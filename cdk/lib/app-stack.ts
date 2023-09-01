import { Construct } from 'constructs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { OrganizationAPI } from './org-api';

interface AppStackProps extends StackProps {}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // TODO partition by tenantId
    const table = new Table(this, 'OrganizationTable', {
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'id', type: AttributeType.STRING },
    });

    new OrganizationAPI(this, 'OrganizationAPI', {
      organizationTable: table,
    });
  }
}
