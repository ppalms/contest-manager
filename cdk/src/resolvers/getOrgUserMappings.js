export function request(ctx) {
  const organizationId = ctx.stash.organization?.id;
  if (!organizationId) {
    console.error('Missing ctx.stash.organization');
  }

  return {
    operation: 'Query',
    query: {
      expression: 'organizationId = :organizationId',
      expressionValues: util.dynamodb.toMapValues({
        ':organizationId': organizationId,
      }),
    },
  };
}

export function response(ctx) {
  return {
    organization: ctx.stash.organization,
    users: ctx.result.items,
  };
}
