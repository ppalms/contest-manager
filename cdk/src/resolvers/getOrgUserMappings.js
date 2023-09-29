export function request(ctx) {
  const organizationId = ctx.stash.organization?.id;
  if (!organizationId) {
    console.error('Failed to get organizationId from stash');
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
  return ctx.result.items;
}
