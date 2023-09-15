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
import { Role } from 'aws-cdk-lib/aws-iam';
import {
  Architecture,
  Function,
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
              handler: new Function(this, 'OrganizationAPIAuthorizer', {
                runtime: Runtime.NODEJS_18_X,
                architecture: Architecture.ARM_64,
                handler: 'authorizer.handler',
                code: LambdaCode.fromAsset(
                  path.join(__dirname, '..', 'esbuild.out')
                ),
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

    // const organizationUserMappingDataSource = api.addDynamoDbDataSource(
    //   'OrganizationUserMappingDataSource',
    //   props.organizationUserMappingTable
    // );

    const defaultPipelineCode = `
      // The before step
      export function request(...args) {
        console.log(args);
        return {}
      }

      // The after step
      export function response(ctx) {
        return ctx.prev.result
      }
    `;

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

    api.createResolver('getOrganizationWithUsersResolver', {
      typeName: 'Query',
      fieldName: 'getOrganizationWithUsers',
      code: Code.fromInline(defaultPipelineCode),
      pipelineConfig: [getOrganizationFunction],
      runtime: FunctionRuntime.JS_1_0_0,
    });

    // const getOrgUserMappingsFunction = new AppsyncFunction(
    //   this,
    //   'GetOrgUserMappingsFunction',
    //   {
    //     api,
    //     name: 'getOrgUserMappings',
    //     dataSource: organizationUserMappingDataSource,
    //     requestMappingTemplate: MappingTemplate.fromString(`
    //     #set($organizationId = $util.dynamodb.toDynamoDBJson($ctx.source.id))
    //     {
    //       "version": "2018-05-29",
    //       "operation": "Query",
    //       "query": {
    //         "expression": "organizationId = :organizationId",
    //         "expressionValues": {
    //           ":organizationId": $organizationId
    //         }
    //       }
    //     }`),
    //     responseMappingTemplate: MappingTemplate.fromString(`
    //       $util.toJson($ctx.result.items)
    //     `),
    //   }
    // );

    // TODO add Lambda resolver that gets user data from cognito listUsersByOrganization

    // api.createResolver('getOrganizationWithUsersResolver', {
    //   typeName: 'Query',
    //   fieldName: 'getOrganizationWithUsers',
    //   pipelineConfig: [getOrganizationFunction, getOrgUserMappingsFunction],
    //   requestMappingTemplate: MappingTemplate.fromString(`{}`),
    //   responseMappingTemplate: MappingTemplate.fromString(`
    //     #if($ctx.error)
    //       $util.error($ctx.error.message, $ctx.error.type)
    //     #end
    //     {
    //       "organization": $util.toJson($ctx.stash.get("organization")),
    //       "users": $util.toJson($ctx.result)
    //     }
    //   `),
    // });

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
