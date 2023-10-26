export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';
  const { id, ...values } = ctx.arguments.user;

  let userId = id;
  if (!userId || userId.length === 0) {
    userId = util.autoId();
  }

  const command = {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}#USER#${userId}`,
      SK: `DETAILS`,
    }),
    attributeValues: util.dynamodb.toMapValues({
      ...values,
      entityType: 'USER',
      GSI1PK: `TENANT#${tenantId}#USERS`,
      GSI1SK: values.role,
    }),
  };

  return command;
}

export function response(ctx) {
  const user = { ...ctx.result, id: ctx.result.PK.split('#')[3] };
  return user;
}
