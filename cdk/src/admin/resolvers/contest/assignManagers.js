export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  const contestId = ctx.arguments.contestId;
  if (!contestId) {
    console.error('contestId is required');
  }

  const managers = ctx.arguments.managers;
  if (!managers || managers.length === 0) {
    console.error('No managers provided');
  }

  return {
    operation: 'Invoke',
    payload: {
      tenantId,
      contestId,
      managers,
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
