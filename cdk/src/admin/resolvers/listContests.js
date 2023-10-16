export function request(ctx) {
  // TODO get from SSM
  const tenantId =
    ctx.identity?.resolverContext.tenantId ??
    'ec79c2bd-eeae-4891-a05e-22222a351273';

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
