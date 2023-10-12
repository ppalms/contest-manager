export function request(ctx) {
  const organizationId = ctx.prev?.result?.id;
  if (!organizationId) {
    util.error('Failed to get organization');
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
  return ctx.result?.items ?? [];
}
