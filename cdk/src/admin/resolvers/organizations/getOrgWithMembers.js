export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  return {
    operation: 'Query',
    query: {
      expression: 'PK = :pk',
      expressionValues: util.dynamodb.toMapValues({
        ':pk': `TENANT#${tenantId}#ORG#${ctx.arguments.id}`,
      }),
    },
  };
}

export function response(ctx) {
  let organization = null;
  const members = [];

  for (const item of ctx.result.items) {
    if (item.entityType === 'ORGANIZATION') {
      organization = { ...item, id: item.PK.split('#')[3] };
    } else if (item.entityType === 'USER') {
      members.push({ ...item, userId: item.SK.split('#')[1] });
    }
  }

  return { organization, members };
}
