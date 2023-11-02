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
  // Too lazy to look up a better way not to return PK/SK junk to caller
  const { PK, SK, entityType, GSI1PK, GSI1SK, ...userAttributes } = ctx.result;

  const savedUser = { ...userAttributes, id: PK.split('#')[3] };
  return savedUser;
}
