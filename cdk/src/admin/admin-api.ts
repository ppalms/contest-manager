import * as path from 'path';
import { Construct } from 'constructs';
import { CfnOutput, Stack } from 'aws-cdk-lib';
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
  adminTable: ITable;
}

export class AdministrationAPI extends Construct {
  constructor(scope: Construct, id: string, props: APIProps) {
    super(scope, id);

    const stack = Stack.of(this);

    const authorizerLambdaFunction = new LambdaFunction(
      this,
      'AuthorizerLambda',
      {
        code: LambdaCode.fromAsset(
          path.join(__dirname, '..', '..', 'esbuild.out', 'authorizer')
        ),
        handler: 'authorizer.handler',
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
      }
    );

    authorizerLambdaFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameters'],
        resources: [
          `arn:aws:ssm:${stack.region}:${stack.account}:parameter/shared/user-pool-id`,
        ],
      })
    );

    const api = new GraphqlApi(this, 'AdministrationAPI', {
      name: 'AdministrationAPI',
      schema: SchemaFile.fromAsset(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'src',
          'graphql',
          'schema',
          'admin.graphql'
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
              handler: authorizerLambdaFunction,
            },
          },
        ],
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      xrayEnabled: false, // TODO
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

    api.grantMutation(pooledTenantRole);
    api.grantQuery(pooledTenantRole);

    const adminTableDataSource = api.addDynamoDbDataSource(
      'AdminTableDataSource',
      props.adminTable
    );

    const organizationDataSource = api.addDynamoDbDataSource(
      'OrganizationDataSource',
      props.organizationTable
    );

    const organizationUserMappingDataSource = api.addDynamoDbDataSource(
      'OrganizationUserMappingDataSource',
      props.organizationUserMappingTable
    );

    const allUserPools = `arn:aws:cognito-idp:${stack.region}:${stack.account}:userpool/*`;

    const getOrganizationFunction = new AppsyncFunction(
      this,
      'GetOrganizationFunction',
      {
        api,
        name: 'getOrganization',
        dataSource: organizationDataSource,
        code: Code.fromAsset(
          path.join(__dirname, 'resolvers', 'getOrganization.js')
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
          path.join(__dirname, 'resolvers', 'getOrgUserMappings.js')
        ),
        runtime: FunctionRuntime.JS_1_0_0,
      }
    );

    const listUsersLambdaFunction = new LambdaFunction(
      this,
      'ListUsersLambdaFunction',
      {
        code: LambdaCode.fromAsset(
          path.join(__dirname, '..', '..', 'esbuild.out', 'listUsers')
        ),
        handler: 'listUsers.handler',
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
      }
    );

    listUsersLambdaFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:GetItem', 'cognito-idp:ListUsersInGroup'],
        resources: [props.organizationTable.tableArn, allUserPools],
      })
    );

    const listUsersDataSource = api.addLambdaDataSource(
      'ListUsersDataSource',
      listUsersLambdaFunction
    );

    const listUsersFunction = new AppsyncFunction(this, 'ListUsersFunction', {
      api,
      name: 'listUsers',
      dataSource: listUsersDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'listUsers.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    // TODO refactor to use single table for org and users
    api.createResolver('getOrganizationWithUsersResolver', {
      typeName: 'Query',
      fieldName: 'getOrganizationWithUsers',
      code: Code.fromAsset(
        path.join(__dirname, 'resolvers', 'getOrgWithUsersPipeline.js')
      ),
      pipelineConfig: [
        getOrganizationFunction,
        getOrgUserMappingsFunction,
        listUsersFunction,
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

    // ** Save User ** //
    const saveUserLambdaFunction = new LambdaFunction(
      this,
      'SaveUserLambdaFunction',
      {
        code: LambdaCode.fromAsset(
          path.join(__dirname, '..', '..', 'esbuild.out', 'saveUser')
        ),
        handler: 'saveUser.handler',
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
        environment: {
          ORGUSERS_TABLE_NAME: props.organizationUserMappingTable.tableName,
        },
      }
    );

    saveUserLambdaFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'cognito-idp:AdminCreateUser',
          'cognito-idp:AdminAddUserToGroup',
          'cognito-idp:AdminUpdateUserAttributes',
          'cognito-idp:AdminGetUser',
          'dynamodb:PutItem', // TODO get rid of orguser mapping table
        ],
        resources: [allUserPools, props.organizationUserMappingTable.tableArn],
      })
    );

    const saveUserDataSource = api.addLambdaDataSource(
      'SaveUserDataSource',
      saveUserLambdaFunction
    );

    api.createResolver('saveUserResolver', {
      typeName: 'Mutation',
      fieldName: 'saveUser',
      dataSource: saveUserDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'saveUser.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    // ** CONTESTS ** //
    api.createResolver('listContestsResolver', {
      typeName: 'Query',
      fieldName: 'listContests',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(
        path.join(__dirname, 'resolvers', 'listContests.js')
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('getContestResolver', {
      typeName: 'Query',
      fieldName: 'getContest',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'getContest.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('saveContestResolver', {
      typeName: 'Mutation',
      fieldName: 'saveContest',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'saveContest.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('deleteContestResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteContest',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(
        path.join(__dirname, 'resolvers', 'deleteContest.js')
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    new CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });
  }
}
