export function request(ctx) {
  return {
    operation: 'Invoke',
    payload: {
      tenantId: ctx.identity.resolverContext.tenantId,
      userPoolId: ctx.identity.resolverContext.userPoolId,
      user: ctx.arguments.user,
    },
  };
}

export function response(ctx) {
  return ctx.result;
}
