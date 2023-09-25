export function request(ctx) {
  ctx.stash.tenantId = ctx.identity.resolverContext.tenantId;
  return {};
}

export function response(ctx) {
  return {
    organization: ctx.stash.organization,
    users: ctx.prev.result,
  };
}
