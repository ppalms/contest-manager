export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ??
    'ec79c2bd-eeae-4891-a05e-22222a351273';

  const { id, ...values } = ctx.arguments.contest;
  const contestId = id ?? util.autoId();

  const command = {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}#CONTEST#${contestId}`,
      SK: `DETAILS`,
    }),
    attributeValues: util.dynamodb.toMapValues({
      ...values,
      entityType: 'CONTEST',
      GSI1PK: `TENANT#${tenantId}#CONTESTS`,
      GSI1SK: values.type,
    }),
  };

  return command;
}

export function response(ctx) {
  const contest = { ...ctx.result, id: ctx.result.PK.split('#')[3] };
  return contest;
}
