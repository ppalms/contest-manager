const AmplifyConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION,
  aws_cognito_region: process.env.NEXT_PUBLIC_AWS_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_USER_POOL_ID,
  aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  aws_appsync_authenticationType: process.env.NEXT_PUBLIC_AUTH_TYPE,
  aws_appsync_region: process.env.NEXT_PUBLIC_AWS_REGION,
};

export default AmplifyConfig;
