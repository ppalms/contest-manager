import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ?? process.env.TEST_TENANT_ID;

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
