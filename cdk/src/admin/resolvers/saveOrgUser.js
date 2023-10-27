export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';
  const { id, orgId, ...values } = ctx.arguments.user;

  let userId = id;
  if (!userId || userId.length === 0) {
    userId = util.autoId();
  }

  const command = {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}#ORG#${orgId}`,
      SK: `USER#${userId}`,
    }),
    attributeValues: util.dynamodb.toMapValues({
      ...values,
      entityType: 'USER',
      GSI1PK: `TENANT#${tenantId}#USER#${userId}`,
      GSI1SK: 'REFERENCE',
    }),
  };

  return command;
}

export function response(ctx) {
  const user = {
    ...ctx.result,
    id: ctx.result.SK.split('#')[1],
  };

  return user;
}
