import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  const orgId = ctx.arguments.orgId;
  if (!orgId) {
    console.error('orgId is required');
  }

  const userId = ctx.arguments.memberId;
  if (!userId) {
    console.error('memberId is required');
  }

  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}#ORG#${orgId}`,
      SK: `USER#${userId}`,
    }),
  };
}

export function response(ctx) {
  return ctx.outErrors.length === 0;
}
