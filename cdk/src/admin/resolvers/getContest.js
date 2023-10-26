export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  return {
    operation: 'Query',
    query: {
      expression: 'PK = :pk',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `TENANT#${tenantId}#CONTEST#${ctx.arguments.id}`,
      }),
    },
  };
}

export function response(ctx) {
  let contest = null;
  const managers = [];

  for (const item of ctx.result.items) {
    if (item.entityType === 'CONTEST') {
      contest = { ...item, id: item.PK.split('#')[3] };
    } else if (item.entityType === 'USER') {
      managers.push({ ...item, id: item.SK.split('#')[1] });
    }
  }

  return { ...contest, managers: managers };
}
