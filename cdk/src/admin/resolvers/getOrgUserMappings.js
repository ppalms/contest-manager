export function request(ctx) {
  const organizationId = ctx.prev?.result?.id;
  if (!organizationId) {
    console.error('Failed to get organization');
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
  if (ctx.result && ctx.result.items && ctx.result.items.length === 0) {
    return [];
  }

  return ctx.result.items;
}
