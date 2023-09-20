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
  AppsyncFunction,
  FunctionRuntime,
  Code,
} from 'aws-cdk-lib/aws-appsync';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Effect, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import {
  Architecture,
  Function as LambdaFunction,
  Code as LambdaCode,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';

interface APIProps {
  organizationTable: ITable;
  organizationUserMappingTable: ITable;
}

export class OrganizationAPI extends Construct {
  constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id);

    const api = new GraphqlApi(this, 'OrganizationAPI', {
      name: 'OrganizationAPI',
      schema: SchemaFile.fromAsset(
        path.join(
          __dirname,
          '..',
          '..',
          'src',
          'graphql',
          'schema',
          'schema.graphql'
        )
      ),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.LAMBDA,
            lambdaAuthorizerConfig: {
              handler: new LambdaFunction(this, 'OrganizationAPIAuthorizer', {
                code: LambdaCode.fromAsset(
                  path.join(__dirname, '..', 'esbuild.out')
                ),
                handler: 'authorizer.handler',
                runtime: Runtime.NODEJS_18_X,
                architecture: Architecture.ARM_64,
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

    const organizationUserMappingDataSource = api.addDynamoDbDataSource(
      'OrganizationUserMappingDataSource',
      props.organizationUserMappingTable
    );

    // TODO parameterize region and account
    const userPoolResources =
      'arn:aws:cognito-idp:us-east-1:275316640779:userpool/*';

    const getOrganizationFunction = new AppsyncFunction(
      this,
      'GetOrganizationFunction',
      {
        api,
        name: 'getOrganization',
        dataSource: organizationDataSource,
        code: Code.fromAsset(
          path.join(__dirname, '..', 'src', 'resolvers', 'getOrganization.js')
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

    const getOrgUserMappingsFunction = new AppsyncFunction(
      this,
      'GetOrgUserMappingsFunction',
      {
        api,
        name: 'getOrgUserMappings',
        dataSource: organizationUserMappingDataSource,
        code: Code.fromAsset(
          path.join(
            __dirname,
            '..',
            'src',
            'resolvers',
            'getOrgUserMappings.js'
          )
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

    const listUsersLambdaFunction = new LambdaFunction(
      this,
      'listUsersLambdaFunction',
      {
        code: LambdaCode.fromAsset(path.join(__dirname, '..', 'esbuild.out')),
        handler: 'listUsersInGroup.handler',
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
      }
    );

    listUsersLambdaFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:GetItem', 'cognito-idp:ListUsersInGroup'],
        resources: [props.organizationTable.tableArn, userPoolResources],
      })
    );

    const getUsersDataSource = api.addLambdaDataSource(
      'GetUsersDataSource',
      listUsersLambdaFunction
    );

    const getUsersFunction = new AppsyncFunction(this, 'GetUsersFunction', {
      api,
      name: 'getUsers',
      dataSource: getUsersDataSource,
      code: Code.fromAsset(
        path.join(__dirname, '..', 'src', 'resolvers', 'getUsers.js')
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    const getOrgUsersPipelineCode = `
      export function request(...args) {
        console.log(args);
        return {};
      }

      export function response(ctx) {
        return {
          organization: ctx.stash.organization,
          users: ctx.prev.result,
        };
      }
    `;

    api.createResolver('getOrganizationWithUsersResolver', {
      typeName: 'Query',
      fieldName: 'getOrganizationWithUsers',
      code: Code.fromInline(getOrgUsersPipelineCode),
      pipelineConfig: [
        getOrganizationFunction,
        getOrgUserMappingsFunction,
        getUsersFunction,
      ],
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('listOrganizationsResolver', {
      typeName: 'Query',
      fieldName: 'listOrganizations',
      dataSource: organizationDataSource,
      requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
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

    // api.createResolver('addUserToOrganizationResolver', {
    //   typeName: 'Mutation',
    //   fieldName: 'addUserToOrganization',
    //   dataSource: organizationUserMappingDataSource,
    //   requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
    //     PrimaryKey.partition('userId').is('userId'),
    //     Values.projecting('organizationId')
    //   ),
    //   responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    // });

    new CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });
  }
}
