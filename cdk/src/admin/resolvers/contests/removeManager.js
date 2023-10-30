import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  const contestId = ctx.arguments.contestId;
  if (!contestId) {
    console.error('contestId is required');
  }

  const managerId = ctx.arguments.managerId;
  if (!managerId) {
    console.error('managerId is required');
  }

  return {
    operation: 'DeleteItem',
    key: util.dynamodb.toMapValues({
      PK: `TENANT#${tenantId}#CONTEST#${contestId}`,
      SK: `USER#${managerId}`,
    }),
  };
}

export function response(ctx) {
  return ctx.outErrors.length === 0;
}
