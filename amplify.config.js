const amplifyConfig = {
  aws_project_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_tXpGrpozQ',
  aws_user_pools_web_client_id: '7leskl1tiikiq6qav97f75el45',
  aws_cognito_region: 'us-east-1',
  aws_cognito_username_attributes: ['EMAIL'],
  aws_cognito_identity_pool_id:
    'us-east-1:d2af5156-075b-4cb2-ac7b-ab9fa8ce82f8',
  aws_appsync_graphqlEndpoint:
    'https://dah6jrbtvvgsdopfzn5t5nivnm.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_authenticationType: 'AWS_LAMBDA',
  aws_appsync_region: 'us-east-1',
};

export default amplifyConfig;
