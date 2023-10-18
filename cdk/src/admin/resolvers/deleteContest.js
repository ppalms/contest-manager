import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId =
    ctx.identity?.resolverContext.tenantId ?? process.env.TEST_TENANT_ID;

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
