import * as path from 'path';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import {
  GraphqlApi,
  SchemaFile,
  AuthorizationType,
  FieldLogLevel,
  MappingTemplate,
  PrimaryKey,
  Values,
} from 'aws-cdk-lib/aws-appsync';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';

interface APIProps {
  organizationTable: ITable;
}

export class OrganizationAPI extends Construct {
  constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id);

    const api = new GraphqlApi(this, 'OrganizationAPI', {
      name: 'OrganizationAPI',
      schema: SchemaFile.fromAsset(
        path.join(__dirname, '..', '..', 'src', 'graphql', 'schema.graphql')
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.LAMBDA,
            lambdaAuthorizerConfig: {
              handler: new Function(this, 'OrganizationAPIAuthorizer', {
                runtime: Runtime.NODEJS_18_X,
                architecture: Architecture.ARM_64,
                handler: 'authorizer.handler',
                code: Code.fromAsset(path.join(__dirname, '..', 'esbuild.out')),
              }),
            },
          },
        ],
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      xrayEnabled: true,
    });

    const pooledTenantRoleArn = StringParameter.fromStringParameterAttributes(
      this,
      'PooledTenantRoleArn',
      { parameterName: '/shared/authenticated-role-arn' }
    );

    const pooledTenantRole = Role.fromRoleArn(
      this,
      'PooledTenantRole',
      pooledTenantRoleArn.stringValue
    );

    // TODO move policy creation to tenant stack
    api.grantMutation(pooledTenantRole);
    api.grantQuery(pooledTenantRole);

    const organizationDataSource = api.addDynamoDbDataSource(
      'OrganizationDataSource',
      props.organizationTable
    );

    api.createResolver('listOrganizationsResolver', {
      typeName: 'Query',
      fieldName: 'listOrganizations',
      dataSource: organizationDataSource,
      requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    });

    api.createResolver('getOrganizationByIdResolver', {
      typeName: 'Query',
      fieldName: 'getOrganizationById',
      dataSource: organizationDataSource,
      requestMappingTemplate: MappingTemplate.dynamoDbGetItem('id', 'id'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    api.createResolver('createOrganizationResolver', {
      typeName: 'Mutation',
      fieldName: 'createOrganization',
      dataSource: organizationDataSource,
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition('id').auto(),
        Values.projecting('organization')
      ),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    api.createResolver('updateOrganizationResolver', {
      typeName: 'Mutation',
      fieldName: 'updateOrganization',
      dataSource: organizationDataSource,
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition('id').is('organization.id'),
        Values.projecting('organization')
      ),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    api.createResolver('deleteOrganizationResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteOrganization',
      dataSource: organizationDataSource,
      requestMappingTemplate: MappingTemplate.dynamoDbDeleteItem('id', 'id'),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    new CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });
  }
}
