import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ??
    'ec79c2bd-eeae-4891-a05e-22222a351273';

  const { id, ...values } = ctx.arguments.contest;
  const contestId = id ?? util.autoId();

  const command = {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}`,
      SK: `CONTEST#${contestId}`,
    }),
    attributeValues: util.dynamodb.toMapValues({
      entityType: 'CONTEST',
      ...values,
    }),
  };

  return command;
}

export function response(ctx) {
  const contest = { ...ctx.result, id: ctx.result.SK.split('#')[1] };
  return contest;
}
