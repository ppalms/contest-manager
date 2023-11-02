export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  return {
    operation: 'Query',
    index: 'GSI1',
    query: {
      expression: 'GSI1PK = :pk and GSI1SK = :sk',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `TENANT#${tenantId}#USERS`,
        ':sk': ctx.arguments.role,
      }),
    },
  };
}

export function response(ctx) {
  const contests = ctx.result.items.map((entity) => {
    return {
      ...entity,
      id: entity.PK.split('#')[3],
    };
  });

  return contests;
}
