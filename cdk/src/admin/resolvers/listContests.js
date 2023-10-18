export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ?? process.env.TEST_TENANT_ID;

  return {
    operation: 'Query',
    index: 'GSI1',
    query: {
      expression: 'GSI1PK = :pk',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `TENANT#${tenantId}#CONTESTS`,
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
