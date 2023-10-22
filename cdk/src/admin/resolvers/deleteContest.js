export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ??
    'ec79c2bd-eeae-4891-a05e-22222a351273';

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
