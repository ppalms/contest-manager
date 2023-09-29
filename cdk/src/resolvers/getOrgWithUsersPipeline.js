export function request(ctx) {
  ctx.stash.tenantId = ctx.identity.resolverContext.tenantId;
  ctx.stash.userPoolId = ctx.identity.resolverContext.userPoolId;
  return {};
}

export function response(ctx) {
  return {
    organization: ctx.stash.organization,
    users: ctx.prev.result,
  };
}
