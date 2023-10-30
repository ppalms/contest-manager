export function request(ctx) {
  const tenantId = ctx.identity?.resolverContext.tenantId ?? '001';

  const assignments = ctx.arguments.assignments;
  if (!assignments || assignments.length === 0) {
    console.error('No assignments provided');
  }

  return {
    operation: 'Invoke',
    payload: {
      tenantId,
      assignments,
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
