export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';
  const { id, ...values } = ctx.arguments.organization;
  const orgId = id ?? util.autoId();

  const command = {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}#ORG#${orgId}`,
      SK: 'DETAILS',
    }),
    attributeValues: util.dynamodb.toMapValues({
      ...values,
      entityType: 'ORGANIZATION',
      GSI1PK: `TENANT#${tenantId}#ORGS`,
      GSI1SK: values.type,
    }),
  };

  return command;
}

export function response(ctx) {
  const org = { ...ctx.result, id: ctx.result.PK.split('#')[3] };
  return org;
}
