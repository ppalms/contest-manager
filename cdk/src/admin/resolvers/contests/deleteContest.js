export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}#CONTEST#${ctx.arguments.id}`,
      SK: `DETAILS`,
    }),
  };
}

export function response(ctx) {
  return ctx.result;
}
