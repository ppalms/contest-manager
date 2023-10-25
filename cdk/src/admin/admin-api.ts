import * as path from 'path';
import { Construct } from 'constructs';
import { CfnOutput, Stack } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import {
  GraphqlApi,
  SchemaFile,
  AuthorizationType,
  FieldLogLevel,
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

    // Have to explicitly allow querying GSIs
    const gsiArn = `${props.adminTable.tableArn}/index/*`;
    const gsiPolicy = new PolicyStatement({
      actions: ['dynamodb:Query'],
      resources: [gsiArn],
    });
    adminTableDataSource.grantPrincipal.addToPrincipalPolicy(gsiPolicy);

    // ** ORGANIZATIONS ** //
    api.createResolver('getOrganizationWithUsersResolver', {
      typeName: 'Query',
      fieldName: 'getOrganizationWithUsers',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(
        path.join(__dirname, 'resolvers', 'getOrgWithUsers.js')
      ),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('listOrganizationsResolver', {
      typeName: 'Query',
      fieldName: 'listOrganizations',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'listOrgs.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('saveOrganizationResolver', {
      typeName: 'Mutation',
      fieldName: 'saveOrganization',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'saveOrg.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('deleteOrganizationResolver', {
      typeName: 'Mutation',
      fieldName: 'deleteOrganization',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'deleteOrg.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    api.createResolver('saveOrgUserResolver', {
      typeName: 'Mutation',
      fieldName: 'saveOrgUser',
      dataSource: adminTableDataSource,
      code: Code.fromAsset(path.join(__dirname, 'resolvers', 'saveOrgUser.js')),
      runtime: FunctionRuntime.JS_1_0_0,
    });

    // TODO create user management UI and wire up eventbridge or org page
    // ** CONGITO USERS ** //
    // const saveUserLambdaFunction = new LambdaFunction(
    //   this,
    //   'SaveUserLambdaFunction',
    //   {
    //     code: LambdaCode.fromAsset(
    //       path.join(__dirname, '..', '..', 'esbuild.out', 'saveUser')
    //     ),
    //     handler: 'saveUser.handler',
    //     runtime: Runtime.NODEJS_18_X,
    //     architecture: Architecture.ARM_64,
    //     environment: {
    //       ORGUSERS_TABLE_NAME: props.organizationUserMappingTable.tableName,
    //     },
    //   }
    // );

    // const allUserPools = `arn:aws:cognito-idp:${stack.region}:${stack.account}:userpool/*`;
    // saveUserLambdaFunction.addToRolePolicy(
    //   new PolicyStatement({
    //     effect: Effect.ALLOW,
    //     actions: [
    //       'cognito-idp:AdminCreateUser',
    //       'cognito-idp:AdminAddUserToGroup',
    //       'cognito-idp:AdminUpdateUserAttributes',
    //       'cognito-idp:AdminGetUser',
    //     ],
    //     resources: [allUserPools, props.organizationUserMappingTable.tableArn],
    //   })
    // );

    // const saveUserDataSource = api.addLambdaDataSource(
    //   'SaveUserDataSource',
    //   saveUserLambdaFunction
    // );

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
